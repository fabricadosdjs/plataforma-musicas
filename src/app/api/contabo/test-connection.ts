import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

export async function testContaboConnection() {
  const s3 = new S3Client({
    region: process.env.CONTABO_REGION,
    endpoint: process.env.CONTABO_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CONTABO_ACCESS_KEY!,
      secretAccessKey: process.env.CONTABO_SECRET_KEY!,
    },
    forcePathStyle: true,
  });

  try {
    const result = await s3.send(new ListBucketsCommand({}));
    return {
      success: true,
      buckets: result.Buckets?.map(b => b.Name) || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Para rodar: importe e chame testContaboConnection() em um endpoint temporário ou script.
