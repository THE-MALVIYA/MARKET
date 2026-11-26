import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Product } from '../types';

interface ProductDetailShowcase3DProps {
  product: Product;
}

function getAccentHex(product: Product): { primary: number; hexStr: string; secondaryStr: string } {
  const key = `${product.id} ${product.category} ${product.name}`.toLowerCase();
  if (key.includes('transaction kit') || key.includes('fault')) {
    return { primary: 0xe5b84b, hexStr: '#E5B84B', secondaryStr: '#00D69A' };
  }
  if (key.includes('sql') || key.includes('database')) {
    return { primary: 0x38bdf8, hexStr: '#38BDF8', secondaryStr: '#00D69A' };
  }
  if (key.includes('crypto')) {
    return { primary: 0xa78bfa, hexStr: '#A78BFA', secondaryStr: '#38BDF8' };
  }
  if (key.includes('cobalt') || key.includes('core impact') || key.includes('metasploit')) {
    return { primary: 0xfb7185, hexStr: '#FB7185', secondaryStr: '#E5B84B' };
  }
  return { primary: 0x00d69a, hexStr: '#00D69A', secondaryStr: '#0EA5A4' };
}

function buildBoxFaceTexture(product: Product, hexStr: string, secondaryStr: string): THREE.CanvasTexture {
  const W = 768;
  const H = 960;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#131b24');
  bg.addColorStop(0.55, '#090e14');
  bg.addColorStop(1, '#04070b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle geometric grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Central holographic emblem glow
  const glow = ctx.createRadialGradient(W / 2, H * 0.42, 16, W / 2, H * 0.42, 260);
  glow.addColorStop(0, `${hexStr}55`);
  glow.addColorStop(0.6, `${secondaryStr}18`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Architectural Hexagon Ring
  ctx.strokeStyle = hexStr;
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
    const px = W / 2 + Math.cos(a) * 120;
    const py = H * 0.36 + Math.sin(a) * 120;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = secondaryStr;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.36, 78, 0, Math.PI * 2);
  ctx.stroke();

  // Brand top tag
  ctx.fillStyle = hexStr;
  ctx.font = '700 24px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('DEEPSEEK // VERIFIED BUILD', W / 2, 82);

  // Product Name
  ctx.fillStyle = '#F4F7F6';
  ctx.font = '800 52px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(product.name.slice(0, 20), W / 2, H * 0.62);

  // Category & Code
  ctx.fillStyle = '#8F9CA8';
  ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(product.category.slice(0, 36), W / 2, H * 0.68);

  ctx.fillStyle = hexStr;
  ctx.font = '700 28px "JetBrains Mono", monospace';
  ctx.fillText(`${product.productCode || product.id.toUpperCase()} · ${product.version || 'LTS'}`, W / 2, H * 0.78);

  // Bottom border bar
  ctx.fillStyle = hexStr;
  ctx.fillRect(64, H - 72, W - 128, 6);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const ProductDetailShowcase3D: React.FC<ProductDetailShowcase3DProps> = ({ product }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let controls: OrbitControls | null = null;
    let pmremGenerator: THREE.PMREMGenerator | null = null;
    let envRenderTarget: THREE.WebGLRenderTarget | null = null;
    let animFrameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let isDragging = false;

    const geos: THREE.BufferGeometry[] = [];
    const mats: THREE.Material[] = [];
    const texs: THREE.Texture[] = [];

    try {
      const probeCanvas = document.createElement('canvas');
      const glProbe = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!glProbe) {
        setFallback(true);
        return;
      }
      const dbg = glProbe.getExtension('WEBGL_debug_renderer_info');
      const rendererStr = dbg ? String(glProbe.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
      const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);
      glProbe.getExtension('WEBGL_lose_context')?.loseContext();

      const width = container.clientWidth || 540;
      const height = container.clientHeight || 360;

      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const canvas = renderer.domElement;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      canvas.style.cursor = 'grab';
      canvas.style.touchAction = 'none';
      container.innerHTML = '';
      container.appendChild(canvas);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 60);
      camera.position.set(1.6, 0.85, 3.8);

      pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      envRenderTarget = pmremGenerator.fromScene(roomEnv, 0.04);
      scene.environment = envRenderTarget.texture;
      scene.environmentIntensity = 0.7;
      roomEnv.dispose();

      const accent = getAccentHex(product);

      const hemi = new THREE.HemisphereLight(0xa5e4ff, 0x07090b, 0.8);
      scene.add(hemi);
      const key = new THREE.DirectionalLight(0xfff5e4, 2.2);
      key.position.set(4, 6, 5);
      scene.add(key);
      const accentLight = new THREE.PointLight(accent.primary, 4.5, 10);
      accentLight.position.set(-2.5, 1.5, 2.5);
      scene.add(accentLight);

      controls = new OrbitControls(camera, canvas);
      controls.enablePan = false;
      controls.minDistance = 2.4;
      controls.maxDistance = 5.6;
      controls.enableDamping = !isSoftwareGl;
      controls.dampingFactor = 0.06;
      controls.addEventListener('start', () => {
        isDragging = true;
        canvas.style.cursor = 'grabbing';
      });
      controls.addEventListener('end', () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
      });

      const unitGroup = new THREE.Group();
      scene.add(unitGroup);

      const faceTex = buildBoxFaceTexture(product, accent.hexStr, accent.secondaryStr);
      texs.push(faceTex);

      // If product has local uploaded image, also apply it directly to the front cover via TextureLoader
      const frontMat = new THREE.MeshStandardMaterial({
        map: faceTex,
        metalness: 0.25,
        roughness: 0.28
      });
      if (product.image && product.image.startsWith('/assets/')) {
        new THREE.TextureLoader().load(product.image, (loaded) => {
          loaded.colorSpace = THREE.SRGBColorSpace;
          texs.push(loaded);
          frontMat.map = loaded;
          frontMat.needsUpdate = true;
        });
      }

      const sideMat = new THREE.MeshStandardMaterial({
        color: 0x111720,
        metalness: 0.82,
        roughness: 0.25
      });
      mats.push(frontMat, sideMat);

      const boxGeo = new THREE.BoxGeometry(1.45, 1.85, 0.36);
      geos.push(boxGeo);
      const productBox = new THREE.Mesh(boxGeo, [
        sideMat,
        sideMat,
        sideMat,
        sideMat,
        frontMat,
        sideMat
      ]);
      unitGroup.add(productBox);

      // Metallic Emissive Edge Frame & Holographic Orbit Ring
      const glowMat = new THREE.MeshStandardMaterial({
        color: accent.primary,
        emissive: accent.primary,
        emissiveIntensity: 1.5,
        roughness: 0.25
      });
      mats.push(glowMat);

      const ringGeo = new THREE.TorusGeometry(1.38, 0.016, 12, 64);
      geos.push(ringGeo);
      const haloRing = new THREE.Mesh(ringGeo, glowMat);
      haloRing.rotation.x = Math.PI / 2.2;
      unitGroup.add(haloRing);

      const ringGeo2 = new THREE.TorusGeometry(1.56, 0.01, 10, 64);
      geos.push(ringGeo2);
      const haloRing2 = new THREE.Mesh(ringGeo2, sideMat);
      haloRing2.rotation.x = -Math.PI / 2.6;
      haloRing2.rotation.y = 0.4;
      unitGroup.add(haloRing2);

      resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry || !renderer || !camera) return;
        const w = Math.max(120, entry.contentRect.width);
        const h = Math.max(120, entry.contentRect.height);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
      resizeObserver.observe(container);

      const clock = new THREE.Clock();
      const tick = () => {
        if (!renderer || !scene || !camera || !controls) return;
        const dt = Math.min(0.1, Math.max(0.016, clock.getDelta()));
        const elapsed = clock.elapsedTime;

        if (!isDragging) {
          unitGroup.rotation.y += dt * 0.42;
        }
        unitGroup.position.y = Math.sin(elapsed * 1.4) * 0.06;
        haloRing.rotation.z += dt * 0.55;
        haloRing2.rotation.z -= dt * 0.35;

        controls.update();
        renderer.render(scene, camera);

        if (isSoftwareGl) {
          animFrameId = window.setTimeout(() => requestAnimationFrame(tick), 60);
        } else {
          animFrameId = requestAnimationFrame(tick);
        }
      };

      animFrameId = requestAnimationFrame(tick);

      return () => {
        window.clearTimeout(animFrameId);
        cancelAnimationFrame(animFrameId);
        if (resizeObserver) resizeObserver.disconnect();
        if (controls) controls.dispose();
        geos.forEach((g) => g.dispose());
        mats.forEach((m) => m.dispose());
        texs.forEach((t) => t.dispose());
        if (envRenderTarget) envRenderTarget.dispose();
        if (pmremGenerator) pmremGenerator.dispose();
        if (renderer) renderer.dispose();
      };
    } catch {
      setFallback(true);
    }
  }, [product]);

  if (fallback) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#06090E] text-xs font-mono text-[#00D69A]">
        {product.name}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#06090E]">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute bottom-2.5 left-3 pointer-events-none px-2 py-1 rounded bg-[#07090B]/85 border border-[#1E2936] text-[10px] font-mono text-[#00D69A]">
        3D LIVE PACKAGE · DRAG TO INSPECT
      </div>
    </div>
  );
};
