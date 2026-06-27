import CryptoJS from 'crypto-js';

export interface MetadataPayload {
  owner_name: string;
  asset_id: string;
  asset_type: string;
  timestamp: string;
  copyright_note: string;
  verification_hash: string;
}

export class AESCrypto {
  /**
   * Encrypts the metadata object using AES-256
   * @param metadata The JSON metadata object
   * @param secretKey The secret key for AES encryption
   * @returns The encrypted ciphertext string
   */
  static encryptMetadata(metadata: MetadataPayload, secretKey: string): string {
    if (!secretKey) throw new Error('Secret key is required for encryption');
    const jsonString = JSON.stringify(metadata);
    return CryptoJS.AES.encrypt(jsonString, secretKey).toString();
  }

  /**
   * Decrypts the ciphertext back into the Metadata object
   * @param ciphertext The encrypted string
   * @param secretKey The secret key used for encryption
   * @returns The parsed MetadataPayload
   */
  static decryptMetadata(ciphertext: string, secretKey: string): MetadataPayload {
    if (!secretKey) throw new Error('Secret key is required for decryption');
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedString) {
        throw new Error('Decryption failed: Incorrect key or corrupted data');
      }
      
      return JSON.parse(decryptedString) as MetadataPayload;
    } catch (error) {
      throw new Error('Failed to decrypt or parse metadata. Ensure the key is correct.');
    }
  }

  /**
   * Generates a random secure key for AES
   */
  static generateSecureKey(): string {
    return CryptoJS.lib.WordArray.random(256 / 8).toString(CryptoJS.enc.Hex);
  }

  /**
   * Generates SHA-256 hash for the asset
   */
  static generateHash(data: string): string {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }
}
