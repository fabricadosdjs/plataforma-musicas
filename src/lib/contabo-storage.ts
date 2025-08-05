// Biblioteca para integração com Contabo Object Storage
import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client, _Object } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface ContaboConfig {
    endpoint: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
}

export interface StorageFile {
    key: string;
    url: string;
    size: number;
    lastModified: Date;
    isAudio: boolean;
    filename: string;
}

export class ContaboStorage {
    private s3Client: S3Client;
    private bucketName: string;
    private endpoint: string;

    constructor(config: ContaboConfig) {
        console.log('🔧 ContaboStorage: Configurando com:', {
            endpoint: config.endpoint,
            region: config.region,
            accessKeyId: config.accessKeyId ? `${config.accessKeyId.substring(0, 8)}...` : 'undefined',
            secretAccessKey: config.secretAccessKey ? '***' : 'undefined',
            bucketName: config.bucketName
        });

        this.s3Client = new S3Client({
            endpoint: config.endpoint,
            region: config.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
            forcePathStyle: true, // Necessário para compatibilidade S3
            apiVersion: '2006-03-01',
        });
        this.bucketName = config.bucketName;
        this.endpoint = config.endpoint;
    }

    /**
     * Lista todos os arquivos do bucket
     */
    async listFiles(prefix?: string): Promise<StorageFile[]> {
        try {
            const command = new ListObjectsV2Command({
                Bucket: this.bucketName,
                Prefix: prefix,
                MaxKeys: 1000, // Limite de arquivos por request
            });

            const response = await this.s3Client.send(command);

            if (!response.Contents) {
                return [];
            }

            return response.Contents
                .filter((obj: _Object) => obj.Key && obj.Size && obj.Size > 0) // Remove pastas vazias
                .map((obj: _Object) => ({
                    key: obj.Key!,
                    url: this.getPublicUrl(obj.Key!),
                    size: obj.Size!,
                    lastModified: obj.LastModified || new Date(),
                    isAudio: this.isAudioFile(obj.Key!),
                    filename: obj.Key!.split('/').pop() || obj.Key!,
                }));
        } catch (error) {
            console.error('Erro ao listar arquivos:', error);
            throw new Error('Falha ao listar arquivos do bucket');
        }
    }

    /**
     * Lista apenas arquivos de áudio
     */
    async listAudioFiles(prefix?: string): Promise<StorageFile[]> {
        const allFiles = await this.listFiles(prefix);
        return allFiles.filter(file => file.isAudio);
    }

    /**
     * Gera URL pública para um arquivo
     */
    getPublicUrl(key: string): string {
        // URL pública do bucket Contabo com o ID específico
        return `https://usc1.contabostorage.com/211285f2fbcc4760a62df1aff280735f:plataforma-de-musicas/${key}`;
    }

    /**
     * Gera URL assinada para acesso seguro
     */
    async getSecureUrl(key: string, expiresIn: number = 3600): Promise<string> {
        try {
            console.log('🎵 ContaboStorage: Gerando URL assinada para:', { key, bucketName: this.bucketName });

            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
            console.log('🎵 ContaboStorage: URL assinada gerada com sucesso:', signedUrl.substring(0, 100) + '...');
            return signedUrl;
        } catch (error) {
            console.error('🎵 ContaboStorage: Erro ao gerar URL assinada:', {
                error: error instanceof Error ? error.message : error,
                key,
                bucketName: this.bucketName,
                endpoint: this.endpoint,
                region: this.s3Client.config.region()
            });
            // Fallback para URL pública
            const publicUrl = this.getPublicUrl(key);
            console.log('🎵 ContaboStorage: Usando fallback para URL pública:', publicUrl);
            return publicUrl;
        }
    }

