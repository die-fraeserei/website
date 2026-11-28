// Prepares project photos before committing them: npm run photos:prepare
//
// For every JPEG in src/data/projekte/<project>/ that is larger than MAX_EDGE or still carries
// EXIF metadata, this script:
//   - applies the EXIF orientation (phone photos are often stored rotated),
//   - downsizes the long edge to MAX_EDGE px (Astro creates the smaller web sizes at build time),
//   - re-encodes as JPEG (quality 85, mozjpeg),
//   - drops all metadata (EXIF, GPS location, camera serial numbers).
// Files that are already small and metadata-free are left untouched, so re-running is safe.
import { readdir, rename, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = 'src/data/projekte';
const MAX_EDGE = 2400;
const JPEG = /\.(jpe?g)$/i;

const folders = (await readdir(ROOT, { withFileTypes: true })).filter((d) => d.isDirectory());
let processed = 0;
let skipped = 0;

for (const folder of folders) {
  const dir = path.join(ROOT, folder.name);
  for (const file of (await readdir(dir)).filter((f) => JPEG.test(f))) {
    const filePath = path.join(dir, file);
    const meta = await sharp(filePath).metadata();
    const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
    if (longEdge <= MAX_EDGE && !meta.exif && !meta.orientation) {
      skipped++;
      continue;
    }
    const before = (await stat(filePath)).size;
    const tmp = `${filePath}.tmp`;
    await sharp(filePath)
      .rotate() // apply EXIF orientation
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(tmp); // sharp writes no metadata unless asked to
    await rename(tmp, filePath);
    const after = (await stat(filePath)).size;
    processed++;
    console.log(
      `✓ ${filePath}: ${meta.width}×${meta.height} → ≤${MAX_EDGE}px, ${(before / 1e6).toFixed(1)} MB → ${(after / 1e6).toFixed(1)} MB`
    );
  }
}

console.log(`Done: ${processed} photo(s) prepared, ${skipped} already fine.`);
