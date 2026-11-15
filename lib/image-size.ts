/* Reads the pixel size and type of a JPEG, PNG or WebP from its first bytes,
   without decoding the image. Used to validate uploaded and imported product
   photos and to store their real dimensions (which next/image needs). */

export type ImageInfo = { contentType: "image/jpeg" | "image/png" | "image/webp"; width: number; height: number };

export function imageInfo(b: Uint8Array): ImageInfo | null {
  if (b.length < 30) return null;
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);

  // PNG: signature, then the IHDR chunk holds width and height.
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    return { contentType: "image/png", width: view.getUint32(16), height: view.getUint32(20) };
  }

  // WebP: RIFF....WEBP, then a VP8 / VP8L / VP8X chunk.
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) {
    const chunk = String.fromCharCode(b[12], b[13], b[14], b[15]);
    if (chunk === "VP8X") {
      return {
        contentType: "image/webp",
        width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)),
        height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)),
      };
    }
    if (chunk === "VP8L") {
      const bits = view.getUint32(21, true);
      return { contentType: "image/webp", width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === "VP8 ") {
      return {
        contentType: "image/webp",
        width: view.getUint16(26, true) & 0x3fff,
        height: view.getUint16(28, true) & 0x3fff,
      };
    }
    return null;
  }

  // JPEG: walk the segments until a start-of-frame marker.
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = b[i + 1];
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0xff) {
        i += marker === 0xff ? 1 : 2;
        continue;
      }
      const length = view.getUint16(i + 2);
      const isFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isFrame) {
        return { contentType: "image/jpeg", height: view.getUint16(i + 5), width: view.getUint16(i + 7) };
      }
      i += 2 + length;
    }
    return null;
  }

  return null;
}
