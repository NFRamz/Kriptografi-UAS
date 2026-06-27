export interface ComparisonStats {
  totalPixels: number;
  modifiedPixels: number;
  percentageDifference: number;
  similarityRate: number;
  hiddenDataSizeBits: number;
}

export interface ComparisonResult {
  stats: ComparisonStats;
  diffDataUrl: string;
  originalData: Uint8ClampedArray;
  protectedData: Uint8ClampedArray;
  width: number;
  height: number;
}

export class ImageComparator {
  static async compareImages(originalImg: HTMLImageElement, protectedImg: HTMLImageElement): Promise<ComparisonResult> {
    if (originalImg.width !== protectedImg.width || originalImg.height !== protectedImg.height) {
      throw new Error('Images must be exactly the same dimensions for precise pixel analysis.');
    }

    const width = originalImg.width;
    const height = originalImg.height;

    // Original Canvas
    const canvasOrig = document.createElement('canvas');
    canvasOrig.width = width;
    canvasOrig.height = height;
    const ctxOrig = canvasOrig.getContext('2d')!;
    ctxOrig.drawImage(originalImg, 0, 0);
    const origImageData = ctxOrig.getImageData(0, 0, width, height);
    const origData = origImageData.data;

    // Protected Canvas
    const canvasProt = document.createElement('canvas');
    canvasProt.width = width;
    canvasProt.height = height;
    const ctxProt = canvasProt.getContext('2d')!;
    ctxProt.drawImage(protectedImg, 0, 0);
    const protImageData = ctxProt.getImageData(0, 0, width, height);
    const protData = protImageData.data;

    // Diff Canvas
    const canvasDiff = document.createElement('canvas');
    canvasDiff.width = width;
    canvasDiff.height = height;
    const ctxDiff = canvasDiff.getContext('2d')!;
    const diffImageData = ctxDiff.createImageData(width, height);
    const diffData = diffImageData.data;

    let modifiedPixels = 0;
    const totalPixels = width * height;
    let modifiedBits = 0; // estimate data size

    for (let i = 0; i < origData.length; i += 4) {
      let isPixelModified = false;

      // Check RGB channels
      for (let j = 0; j < 3; j++) {
        if (origData[i + j] !== protData[i + j]) {
          isPixelModified = true;
          modifiedBits++;
        }
      }

      if (isPixelModified) {
        modifiedPixels++;
        // Highlight modified pixel in bright primary color (cyan/magenta mix depending on theme, let's use neon purple/cyan)
        diffData[i] = 176;     // R (from #b026ff)
        diffData[i + 1] = 38;  // G
        diffData[i + 2] = 255; // B
        diffData[i + 3] = 255; // Alpha
      } else {
        // Dim unchanged pixel
        diffData[i] = origData[i] * 0.1;
        diffData[i + 1] = origData[i + 1] * 0.1;
        diffData[i + 2] = origData[i + 2] * 0.1;
        diffData[i + 3] = 255;
      }
    }

    ctxDiff.putImageData(diffImageData, 0, 0);

    const percentageDifference = (modifiedPixels / totalPixels) * 100;
    const similarityRate = 100 - percentageDifference;

    return {
      stats: {
        totalPixels,
        modifiedPixels,
        percentageDifference,
        similarityRate,
        hiddenDataSizeBits: modifiedBits // Roughly, since 1 bit modified means 1 bit payload minimum
      },
      diffDataUrl: canvasDiff.toDataURL('image/png'),
      originalData: origData,
      protectedData: protData,
      width,
      height
    };
  }

  // Utility to extract specific pixel for the Pixel Inspector
  static getPixelAt(data: Uint8ClampedArray, width: number, x: number, y: number): { r: number, g: number, b: number, a: number } {
    const index = (y * width + x) * 4;
    return {
      r: data[index],
      g: data[index + 1],
      b: data[index + 2],
      a: data[index + 3]
    };
  }
}
