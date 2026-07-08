import { AESCrypto } from './src/lib/crypto';
const meta = {owner_name: 'test', asset_id: '1', asset_type: '2', timestamp: '3', copyright_note: '4', verification_hash: '5'};
const key = AESCrypto.generateSecureKey();
const cipher = AESCrypto.encryptMetadata(meta, key);
console.log(cipher);
const dec = AESCrypto.decryptMetadata(cipher, key);
console.log(dec);
