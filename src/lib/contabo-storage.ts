// Biblioteca para integração com Contabo Object Storage
import { S3Client } from '@aws-sdk/client-s3';
import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
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
            requestHandler: {
                requestTimeout: 30000, // 30 segundos para operações S3
                connectionTimeout: 10000, // 10 segundos para conexão
            },
        });
        this.bucketName = config.bucketName;
        this.endpoint = config.endpoint;
    }

    /**
     * Lista todos os arquivos do bucket
     */
    async listFiles(prefix?: string): Promise<StorageFile[]> {
        try {
            const allFiles: StorageFile[] = [];
            let continuationToken: string | undefined;

            do {
                const command = new ListObjectsV2Command({
                    Bucket: this.bucketName,
                    Prefix: prefix,
                    MaxKeys: 1000, // Máximo por request, mas vamos fazer múltiplos requests
                    ContinuationToken: continuationToken,
                });

                const response = await this.s3Client.send(command);

                if (response.Contents) {
                    const files = response.Contents
                        .filter((obj: any) => obj.Key && obj.Size && obj.Size > 0) // Remove pastas vazias
                        .map((obj: any) => ({
                            key: obj.Key!,
                            url: this.getPublicUrl(obj.Key!),
                            size: obj.Size!,
                            lastModified: obj.LastModified || new Date(),
                            isAudio: this.isAudioFile(obj.Key!),
                            filename: obj.Key!.split('/').pop() || obj.Key!,
                        }));

                    allFiles.push(...files);
                }

                continuationToken = response.NextContinuationToken;

                // Pequena pausa para não sobrecarregar a API
                if (continuationToken) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

            } while (continuationToken);

            console.log(`📁 Total de arquivos listados: ${allFiles.length}`);
            return allFiles;
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
        // Codificar cada parte do caminho separadamente para tratar caracteres especiais
        const encodedKey = key.split('/').map(part => encodeURIComponent(part)).join('/');
        // URL pública do bucket Contabo com o ID específico
        return `https://usc1.contabostorage.com/211285f2fbcc4760a62df1aff280735f:plataforma-de-musicas/${encodedKey}`;
    }

    /**
     * Gera URL assinada para acesso seguro
     */
    async getSecureUrl(key: string, expiresIn: number = 3600): Promise<string> {
        try {
            // Decodificar a chave se ela estiver codificada
            const decodedKey = decodeURIComponent(key);
            console.log('🎵 ContaboStorage: Gerando URL assinada para:', {
                originalKey: key,
                decodedKey: decodedKey,
                bucketName: this.bucketName
            });

            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: decodedKey,
            });

            const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
            console.log('🎵 ContaboStorage: URL assinada gerada com sucesso');
            console.log('🎵 ContaboStorage: URL gerada:', signedUrl.substring(0, 100) + '...');

            // Retornar URL assinada sem validação para evitar timeouts
            // A validação será feita pelo cliente quando necessário
            return signedUrl;

        } catch (error) {
            console.error('🎵 ContaboStorage: Erro ao gerar URL assinada:', {
                error: error instanceof Error ? (error as Error).message : error,
                key,
                bucketName: this.bucketName,
                endpoint: this.endpoint
            });

            // Fallback para URL pública em caso de erro
            const publicUrl = this.getPublicUrl(key);
            console.log('🎵 ContaboStorage: Usando fallback para URL pública:', publicUrl.substring(0, 100) + '...');
            return publicUrl;
        }
    }

    /**
     * Gera URL assinada temporária (para buckets privados)
     */
    async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        try {
            // Decodificar a chave se ela estiver codificada
            const decodedKey = decodeURIComponent(key);

            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: decodedKey,
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
            // Decodificar a chave se ela estiver codificada
            const decodedKey = decodeURIComponent(key);

            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: decodedKey,
                Body: file,
                ContentType: contentType || this.getMimeType(decodedKey),
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
            // Decodificar a chave se ela estiver codificada
            const decodedKey = decodeURIComponent(key);

            const command = new ListObjectsV2Command({
                Bucket: this.bucketName,
                Prefix: decodedKey,
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
            // Decodificar a chave se ela estiver codificada
            const decodedKey = decodeURIComponent(key);
            console.log(`🗑️ Tentando excluir arquivo: ${decodedKey}`);

            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: decodedKey,
            });

            const result = await this.s3Client.send(command);
            console.log(`✅ Arquivo excluído com sucesso: ${key}`, result);
        } catch (error) {
            console.error(`❌ Erro ao deletar arquivo ${key}:`, error);
            throw new Error(`Falha ao deletar arquivo: ${error instanceof Error ? (error as Error).message : 'Erro desconhecido'}`);
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
    accessKeyId: process.env.CONTABO_ACCESS_KEY || '',
    secretAccessKey: process.env.CONTABO_SECRET_KEY || '',
    bucketName: process.env.CONTABO_BUCKET_NAME || '',
});
