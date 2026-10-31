import * as THREE from 'three';

// Procedural Canvas Texture Generator for realistic supermarket packaging and signage

const textureCache: Record<string, THREE.CanvasTexture> = {};

export function createProductLabelTexture(
  productName: string,
  brand: string,
  bgColor: string,
  accentColor: string,
  type: string,
  price: number,
  discount: number
): THREE.CanvasTexture {
  const cacheKey = `${productName}_${brand}_${bgColor}_${type}`;
  if (textureCache[cacheKey]) {
    return textureCache[cacheKey];
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Background base
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 512);

  // Gradient overlay
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Decorative header band
  ctx.fillStyle = accentColor;
  ctx.fillRect(0, 0, 512, 90);

  // Brand Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(brand.toUpperCase(), 256, 60);

  // Center product title area
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px "Segoe UI", Roboto, sans-serif';
  
  // Wrap product name if long
  const words = productName.split(' ');
  if (words.length > 2) {
    ctx.fillText(words.slice(0, 2).join(' '), 256, 170);
    ctx.font = '32px "Segoe UI", Roboto, sans-serif';
    ctx.fillText(words.slice(2).join(' '), 256, 220);
  } else {
    ctx.fillText(productName, 256, 190);
  }

  // Type-specific illustration graphics
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.arc(256, 310, 80, 0, Math.PI * 2);
  ctx.fill();

  // Price & Discount badge
  if (discount > 0) {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(40, 280, 110, 48, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`${discount}% OFF`, 95, 313);
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px "Segoe UI", sans-serif';
  ctx.fillText(`₹${price}`, 256, 320);

  ctx.restore();

  // Realistic Barcode bottom area
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(80, 410, 352, 70);

  ctx.fillStyle = '#111827';
  // Generate barcode bars
  let x = 100;
  for (let i = 0; i < 48; i++) {
    const barWidth = (i % 3 === 0 ? 4 : i % 5 === 0 ? 6 : 2);
    ctx.fillRect(x, 415, barWidth, 45);
    x += barWidth + ((i % 4) + 2);
    if (x > 410) break;
  }

  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('8 901030 882' + (price % 90 + 10), 256, 474);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache[cacheKey] = texture;
  return texture;
}

// Generate high quality floor tile texture
export function createFloorTileTexture(): { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const cacheKey = 'supermarket_floor_tile';
  if (textureCache[cacheKey]) {
    return {
      map: textureCache[cacheKey],
      roughnessMap: textureCache[cacheKey + '_rough']
    };
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Polished Light Gray / Beige Terrazzo Tile
  ctx.fillStyle = '#e8ecf2';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle marble / speckled flecks
  for (let i = 0; i < 3500; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const size = Math.random() * 2.5 + 0.5;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(160, 175, 195, 0.3)' : 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(x, y, size, size);
  }

  // 4x4 Tile grid seams (mortar joints)
  ctx.strokeStyle = '#c5ccd6';
  ctx.lineWidth = 3;
  const step = 256;
  for (let i = 0; i <= 1024; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 1024);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(1024, i);
    ctx.stroke();
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(8, 8);

  // Roughness canvas (glossy tiles with matte mortar seams)
  const rCanvas = document.createElement('canvas');
  rCanvas.width = 512;
  rCanvas.height = 512;
  const rCtx = rCanvas.getContext('2d')!;
  rCtx.fillStyle = '#333333'; // Low roughness = glossy shine
  rCtx.fillRect(0, 0, 512, 512);
  rCtx.strokeStyle = '#888888'; // Higher roughness at joints
  rCtx.lineWidth = 3;
  for (let i = 0; i <= 512; i += 128) {
    rCtx.beginPath();
    rCtx.moveTo(i, 0);
    rCtx.lineTo(i, 512);
    rCtx.stroke();
    rCtx.beginPath();
    rCtx.moveTo(0, i);
    rCtx.lineTo(512, i);
    rCtx.stroke();
  }

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(8, 8);

  textureCache[cacheKey] = map;
  textureCache[cacheKey + '_rough'] = roughnessMap;

  return { map, roughnessMap };
}

// Generate Hanging Aisle Sign Texture
export function createAisleSignTexture(aisleNum: number, title: string, subtitle: string, color: string): THREE.CanvasTexture {
  const cacheKey = `aisle_sign_${aisleNum}`;
  if (textureCache[cacheKey]) return textureCache[cacheKey];

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 1024, 360);

  // Outer border with accent color
  ctx.strokeStyle = color;
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 1014, 350);

  // Left circle badge with Aisle number
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(170, 180, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AISLE', 170, 150);

  ctx.font = 'bold 88px "Segoe UI", sans-serif';
  ctx.fillText(`${aisleNum}`, 170, 230);

  // Right side text
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 64px "Segoe UI", sans-serif';
  ctx.fillText(title.toUpperCase(), 340, 160);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '36px "Segoe UI", sans-serif';
  ctx.fillText(subtitle, 340, 230);

  const texture = new THREE.CanvasTexture(canvas);
  textureCache[cacheKey] = texture;
  return texture;
}

// Supermarket Entrance Banner with Official Brand Logo
export function createEntranceBannerTexture(): THREE.CanvasTexture {
  const cacheKey = 'store_entrance_banner';
  if (textureCache[cacheKey]) return textureCache[cacheKey];

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 340;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1024, 340);

  const texture = new THREE.CanvasTexture(canvas);
  textureCache[cacheKey] = texture;

  const img = new Image();
  img.src = '/suprgo-logo.jpg';
  img.onload = () => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1024, 340);
    const scale = Math.min(980 / img.width, 320 / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (1024 - w) / 2;
    const y = (340 - h) / 2;
    ctx.drawImage(img, x, y, w, h);
    texture.needsUpdate = true;
  };

  return texture;
}

