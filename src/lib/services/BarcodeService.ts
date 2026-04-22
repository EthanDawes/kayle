// BarcodeDetector is a browser API not yet in TypeScript's lib
interface BarcodeDetectorResult {
  rawValue: string
  format: string
}

declare class BarcodeDetector {
  constructor(options?: { formats?: string[] })
  detect(image: ImageBitmapSource): Promise<BarcodeDetectorResult[]>
}

const FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "qr_code"]

export const BarcodeService = {
  isSupported(): boolean {
    return "BarcodeDetector" in window
  },

  async detect(dataUrl: string): Promise<string | null> {
    if (!this.isSupported()) {
      throw new Error("BarcodeDetector is not supported in this browser. Try Chrome on Android or desktop.")
    }

    const blob = await fetch(dataUrl).then((r) => r.blob())
    const bitmap = await createImageBitmap(blob)
    const detector = new BarcodeDetector({ formats: FORMATS })
    const results = await detector.detect(bitmap)
    bitmap.close()

    return results[0]?.rawValue ?? null
  },
}