    /**
     * Gera URL assinada temporária (para buckets privados)
     */
    async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            return await getSignedUrl(this.s3Client, command, { expiresIn });
        } catch (error) {
            console.error('Erro ao gerar URL assinada:', error);
            throw new Error('Falha ao gerar URL assinada');
        }
    }

    /**
     * Faz upload de um arquivo
     */
    async uploadFile(
        key: string,
        file: Buffer | Uint8Array | string,
        contentType?: string
    ): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file,
                ContentType: contentType || this.getMimeType(key),
                ACL: 'public-read', // Para tornar o arquivo público
            });

            await this.s3Client.send(command);
            return this.getPublicUrl(key);
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            throw new Error('Falha ao fazer upload do arquivo');
        }
    }

    /**
     * Obtém informações de um arquivo específico
     */
    async getFileInfo(key: string): Promise<StorageFile | null> {
        try {
            const command = new ListObjectsV2Command({
                Bucket: this.bucketName,
                Prefix: key,
                MaxKeys: 1,
            });

            const response = await this.s3Client.send(command);

            if (!response.Contents || response.Contents.length === 0) {
                return null;
            }

            const obj = response.Contents[0];
            if (obj.Key !== key) {
                return null;
            }

            return {
                key: obj.Key!,
                url: this.getPublicUrl(obj.Key!),
                size: obj.Size!,
                lastModified: obj.LastModified || new Date(),
                isAudio: this.isAudioFile(obj.Key!),
                filename: obj.Key!.split('/').pop() || obj.Key!,
            };
        } catch (error) {
            console.error('Erro ao obter informações do arquivo:', error);
            return null;
        }
    }

    /**
     * Deleta um arquivo
     */
    async deleteFile(key: string): Promise<void> {
        try {
            console.log(`🗑️ Tentando excluir arquivo: ${key}`);

            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            const result = await this.s3Client.send(command);
            console.log(`✅ Arquivo excluído com sucesso: ${key}`, result);
        } catch (error) {
            console.error(`❌ Erro ao deletar arquivo ${key}:`, error);
            throw new Error(`Falha ao deletar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    /**
     * Verifica se um arquivo é de áudio
     */
    public isAudioFile(filename: string): boolean {
        const audioExtensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma'];
        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return audioExtensions.includes(extension);
    }

    /**
     * Retorna o MIME type baseado na extensão do arquivo
     */
    private getMimeType(filename: string): string {
        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        const mimeTypes: { [key: string]: string } = {
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.flac': 'audio/flac',
            '.aac': 'audio/aac',
            '.ogg': 'audio/ogg',
            '.m4a': 'audio/mp4',
            '.wma': 'audio/x-ms-wma',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
        };
        return mimeTypes[extension] || 'application/octet-stream';
    }

    /**
     * Busca arquivos por nome
     */
    async searchFiles(query: string, prefix?: string): Promise<StorageFile[]> {
        const files = await this.listFiles(prefix);
        const lowerQuery = query.toLowerCase();

        return files.filter(file =>
            file.filename.toLowerCase().includes(lowerQuery) ||
            file.key.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Organiza arquivos por estrutura de pastas
     */
    async getFileTree(prefix?: string): Promise<any> {
        const files = await this.listFiles(prefix);
        const tree: any = {};

        files.forEach(file => {
            const parts = file.key.split('/');
            let current = tree;

            parts.forEach((part, index) => {
                if (index === parts.length - 1) {
                    // É um arquivo
                    current[part] = file;
                } else {
                    // É uma pasta
                    if (!current[part]) {
                        current[part] = {};
                    }
                    current = current[part];
                }
            });
        });

        return tree;
    }
}

// Instância padrão configurada via variáveis de ambiente
export const contaboStorage = new ContaboStorage({
    endpoint: process.env.CONTABO_ENDPOINT || '',
    region: process.env.CONTABO_REGION || 'usc1',
    accessKeyId: process.env.CONTABO_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CONTABO_SECRET_ACCESS_KEY || '',
    bucketName: process.env.CONTABO_BUCKET_NAME || '',
});
