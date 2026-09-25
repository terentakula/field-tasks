import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import { AttachedFile } from '../types/task';

const ATTACHMENTS_DIR = FileSystem.documentDirectory + 'attachments/';

async function saveToAppFolder(uri: string, name: string, mimeType: string): Promise<AttachedFile> {
  await FileSystem.makeDirectoryAsync(ATTACHMENTS_DIR, { intermediates: true });
  const id = Crypto.randomUUID();
  const extension = mimeType === 'application/pdf' ? '.pdf' : '.jpg';
  const target = ATTACHMENTS_DIR + id + extension;
  await FileSystem.copyAsync({ from: uri, to: target });
  return { id, uri: target, name, mimeType };
}

export async function pickImage(): Promise<AttachedFile | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
  if (result.canceled) return null;
  const photo = result.assets[0];
  return saveToAppFolder(photo.uri, photo.fileName ?? 'photo.jpg', photo.mimeType ?? 'image/jpeg');
}

export async function pickDocument(): Promise<AttachedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: false,});
  if (result.canceled) return null;
  const doc = result.assets[0];
  return saveToAppFolder(doc.uri, doc.name, 'application/pdf');
}