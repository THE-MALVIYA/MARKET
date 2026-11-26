import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface FloatingNode {
  mesh: THREE.Mesh;
  baseX: number;
  baseY: number;
  baseZ: number;
  rotSpeedX: number;
  rotSpeedY: number;
  bobSpeed: number;
  bobAmp: number;
  phase: number;
}

const _mouseTarget = new THREE.Vector2(0, 0);
const _mouseCurrent = new THREE.Vector2(0, 0);

export const SpatialBackdrop3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let pmremGenerator: THREE.PMREMGenerator | null = null;
    let envRT: THREE.WebGLRenderTarget | null = null;
    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let disposed = false;

    const geos: THREE.BufferGeometry[] = [];
    const mats: THREE.Material[] = [];

    try {
      const probeCanvas = document.createElement('canvas');
      const glProbe = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!glProbe) return;

      const dbg = glProbe.getExtension('WEBGL_debug_renderer_info');
      const gpuStr = dbg ? String(glProbe.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
      const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpuStr);
      glProbe.getExtension('WEBGL_lose_context')?.loseContext();

      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;

      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const canvas = renderer.domElement;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      container.innerHTML = '';
      container.appendChild(canvas);

      canvas.addEventListener('webglcontextlost', (e) => e.preventDefault());

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050709, 0.032);

      camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 100);
      camera.position.set(0, 1.8, 16);

      pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      envRT = pmremGenerator.fromScene(roomEnv, 0.04);
      scene.environment = envRT.texture;
      scene.environmentIntensity = 0.85;
      roomEnv.dispose();

      // Studio Ambient + Rim Lighting
      const hemi = new THREE.HemisphereLight(0x38bdf8, 0x050709, 0.75);
      scene.add(hemi);

      const keyLight = new THREE.DirectionalLight(0x00d69a, 2.1);
      keyLight.position.set(8, 10, 9);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.7);
      rimLight.position.set(-10, -4, -6);
      scene.add(rimLight);

      // 1. Real 3D Perspective Wireframe Architectural Terrain Grid
      const gridFloor = new THREE.GridHelper(68, 44, 0x00d69a, 0x162230);
      gridFloor.position.set(0, -6.2, -8);
      const gridMats = Array.isArray(gridFloor.material) ? gridFloor.material : [gridFloor.material];
      gridMats.forEach((m) => {
        m.transparent = true;
        m.opacity = 0.28;
        mats.push(m);
      });
      geos.push(gridFloor.geometry);
      scene.add(gridFloor);

      // 2. Crisp 3D Metallic/Crystal Floating Telemetry Polyhedra
      const octGeo = new THREE.OctahedronGeometry(0.42, 0);
      const icoGeo = new THREE.IcosahedronGeometry(0.34, 0);
      const torusGeo = new THREE.TorusGeometry(0.48, 0.045, 12, 36);
      geos.push(octGeo, icoGeo, torusGeo);

      const titaniumMat = new THREE.MeshPhysicalMaterial({
        color: 0x16212e,
        metalness: 0.92,
        roughness: 0.18,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
      });
      const emeraldAlloyMat = new THREE.MeshPhysicalMaterial({
        color: 0x00d69a,
        emissive: 0x00664a,
        emissiveIntensity: 0.5,
        metalness: 0.86,
        roughness: 0.16,
        clearcoat: 0.9
      });
      const cyanAlloyMat = new THREE.MeshPhysicalMaterial({
        color: 0x22d3ee,
        emissive: 0x0b4c5e,
        emissiveIntensity: 0.45,
        metalness: 0.88,
        roughness: 0.18,
        clearcoat: 0.9
      });
      mats.push(titaniumMat, emeraldAlloyMat, cyanAlloyMat);

      const nodeConfigs = [
        { x: -9.5, y: 4.2, z: -4.5, geo: octGeo, mat: titaniumMat },
        { x: 10.2, y: 3.6, z: -5.2, geo: torusGeo, mat: emeraldAlloyMat },
        { x: -11.4, y: -2.2, z: -6.8, geo: icoGeo, mat: cyanAlloyMat },
        { x: 9.8, y: -2.8, z: -4.2, geo: octGeo, mat: titaniumMat },
        { x: -5.5, y: 5.8, z: -9.5, geo: torusGeo, mat: cyanAlloyMat },
        { x: 5.8, y: -4.1, z: -8.5, geo: icoGeo, mat: emeraldAlloyMat },
        { x: 0.4, y: 5.4, z: -11.2, geo: octGeo, mat: emeraldAlloyMat },
        { x: -14.2, y: 1.2, z: -9.5, geo: icoGeo, mat: titaniumMat },
        { x: 13.8, y: 0.8, z: -10.5, geo: octGeo, mat: cyanAlloyMat }
      ];

      const nodes: FloatingNode[] = nodeConfigs.map((cfg, idx) => {
        const mesh = new THREE.Mesh(cfg.geo, cfg.mat);
        mesh.position.set(cfg.x, cfg.y, cfg.z);
        const scale = 0.85 + (idx % 3) * 0.28;
        mesh.scale.setScalar(scale);
        scene!.add(mesh);
        return {
          mesh,
          baseX: cfg.x,
          baseY: cfg.y,
          baseZ: cfg.z,
          rotSpeedX: 0.16 + (idx % 4) * 0.06,
          rotSpeedY: 0.22 + (idx % 3) * 0.08,
          bobSpeed: 0.45 + (idx % 3) * 0.15,
          bobAmp: 0.28 + (idx % 2) * 0.18,
          phase: idx * 1.15
        };
      });

      // 3. Subtle 3D Depth Dust Motes
      const moteCount = isSoftwareGl ? 180 : 380;
      const motePos = new Float32Array(moteCount * 3);
      for (let i = 0; i < moteCount; i++) {
        motePos[i * 3] = (((i * 73) % 100) / 100 - 0.5) * 34;
        motePos[i * 3 + 1] = (((i * 41) % 100) / 100 - 0.5) * 20;
        motePos[i * 3 + 2] = -2 - ((i * 29) % 18);
      }
      const moteGeo = new THREE.BufferGeometry();
      moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
      const moteMat = new THREE.PointsMaterial({
        color: 0x7dd3fc,
        size: 0.055,
        transparent: true,
        opacity: 0.45,
        sizeAttenuation: true,
        depthWrite: false
      });
      geos.push(moteGeo);
      mats.push(moteMat);
      const motes = new THREE.Points(moteGeo, moteMat);
      scene.add(motes);

      const handleMouseMove = (e: MouseEvent) => {
        _mouseTarget.x = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
        _mouseTarget.y = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
      };
      window.addEventListener('mousemove', handleMouseMove, { passive: true });

      resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry || !renderer || !camera) return;
        const rw = Math.max(200, entry.contentRect.width);
        const rh = Math.max(200, entry.contentRect.height);
        camera.aspect = rw / rh;
        camera.updateProjectionMatrix();
        renderer.setSize(rw, rh);
      });
      resizeObserver.observe(container);

      const afterDraw = (cb: () => void) => {
        const gl = renderer!.getContext() as WebGL2RenderingContext;
        if (!gl || typeof gl.fenceSync !== 'function') {
          frameId = window.setTimeout(cb, 80);
          return;
        }
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 8);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 85);
          }
        };
        frameId = window.setTimeout(poll, 8);
      };

      const clock = new THREE.Clock();

      const tick = () => {
        if (disposed || !renderer || !scene || !camera) return;
        const dt = Math.min(0.1, Math.max(0.016, clock.getDelta()));
        const t = clock.elapsedTime;
        const scrollFactor = Math.min(1.5, (window.scrollY || 0) / 1400);

        _mouseCurrent.x = THREE.MathUtils.damp(_mouseCurrent.x, _mouseTarget.x, 3.2, dt);
        _mouseCurrent.y = THREE.MathUtils.damp(_mouseCurrent.y, _mouseTarget.y, 3.2, dt);

        if (!reducedMotion) {
          camera.position.x = _mouseCurrent.x * 1.15;
          camera.position.y = 1.8 - _mouseCurrent.y * 0.65 - scrollFactor * 1.4;
          camera.lookAt(0, -scrollFactor * 1.1, -6);

          nodes.forEach((n) => {
            n.mesh.rotation.x += dt * n.rotSpeedX;
            n.mesh.rotation.y += dt * n.rotSpeedY;
            n.mesh.position.y = n.baseY + Math.sin(t * n.bobSpeed + n.phase) * n.bobAmp;
          });

          motes.rotation.y = t * 0.012;
          gridFloor.position.z = -8 + ((t * 0.85) % 1.54);
        }

        renderer.render(scene, camera);

        if (reducedMotion) return;
        if (isSoftwareGl) afterDraw(tick);
        else frameId = requestAnimationFrame(tick);
      };

      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }
      frameId = requestAnimationFrame(tick);

      return () => {
        disposed = true;
        cancelAnimationFrame(frameId);
        window.clearTimeout(frameId);
        window.removeEventListener('mousemove', handleMouseMove);
        if (resizeObserver) resizeObserver.disconnect();
        geos.forEach((g) => g.dispose());
        mats.forEach((m) => m.dispose());
        if (envRT) envRT.dispose();
        if (pmremGenerator) pmremGenerator.dispose();
        if (renderer) renderer.dispose();
      };
    } catch {
      // Fall back gracefully to pure CSS spatial gradient
    }
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-75"
    />
  );
};
