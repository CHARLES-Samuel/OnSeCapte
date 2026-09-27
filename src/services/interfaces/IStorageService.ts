export interface IStorageService {
  /** Uploads a group photo and returns the download URL */
  uploadGroupPhoto(groupId: string, file: File | Blob): Promise<string>;
  
  /** Deletes a group photo */
  deleteGroupPhoto(groupId: string): Promise<void>;
}
