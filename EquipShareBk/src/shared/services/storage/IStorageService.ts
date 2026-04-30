export interface IStorageService {
  uploadFile(options: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    folder: string;
  }): Promise<string>; // returns public URL

  deleteFile(url: string): Promise<void>;
}
