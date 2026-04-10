import { BlobServiceClient } from "@azure/storage-blob";
import { randomUUID } from "crypto";
import path from "path";
import { env } from "@config/env";
import { IStorageService } from "./IStorageService";

export class AzureBlobStorageService implements IStorageService {
  private _client: BlobServiceClient | null = null;
  private container: string;

  constructor() {
    this.container = env.AZURE_STORAGE_CONTAINER_NAME;
  }

  private get client(): BlobServiceClient {
    if (!this._client) {
      if (!env.AZURE_STORAGE_CONNECTION_STRING) {
        throw new Error(
          "AZURE_STORAGE_CONNECTION_STRING is not configured. Set it in .env to enable file uploads.",
        );
      }
      this._client = BlobServiceClient.fromConnectionString(
        env.AZURE_STORAGE_CONNECTION_STRING,
      );
    }
    return this._client;
  }

  async uploadFile({
    buffer,
    originalName,
    mimeType,
    folder,
  }: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    folder: string;
  }): Promise<string> {
    const ext = path.extname(originalName).toLowerCase() || ".jpg";
    const blobName = `${folder}/${randomUUID()}${ext}`;

    const containerClient = this.client.getContainerClient(this.container);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    return blockBlobClient.url;
  }

  async deleteFile(url: string): Promise<void> {
    const blobName = new URL(url).pathname.replace(`/${this.container}/`, "");
    const containerClient = this.client.getContainerClient(this.container);
    await containerClient.getBlockBlobClient(blobName).deleteIfExists();
  }
}
