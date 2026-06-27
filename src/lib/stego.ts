export interface EmbeddingResult {
  dataUrl: string;
  blob: Blob;
  totalBits: number;
  modifiedPixels: number;
  capacity: number;
  sampleOriginal: number[];
  sampleModified: number[];
}

export class LSBSteganography {
  // Convert string to binary array
  static stringToBinary(text: string): number[] {
    const binary: number[] = [];
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      for (let j = 7; j >= 0; j--) {
        binary.push((charCode >> j) & 1);
      }
    }
    return binary;
  }

  // Convert binary array to string
  static binaryToString(binary: number[]): string {
    let text = '';
    for (let i = 0; i < binary.length; i += 8) {
      let charCode = 0;
      for (let j = 0; j < 8; j++) {
        if (i + j < binary.length) {
          charCode = (charCode << 1) | binary[i + j];
        }
      }
      if (charCode === 0) break; // null terminator
      text += String.fromCharCode(charCode);
    }
    return text;
  }

  static async embedData(imageElement: HTMLImageElement, text: string): Promise<EmbeddingResult> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    canvas.width = imageElement.naturalWidth || imageElement.width;
    canvas.height = imageElement.naturalHeight || imageElement.height;
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Convert text to binary and add 32-bit length prefix
    // We add a null terminator to ensure extraction stops cleanly without reading trailing garbage
    const textBinary = this.stringToBinary(text + '\0');
    const lengthBinary: number[] = [];
    let len = textBinary.length;
    for (let i = 31; i >= 0; i--) {
      lengthBinary.push((len >> i) & 1);
    }
    
    const payload = [...lengthBinary, ...textBinary];
    const totalBits = payload.length;
    const capacity = (data.length / 4) * 3; // 3 bits per pixel (RGB)

    if (totalBits > capacity) {
      throw new Error(`Payload too large. Capacity: ${capacity} bits, Payload: ${totalBits} bits`);
    }

    let payloadIndex = 0;
    let modifiedPixelsCount = 0;
    
    // Store samples for visualization
    const sampleOriginal: number[] = [];
    const sampleModified: number[] = [];
    let samplesCollected = 0;

    for (let i = 0; i < data.length && payloadIndex < totalBits; i += 4) {
      let pixelModified = false;

      // Modify RGB channels (indices i, i+1, i+2). Alpha is i+3.
      for (let j = 0; j < 3; j++) {
        if (payloadIndex < totalBits) {
          const originalValue = data[i + j];
          const bitToEmbed = payload[payloadIndex];
          
          // Clear LSB and set to bitToEmbed
          const newValue = (originalValue & ~1) | bitToEmbed;
          
          if (originalValue !== newValue) {
            data[i + j] = newValue;
            pixelModified = true;
          }
          
          if (samplesCollected < 8) { // Collect first 8 modified bytes for visualizer
            sampleOriginal.push(originalValue);
            sampleModified.push(newValue);
            samplesCollected++;
          }
          
          payloadIndex++;
        }
      }
      
      if (pixelModified) {
        modifiedPixelsCount++;
      }
      // Force alpha to 255 to prevent premultiplied alpha from corrupting RGB values
      data[i + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);

    // Convert to Blob and DataURL
    const dataUrl = canvas.toDataURL('image/png');
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas to Blob failed'));
      }, 'image/png');
    });

    return {
      dataUrl,
      blob,
      totalBits,
      modifiedPixels: modifiedPixelsCount,
      capacity,
      sampleOriginal,
      sampleModified
    };
  }

  static async extractData(imageElement: HTMLImageElement): Promise<{ text: string, extractedBits: number }> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    canvas.width = imageElement.naturalWidth || imageElement.width;
    canvas.height = imageElement.naturalHeight || imageElement.height;
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    let payloadIndex = 0;
    
    // First, extract 32 bits for the length
    let length = 0;
    const lengthBits: number[] = [];
    
    for (let i = 0; i < data.length && lengthBits.length < 32; i += 4) {
      for (let j = 0; j < 3; j++) {
        if (lengthBits.length < 32) {
          lengthBits.push(data[i + j] & 1);
        }
      }
    }

    // Convert 32 bits to integer length
    for (let i = 0; i < 32; i++) {
      length = ((length << 1) | lengthBits[i]) >>> 0;
    }

    // Protection against garbage length (e.g. image without stego data)
    // A standard AES string isn't millions of characters long. Let's cap at 50,000 characters.
    if (length <= 0 || length > 50000 * 8) {
      throw new Error("No valid steganography payload found in this image.");
    }

    const textBits: number[] = [];
    let bitsToRead = length;
    
    // Resume reading right after the first 32 bits
    let currentBitIndex = 0;
    
    for (let i = 0; i < data.length && textBits.length < bitsToRead; i += 4) {
      for (let j = 0; j < 3; j++) {
        if (currentBitIndex >= 32 && textBits.length < bitsToRead) {
          textBits.push(data[i + j] & 1);
        }
        currentBitIndex++;
      }
    }

    const text = this.binaryToString(textBits);
    
    return {
      text,
      extractedBits: lengthBits.length + textBits.length
    };
  }
}
