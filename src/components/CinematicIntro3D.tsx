import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Volume2,
  FastForward,
  Terminal,
  Sparkles,
  Play,
  Cpu
} from 'lucide-react';
import { INTRO_VOICE_CUES, IntroAudioEngine } from '../utils/introAudioEngine';

interface CinematicIntro3DProps {
  onComplete: (completedNaturally: boolean) => void;
}

type IntroPhase = 'video' | 'transition' | 'animation';

const INTRO_VIDEO_SRC = '/assets/aistudio/video_2026-11-26_10-51-07_ca5d36bf.mp4';
const ANIMATION_DURATION = 30; // Exact 30-second ultra-powerful 4K 3D sequence

const _v1 = new THREE.Vector3();
const _camPos = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();
const _c1 = new THREE.Color();
const _c2 = new THREE.Color();
const _c3 = new THREE.Color();
const _m4 = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _s = new THREE.Vector3();

function createHexQuantumFloorTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const S = 1024;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#020408';
  ctx.fillRect(0, 0, S, S);

  // Subtle architectural sub-grid
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= S; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, S);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(S, i);
    ctx.stroke();
  }

  // Crisp 4K-grade hexagonal lattice
  const r = 44;
  const dx = r * 1.5;
  const dy = r * Math.sqrt(3);
  ctx.strokeStyle = 'rgba(0, 214, 154, 0.32)';
  ctx.lineWidth = 2;

  for (let col = -1; col < S / dx + 2; col++) {
    for (let row = -1; row < S / dy + 2; row++) {
      const cx = col * dx;
      const cy = row * dy + (col % 2 === 0 ? 0 : dy / 2);
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 3) * k;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createStarSpriteTexture(): THREE.CanvasTexture {
  const S = 128;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createRadialGradient(S / 2, S / 2, 1, S / 2, S / 2, S / 2);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.22, 'rgba(255, 255, 255, 0.85)');
  grad.addColorStop(0.55, 'rgba(180, 248, 255, 0.28)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function formatTime(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  const m = String(Math.floor(safe / 60)).padStart(2, '0');
  const s = String(safe % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export const CinematicIntro3D: React.FC<CinematicIntro3DProps> = ({ onComplete }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<IntroAudioEngine | null>(null);
  const completedRef = useRef(false);
  const elapsedRef = useRef(0);
  const phaseRef = useRef<IntroPhase>('video');
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [phase, setPhase] = useState<IntroPhase>('video');
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoMutedPrompt, setVideoMutedPrompt] = useState(false);
  const [videoNeedsPlayClick, setVideoNeedsPlayClick] = useState(false);

  const [elapsed, setElapsed] = useState(0);
  const [act, setAct] = useState<1 | 2 | 3>(1);
  const [audioActive, setAudioActive] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [surgeFlash, setSurgeFlash] = useState(false);
  const [activeCueIndex, setActiveCueIndex] = useState(0);

  phaseRef.current = phase;

  const exitIntro = (natural: boolean) => {
    if (completedRef.current) return;
    completedRef.current = true;
    setFadingOut(true);
    window.setTimeout(() => {
      audioRef.current?.dispose();
      onCompleteRef.current(natural);
    }, 520);
  };

  const transitionToAnimation = () => {
    if (phaseRef.current !== 'video' || completedRef.current) return;
    phaseRef.current = 'transition';
    setPhase('transition');
    if (videoRef.current) {
      videoRef.current.pause();
    }
    window.setTimeout(() => {
      if (completedRef.current) return;
      phaseRef.current = 'animation';
      setPhase('animation');
    }, 440);
  };

  // Phase 1: Immediate Full-Screen 4K-Enhanced Video Playback with Sound
  useEffect(() => {
    if (phase !== 'video') return;
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    const tryStartWithSound = async () => {
      try {
        video.muted = false;
        video.volume = 1.0;
        await video.play();
        if (!cancelled) {
          setVideoMutedPrompt(false);
          setVideoNeedsPlayClick(false);
          setAudioActive(true);
        }
      } catch {
        try {
          video.muted = true;
          await video.play();
          if (!cancelled) {
            setVideoMutedPrompt(true);
            setVideoNeedsPlayClick(false);
          }
        } catch {
          if (!cancelled) {
            setVideoNeedsPlayClick(true);
            setVideoMutedPrompt(true);
          }
        }
      }
    };

    void tryStartWithSound();

    const unlockSoundOnGesture = () => {
      if (cancelled || phaseRef.current !== 'video') return;
      const v = videoRef.current;
      if (!v) return;
      if (v.paused) {
        void v.play().catch(() => {});
      }
      if (v.muted) {
        v.muted = false;
        v.volume = 1.0;
        setVideoMutedPrompt(false);
        setVideoNeedsPlayClick(false);
        setAudioActive(true);
      }
      if (!audioRef.current) {
        audioRef.current = new IntroAudioEngine();
      }
      audioRef.current.setMuted(false);
      void audioRef.current.start().then((ok) => {
        if (ok) setAudioActive(true);
      });
    };

    window.addEventListener('pointerdown', unlockSoundOnGesture, { passive: true, capture: true });
    window.addEventListener('touchstart', unlockSoundOnGesture, { passive: true, capture: true });
    window.addEventListener('click', unlockSoundOnGesture, { passive: true, capture: true });
    window.addEventListener('keydown', unlockSoundOnGesture, { passive: true, capture: true });

    return () => {
      cancelled = true;
      window.removeEventListener('pointerdown', unlockSoundOnGesture, true);
      window.removeEventListener('touchstart', unlockSoundOnGesture, true);
      window.removeEventListener('click', unlockSoundOnGesture, true);
      window.removeEventListener('keydown', unlockSoundOnGesture, true);
    };
  }, [phase]);

  const handleEnableVideoSound = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const v = videoRef.current;
    if (v) {
      v.muted = false;
      v.volume = 1.0;
      if (v.paused) {
        void v.play().catch(() => {});
      }
      setVideoMutedPrompt(false);
      setVideoNeedsPlayClick(false);
      setAudioActive(true);
    }
    if (!audioRef.current) {
      audioRef.current = new IntroAudioEngine();
    }
    audioRef.current.setMuted(false);
    void audioRef.current.start().then((ok) => {
      if (ok) setAudioActive(true);
    });
  };

  // Phase 2: Brand-New 30-Second Ultra-HD 4K Quantum Astrolabe & Singularity Animation
  useEffect(() => {
    if (phase !== 'animation') return;
    const container = mountRef.current;
    if (!container) return;

    const engine = audioRef.current || new IntroAudioEngine();
    audioRef.current = engine;
    engine.setMuted(false);

    void engine.start().then((ok) => {
      if (ok) {
        setAudioActive(true);
        engine.setMuted(false);
        engine.triggerHorrorHorn(1.0);
        const idx = engine.updateVoiceCues(Math.max(0.85, elapsedRef.current));
        setActiveCueIndex(idx);
      }
    });

    const handleFirstGesture = () => {
      engine.setMuted(false);
      if (engine.getState() !== 'running') {
        void engine.start().then((ok) => {
          if (ok) {
            setAudioActive(true);
            engine.setMuted(false);
            const idx = engine.updateVoiceCues(Math.max(0.85, elapsedRef.current));
            setActiveCueIndex(idx);
          }
        });
      }
    };

    window.addEventListener('pointerdown', handleFirstGesture, { passive: true, capture: true });
    window.addEventListener('touchstart', handleFirstGesture, { passive: true, capture: true });
    window.addEventListener('click', handleFirstGesture, { passive: true, capture: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true, capture: true });

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let pmremGenerator: THREE.PMREMGenerator | null = null;
    let envRT: THREE.WebGLRenderTarget | null = null;
    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let disposed = false;
    let lastAct: 1 | 2 | 3 = 1;
    const firedPulses = new Set<number>();

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
          setElapsed(Math.min(ANIMATION_DURATION, sec));
          setAct(sec < 10 ? 1 : sec < 20 ? 2 : 3);
          setActiveCueIndex(engine.updateVoiceCues(sec));
          if (sec >= ANIMATION_DURATION) {
            clearInterval(t);
            exitIntro(true);
          }
        }, 120);
        return () => {
          clearInterval(t);
          window.removeEventListener('pointerdown', handleFirstGesture, true);
          window.removeEventListener('touchstart', handleFirstGesture, true);
          window.removeEventListener('click', handleFirstGesture, true);
          window.removeEventListener('keydown', handleFirstGesture, true);
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
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2.5));
      renderer.setSize(w, h);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.32;
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const canvas = renderer.domElement;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      container.innerHTML = '';
      container.appendChild(canvas);

      canvas.addEventListener('webglcontextlost', (e) => e.preventDefault());

      const maxAniso = renderer.capabilities.getMaxAnisotropy();

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x020409);
      scene.fog = new THREE.FogExp2(0x020409, 0.028);

      camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 240);
      camera.position.set(0, 2.6, 26);

      pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      envRT = pmremGenerator.fromScene(roomEnv, 0.04);
      scene.environment = envRT.texture;
      scene.environmentIntensity = 1.15;
      roomEnv.dispose();

      // Cinematic 3-Point + Reactor Core Lighting Rig
      const hemi = new THREE.HemisphereLight(0x38bdf8, 0x04070d, 0.85);
      scene.add(hemi);

      const keyLight = new THREE.DirectionalLight(0x00d69a, 3.2);
      keyLight.position.set(8, 12, 10);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.6);
      rimLight.position.set(-10, 6, -8);
      scene.add(rimLight);

      const goldRim = new THREE.DirectionalLight(0xf59e0b, 1.8);
      goldRim.position.set(0, -6, 9);
      scene.add(goldRim);

      const coreLight = new THREE.PointLight(0x00d69a, 18, 38, 1.4);
      coreLight.position.set(0, 0.8, 0);
      scene.add(coreLight);

      // 1. Reflective 4K Hexagonal Quantum Mirror Floor
      const floorTex = createHexQuantumFloorTexture(maxAniso);
      texs.push(floorTex);
      const floorGeo = new THREE.PlaneGeometry(180, 180);
      const floorMat = new THREE.MeshStandardMaterial({
        map: floorTex,
        color: 0x0d1b26,
        roughness: 0.14,
        metalness: 0.92,
        emissive: 0x021218,
        emissiveIntensity: 0.65,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1
      });
      geos.push(floorGeo);
      mats.push(floorMat);
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.y = -4.2;
      scene.add(floorMesh);

      // 2. Centerpiece: 7-Layer Precision Quantum Astrolabe & Singularity Core
      const reactorGroup = new THREE.Group();
      reactorGroup.position.set(0, 0.8, 0);
      scene.add(reactorGroup);

      // Layer A: Liquid-Chrome Mirror Sphere Core
      const innerSphereGeo = new THREE.SphereGeometry(0.95, 48, 48);
      const innerSphereMat = new THREE.MeshStandardMaterial({
        color: 0x08131d,
        metalness: 1.0,
        roughness: 0.04,
        emissive: 0x00d69a,
        emissiveIntensity: 0.55
      });
      geos.push(innerSphereGeo);
      mats.push(innerSphereMat);
      const innerSphere = new THREE.Mesh(innerSphereGeo, innerSphereMat);
      reactorGroup.add(innerSphere);

      // Layer B: Glowing Crystalline Plasma Geodesic Shell
      const plasmaGeo = new THREE.IcosahedronGeometry(1.38, 2);
      const plasmaMat = new THREE.MeshStandardMaterial({
        color: 0x00d69a,
        emissive: 0x00d69a,
        emissiveIntensity: 2.8,
        wireframe: true,
        transparent: true,
        opacity: 0.88
      });
      geos.push(plasmaGeo);
      mats.push(plasmaMat);
      const plasmaShell = new THREE.Mesh(plasmaGeo, plasmaMat);
      reactorGroup.add(plasmaShell);

      // Layer C: 5 Precision-Machined Concentric Titanium/Neon Gimbal Rings
      const ringSpecs = [
        { radius: 2.15, tube: 0.065, color: 0x00d69a, speedX: 1.1, speedY: 0.8, speedZ: 0.3 },
        { radius: 2.75, tube: 0.055, color: 0x22d3ee, speedX: -0.8, speedY: 1.25, speedZ: 0.5 },
        { radius: 3.4, tube: 0.07, color: 0xf59e0b, speedX: 0.65, speedY: -0.95, speedZ: 0.9 },
        { radius: 4.1, tube: 0.05, color: 0x38bdf8, speedX: -1.05, speedY: -0.6, speedZ: 0.7 },
        { radius: 4.85, tube: 0.06, color: 0x00d69a, speedX: 0.45, speedY: 0.85, speedZ: -0.65 }
      ];

      const gimbalRings: {
        mesh: THREE.Mesh;
        mat: THREE.MeshStandardMaterial;
        speedX: number;
        speedY: number;
        speedZ: number;
      }[] = [];

      ringSpecs.forEach((spec) => {
        const g = new THREE.TorusGeometry(spec.radius, spec.tube, 24, 128);
        const m = new THREE.MeshStandardMaterial({
          color: 0xdbeafe,
          metalness: 0.95,
          roughness: 0.12,
          emissive: spec.color,
          emissiveIntensity: 1.55
        });
        geos.push(g);
        mats.push(m);
        const mesh = new THREE.Mesh(g, m);
        reactorGroup.add(mesh);
        gimbalRings.push({
          mesh,
          mat: m,
          speedX: spec.speedX,
          speedY: spec.speedY,
          speedZ: spec.speedZ
        });
      });

      // Layer D: 96 Instanced Mirror-Chrome & Neon-Trimmed Monolith Turbine Blades
      const BLADE_COUNT = 96;
      const bladeGeo = new THREE.BoxGeometry(0.18, 1.45, 0.42);
      const bladeMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.96,
        roughness: 0.14,
        emissive: 0x0ea5a4,
        emissiveIntensity: 0.85
      });
      geos.push(bladeGeo);
      mats.push(bladeMat);
      const blades = new THREE.InstancedMesh(bladeGeo, bladeMat, BLADE_COUNT);
      reactorGroup.add(blades);

      // Layer E: 6 Volumetric Energy Pillars framing the Reactor Horizon
      const pillarGeo = new THREE.CylinderGeometry(0.12, 0.28, 18, 16, 1, true);
      const pillarMat = new THREE.MeshBasicMaterial({
        color: 0x00d69a,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      geos.push(pillarGeo);
      mats.push(pillarMat);

      for (let p = 0; p < 6; p++) {
        const angle = (p / 6) * Math.PI * 2;
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(Math.sin(angle) * 11, 3.8, Math.cos(angle) * 11);
        scene.add(pillar);
      }

      // Layer F: Dual Expanding Electromagnetic Plasma Shockwave Rings
      const shockGeo = new THREE.TorusGeometry(1.0, 0.065, 12, 96);
      const shockMat1 = new THREE.MeshBasicMaterial({
        color: 0x00d69a,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const shockMat2 = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      geos.push(shockGeo);
      mats.push(shockMat1, shockMat2);

      const shockRing1 = new THREE.Mesh(shockGeo, shockMat1);
      shockRing1.rotation.x = Math.PI / 2;
      shockRing1.position.set(0, -3.9, 0);

      const shockRing2 = new THREE.Mesh(shockGeo, shockMat2);
      shockRing2.position.set(0, 0.8, 0);

      scene.add(shockRing1, shockRing2);

      // 3. 3,200-Star Multi-Spectrum Galaxy & Hyperspace Vortex
      const STAR_COUNT = 3200;
      const starPos = new Float32Array(STAR_COUNT * 3);
      const starCol = new Float32Array(STAR_COUNT * 3);
      const starMeta: { angle: number; radius: number; y: number; speed: number }[] = [];

      const palette = [0x00d69a, 0x22d3ee, 0x38bdf8, 0xf59e0b, 0xf8fafc];
      for (let i = 0; i < STAR_COUNT; i++) {
        const arm = i % 3;
        const radius = 3.5 + Math.pow(Math.random(), 0.72) * 32;
        const angle = arm * ((Math.PI * 2) / 3) + radius * 0.24 + (Math.random() - 0.5) * 0.9;
        const y = (Math.random() - 0.5) * (10 + radius * 0.28);
        starMeta.push({ angle, radius, y, speed: 0.14 + Math.random() * 0.35 });

        starPos[i * 3] = Math.cos(angle) * radius;
        starPos[i * 3 + 1] = y + 0.8;
        starPos[i * 3 + 2] = Math.sin(angle) * radius;

        _c1.setHex(palette[i % palette.length]);
        starCol[i * 3] = _c1.r;
        starCol[i * 3 + 1] = _c1.g;
        starCol[i * 3 + 2] = _c1.b;
      }

      const starGeo = new THREE.BufferGeometry();
      const starPosAttr = new THREE.BufferAttribute(starPos, 3);
      starGeo.setAttribute('position', starPosAttr);
      starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
      const starTex = createStarSpriteTexture();
      geos.push(starGeo);
      texs.push(starTex);

      const starMat = new THREE.PointsMaterial({
        map: starTex,
        size: 0.36,
        vertexColors: true,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      mats.push(starMat);
      scene.add(new THREE.Points(starGeo, starMat));

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
              frameId = window.setTimeout(cb, 70);
            }
          };
          frameId = window.setTimeout(poll, 5);
        } else {
          frameId = window.setTimeout(cb, 70);
        }
      };

      const startPerf = performance.now();
      let lastHudUpdate = 0;
      let lastFlashState = false;

      // Crisp 30-second shockwave pulse beats
      const PULSE_TIMES = [3.5, 9.5, 15.0, 20.5, 25.0];

      const tick = () => {
        if (disposed || !renderer || !scene || !camera) return;

        const nowMs = performance.now();
        const t = Math.min(ANIMATION_DURATION, (nowMs - startPerf) / 1000);
        elapsedRef.current = t;

        const currentAct: 1 | 2 | 3 = t < 10 ? 1 : t < 20 ? 2 : 3;
        if (currentAct !== lastAct) {
          lastAct = currentAct;
          setAct(currentAct);
          engine.shiftActTone(currentAct);
        }

        let pulsePower = 0;
        let shockProgress = -1;
        let inFlash = false;

        for (let pi = 0; pi < PULSE_TIMES.length; pi++) {
          const pt = PULSE_TIMES[pi];
          if (t >= pt && !firedPulses.has(pi)) {
            firedPulses.add(pi);
            engine.triggerQuantumPulse();
          }
          const dtP = t - pt;
          if (dtP >= 0 && dtP < 1.6) {
            shockProgress = dtP / 1.6;
            if (dtP < 0.16) inFlash = true;
            pulsePower = Math.max(pulsePower, 1 - dtP / 1.6);
          }
        }

        if (inFlash !== lastFlashState) {
          lastFlashState = inFlash;
          setSurgeFlash(inFlash);
        }

        if (nowMs - lastHudUpdate > 120) {
          lastHudUpdate = nowMs;
          setElapsed(t);
          const cueIdx = engine.updateVoiceCues(t);
          setActiveCueIndex(cueIdx);
        }

        // Dynamic Spectrum Blend: Emerald (#00D69A) -> Cyan (#22D3EE) -> Radiant Gold (#F59E0B)
        const goldBlend = THREE.MathUtils.clamp((t - 20) / 6, 0, 1);
        _c1.setHex(0x00d69a);
        _c2.setHex(0x22d3ee);
        _c3.setHex(0xf59e0b);
        _c1.lerp(_c2, Math.sin(t * 0.45) * 0.5 + 0.5);
        _c1.lerp(_c3, goldBlend * 0.65);

        coreLight.color.copy(_c1);
        coreLight.intensity = 18 + pulsePower * 22 + goldBlend * 12;
        keyLight.color.copy(_c1);
        keyLight.intensity = 3.2 + pulsePower * 2.2;
        plasmaMat.color.copy(_c1);
        plasmaMat.emissive.copy(_c1);
        plasmaMat.emissiveIntensity = 2.6 + pulsePower * 3.0;
        innerSphereMat.emissive.copy(_c1);
        innerSphereMat.emissiveIntensity = 0.55 + pulsePower * 1.4;
        pillarMat.color.copy(_c1);
        pillarMat.opacity = 0.14 + pulsePower * 0.24;

        // Inner Sphere & Plasma Core Rotation
        const spinBoost = 1 + pulsePower * 2.0 + (currentAct === 3 ? 1.8 : 0);
        plasmaShell.rotation.x = t * 0.55 * spinBoost;
        plasmaShell.rotation.y = t * 0.85 * spinBoost;
        const coreScale = 1 + Math.sin(t * 5) * 0.06 + pulsePower * 0.26;
        plasmaShell.scale.setScalar(coreScale);
        innerSphere.scale.setScalar(1 + pulsePower * 0.18);

        // 5-Axis Gimbal Rings -> Snap into Symmetric Alignment during Act III Climax!
        const lockBlend = THREE.MathUtils.clamp((t - 20.5) / 3.5, 0, 1);
        gimbalRings.forEach((gr, idx) => {
          if (lockBlend > 0.01) {
            const targetRotX = idx % 2 === 0 ? 0.15 : -0.15;
            const targetRotY = t * (0.45 + idx * 0.12);
            const targetRotZ = 0;
            gr.mesh.rotation.x = THREE.MathUtils.lerp(gr.mesh.rotation.x, targetRotX, 0.08 + lockBlend * 0.12);
            gr.mesh.rotation.y = THREE.MathUtils.lerp(gr.mesh.rotation.y, targetRotY, 0.1);
            gr.mesh.rotation.z = THREE.MathUtils.lerp(gr.mesh.rotation.z, targetRotZ, 0.08 + lockBlend * 0.12);
          } else {
            gr.mesh.rotation.x = t * gr.speedX;
            gr.mesh.rotation.y = t * gr.speedY;
            gr.mesh.rotation.z = t * gr.speedZ;
          }
          gr.mat.emissiveIntensity = 1.4 + pulsePower * 1.8 + lockBlend * 0.9;
        });

        // 96 Instanced Turbine Blades: Unfurling Mechanical Iris Halo
        bladeMat.emissive.copy(_c1);
        const irisRadius = 5.4 + Math.sin(t * 1.4) * 0.55 + pulsePower * 1.6 + lockBlend * 1.8;
        for (let i = 0; i < BLADE_COUNT; i++) {
          const frac = i / BLADE_COUNT;
          const a = frac * Math.PI * 2 + t * 0.48;
          const waveY = Math.sin(frac * Math.PI * 6 + t * 2.8) * (1.2 + pulsePower * 0.9);
          const r = irisRadius + (i % 2 === 0 ? 0.45 : -0.45);
          _v1.set(Math.cos(a) * r, waveY, Math.sin(a) * r);
          _e.set(Math.sin(t + i * 0.2) * 0.6, -a, Math.PI * 0.18 + pulsePower * 0.5);
          _q.setFromEuler(_e);
          const sc = 0.85 + pulsePower * 0.45;
          _s.set(sc, sc * (1 + (i % 3) * 0.2), sc);
          _m4.compose(_v1, _q, _s);
          blades.setMatrixAt(i, _m4);
        }
        blades.instanceMatrix.needsUpdate = true;

        // Dual Electromagnetic Shockwaves
        if (shockProgress >= 0) {
          const s1 = 1 + shockProgress * 22;
          shockRing1.scale.set(s1, s1, 1);
          shockMat1.color.copy(_c1);
          shockMat1.opacity = (1 - shockProgress) * 0.88;

          const s2 = 1 + shockProgress * 15;
          shockRing2.scale.setScalar(s2);
          shockRing2.rotation.x = t * 1.5;
          shockRing2.rotation.y = t * 1.1;
          shockMat2.opacity = (1 - shockProgress) * 0.65;
        } else {
          shockMat1.opacity = 0;
          shockMat2.opacity = 0;
        }

        // 3,200-Star Galaxy Swirl & Act III Hyperspace Warp
        const sArr = starPosAttr.array as Float32Array;
        const warpSpeed = currentAct === 3 ? 1.8 + ((t - 20) / 10) * 3.5 : 1.0 + pulsePower * 0.9;
        for (let i = 0; i < STAR_COUNT; i++) {
          const sm = starMeta[i];
          const a = sm.angle + t * sm.speed * 0.35 * warpSpeed;
          sArr[i * 3] = Math.cos(a) * sm.radius;
          sArr[i * 3 + 1] = sm.y + 0.8 + Math.sin(t * 0.8 + i * 0.01) * 0.35;
          sArr[i * 3 + 2] = Math.sin(a) * sm.radius;
        }
        starPosAttr.needsUpdate = true;

        floorTex.offset.y = -(t * (currentAct === 3 ? 0.55 : 0.22)) % 1;

        // Smooth FOV Pulse
        const targetFov =
          currentAct === 3
            ? 48 + ((t - 20) / 10) * 16 + pulsePower * 5
            : 48 + pulsePower * 7;
        if (Math.abs(camera.fov - targetFov) > 0.12) {
          camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.16);
          camera.updateProjectionMatrix();
        }

        // 30-Second Tight 3-Act Camera Choreography
        if (t < 10) {
          // Act I (0-10s): Majestic sweeping approach through nebula toward Quantum Core
          const p = t / 10;
          const ease = 1 - Math.pow(1 - p, 2);
          const angle = -0.75 + p * 0.95;
          const dist = THREE.MathUtils.lerp(24.5, 11.2, ease);
          _camPos.set(
            Math.sin(angle) * dist,
            THREE.MathUtils.lerp(4.4, 2.0, ease),
            Math.cos(angle) * dist
          );
          _lookTarget.set(0, 0.8, 0);
        } else if (t < 20) {
          // Act II (10-20s): Dynamic 360-degree high-energy orbital swoop around gimbal rings
          const p = (t - 10) / 10;
          const angle = 0.2 + p * Math.PI * 1.85;
          const dist = 10.6 - pulsePower * 1.8 + Math.sin(p * Math.PI * 2) * 1.4;
          _camPos.set(
            Math.sin(angle) * dist,
            1.6 + Math.sin(p * Math.PI * 2.5) * 2.2,
            Math.cos(angle) * dist
          );
          _lookTarget.set(0, 0.85, 0);
        } else {
          // Act III (20-30s): Lock-on symmetry + Hyperspace Warp Launch straight through the core
          const p = (t - 20) / 10;
          const ease = p * p * (3 - 2 * p);
          const orbitAngle = THREE.MathUtils.lerp(Math.PI * 2.05, Math.PI * 2.0, ease);
          const dist = THREE.MathUtils.lerp(11.4, 0.4, ease);
          _camPos.set(
            Math.sin(orbitAngle) * dist,
            THREE.MathUtils.lerp(2.2, 0.8, ease),
            Math.cos(orbitAngle) * dist
          );
          _lookTarget.set(0, 0.8, -8);
        }

        camera.position.lerp(_camPos, 0.16);
        camera.lookAt(_lookTarget);

        renderer.render(scene, camera);

        if (t >= ANIMATION_DURATION) {
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
        window.removeEventListener('pointerdown', handleFirstGesture, true);
        window.removeEventListener('touchstart', handleFirstGesture, true);
        window.removeEventListener('click', handleFirstGesture, true);
        window.removeEventListener('keydown', handleFirstGesture, true);
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
  }, [phase]);

  const forceEnableAnimSound = async () => {
    const engine = audioRef.current;
    if (!engine) return;
    engine.setMuted(false);
    if (!audioActive) {
      const ok = await engine.start();
      if (ok) {
        setAudioActive(true);
        const idx = engine.updateVoiceCues(Math.max(0.85, elapsedRef.current));
        setActiveCueIndex(idx);
      }
    }
  };

  // =========================================================================
  // RENDER STAGE 1: FULL-SCREEN 4K UHD VIDEO WITH SOUND
  // =========================================================================
  if (phase === 'video' || phase === 'transition') {
    const vidPct = videoDuration > 0 ? Math.min(100, (videoTime / videoDuration) * 100) : 0;

    return (
      <div
        onClick={() => {
          handleEnableVideoSound();
        }}
        className={`fixed inset-0 z-50 bg-black text-white overflow-hidden select-none transition-opacity duration-500 ${
          fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <video
          ref={videoRef}
          src={INTRO_VIDEO_SRC}
          playsInline
          autoPlay
          preload="auto"
          onLoadedMetadata={(e) => {
            const dur = e.currentTarget.duration;
            if (Number.isFinite(dur)) setVideoDuration(dur);
          }}
          onTimeUpdate={(e) => {
            setVideoTime(e.currentTarget.currentTime);
          }}
          onEnded={transitionToAnimation}
          onError={transitionToAnimation}
          className="w-full h-full object-contain landscape:object-cover"
          style={{
            filter: 'contrast(1.08) saturate(1.1) brightness(1.03)'
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, transparent 60%, rgba(0, 0, 0, 0.62) 100%)'
          }}
        />

        {phase === 'transition' && (
          <div className="pointer-events-none absolute inset-0 z-40 bg-[#00D69A]/20 animate-pulse flex items-center justify-center">
            <div className="px-6 py-3 rounded-xl bg-[#07090B]/95 border border-[#00D69A] font-mono text-xs sm:text-sm tracking-[0.28em] text-[#00D69A] uppercase shadow-2xl">
              LAUNCHING 4K QUANTUM SEQUENCE // 00:30
            </div>
          </div>
        )}

        <div className="hidden">
          <div className="px-3.5 py-2 rounded-lg bg-[#07090B]/88 border border-[#233040] flex items-center gap-2.5 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-[#00D69A] animate-pulse" />
            <span className="font-mono text-[11px] font-semibold tracking-wider text-white">
              4K UHD STREAM // INCOMING TRANSMISSION
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEnableVideoSound}
              className="px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-[#07090B]/88 border-[#00D69A]/60 text-[#00D69A]"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Sound On</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                transitionToAnimation();
              }}
              className="px-3 py-2 rounded-lg bg-[#07090B]/88 hover:bg-[#151C24] border border-[#233040] text-[#E2E8F0] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00D69A]" />
              <span className="hidden sm:inline">Next: 30s 3D Sequence</span>
              <span className="sm:hidden">3D Intro</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                exitIntro(false);
              }}
              className="px-3.5 py-2 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Enter Platform</span>
              <FastForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {(videoMutedPrompt || videoNeedsPlayClick) && (
          <div className="hidden">
            <button
              type="button"
              onClick={handleEnableVideoSound}
              className="px-6 py-3.5 rounded-xl bg-[#07090B]/94 border-2 border-[#00D69A] text-white font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-3 shadow-[0_0_32px_rgba(0,214,154,0.35)] hover:bg-[#0D1116] transition-transform active:scale-95 cursor-pointer animate-pulse"
            >
              {videoNeedsPlayClick ? (
                <Play className="w-4 h-4 text-[#00D69A] fill-[#00D69A]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#00D69A]" />
              )}
              <span>
                {videoNeedsPlayClick
                  ? 'Tap to Launch Full 4K Video + Sound'
                  : 'Tap Anywhere to Enable Full Sound'}
              </span>
            </button>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 z-20">
          <div className="flex items-center justify-between font-mono text-[10px] text-[#B8C5D2] mb-1.5">
            <span>STAGE 01 / 02 · FULL 4K TRANSMISSION</span>
            <span className="tabular-nums">
              {formatTime(videoTime)} / {formatTime(videoDuration)}
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-[#11161D]/90 overflow-hidden">
            <div
              className="h-full bg-[#00D69A] transition-all duration-150"
              style={{ width: `${vidPct}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER STAGE 2: 30-SECOND ULTRA-HD 4K QUANTUM ASTROLABE 3D ANIMATION
  // =========================================================================
  const remaining = Math.max(0, Math.ceil(ANIMATION_DURATION - elapsed));
  const secs = String(remaining).padStart(2, '0');
  const progressPct = Math.min(100, (elapsed / ANIMATION_DURATION) * 100);

  const activeCue = INTRO_VOICE_CUES[activeCueIndex] || INTRO_VOICE_CUES[0];
  const nextCueAt =
    activeCueIndex < INTRO_VOICE_CUES.length - 1
      ? INTRO_VOICE_CUES[activeCueIndex + 1].atSeconds
      : ANIMATION_DURATION;
  const cueWindow = Math.max(1.8, nextCueAt - activeCue.atSeconds - 0.5);
  const cueElapsed = Math.max(0, elapsed - activeCue.atSeconds);
  const revealChars = Math.min(
    activeCue.text.length,
    Math.max(10, Math.floor((cueElapsed / cueWindow) * activeCue.text.length * 1.45))
  );
  const typedSubtitle = activeCue.text.slice(0, revealChars);

  const actTitle =
    act === 1
      ? 'STAGE 02 · ACT I // QUANTUM CORE IGNITION'
      : act === 2
      ? 'STAGE 02 · ACT II // HYPER-GYRO ACCELERATION'
      : 'STAGE 02 · ACT III // SOVEREIGN 4K LOCKUP';

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#020409] text-white overflow-hidden select-none transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Dedicated WebGL Mount Container */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* Subtle Cosmic Vignette & Supernova Surge Glow (zero backdrop-filter over WebGL) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-150"
        style={{
          background: surgeFlash
            ? 'radial-gradient(circle at 50% 48%, rgba(0, 214, 154, 0.22) 0%, rgba(34, 211, 238, 0.1) 36%, rgba(2, 4, 9, 0.72) 100%)'
            : 'radial-gradient(circle at 50% 48%, transparent 34%, rgba(2, 4, 9, 0.72) 100%)'
        }}
      />

      {/* Minimal Top HUD Strip */}
      <div className="hidden">
        <div className="px-3.5 py-2 rounded-lg bg-[#07090B]/92 border border-[#233040] flex items-center gap-2.5 pointer-events-none">
          <Cpu className="w-4 h-4 shrink-0 text-[#00D69A]" />
          <span className="font-mono text-[11px] font-semibold tracking-wider text-[#00D69A]">
            {actTitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-lg bg-[#07090B]/92 border border-[#233040] font-mono text-xs text-white tabular-nums">
            00:{secs} <span className="text-[#9AA7B4] text-[10px]">/ 00:30</span>
          </div>

          {!audioActive && (
            <button
              type="button"
              onClick={forceEnableAnimSound}
              className="px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-[#00D69A]/20 border-[#00D69A] text-white hover:bg-[#00D69A]/30"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Enable Sound &amp; Voice</span>
            </button>
          )}

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

      {/* Act III Climax 4K Brand Lockup */}
      {elapsed >= 21.5 && (
        <div className="pointer-events-none absolute inset-x-0 top-[18%] z-20 flex flex-col items-center text-center px-4">
          <span className="font-mono text-xs tracking-[0.38em] text-[#22D3EE] uppercase mb-2 font-bold">
            Ultra-HD 4K Sovereign Infrastructure
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[0.18em] text-white drop-shadow-[0_0_28px_rgba(0,214,154,0.45)]">
            DEEPSEEK
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-[#E2E8F0] max-w-lg font-medium">
            Quantum core synchronized. Launching global cyber-defense &amp; enterprise command grid
          </p>
        </div>
      )}

      {/* Live On-Screen Voice Transcript Display */}
      <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 w-[min(820px,94vw)] z-20">
        <div className="px-5 py-3.5 rounded-xl bg-[#05080C]/95 border border-[#00D69A]/50 shadow-2xl">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#00D69A]" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#00D69A]">
                VOICE BRIEFING // {activeCue.label}
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#9AA7B4] tabular-nums">
              {Math.round(progressPct)}%
            </span>
          </div>

          <p className="text-xs sm:text-sm font-medium text-white leading-relaxed font-mono">
            &ldquo;{typedSubtitle}
            {revealChars < activeCue.text.length ? '_' : ''}&rdquo;
          </p>

          <div className="mt-2.5 w-full h-1 rounded-full bg-[#11161D] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00D69A] via-[#22D3EE] to-[#F59E0B] transition-all duration-150"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
