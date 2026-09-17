/**
 * Regenerates src/app/lib/raSignature.js from public/ra-signature.jpeg.
 *
 * The Service Agreement PDF is rendered on the server, and server-side code must
 * not read the fixed RA (Service Provider) signature from the runtime
 * filesystem. The image bytes are therefore bundled into the server code.
 *
 * Run this after changing the signature image:
 *
 *   node scripts/generate-ra-signature-asset.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const imagePath = path.join(root, "public", "ra-signature.jpeg");
const outPath = path.join(root, "src", "app", "lib", "raSignature.js");

function readJpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) {
    throw new Error(`${imagePath} is not a JPEG file (bad SOI marker)`);
  }
  let offset = 2;
  while (offset < buf.length - 1) {
    if (buf[offset] !== 0xff) {
      offset++;
      continue;
    }
    const marker = buf[offset + 1];
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2;
      continue;
    }
    const length = buf.readUInt16BE(offset + 2);
    const isSof =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 && // DHT
      marker !== 0xc8 && // JPG
      marker !== 0xcc; // DAC
    if (isSof) {
      return {
        height: buf.readUInt16BE(offset + 5),
        width: buf.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }
  throw new Error(`Could not read JPEG dimensions from ${imagePath}`);
}

const buffer = fs.readFileSync(imagePath);
const { width, height } = readJpegSize(buffer);
const base64 = buffer.toString("base64");

const CHUNK = 96;
const chunks = [];
for (let i = 0; i < base64.length; i += CHUNK) {
  chunks.push(base64.slice(i, i + CHUNK));
}
const literal = chunks
  .map((chunk, i) => `  "${chunk}"${i === chunks.length - 1 ? ";" : " +"}`)
  .join("\n");

const file = `// RA (Service Provider) signature used by the Service Agreement PDF.
//
// GENERATED FILE - do not hand-edit the base64 below. Regenerate with:
//   node scripts/generate-ra-signature-asset.js
// whenever public/ra-signature.jpeg changes.
//
// The browser renders this image as the static file /ra-signature.jpeg (see
// src/components/RASignature.jsx). Server-side PDF generation must NOT depend on
// the runtime filesystem for it: public/ is a static-asset directory that is not
// guaranteed to exist next to the deployed server code (serverless function, or
// a standalone/container build started from a different working directory).
// Reading it with fs is what made the RA signature silently disappear from
// production PDFs while still working locally.
//
// Bundled image: public/ra-signature.jpeg (${buffer.length} bytes, ${width}x${height} px, JPEG)
import fs from "fs";

export const RA_SIGNATURE_JPEG_BASE64 =
${literal}

/**
 * Returns the RA signature JPEG bytes in a runtime-independent way.
 *
 * - RA_SIGNATURE_PATH (optional) overrides the bundled image with a file on the
 *   runtime filesystem. An unreadable override throws, so the failure is
 *   reported instead of silently falling back to a different image.
 * - Otherwise the bundled copy is returned, requiring no filesystem access.
 */
export function getRASignatureJpegBuffer() {
  const overridePath = (process.env.RA_SIGNATURE_PATH || "").trim();
  if (overridePath) {
    return fs.readFileSync(overridePath);
  }
  return Buffer.from(RA_SIGNATURE_JPEG_BASE64, "base64");
}
`;

fs.writeFileSync(outPath, file);
console.log(
  `Wrote ${path.relative(root, outPath)} from ${path.relative(root, imagePath)} (${buffer.length} bytes, ${width}x${height}, ${base64.length} base64 chars)`,
);
