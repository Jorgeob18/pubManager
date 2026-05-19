import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#1e40af" rx="64"/>
  <text x="256" y="320" font-family="Arial" font-size="280" font-weight="bold" fill="white" text-anchor="middle">P</text>
</svg>`;

async function generateIcons() {
  const publicDir = path.join(process.cwd(), 'public');
  
  await sharp(Buffer.from(svgIcon))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  
  await sharp(Buffer.from(svgIcon))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  
  console.log('Iconos PWA generados correctamente');
}

generateIcons().catch(console.error);