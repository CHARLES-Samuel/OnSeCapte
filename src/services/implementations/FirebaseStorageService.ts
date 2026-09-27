import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../../config/firebase";
import type { IStorageService } from "../interfaces/IStorageService";

export class FirebaseStorageService implements IStorageService {
  async uploadGroupPhoto(groupId: string, file: File | Blob): Promise<string> {
    // Le chemin dans le Storage
    const storageRef = ref(storage, `groups/${groupId}/photo.jpg`);
    
    // Upload de l'image
    const snapshot = await uploadBytes(storageRef, file);
    
    // Récupération de l'URL publique
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  }

  async deleteGroupPhoto(groupId: string): Promise<void> {
    const storageRef = ref(storage, `groups/${groupId}/photo.jpg`);
    try {
      await deleteObject(storageRef);
    } catch (error: any) {
      // Ignorer l'erreur si l'objet n'existe pas
      if (error.code !== "storage/object-not-found") {
        throw error;
      }
    }
  }
}

export const storageService = new FirebaseStorageService();
