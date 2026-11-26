import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Volume2, VolumeX, FastForward, Terminal, ShieldAlert } from 'lucide-react';
import { INTRO_VOICE_CUES, IntroAudioEngine } from '../utils/introAudioEngine';

interface CinematicIntro3DProps {
  onComplete: (completedNaturally: boolean) => void;
}

const INTRO_DURATION = 120;

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _camPos = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();
const _c1 = new THREE.Color();
const _c2 = new THREE.Color();
const _m4 = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _s = new THREE.Vector3();

const HACKER_LINES_RED = [
  'root@node-09:~# ./exploit_kernel --target 0.0.0.0/0',
  '[+] Bypassing WAF & TLS 1.3 Pinning .......... OK',
  '[!] MEMORY DUMP: 0x7FFE89A2 -> 4F 9C 00 FF A1 3D',
  '[+] Cracking RSA-4096 Master Entropy [99.4%]',
  'WARN: IDS Watchdog Terminated (PID 4401)',
  '[+] Injecting Ring-0 Payload into /dev/kmem',
  'TRACE: 185.220.101.44 -> PORT 443 OVERRIDE',
  '[CRITICAL] SYSTEM ACCESS ESCALATED: UID=0 (ROOT)',
  '>>> STREAMING ENCRYPTED PAYLOAD: 1.42 GB/s <<<',
  '[!] FIREWALL LAYER 7 SHATTERED // NO ESCAPE'
];

const HACKER_LINES_EMERALD = [
  'root@deepseek-core:~# ./deephat_lock --engage',
  '[+] Deephat Containment Mesh Verified ........ 100%',
  '[+] Modules Armed: X-TX SQM | SQL Flash | TX Kit',
  '[+] Live 3D Global Threat Earth Synchronized',
  '[+] Verifying SHA-256 Package Manifests ...... OK',
  '[+] Tron TRC-20 On-Chain Scanner Ready',
  '[+] Zero-Trust Quantum Vaults Sealed',
  '[+] Issuing Sovereign License Infrastructure',
  '>>> DEEPSEEK COMMAND GRID: ONLINE <<<'
];

function drawTerminalCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  tickCount: number,
  isContainment: boolean,
  isBreachFlash: boolean,
  variant: number
) {
  ctx.fillStyle = isBreachFlash ? '#2b0208' : '#030608';
  ctx.fillRect(0, 0, width, height);

  const accent = isContainment ? '#00D69A' : '#FF1E38';
  const dimAccent = isContainment ? 'rgba(0, 214, 154, 0.24)' : 'rgba(255, 30, 56, 0.26)';
  const subText = isContainment ? '#8CEAD0' : '#FF8F9C';

  // Scanline grid
  ctx.strokeStyle = dimAccent;
  ctx.lineWidth = 1;
  for (let y = 0; y < height; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Header Bar
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, width, 34);
  ctx.fillStyle = '#040608';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(
    isContainment
      ? `DEEPSEEK // DEEPHAT SHELL #0${variant + 1}`
      : `ROOT BREACH // NODE-0${variant + 4} [UID=0]`,
    14,
    22
  );

  // Scrolling terminal lines
  const lines = isContainment ? HACKER_LINES_EMERALD : HACKER_LINES_RED;
  ctx.font = '14px monospace';
  for (let i = 0; i < 8; i++) {
    const idx = (tickCount + i + variant * 2) % lines.length;
    ctx.fillStyle = i === 7 ? '#FFFFFF' : i % 2 === 0 ? accent : subText;
    ctx.fillText(lines[idx], 16, 64 + i * 24);
  }

  // Live Hex Matrix Block at bottom
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(14, height - 74, width - 28, 58);
  ctx.strokeStyle = accent;
  ctx.strokeRect(14, height - 74, width - 28, 58);

  const pct = isContainment ? 100 : Math.min(99, ((tickCount * 7 + variant * 19) % 100));
  ctx.fillStyle = accent;
  ctx.font = 'bold 13px monospace';
  ctx.fillText(
    isContainment
      ? `CONTAINMENT INTEGRITY: 100%  [SHA-256 LOCKED]`
      : `DECRYPTING CORE ENTROPY: ${pct}%  [0x${((tickCount * 4919 + variant * 997) & 0xffff).toString(16).toUpperCase().padStart(4, '0')}]`,
    24,
    height - 49
  );

  ctx.fillStyle = '#11161D';
  ctx.fillRect(24, height - 36, width - 48, 10);
  ctx.fillStyle = accent;
  ctx.fillRect(24, height - 36, ((width - 48) * pct) / 100, 10);
}

function createServerRackTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#06080b';
  ctx.fillRect(0, 0, 256, 512);

  for (let y = 12; y < 500; y += 22) {
    ctx.fillStyle = '#0d1118';
    ctx.fillRect(14, y, 228, 16);
    ctx.strokeStyle = '#18222e';
    ctx.strokeRect(14, y, 228, 16);

    for (let x = 24; x < 190; x += 18) {
      const r = (x * 13 + y * 7) % 11;
      ctx.fillStyle = r < 2 ? '#ff1e38' : r === 3 ? '#00d69a' : '#1b2634';
      ctx.fillRect(x, y + 5, 8, 5);
    }
    ctx.fillStyle = y % 66 === 12 ? '#ff1e38' : '#243242';
    ctx.fillRect(210, y + 4, 22, 8);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createFloorGridTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#020305';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = 'rgba(255, 30, 56, 0.34)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 512; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(0, 214, 154, 0.14)';
  ctx.lineWidth = 1;
  for (let i = 32; i < 512; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(20, 20);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createHackerSpriteTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, 64, 64);

  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.45, 'rgba(255, 255, 255, 0.65)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('01', 32, 32);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const CinematicIntro3D: React.FC<CinematicIntro3DProps> = ({ onComplete }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<IntroAudioEngine | null>(null);
  const completedRef = useRef(false);
  const elapsedRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [elapsed, setElapsed] = useState(0);
  const [act, setAct] = useState<1 | 2 | 3 | 4>(1);
  const [audioActive, setAudioActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [blackoutFlash, setBlackoutFlash] = useState(false);
  const [activeCueIndex, setActiveCueIndex] = useState(0);

  const exitIntro = (natural: boolean) => {
    if (completedRef.current) return;
    completedRef.current = true;
    setFadingOut(true);
    window.setTimeout(() => {
      audioRef.current?.dispose();
      onCompleteRef.current(natural);
    }, 550);
  };

  const unlockAndPlayAudio = async () => {
    const engine = audioRef.current;
    if (!engine) return;
    const ok = await engine.start();
    if (ok) {
      setAudioActive(true);
      setMuted(false);
      engine.setMuted(false);
      const idx = engine.updateVoiceCues(Math.max(1.05, elapsedRef.current));
      setActiveCueIndex(idx);
    }
  };

  const toggleMute = async () => {
    const engine = audioRef.current;
    if (!engine) return;
    if (!audioActive) {
      await unlockAndPlayAudio();
      return;
    }
    const nextMuted = !muted;
    setMuted(nextMuted);
    engine.setMuted(nextMuted);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const engine = new IntroAudioEngine();
    audioRef.current = engine;

    void engine.start().then((ok) => {
      if (ok) {
        setAudioActive(true);
        const idx = engine.updateVoiceCues(Math.max(1.05, elapsedRef.current));
        setActiveCueIndex(idx);
      }
    });

    const handleFirstGesture = () => {
      if (engine.getState() !== 'running') {
        void engine.start().then((ok) => {
          if (ok) {
            setAudioActive(true);
            const idx = engine.updateVoiceCues(Math.max(1.05, elapsedRef.current));
            setActiveCueIndex(idx);
          }
        });
      }
    };

    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let pmremGenerator: THREE.PMREMGenerator | null = null;
    let envRT: THREE.WebGLRenderTarget | null = null;
    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let disposed = false;
    let lastAct: 1 | 2 | 3 | 4 = 1;
    const firedBreaches = new Set<number>();

    const geos: THREE.BufferGeometry[] = [];
    const mats: THREE.Material[] = [];
    const texs: THREE.Texture[] = [];

    try {
      const probeCanvas = document.createElement('canvas');
      const glProbe = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!glProbe) {
        const startTs = performance.now();
        const t = window.setInterval(() => {
          const sec = (performance.now() - startTs) / 1000;
          elapsedRef.current = sec;
          setElapsed(Math.min(INTRO_DURATION, sec));
          setActiveCueIndex(engine.updateVoiceCues(sec));
          if (sec >= INTRO_DURATION) {
            clearInterval(t);
            exitIntro(true);
          }
        }, 180);
        return () => {
          clearInterval(t);
          window.removeEventListener('pointerdown', handleFirstGesture);
          window.removeEventListener('keydown', handleFirstGesture);
          engine.dispose();
        };
      }

      const dbg = glProbe.getExtension('WEBGL_debug_renderer_info');
      const gpuStr = dbg ? String(glProbe.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
      const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpuStr);
      glProbe.getExtension('WEBGL_lose_context')?.loseContext();

      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;

      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.24;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = !isSoftwareGl;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const canvas = renderer.domElement;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      container.innerHTML = '';
      container.appendChild(canvas);

      canvas.addEventListener('webglcontextlost', (e) => e.preventDefault());

      const maxAniso = renderer.capabilities.getMaxAnisotropy();

      scene = new THREE.Scene();
      const bgColor = new THREE.Color(0x020204);
      scene.background = bgColor;
      const fog = new THREE.FogExp2(0x020204, 0.052);
      scene.fog = fog;

      camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 180);
      camera.position.set(0, 1.5, 22.0);

      pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      envRT = pmremGenerator.fromScene(roomEnv, 0.04);
      scene.environment = envRT.texture;
      scene.environmentIntensity = 0.7;
      roomEnv.dispose();

      // Horror Cyber-Bunker Lighting Rig
      const hemi = new THREE.HemisphereLight(0x281822, 0x030406, 0.6);
      scene.add(hemi);

      const keyLight = new THREE.DirectionalLight(0xff1e38, 2.4);
      keyLight.position.set(6, 12, 10);
      if (!isSoftwareGl) {
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(1024, 1024);
      }
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x00d69a, 1.8);
      rimLight.position.set(-10, 5, -9);
      scene.add(rimLight);

      const monitorGlow = new THREE.PointLight(0xff1e38, 9, 18, 1.5);
      monitorGlow.position.set(0, 0.9, 2.2);
      scene.add(monitorGlow);

      const alarmStrobe = new THREE.PointLight(0xff2c44, 0, 60, 1.1);
      alarmStrobe.position.set(0, 9, 4);
      scene.add(alarmStrobe);

      // 1. Wet Obsidian Floor Grid (polygonOffset prevents z-fighting)
      const floorTex = createFloorGridTexture(maxAniso);
      texs.push(floorTex);
      const floorGeo = new THREE.PlaneGeometry(140, 140);
      const floorMat = new THREE.MeshStandardMaterial({
        map: floorTex,
        roughness: 0.22,
        metalness: 0.78,
        emissive: 0x160306,
        emissiveIntensity: 0.4,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1
      });
      geos.push(floorGeo);
      mats.push(floorMat);
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.y = -4.5;
      floorMesh.receiveShadow = !isSoftwareGl;
      scene.add(floorMesh);

      // 2. Towering Cyber-Server Rack Corridor (96 Instanced Monoliths)
      const rackTex = createServerRackTexture(maxAniso);
      texs.push(rackTex);
      const RACK_COUNT = 96;
      const rackGeo = new THREE.BoxGeometry(1.7, 13.5, 2.1);
      const rackMat = new THREE.MeshStandardMaterial({
        map: rackTex,
        color: 0x1b222c,
        emissiveMap: rackTex,
        emissive: 0xffffff,
        emissiveIntensity: 0.7,
        metalness: 0.85,
        roughness: 0.35
      });
      geos.push(rackGeo);
      mats.push(rackMat);

      const racks = new THREE.InstancedMesh(rackGeo, rackMat, RACK_COUNT);
      const rackMeta: { x: number; z: number; baseScaleY: number }[] = [];
      for (let i = 0; i < RACK_COUNT; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const row = Math.floor(i / 2);
        const angle = (row / 24) * Math.PI * 1.4 - Math.PI * 0.7;
        const dist = 10.5 + (row % 3) * 4.2;
        const x =
          row < 20
            ? side * (7.2 + (row % 2) * 3.1)
            : Math.sin(angle) * dist;
        const z =
          row < 20
            ? 24 - row * 2.5
            : Math.cos(angle) * dist - 4;
        const sy = 0.88 + (i % 5) * 0.14;
        rackMeta.push({ x, z, baseScaleY: sy });
        _v1.set(x, -4.5 + (13.5 * sy) / 2, z);
        _e.set(0, row < 20 ? (side > 0 ? -Math.PI / 2 : Math.PI / 2) : -angle, 0);
        _q.setFromEuler(_e);
        _s.set(1, sy, 1);
        _m4.compose(_v1, _q, _s);
        racks.setMatrixAt(i, _m4);
      }
      racks.instanceMatrix.needsUpdate = true;
      racks.computeBoundingSphere();
      scene.add(racks);

      // 3. Centerpiece Composite 3D Subject: HOODED CYBER-INTRUDER PHANTOM (16+ PBR Parts)
      const hackerGroup = new THREE.Group();
      hackerGroup.position.set(0, 0.2, 0);
      scene.add(hackerGroup);

      const cloakMat = new THREE.MeshStandardMaterial({
        color: 0x090b0e,
        roughness: 0.86,
        metalness: 0.18
      });
      const maskArmorMat = new THREE.MeshStandardMaterial({
        color: 0x1c232d,
        roughness: 0.18,
        metalness: 0.92
      });
      const cyberChromeMat = new THREE.MeshStandardMaterial({
        color: 0x8ea0b2,
        roughness: 0.14,
        metalness: 0.96
      });
      const faceVoidMat = new THREE.MeshStandardMaterial({
        color: 0x010102,
        roughness: 0.95,
        metalness: 0.05
      });
      const eyeMat = new THREE.MeshStandardMaterial({
        color: 0xff0026,
        emissive: 0xff0026,
        emissiveIntensity: 3.8,
        roughness: 0.08,
        metalness: 0.1
      });
      const laserBeamMat = new THREE.MeshBasicMaterial({
        color: 0xff1133,
        transparent: true,
        opacity: 0.24,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      mats.push(cloakMat, maskArmorMat, cyberChromeMat, faceVoidMat, eyeMat, laserBeamMat);

      // Sculpted Hooded Torso & Mantle (LatheGeometry silhouette)
      const torsoPts = [
        new THREE.Vector2(2.3, -4.6),
        new THREE.Vector2(1.9, -2.2),
        new THREE.Vector2(1.65, -0.5),
        new THREE.Vector2(1.35, 0.6),
        new THREE.Vector2(0.85, 0.9)
      ];
      const torsoGeo = new THREE.LatheGeometry(torsoPts, 24);
      geos.push(torsoGeo);
      const torsoMesh = new THREE.Mesh(torsoGeo, cloakMat);
      hackerGroup.add(torsoMesh);

      // Cyber Shoulder Pauldrons (beveled armor)
      const shoulderGeo = new THREE.BoxGeometry(1.35, 0.45, 0.95);
      geos.push(shoulderGeo);
      [-1, 1].forEach((side) => {
        const sh = new THREE.Mesh(shoulderGeo, maskArmorMat);
        sh.position.set(side * 1.48, 0.35, 0.1);
        sh.rotation.z = side * -0.34;
        hackerGroup.add(sh);
      });

      // Head Assembly (tracks viewer with sinister micro-tilts)
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 1.85, 0.2);
      hackerGroup.add(headGroup);

      // Outer Hood Cowl
      const hoodGeo = new THREE.SphereGeometry(1.18, 28, 24, 0, Math.PI * 2, 0, Math.PI * 0.72);
      geos.push(hoodGeo);
      const hoodMesh = new THREE.Mesh(hoodGeo, cloakMat);
      hoodMesh.scale.set(1.04, 1.24, 1.18);
      hoodMesh.rotation.x = 0.26;
      hoodMesh.position.set(0, 0.16, -0.15);
      headGroup.add(hoodMesh);

      // Hood Peak Rim
      const hoodRimGeo = new THREE.TorusGeometry(0.95, 0.14, 12, 32, Math.PI * 1.35);
      geos.push(hoodRimGeo);
      const hoodRim = new THREE.Mesh(hoodRimGeo, cloakMat);
      hoodRim.rotation.z = -Math.PI * 0.175;
      hoodRim.rotation.x = -0.25;
      hoodRim.position.set(0, 0.08, 0.66);
      headGroup.add(hoodRim);

      // Pitch-black shadow void under hood
      const voidGeo = new THREE.SphereGeometry(0.82, 20, 18);
      geos.push(voidGeo);
      const voidMesh = new THREE.Mesh(voidGeo, faceVoidMat);
      voidMesh.scale.set(0.9, 1.08, 0.88);
      voidMesh.position.set(0, 0.05, 0.28);
      headGroup.add(voidMesh);

      // Sculpted Metallic Cyber-Skull Mask (ExtrudeGeometry faceplate)
      const maskShape = new THREE.Shape();
      maskShape.moveTo(-0.56, 0.52);
      maskShape.lineTo(0, 0.68);
      maskShape.lineTo(0.56, 0.52);
      maskShape.lineTo(0.66, 0.05);
      maskShape.lineTo(0.46, -0.45);
      maskShape.lineTo(0.24, -0.78);
      maskShape.lineTo(-0.24, -0.78);
      maskShape.lineTo(-0.46, -0.45);
      maskShape.lineTo(-0.66, 0.05);
      maskShape.closePath();

      const maskGeo = new THREE.ExtrudeGeometry(maskShape, {
        depth: 0.28,
        bevelEnabled: true,
        bevelThickness: 0.07,
        bevelSize: 0.06,
        bevelSegments: 3
      });
      geos.push(maskGeo);
      const maskMesh = new THREE.Mesh(maskGeo, maskArmorMat);
      maskMesh.position.set(0, 0.02, 0.54);
      headGroup.add(maskMesh);

      // Sinister Teeth / Respirator Vent Bars on Mask Jaw
      const ventGeo = new THREE.BoxGeometry(0.05, 0.24, 0.09);
      geos.push(ventGeo);
      for (let v = -3; v <= 3; v++) {
        const bar = new THREE.Mesh(ventGeo, cyberChromeMat);
        bar.position.set(v * 0.08, -0.5, 0.9);
        headGroup.add(bar);
      }

      // Piercing Crimson Optical Scanner Eyes + Volumetric Laser Cones
      const eyeGeo = new THREE.BoxGeometry(0.22, 0.075, 0.14);
      const beamGeo = new THREE.ConeGeometry(0.45, 11, 20, 1, true);
      beamGeo.translate(0, -5.5, 0);
      beamGeo.rotateX(Math.PI / 2);
      geos.push(eyeGeo, beamGeo);

      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.24, 0.15, 0.88);
      leftEye.rotation.z = -0.18;

      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.24, 0.15, 0.88);
      rightEye.rotation.z = 0.18;

      const leftBeam = new THREE.Mesh(beamGeo, laserBeamMat);
      leftBeam.position.copy(leftEye.position);
      const rightBeam = new THREE.Mesh(beamGeo, laserBeamMat);
      rightBeam.position.copy(rightEye.position);

      headGroup.add(leftEye, rightEye, leftBeam, rightBeam);

      // Articulated Cyber-Hands hovering over holographic keyboards
      const armGeo = new THREE.CylinderGeometry(0.14, 0.18, 1.65, 12);
      const handGeo = new THREE.BoxGeometry(0.32, 0.12, 0.42);
      const fingerGeo = new THREE.BoxGeometry(0.04, 0.05, 0.22);
      geos.push(armGeo, handGeo, fingerGeo);

      const hands: THREE.Group[] = [];
      [-1, 1].forEach((side) => {
        const arm = new THREE.Mesh(armGeo, cloakMat);
        arm.position.set(side * 1.35, -0.55, 0.9);
        arm.rotation.x = 1.05;
        arm.rotation.z = side * 0.28;
        hackerGroup.add(arm);

        const handGrp = new THREE.Group();
        handGrp.position.set(side * 0.92, -1.05, 1.85);
        const palm = new THREE.Mesh(handGeo, maskArmorMat);
        handGrp.add(palm);
        for (let f = -2; f <= 2; f++) {
          const finger = new THREE.Mesh(fingerGeo, cyberChromeMat);
          finger.position.set(f * 0.06, -0.02, 0.26);
          finger.rotation.x = 0.35;
          handGrp.add(finger);
        }
        hackerGroup.add(handGrp);
        hands.push(handGrp);
      });

      // 4. Dual Live-Updating 3D Terminal Textures & 6 Curved Holographic Displays
      const termCanvasA = document.createElement('canvas');
      termCanvasA.width = 512;
      termCanvasA.height = 320;
      const termCtxA = termCanvasA.getContext('2d')!;
      drawTerminalCanvas(termCtxA, 512, 320, 0, false, false, 0);
      const termTexA = new THREE.CanvasTexture(termCanvasA);
      termTexA.colorSpace = THREE.SRGBColorSpace;
      termTexA.anisotropy = maxAniso;

      const termCanvasB = document.createElement('canvas');
      termCanvasB.width = 512;
      termCanvasB.height = 320;
      const termCtxB = termCanvasB.getContext('2d')!;
      drawTerminalCanvas(termCtxB, 512, 320, 3, false, false, 1);
      const termTexB = new THREE.CanvasTexture(termCanvasB);
      termTexB.colorSpace = THREE.SRGBColorSpace;
      termTexB.anisotropy = maxAniso;
      texs.push(termTexA, termTexB);

      const screenMatA = new THREE.MeshStandardMaterial({
        map: termTexA,
        emissiveMap: termTexA,
        emissive: 0xffffff,
        emissiveIntensity: 1.05,
        roughness: 0.2,
        metalness: 0.1,
        side: THREE.DoubleSide
      });
      const screenMatB = new THREE.MeshStandardMaterial({
        map: termTexB,
        emissiveMap: termTexB,
        emissive: 0xffffff,
        emissiveIntensity: 1.05,
        roughness: 0.2,
        metalness: 0.1,
        side: THREE.DoubleSide
      });
      mats.push(screenMatA, screenMatB);

      const screenGeo = new THREE.PlaneGeometry(3.2, 2.0);
      geos.push(screenGeo);

      const holoScreens: { mesh: THREE.Mesh; baseAngle: number; baseY: number; radius: number }[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = -Math.PI * 0.52 + (i / 5) * Math.PI * 1.04;
        const radius = i % 2 === 0 ? 4.3 : 5.4;
        const y = i % 2 === 0 ? -0.35 : 2.35;
        const scr = new THREE.Mesh(screenGeo, i % 2 === 0 ? screenMatA : screenMatB);
        scr.position.set(Math.sin(angle) * radius, y, Math.cos(angle) * radius - 0.5);
        scr.lookAt(0, y, 0.4);
        scene.add(scr);
        holoScreens.push({ mesh: scr, baseAngle: angle, baseY: y, radius });
      }

      // 5. Snaking Fiber-Optic Conduit Cables (TubeGeometry) across the wet floor
      const cableMat = new THREE.MeshStandardMaterial({
        color: 0xff1e38,
        emissive: 0xff1e38,
        emissiveIntensity: 1.4,
        roughness: 0.3,
        metalness: 0.7
      });
      mats.push(cableMat);

      for (let c = 0; c < 10; c++) {
        const a = (c / 10) * Math.PI * 2;
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(Math.sin(a) * 1.2, -4.38, Math.cos(a) * 1.2),
          new THREE.Vector3(Math.sin(a + 0.22) * 5.2, -4.42, Math.cos(a + 0.22) * 5.2),
          new THREE.Vector3(Math.sin(a - 0.18) * 10.5, -4.38, Math.cos(a - 0.18) * 10.5),
          new THREE.Vector3(Math.sin(a) * 15.0, -3.5, Math.cos(a) * 15.0)
        ]);
        const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.055, 8, false);
        geos.push(tubeGeo);
        scene.add(new THREE.Mesh(tubeGeo, cableMat));
      }

      // 6. Rotating Firewall Rings & Threat Orbit Core
      const ringGeo1 = new THREE.TorusGeometry(3.8, 0.05, 12, 80);
      const ringGeo2 = new THREE.TorusGeometry(4.7, 0.04, 12, 96);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xff1e38,
        emissive: 0xff1e38,
        emissiveIntensity: 1.8,
        metalness: 0.8,
        roughness: 0.2
      });
      geos.push(ringGeo1, ringGeo2);
      mats.push(ringMat);

      const firewallRing1 = new THREE.Mesh(ringGeo1, ringMat);
      const firewallRing2 = new THREE.Mesh(ringGeo2, ringMat);
      firewallRing1.position.set(0, 0.5, 0);
      firewallRing2.position.set(0, 0.5, 0);
      scene.add(firewallRing1, firewallRing2);

      // 7. 1,500 Falling 3D Binary / Matrix Breach Rain Particles
      const RAIN_COUNT = 1500;
      const rainPos = new Float32Array(RAIN_COUNT * 3);
      const rainData: { x: number; z: number; speed: number }[] = [];
      for (let i = 0; i < RAIN_COUNT; i++) {
        const x = (Math.random() - 0.5) * 34;
        const z = (Math.random() - 0.5) * 44;
        const y = -4.5 + Math.random() * 19;
        rainData.push({ x, z, speed: 3.5 + Math.random() * 5.8 });
        rainPos[i * 3] = x;
        rainPos[i * 3 + 1] = y;
        rainPos[i * 3 + 2] = z;
      }
      const rainGeo = new THREE.BufferGeometry();
      const rainAttr = new THREE.BufferAttribute(rainPos, 3);
      rainGeo.setAttribute('position', rainAttr);
      const spriteTex = createHackerSpriteTexture();
      geos.push(rainGeo);
      texs.push(spriteTex);

      const rainMat = new THREE.PointsMaterial({
        map: spriteTex,
        color: 0xff1e38,
        size: 0.28,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      mats.push(rainMat);
      const rainPoints = new THREE.Points(rainGeo, rainMat);
      scene.add(rainPoints);

      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }

      resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry || !renderer || !camera) return;
        const nw = Math.max(120, entry.contentRect.width);
        const nh = Math.max(120, entry.contentRect.height);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      });
      resizeObserver.observe(container);

      const afterDraw = (cb: () => void) => {
        if (!renderer || disposed) return;
        const gl = renderer.getContext() as WebGL2RenderingContext;
        if (gl && typeof gl.fenceSync === 'function') {
          const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
          gl.flush();
          const poll = () => {
            if (disposed) {
              if (sync) gl.deleteSync(sync);
              return;
            }
            const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
            if (state === gl.UNSIGNALED) {
              frameId = window.setTimeout(poll, 5);
            } else {
              if (sync) gl.deleteSync(sync);
              frameId = window.setTimeout(cb, 75);
            }
          };
          frameId = window.setTimeout(poll, 5);
        } else {
          frameId = window.setTimeout(cb, 75);
        }
      };

      const startPerf = performance.now();
      let lastHudUpdate = 0;
      let lastTermRedraw = 0;
      let termTick = 0;
      let lastBlackoutState = false;

      // Key terrifying breach jumpscare & alarm moments across 2 minutes
      const BREACH_TIMES = [8.5, 22.0, 35.5, 48.0, 61.5, 78.0, 96.0];

      const tick = () => {
        if (disposed || !renderer || !scene || !camera) return;

        const nowMs = performance.now();
        const t = Math.min(INTRO_DURATION, (nowMs - startPerf) / 1000);
        elapsedRef.current = t;

        const currentAct: 1 | 2 | 3 | 4 =
          t < 30 ? 1 : t < 60 ? 2 : t < 90 ? 3 : 4;

        if (currentAct !== lastAct) {
          lastAct = currentAct;
          setAct(currentAct);
          engine.shiftActTone(currentAct);
        }

        // Detect breach lunge & power blackout strobe
        let breachPower = 0;
        let inBlackout = false;
        for (let bi = 0; bi < BREACH_TIMES.length; bi++) {
          const bt = BREACH_TIMES[bi];
          if (t >= bt && !firedBreaches.has(bi)) {
            firedBreaches.add(bi);
            engine.triggerBreachGlitchAndAlarm();
          }
          const dtB = t - bt;
          if (dtB >= 0 && dtB < 1.25) {
            if (dtB < 0.24) {
              inBlackout = true; // Lights cut out except glowing red eyes!
            } else {
              breachPower = Math.max(breachPower, 1 - (dtB - 0.24) / 1.01);
            }
          }
        }

        if (inBlackout !== lastBlackoutState) {
          lastBlackoutState = inBlackout;
          setBlackoutFlash(inBlackout);
        }

        if (nowMs - lastHudUpdate > 160) {
          lastHudUpdate = nowMs;
          setElapsed(t);
          const cueIdx = engine.updateVoiceCues(t);
          setActiveCueIndex(cueIdx);
        }

        // Color Evolution: Acts 1 & 2 = Terrifying Crimson Breach -> Acts 3 & 4 = Deephat Emerald Lock
        const containmentBlend = THREE.MathUtils.clamp((t - 58) / 14, 0, 1);
        _c1.setHex(0xff1e38);
        _c2.setHex(0x00d69a);
        _c1.lerp(_c2, containmentBlend);

        // Redraw live 3D holographic hacker screens every ~175ms
        if (nowMs - lastTermRedraw > 175) {
          lastTermRedraw = nowMs;
          termTick++;
          const isContainment = containmentBlend > 0.55;
          drawTerminalCanvas(termCtxA, 512, 320, termTick, isContainment, breachPower > 0.4, 0);
          drawTerminalCanvas(termCtxB, 512, 320, termTick + 2, isContainment, breachPower > 0.4, 1);
          termTexA.needsUpdate = true;
          termTexB.needsUpdate = true;
        }

        // Lighting & Power-Blackout Terror Flicker
        if (inBlackout) {
          hemi.intensity = 0.02;
          keyLight.intensity = 0.0;
          rimLight.intensity = 0.05;
          monitorGlow.intensity = 0.2;
          alarmStrobe.intensity = 0;
          eyeMat.emissiveIntensity = 7.5; // Eyes burn violently in total pitch darkness!
        } else {
          hemi.intensity = 0.6;
          keyLight.color.copy(_c1);
          keyLight.intensity = 2.4 + breachPower * 2.5;
          rimLight.intensity = 1.8;
          monitorGlow.color.copy(_c1);
          monitorGlow.intensity = 9 + Math.sin(t * 9) * 2.2 + breachPower * 8;
          alarmStrobe.color.copy(_c1);
          alarmStrobe.intensity = breachPower > 0.05 ? breachPower * 22 : Math.sin(t * 7) > 0.92 ? 10 : 0;
          eyeMat.emissive.copy(_c1);
          eyeMat.emissiveIntensity = 3.8 + breachPower * 3.5;
        }

        cableMat.color.copy(_c1);
        cableMat.emissive.copy(_c1);
        cableMat.emissiveIntensity = 1.2 + Math.sin(t * 6) * 0.5 + breachPower * 1.4;
        ringMat.color.copy(_c1);
        ringMat.emissive.copy(_c1);
        rainMat.color.copy(_c1);
        laserBeamMat.color.copy(_c1);
        laserBeamMat.opacity = inBlackout ? 0.55 : 0.22 + breachPower * 0.32;

        // Animate Hacker Phantom & Sinister Head Tracking
        hackerGroup.position.y = 0.2 + Math.sin(t * 1.5) * 0.16;
        headGroup.lookAt(camera.position.x * 0.45, camera.position.y - 1.2, camera.position.z);
        headGroup.rotation.z = Math.sin(t * 1.9) * 0.09 + (breachPower > 0.2 ? (Math.random() - 0.5) * 0.16 : 0);

        // Cyber hands furiously typing / projecting streams
        hands.forEach((hand, idx) => {
          hand.position.y = -1.05 + Math.sin(t * 16 + idx * 2.1) * 0.06;
          hand.rotation.x = Math.sin(t * 12 + idx) * 0.12;
        });

        // Orbiting Holographic Screens
        holoScreens.forEach((hs, idx) => {
          const driftAngle = hs.baseAngle + Math.sin(t * 0.45 + idx) * 0.06;
          hs.mesh.position.x = Math.sin(driftAngle) * hs.radius;
          hs.mesh.position.z = Math.cos(driftAngle) * hs.radius - 0.5;
          hs.mesh.position.y = hs.baseY + Math.sin(t * 1.3 + idx * 0.9) * 0.14;
          hs.mesh.lookAt(0, hs.mesh.position.y, 0.5);
        });

        // Firewall Rings
        firewallRing1.rotation.x = Math.PI * 0.36 + t * 0.45;
        firewallRing1.rotation.y = t * 0.65;
        firewallRing2.rotation.x = -Math.PI * 0.28 + t * 0.35;
        firewallRing2.rotation.z = -t * 0.55;

        // Falling 3D Binary Rain
        const rArr = rainAttr.array as Float32Array;
        const speedMult = 1 + breachPower * 2.1;
        for (let i = 0; i < RAIN_COUNT; i++) {
          let y = rArr[i * 3 + 1] - rainData[i].speed * 0.016 * speedMult;
          if (y < -4.5) y = 14.5;
          rArr[i * 3 + 1] = y;
        }
        rainAttr.needsUpdate = true;

        // Floor scroll illusion
        floorTex.offset.y = -(t * 0.22) % 1;

        // Violent glitch camera shake during breach impacts
        const shake = breachPower > 0.1 ? breachPower * 0.34 : 0;
        const sx = (Math.random() - 0.5) * shake;
        const sy = (Math.random() - 0.5) * shake;

        // 2-Minute (120s) 4-Act Camera Choreography
        if (t < 30) {
          // Act 1 (0-30s): Creeping through dark server corridor toward hooded hacker
          const p = t / 30;
          const dist = THREE.MathUtils.lerp(22.5, 9.2, p);
          const sway = Math.sin(p * Math.PI * 2.2) * 2.8;
          _camPos.set(sway + sx, 1.4 + Math.sin(p * Math.PI) * 0.8 + sy, dist);
          _lookTarget.set(0, 1.45, 0.3);
        } else if (t < 60) {
          // Act 2 (30-60s): Aggressive breach orbit & close-up terror lunges at skull mask
          const p = (t - 30) / 30;
          const angle = Math.sin(p * Math.PI * 3.0) * 1.15;
          const dist = 7.8 - breachPower * 2.9 + Math.sin(p * Math.PI * 4) * 1.2;
          _camPos.set(
            Math.sin(angle) * dist + sx,
            1.6 + Math.sin(p * Math.PI * 2.5) * 1.1 + sy,
            Math.cos(angle) * dist
          );
          _lookTarget.set(0, 1.65, 0.4);
        } else if (t < 90) {
          // Act 3 (60-90s): Deephat containment helical sweep showing holographic screens & emerald grid
          const p = (t - 60) / 30;
          const angle = Math.PI * 0.4 + p * Math.PI * 1.5;
          const dist = THREE.MathUtils.lerp(10.8, 7.6, p);
          _camPos.set(
            Math.sin(angle) * dist + sx,
            THREE.MathUtils.lerp(1.2, 3.4, p) + sy,
            Math.cos(angle) * dist
          );
          _lookTarget.set(0, 1.1, 0.2);
        } else {
          // Act 4 (90-120s): Final DeepSeek command portal warp acceleration
          const p = (t - 90) / 30;
          const ease = p * p * (3 - 2 * p);
          _camPos.set(
            THREE.MathUtils.lerp(1.8, 0, ease) + sx,
            THREE.MathUtils.lerp(2.6, 1.55, ease) + sy,
            THREE.MathUtils.lerp(9.2, 1.35, ease)
          );
          _lookTarget.set(0, 1.55, -2.5);
        }

        camera.position.lerp(_camPos, 0.16);
        camera.lookAt(_lookTarget);

        renderer.render(scene, camera);

        if (t >= INTRO_DURATION) {
          exitIntro(true);
          return;
        }

        if (isSoftwareGl) {
          afterDraw(tick);
        } else {
          frameId = requestAnimationFrame(tick);
        }
      };

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }

      return () => {
        disposed = true;
        cancelAnimationFrame(frameId);
        window.clearTimeout(frameId);
        window.removeEventListener('pointerdown', handleFirstGesture);
        window.removeEventListener('keydown', handleFirstGesture);
        if (resizeObserver) resizeObserver.disconnect();
        geos.forEach((g) => g.dispose());
        mats.forEach((m) => m.dispose());
        texs.forEach((tx) => tx.dispose());
        if (envRT) envRT.dispose();
        if (pmremGenerator) pmremGenerator.dispose();
        if (renderer) renderer.dispose();
        engine.dispose();
      };
    } catch {
      exitIntro(false);
    }
  }, []);

  const remaining = Math.max(0, Math.ceil(INTRO_DURATION - elapsed));
  const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');
  const progressPct = Math.min(100, (elapsed / INTRO_DURATION) * 100);

  const activeCue = INTRO_VOICE_CUES[activeCueIndex] || INTRO_VOICE_CUES[0];
  const nextCueAt =
    activeCueIndex < INTRO_VOICE_CUES.length - 1
      ? INTRO_VOICE_CUES[activeCueIndex + 1].atSeconds
      : INTRO_DURATION;
  const cueWindow = Math.max(2.5, nextCueAt - activeCue.atSeconds - 1.2);
  const cueElapsed = Math.max(0, elapsed - activeCue.atSeconds);
  const revealChars = Math.min(
    activeCue.text.length,
    Math.max(12, Math.floor((cueElapsed / cueWindow) * activeCue.text.length * 1.45))
  );
  const typedSubtitle = activeCue.text.slice(0, revealChars);

  const actTitle =
    act === 1
      ? 'BREACH ACTIVE // DARK CORRIDOR INFILTRATION'
      : act === 2
      ? 'KERNEL OVERRIDE // ROOT ESCALATION'
      : act === 3
      ? 'DEEPHAT BRIEFING // PLATFORM ARCHITECTURE'
      : 'PORTAL ARMED // INITIALIZING DEEPSEEK';

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#020204] text-[#F4F7F6] overflow-hidden select-none transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Dedicated WebGL Mount Container */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* Crimson / Obsidian Vignette Scrim (zero backdrop-filter over WebGL) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-100"
        style={{
          background: blackoutFlash
            ? 'radial-gradient(circle at 50% 42%, rgba(255, 0, 34, 0.08) 12%, rgba(0, 0, 0, 0.94) 75%)'
            : act <= 2
            ? 'radial-gradient(circle at 50% 44%, transparent 28%, rgba(16, 2, 5, 0.8) 100%)'
            : 'radial-gradient(circle at 50% 44%, transparent 32%, rgba(2, 8, 10, 0.76) 100%)'
        }}
      />

      {/* Minimal Top HUD Strip with Timer, Sound Control & Enter Platform */}
      <div className="absolute top-3 left-3 right-3 sm:top-5 sm:left-6 sm:right-6 z-20 flex flex-wrap items-center justify-between gap-2">
        <div className="px-3.5 py-2 rounded-lg bg-[#07090B]/92 border border-[#1E2936] flex items-center gap-2.5 pointer-events-none">
          <ShieldAlert
            className={`w-4 h-4 shrink-0 ${
              act <= 2 ? 'text-[#FF1E38]' : 'text-[#00D69A]'
            }`}
          />
          <span
            className={`font-mono text-[11px] font-semibold tracking-wider ${
              act <= 2 ? 'text-[#FF8F9C]' : 'text-[#00D69A]'
            }`}
          >
            {actTitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-lg bg-[#07090B]/92 border border-[#1E2936] font-mono text-xs text-[#F4F7F6] tabular-nums">
            {mins}:{secs} <span className="text-[#8F9CA8] text-[10px]">/ 02:00</span>
          </div>

          <button
            type="button"
            onClick={toggleMute}
            className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              !audioActive
                ? 'bg-[#FF1E38]/25 border-[#FF1E38] text-[#FFD6DC] hover:bg-[#FF1E38]/35'
                : muted
                ? 'bg-[#07090B]/92 border-[#1E2936] text-[#8F9CA8] hover:text-[#F4F7F6]'
                : 'bg-[#07090B]/92 border-[#00D69A]/60 text-[#00D69A]'
            }`}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {!audioActive ? 'Enable Sound & Voice' : muted ? 'Unmute' : 'Sound On'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => exitIntro(false)}
            className="px-3.5 py-2 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Enter Platform</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Act IV Climax Title Lockup */}
      {elapsed >= 104 && (
        <div className="pointer-events-none absolute inset-x-0 top-[18%] z-20 flex flex-col items-center text-center px-4">
          <span className="font-mono text-xs tracking-[0.38em] text-[#00D69A] uppercase mb-2">
            Sovereign Deephat Infrastructure
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[0.16em] text-[#F4F7F6]">
            DEEPSEEK
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-[#D1D9E0] max-w-lg">
            Containment complete. Launching live global cyber-defense &amp; software command grid
          </p>
        </div>
      )}

      {/* Live On-Screen Voice Transcript Display (shows exactly what the voice is speaking) */}
      <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 w-[min(820px,94vw)] z-20">
        <div
          className={`px-5 py-3.5 rounded-xl bg-[#050709]/95 border transition-colors ${
            act <= 2 ? 'border-[#FF1E38]/55' : 'border-[#00D69A]/55'
          } shadow-2xl`}
        >
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2">
              <Terminal
                className={`w-3.5 h-3.5 ${act <= 2 ? 'text-[#FF1E38]' : 'text-[#00D69A]'}`}
              />
              <span
                className={`font-mono text-[10px] font-bold uppercase tracking-[0.2em] ${
                  act <= 2 ? 'text-[#FF6E7F]' : 'text-[#00D69A]'
                }`}
              >
                VOICE TRANSCRIPT // {activeCue.label}
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#8F9CA8] tabular-nums">
              {Math.round(progressPct)}%
            </span>
          </div>

          <p className="text-xs sm:text-sm font-medium text-[#F4F7F6] leading-relaxed font-mono">
            &ldquo;{typedSubtitle}
            {revealChars < activeCue.text.length ? '_' : ''}&rdquo;
          </p>

          <div className="mt-2.5 w-full h-1 rounded-full bg-[#11161D] overflow-hidden">
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${progressPct}%`,
                backgroundColor: act <= 2 ? '#FF1E38' : '#00D69A'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
