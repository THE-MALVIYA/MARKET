import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
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

function createRoundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createRadialGradient(S / 2, S / 2, 12, S / 2, S / 2, S / 2);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.36)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildBoxFaceTexture(
  product: Product,
  hexStr: string,
  secondaryStr: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const W = 1536;
  const H = 1920;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  ctx.scale(2, 2);

  const w = 768;
  const h = 960;
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#182433');
  bg.addColorStop(0.55, '#0A1018');
  bg.addColorStop(1, '#04070B');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Machined micro-grid
  ctx.strokeStyle = 'rgba(255,255,255,0.055)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Central radial illumination
  const glow = ctx.createRadialGradient(w / 2, h * 0.4, 18, w / 2, h * 0.4, 280);
  glow.addColorStop(0, `${hexStr}60`);
  glow.addColorStop(0.55, `${secondaryStr}22`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Precision 4K Hexagonal Emblem
  ctx.strokeStyle = hexStr;
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
    const px = w / 2 + Math.cos(a) * 124;
    const py = h * 0.36 + Math.sin(a) * 124;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = secondaryStr;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.36, 82, 0, Math.PI * 2);
  ctx.stroke();

  // Brand top tag
  ctx.fillStyle = hexStr;
  ctx.font = '700 24px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('DEEPSEEK // 4K VERIFIED BUILD', w / 2, 82);

  // Product Name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 50px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(product.name.slice(0, 20), w / 2, h * 0.62);

  // Category & Code
  ctx.fillStyle = '#B8C5D2';
  ctx.font = '600 23px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(product.category.slice(0, 36), w / 2, h * 0.68);

  ctx.fillStyle = hexStr;
  ctx.font = '700 26px "JetBrains Mono", monospace';
  ctx.fillText(`${product.productCode || product.id.toUpperCase()} · ${product.version || 'LTS'}`, w / 2, h * 0.78);

  // Bottom machined trim bar
  ctx.fillStyle = hexStr;
  ctx.fillRect(64, h - 72, w - 128, 6);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
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
    let disposed = false;

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
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2.5));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.24;
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const canvas = renderer.domElement;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      canvas.style.cursor = 'grab';
      canvas.style.touchAction = 'none';
      container.innerHTML = '';
      container.appendChild(canvas);

      canvas.addEventListener('webglcontextlost', (e) => e.preventDefault());

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 60);
      camera.position.set(1.75, 0.92, 4.15);

      pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      envRenderTarget = pmremGenerator.fromScene(roomEnv, 0.04);
      scene.environment = envRenderTarget.texture;
      scene.environmentIntensity = 0.95;
      roomEnv.dispose();

      const accent = getAccentHex(product);

      // Balanced 3-Point Studio Lighting + Softboxes
      const hemi = new THREE.HemisphereLight(0xa5e4ff, 0x07090b, 0.78);
      scene.add(hemi);

      const key = new THREE.DirectionalLight(0xfff5e4, 2.3);
      key.position.set(4.5, 6.2, 5.5);
      scene.add(key);

      const rim = new THREE.DirectionalLight(0x38bdf8, 1.55);
      rim.position.set(-5, 3, -4);
      scene.add(rim);

      const accentLight = new THREE.PointLight(accent.primary, 5.5, 11);
      accentLight.position.set(-2.4, 1.3, 2.6);
      scene.add(accentLight);

      if (!isSoftwareGl) {
        RectAreaLightUniformsLib.init();
        const softboxLeft = new THREE.RectAreaLight(0xffffff, 3.2, 2.4, 3.2);
        softboxLeft.position.set(-3.2, 1.8, 3.0);
        softboxLeft.lookAt(0, 0, 0);
        scene.add(softboxLeft);

        const softboxRight = new THREE.RectAreaLight(accent.primary, 2.6, 2.0, 2.8);
        softboxRight.position.set(3.2, 0.6, 2.8);
        softboxRight.lookAt(0, 0, 0);
        scene.add(softboxRight);
      }

      controls = new OrbitControls(camera, canvas);
      controls.enablePan = false;
      controls.minDistance = 2.5;
      controls.maxDistance = 5.8;
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

      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      const faceTex = buildBoxFaceTexture(product, accent.hexStr, accent.secondaryStr, maxAniso);
      texs.push(faceTex);

      // 1. Machined Beveled Titanium Chassis (Primary Silhouette via ExtrudeGeometry)
      const chassisShape = createRoundedRectShape(1.42, 1.84, 0.09);
      const rawChassisGeo = new THREE.ExtrudeGeometry(chassisShape, {
        depth: 0.28,
        bevelEnabled: true,
        bevelThickness: 0.045,
        bevelSize: 0.04,
        bevelSegments: 4
      });
      rawChassisGeo.translate(0, 0, -0.14);
      const chassisGeo = mergeVertices(rawChassisGeo);
      rawChassisGeo.dispose();
      if (
        chassisGeo.index &&
        chassisGeo.attributes.position &&
        chassisGeo.attributes.normal &&
        chassisGeo.attributes.uv
      ) {
        chassisGeo.computeTangents();
      }
      geos.push(chassisGeo);

      const chassisMat = new THREE.MeshPhysicalMaterial({
        color: 0x161f2b,
        metalness: 0.92,
        roughness: 0.24,
        anisotropy: 0.78,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2
      });
      mats.push(chassisMat);

      const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
      unitGroup.add(chassisMesh);

      // 2. Internal Glowing Core Side Vent Frame (Secondary Read)
      const coreFrameGeo = new THREE.BoxGeometry(1.52, 1.62, 0.14);
      geos.push(coreFrameGeo);
      const glowMat = new THREE.MeshStandardMaterial({
        color: accent.primary,
        emissive: accent.primary,
        emissiveIntensity: 1.65,
        metalness: 0.4,
        roughness: 0.2
      });
      mats.push(glowMat);
      const coreFrameMesh = new THREE.Mesh(coreFrameGeo, glowMat);
      unitGroup.add(coreFrameMesh);

      // 3. Recessed 4K Artwork Faceplate + Backplate
      const frontMat = new THREE.MeshPhysicalMaterial({
        map: faceTex,
        metalness: 0.2,
        roughness: 0.18,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08
      });
      mats.push(frontMat);

      if (product.image && product.image.startsWith('/assets/')) {
        new THREE.TextureLoader().load(product.image, (loaded) => {
          loaded.colorSpace = THREE.SRGBColorSpace;
          loaded.anisotropy = maxAniso;
          texs.push(loaded);
          frontMat.map = loaded;
          frontMat.needsUpdate = true;
        });
      }

      const plateGeo = new THREE.PlaneGeometry(1.32, 1.74);
      geos.push(plateGeo);

      const frontPlate = new THREE.Mesh(plateGeo, frontMat);
      frontPlate.position.z = 0.19;
      frontPlate.material.polygonOffset = true;
      frontPlate.material.polygonOffsetFactor = -1;
      frontPlate.material.polygonOffsetUnits = -1;
      unitGroup.add(frontPlate);

      const backPlate = new THREE.Mesh(plateGeo, frontMat);
      backPlate.position.z = -0.19;
      backPlate.rotation.y = Math.PI;
      unitGroup.add(backPlate);

      // 4. Precision Machined Corner Fasteners (Accent Detail)
      const boltGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.4, 6);
      boltGeo.rotateX(Math.PI / 2);
      geos.push(boltGeo);
      const boltMat = new THREE.MeshPhysicalMaterial({
        color: 0xdbeafe,
        metalness: 0.96,
        roughness: 0.14,
        clearcoat: 0.8
      });
      mats.push(boltMat);

      const boltCoords: [number, number][] = [
        [-0.6, 0.8],
        [0.6, 0.8],
        [-0.6, -0.8],
        [0.6, -0.8]
      ];
      boltCoords.forEach(([bx, by]) => {
        const bolt = new THREE.Mesh(boltGeo, boltMat);
        bolt.position.set(bx, by, 0);
        unitGroup.add(bolt);
      });

      // 5. Dual Counter-Rotating Gyroscopic Containment Rings
      const ringGeo1 = new THREE.TorusGeometry(1.42, 0.018, 14, 72);
      const ringGeo2 = new THREE.TorusGeometry(1.62, 0.012, 12, 72);
      geos.push(ringGeo1, ringGeo2);

      const ringMetalMat = new THREE.MeshPhysicalMaterial({
        color: 0x334155,
        metalness: 0.94,
        roughness: 0.18,
        clearcoat: 0.9
      });
      mats.push(ringMetalMat);

      const haloRing = new THREE.Mesh(ringGeo1, glowMat);
      haloRing.rotation.x = Math.PI / 2.25;
      unitGroup.add(haloRing);

      const haloRing2 = new THREE.Mesh(ringGeo2, ringMetalMat);
      haloRing2.rotation.x = -Math.PI / 2.6;
      haloRing2.rotation.y = 0.42;
      unitGroup.add(haloRing2);

      // 6. Grounded Studio Contact Shadow Plane (prevents floating void)
      const shadowTex = createContactShadowTexture();
      texs.push(shadowTex);
      const shadowGeo = new THREE.PlaneGeometry(3.2, 3.2);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.58,
        depthWrite: false
      });
      geos.push(shadowGeo);
      mats.push(shadowMat);
      const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -1.24;
      scene.add(shadowPlane);

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

      const afterDraw = (cb: () => void) => {
        const gl = renderer!.getContext() as WebGL2RenderingContext;
        if (!gl || typeof gl.fenceSync !== 'function') {
          animFrameId = window.setTimeout(cb, 75);
          return;
        }
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            animFrameId = window.setTimeout(poll, 6);
          } else {
            if (sync) gl.deleteSync(sync);
            animFrameId = window.setTimeout(cb, 80);
          }
        };
        animFrameId = window.setTimeout(poll, 6);
      };

      const clock = new THREE.Clock();
      const tick = () => {
        if (disposed || !renderer || !scene || !camera || !controls) return;
        const dt = Math.min(0.1, Math.max(0.016, clock.getDelta()));
        const elapsed = clock.elapsedTime;

        if (!isDragging) {
          unitGroup.rotation.y += dt * 0.42;
        }
        unitGroup.position.y = Math.sin(elapsed * 1.35) * 0.055;
        haloRing.rotation.z += dt * 0.55;
        haloRing2.rotation.z -= dt * 0.36;

        controls.update();
        renderer.render(scene, camera);

        if (isSoftwareGl) afterDraw(tick);
        else animFrameId = requestAnimationFrame(tick);
      };

      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }
      animFrameId = requestAnimationFrame(tick);

      return () => {
        disposed = true;
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
      <div className="absolute bottom-2.5 left-3 pointer-events-none px-2.5 py-1 rounded bg-[#07090B]/90 border border-[#2A394C] text-[10px] font-mono text-[#00D69A]">
        4K 3D HARDWARE RIG · DRAG TO ROTATE 360°
      </div>
    </div>
  );
};
