// src/services/storageService.ts

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";

/**
 * Faz o upload de uma imagem de capa para o Firebase Storage.
 * @param file - O ficheiro da imagem a ser carregada.
 * @returns A URL de download da imagem.
 */
export const uploadModuleCoverImage = async (file: File): Promise<string> => {
  if (!file) throw new Error("Nenhum ficheiro fornecido.");

  // Cria um nome de ficheiro único para evitar sobreposições
  const fileName = `cover_${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `module-covers/${fileName}`);

  try {
    // Faz o upload do ficheiro
    const snapshot = await uploadBytes(storageRef, file);
    
    // Obtém a URL de download
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    throw new Error("Falha no upload da imagem de capa.");
  }
};