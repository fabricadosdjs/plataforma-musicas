// src/app/api/oci-objects/route.ts
import { NextResponse } from 'next/server';
// Importa os módulos necessários do OCI SDK de forma mais direta
import { Auth, ObjectStorage } from 'oci-sdk'; // <--- MUDANÇA AQUI: Importação direta de Auth e ObjectStorage

export async function GET(request: Request) {
  try {
    // 1. Validar Variáveis de Ambiente
    const {
      OCI_TENANCY_OCID,
      OCI_USER_OCID,
      OCI_REGION,
      OCI_FINGERPRINT,
      OCI_PRIVATE_KEY,
      OCI_NAMESPACE,
      OCI_BUCKET_NAME,
    } = process.env;

    if (
      !OCI_TENANCY_OCID ||
      !OCI_USER_OCID ||
      !OCI_REGION ||
      !OCI_FINGERPRINT ||
      !OCI_PRIVATE_KEY ||
      !OCI_NAMESPACE ||
      !OCI_BUCKET_NAME
    ) {
      console.error('Missing OCI Environment Variables');
      return new NextResponse('Erro de configuração do OCI: Variáveis de ambiente faltando.', {
        status: 500,
      });
    }

    // 2. Configurar o Provedor de Autenticação (Authentication Provider)
    // Usa o AuthenticationDetailsProvider para autenticação baseada em chave de API
    const authProvider = new Auth.common.AuthenticationDetailsProvider( // <--- USANDO Auth.common
      OCI_TENANCY_OCID,
      OCI_USER_OCID,
      OCI_FINGERPRINT,
      OCI_PRIVATE_KEY,
      null, // Passphrase, se sua chave privada tiver uma
      OCI_REGION
    );

    // 3. Criar o Cliente do Object Storage
    const client = new ObjectStorage.ObjectStorageClient({ // <--- USANDO ObjectStorage
      authenticationDetailsProvider: authProvider,
    });

    // 4. Definir a Requisição para Listar Objetos
    const listObjectsRequest: ObjectStorage.requests.ListObjectsRequest = { // <--- USANDO ObjectStorage.requests
      namespaceName: OCI_NAMESPACE,
      bucketName: OCI_BUCKET_NAME,
      // prefix: 'my-folder/', // Opcional: para listar objetos com um prefixo específico
      // limit: 100, // Opcional: número máximo de objetos a retornar
    };

    // 5. Chamar a API do OCI para Listar Objetos
    const response = await client.listObjects(listObjectsRequest);

    // 6. Extrair e Retornar os Nomes dos Objetos
    const objectNames = response.listObjects.objects?.map((obj) => obj.name) || [];

    return NextResponse.json({ objects: objectNames });
  } catch (error: any) {
    console.error('[OCI_LIST_OBJECTS_ERROR]', error);
    // Retorna uma mensagem de erro mais detalhada em desenvolvimento para depuração
    // Em produção, considere uma mensagem mais genérica por segurança
    return new NextResponse(`Erro ao listar objetos do OCI: ${error.message || 'Erro desconhecido'}`, {
      status: 500,
    });
  }
}
