typescriptimport { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } from "@azure/storage-blob";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "documents";

export const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
export const containerClient = blobServiceClient.getContainerClient(containerName);

// Upload sécurisé
export async function uploadFileToAzure(fileName: string, fileBuffer: Buffer) {
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.upload(fileBuffer, fileBuffer.length);
  return blockBlobClient.url;
}

// Génération d'URL temporaire sécurisée (valide 1 heure)
export async function generateSecureDownloadUrl(fileName: string) {
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  
  const sasOptions = {
    containerName,
    blobName: fileName,
    permissions: BlobSASPermissions.parse("r"), // Read only
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + 60 * 60 * 1000), // 1 heure
  };

  const sasToken = generateBlobSASQueryParameters(sasOptions, blobServiceClient.credential).toString();
  return `${blockBlobClient.url}?${sasToken}`;
}