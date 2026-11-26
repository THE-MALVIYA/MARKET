import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import * as topojson from 'topojson-client';
import countriesAtlas from 'world-atlas/countries-110m.json';

interface CityNode {
  name: string;
  country: string;
  lat: number;
  lon: number;
  tier: 1 | 2;
}

const GLOBAL_CITIES: CityNode[] = [
  { name: 'New York', country: 'US', lat: 40.71, lon: -74.01, tier: 1 },
  { name: 'Washington', country: 'US', lat: 38.91, lon: -77.04, tier: 2 },
  { name: 'Chicago', country: 'US', lat: 41.88, lon: -87.63, tier: 2 },
  { name: 'San Francisco', country: 'US', lat: 37.77, lon: -122.42, tier: 1 },
  { name: 'Toronto', country: 'CA', lat: 43.65, lon: -79.38, tier: 1 },
  { name: 'Mexico City', country: 'MX', lat: 19.43, lon: -99.13, tier: 1 },
  { name: 'Bogotá', country: 'CO', lat: 4.71, lon: -74.07, tier: 2 },
  { name: 'Lima', country: 'PE', lat: -12.05, lon: -77.04, tier: 2 },
  { name: 'São Paulo', country: 'BR', lat: -23.55, lon: -46.63, tier: 1 },
  { name: 'Buenos Aires', country: 'AR', lat: -34.6, lon: -58.38, tier: 1 },
  { name: 'Santiago', country: 'CL', lat: -33.45, lon: -70.67, tier: 2 },
  { name: 'London', country: 'UK', lat: 51.51, lon: -0.13, tier: 1 },
  { name: 'Madrid', country: 'ES', lat: 40.42, lon: -3.7, tier: 2 },
  { name: 'Paris', country: 'FR', lat: 48.86, lon: 2.35, tier: 1 },
  { name: 'Amsterdam', country: 'NL', lat: 52.37, lon: 4.9, tier: 2 },
  { name: 'Frankfurt', country: 'DE', lat: 50.11, lon: 8.68, tier: 1 },
  { name: 'Zurich', country: 'CH', lat: 47.37, lon: 8.54, tier: 2 },
  { name: 'Rome', country: 'IT', lat: 41.9, lon: 12.5, tier: 2 },
  { name: 'Stockholm', country: 'SE', lat: 59.33, lon: 18.07, tier: 2 },
  { name: 'Warsaw', country: 'PL', lat: 52.23, lon: 21.01, tier: 2 },
  { name: 'Kyiv', country: 'UA', lat: 50.45, lon: 30.52, tier: 2 },
  { name: 'Moscow', country: 'RU', lat: 55.76, lon: 37.62, tier: 1 },
  { name: 'Istanbul', country: 'TR', lat: 41.01, lon: 28.98, tier: 1 },
  { name: 'Cairo', country: 'EG', lat: 30.04, lon: 31.24, tier: 1 },
  { name: 'Casablanca', country: 'MA', lat: 33.57, lon: -7.59, tier: 2 },
  { name: 'Lagos', country: 'NG', lat: 6.52, lon: 3.38, tier: 1 },
  { name: 'Nairobi', country: 'KE', lat: -1.29, lon: 36.82, tier: 2 },
  { name: 'Johannesburg', country: 'ZA', lat: -26.2, lon: 28.05, tier: 1 },
  { name: 'Tel Aviv', country: 'IL', lat: 32.09, lon: 34.78, tier: 2 },
  { name: 'Riyadh', country: 'SA', lat: 24.71, lon: 46.68, tier: 2 },
  { name: 'Dubai', country: 'AE', lat: 25.2, lon: 55.27, tier: 1 },
  { name: 'Karachi', country: 'PK', lat: 24.86, lon: 67.0, tier: 2 },
  { name: 'New Delhi', country: 'IN', lat: 28.61, lon: 77.21, tier: 1 },
  { name: 'Mumbai', country: 'IN', lat: 19.08, lon: 72.88, tier: 1 },
  { name: 'Bengaluru', country: 'IN', lat: 12.97, lon: 77.59, tier: 1 },
  { name: 'Bangkok', country: 'TH', lat: 13.76, lon: 100.5, tier: 2 },
  { name: 'Singapore', country: 'SG', lat: 1.35, lon: 103.82, tier: 1 },
  { name: 'Jakarta', country: 'ID', lat: -6.21, lon: 106.85, tier: 1 },
  { name: 'Hong Kong', country: 'HK', lat: 22.32, lon: 114.17, tier: 1 },
  { name: 'Taipei', country: 'TW', lat: 25.03, lon: 121.57, tier: 2 },
  { name: 'Beijing', country: 'CN', lat: 39.9, lon: 116.41, tier: 1 },
  { name: 'Shanghai', country: 'CN', lat: 31.23, lon: 121.47, tier: 2 },
  { name: 'Seoul', country: 'KR', lat: 37.57, lon: 126.98, tier: 1 },
  { name: 'Tokyo', country: 'JP', lat: 35.68, lon: 139.65, tier: 1 },
  { name: 'Sydney', country: 'AU', lat: -33.87, lon: 151.21, tier: 1 },
  { name: 'Auckland', country: 'NZ', lat: -36.85, lon: 174.76, tier: 2 }
];

type AttackKind = 'intrusion' | 'anomaly' | 'mitigated';

interface AttackEvent {
  srcIdx: number;
  dstIdx: number;
  kind: AttackKind;
  progress: number;
  speed: number;
  curve: THREE.QuadraticBezierCurve3;
  guideLine: THREE.Line;
  trailLine: THREE.Line;
  trailPosAttr: THREE.BufferAttribute;
  trailPositions: Float32Array;
  color: THREE.Color;
}

interface RippleState {
  mesh: THREE.Mesh;
  active: boolean;
  age: number;
  duration: number;
}

type FocusPreset = 'global' | 'india' | 'europe' | 'americas' | 'asia';

const EARTH_RADIUS = 1.36;
const CLOUD_RADIUS = 1.384;
const ATMOS_RADIUS = 1.5;
const TRAIL_SEGMENTS = 30;
const GUIDE_SEGMENTS = 36;
const ATTACK_COUNT = 20;

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _camDir = new THREE.Vector3();
const _worldPos = new THREE.Vector3();
const _worldNorm = new THREE.Vector3();
const _proj = new THREE.Vector3();
const _dummy = new THREE.Object3D();
const _targetCamPos = new THREE.Vector3();

function latLonToVector3(lat: number, lon: number, radius: number, out = new THREE.Vector3()): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  out.set(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
  return out;
}

function drawWrappedRing(
  ctx: CanvasRenderingContext2D,
  ring: number[][],
  w: number,
  h: number,
  offsetPx = 0
) {
  if (ring.length < 2) return;
  let prevLon = ring[0][0];
  ctx.moveTo(((prevLon + 180) / 360) * w + offsetPx, ((90 - ring[0][1]) / 180) * h);
  for (let i = 1; i < ring.length; i++) {
    let lon = ring[i][0];
    const lat = ring[i][1];
    while (lon - prevLon > 180) lon -= 360;
    while (lon - prevLon < -180) lon += 360;
    prevLon = lon;
    const x = ((lon + 180) / 360) * w + offsetPx;
    const y = ((90 - lat) / 180) * h;
    ctx.lineTo(x, y);
  }
}

function computeRingCentroidAndSpan(ring: number[][]) {
  if (!ring.length) return { lat: 0, lon: 0, span: 0 };
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  let sumLon = 0;
  let sumLat = 0;
  let prevLon = ring[0][0];

  for (let i = 0; i < ring.length; i++) {
    let lon = ring[i][0];
    const lat = ring[i][1];
    while (lon - prevLon > 180) lon -= 360;
    while (lon - prevLon < -180) lon += 360;
    prevLon = lon;

    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    sumLon += lon;
    sumLat += lat;
  }

  let avgLon = sumLon / ring.length;
  while (avgLon > 180) avgLon -= 360;
  while (avgLon < -180) avgLon += 360;
  const avgLat = sumLat / ring.length;
  const span = (maxLon - minLon) * (maxLat - minLat);
  return { lat: avgLat, lon: avgLon, span };
}

function buildSpaceUniverseTexture(isHighRes: boolean): THREE.CanvasTexture {
  const W = isHighRes ? 4096 : 2048;
  const H = isHighRes ? 2048 : 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Deep cosmic background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#02040a');
  bg.addColorStop(0.5, '#040814');
  bg.addColorStop(1, '#02050c');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle Milky Way / cosmic nebula clouds
  const scaleFactor = W / 2048;
  const nebulae = [
    { x: 0.22 * W, y: 0.35 * H, r: 420 * scaleFactor, c1: 'rgba(14, 165, 164, 0.14)', c2: 'rgba(14, 165, 164, 0)' },
    { x: 0.68 * W, y: 0.58 * H, r: 480 * scaleFactor, c1: 'rgba(37, 99, 235, 0.14)', c2: 'rgba(37, 99, 235, 0)' },
    { x: 0.45 * W, y: 0.46 * H, r: 360 * scaleFactor, c1: 'rgba(0, 214, 154, 0.1)', c2: 'rgba(0, 214, 154, 0)' },
    { x: 0.85 * W, y: 0.28 * H, r: 340 * scaleFactor, c1: 'rgba(99, 102, 241, 0.11)', c2: 'rgba(99, 102, 241, 0)' }
  ];
  nebulae.forEach((n) => {
    const g = ctx.createRadialGradient(n.x, n.y, 10, n.x, n.y, n.r);
    g.addColorStop(0, n.c1);
    g.addColorStop(1, n.c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  });

  // Thousands of crisp background universe stars
  const starCount = isHighRes ? 3600 : 2200;
  for (let i = 0; i < starCount; i++) {
    const x = (i * 977 + (i % 37) * 53) % W;
    const y = (i * 593 + (i % 41) * 29) % H;
    const size = (i % 17 === 0 ? 2.2 : i % 5 === 0 ? 1.4 : 0.9) * scaleFactor;
    const alpha = 0.28 + ((i * 19) % 72) / 100;
    ctx.fillStyle =
      i % 9 === 0
        ? `rgba(147, 197, 253, ${alpha})`
        : i % 13 === 0
        ? `rgba(253, 224, 160, ${alpha})`
        : `rgba(240, 249, 255, ${alpha})`;
    ctx.fillRect(x, y, size, size);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildSunGlowTexture(): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 2, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(255, 250, 232, 1.0)');
  g.addColorStop(0.18, 'rgba(255, 225, 160, 0.75)');
  g.addColorStop(0.48, 'rgba(56, 189, 248, 0.18)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildEarthTextures(maxAnisotropy: number, isHighRes: boolean) {
  const W = isHighRes ? 4096 : 2048;
  const H = isHighRes ? 2048 : 1024;
  const pxScale = W / 2048;

  const dayCanvas = document.createElement('canvas');
  dayCanvas.width = W;
  dayCanvas.height = H;
  const dayCtx = dayCanvas.getContext('2d')!;

  const oceanGrad = dayCtx.createLinearGradient(0, 0, 0, H);
  oceanGrad.addColorStop(0.0, '#133552');
  oceanGrad.addColorStop(0.16, '#092440');
  oceanGrad.addColorStop(0.5, '#071d38');
  oceanGrad.addColorStop(0.84, '#092440');
  oceanGrad.addColorStop(1.0, '#153954');
  dayCtx.fillStyle = oceanGrad;
  dayCtx.fillRect(0, 0, W, H);

  for (let i = 0; i < 650; i++) {
    const rx = (i * 397) % W;
    const ry = (i * 211) % H;
    const rad = 24 + (i % 55);
    const g = dayCtx.createRadialGradient(rx, ry, 2, rx, ry, rad);
    g.addColorStop(0, i % 2 === 0 ? 'rgba(18, 92, 134, 0.16)' : 'rgba(2, 12, 26, 0.16)');
    g.addColorStop(1, 'rgba(6, 26, 50, 0)');
    dayCtx.fillStyle = g;
    dayCtx.fillRect(rx - rad, ry - rad, rad * 2, rad * 2);
  }

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = W;
  roughCanvas.height = H;
  const roughCtx = roughCanvas.getContext('2d')!;
  roughCtx.fillStyle = '#383838';
  roughCtx.fillRect(0, 0, W, H);

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = W;
  bumpCanvas.height = H;
  const bumpCtx = bumpCanvas.getContext('2d')!;
  bumpCtx.fillStyle = '#080808';
  bumpCtx.fillRect(0, 0, W, H);

  const nightCanvas = document.createElement('canvas');
  nightCanvas.width = W;
  nightCanvas.height = H;
  const nightCtx = nightCanvas.getContext('2d')!;
  nightCtx.fillStyle = '#000000';
  nightCtx.fillRect(0, 0, W, H);

  const countriesGeo = topojson.feature(
    countriesAtlas as unknown as Parameters<typeof topojson.feature>[0],
    (countriesAtlas as unknown as { objects: { countries: Parameters<typeof topojson.feature>[1] } })
      .objects.countries
  ) as unknown as {
    features: Array<{
      properties?: { name?: string };
      geometry: {
        type: 'Polygon' | 'MultiPolygon';
        coordinates: number[][][] | number[][][][];
      };
    }>;
  };

  const traceFeature = (
    ctx: CanvasRenderingContext2D,
    geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: number[][][] | number[][][][] },
    offsetPx = 0
  ) => {
    ctx.beginPath();
    if (geometry.type === 'Polygon') {
      const rings = geometry.coordinates as number[][][];
      rings.forEach((ring) => drawWrappedRing(ctx, ring, W, H, offsetPx));
    } else if (geometry.type === 'MultiPolygon') {
      const polys = geometry.coordinates as number[][][][];
      polys.forEach((poly) => {
        poly.forEach((ring) => drawWrappedRing(ctx, ring, W, H, offsetPx));
      });
    }
  };

  // Coastal shelf glow
  dayCtx.save();
  dayCtx.lineJoin = 'round';
  countriesGeo.features.forEach((feat) => {
    [-W, 0, W].forEach((offset) => {
      traceFeature(dayCtx, feat.geometry, offset);
      dayCtx.strokeStyle = 'rgba(20, 150, 170, 0.28)';
      dayCtx.lineWidth = 6;
      dayCtx.stroke();
    });
  });
  dayCtx.restore();

  const landGrad = dayCtx.createLinearGradient(0, 0, 0, H);
  landGrad.addColorStop(0.0, '#dceaf5');
  landGrad.addColorStop(0.11, '#bad0de');
  landGrad.addColorStop(0.19, '#254a3a');
  landGrad.addColorStop(0.32, '#2f5f42');
  landGrad.addColorStop(0.41, '#756e49');
  landGrad.addColorStop(0.5, '#205b38');
  landGrad.addColorStop(0.6, '#626c45');
  landGrad.addColorStop(0.76, '#2d553d');
  landGrad.addColorStop(0.89, '#cadbe8');
  landGrad.addColorStop(1.0, '#eef6fc');

  const countryLabels: { name: string; lat: number; lon: number; span: number }[] = [];

  countriesGeo.features.forEach((feat, idx) => {
    const name = feat.properties?.name || '';
    const isPolar = /Antarctica|Greenland/i.test(name);

    // Find largest ring centroid for clean country label placement
    let bestRing: number[][] | null = null;
    let bestSpan = -1;
    if (feat.geometry.type === 'Polygon') {
      const r = (feat.geometry.coordinates as number[][][])[0];
      const info = computeRingCentroidAndSpan(r);
      bestRing = r;
      bestSpan = info.span;
    } else if (feat.geometry.type === 'MultiPolygon') {
      (feat.geometry.coordinates as number[][][][]).forEach((poly) => {
        const r = poly[0];
        const info = computeRingCentroidAndSpan(r);
        if (info.span > bestSpan) {
          bestSpan = info.span;
          bestRing = r;
        }
      });
    }
    if (bestRing && name) {
      const c = computeRingCentroidAndSpan(bestRing);
      // Adjust a few wide/hollow centroids manually for cleanest visual centering
      let labelLon = c.lon;
      let labelLat = c.lat;
      if (name === 'United States of America') {
        labelLon = -98.5;
        labelLat = 39.5;
      } else if (name === 'Russia') {
        labelLon = 92;
        labelLat = 62;
      } else if (name === 'Canada') {
        labelLon = -102;
        labelLat = 58;
      } else if (name === 'France') {
        labelLon = 2.4;
        labelLat = 46.8;
      }
      countryLabels.push({
        name: name === 'United States of America' ? 'USA' : name === 'United Kingdom' ? 'UK' : name,
        lat: labelLat,
        lon: labelLon,
        span: bestSpan
      });
    }

    [-W, 0, W].forEach((offset) => {
      traceFeature(dayCtx, feat.geometry, offset);
      dayCtx.fillStyle = isPolar ? '#dfecf5' : landGrad;
      dayCtx.fill();

      traceFeature(dayCtx, feat.geometry, offset);
      dayCtx.fillStyle =
        idx % 3 === 0
          ? 'rgba(26, 92, 64, 0.22)'
          : idx % 3 === 1
          ? 'rgba(98, 86, 56, 0.16)'
          : 'rgba(18, 66, 52, 0.18)';
      dayCtx.fill();

      // Clear country border lines
      traceFeature(dayCtx, feat.geometry, offset);
      dayCtx.strokeStyle = 'rgba(120, 235, 200, 0.5)';
      dayCtx.lineWidth = 1.15;
      dayCtx.stroke();

      traceFeature(roughCtx, feat.geometry, offset);
      roughCtx.fillStyle = isPolar ? '#787878' : '#d6d6d6';
      roughCtx.fill();

      traceFeature(bumpCtx, feat.geometry, offset);
      bumpCtx.fillStyle = isPolar ? '#858585' : '#646464';
      bumpCtx.fill();
      bumpCtx.strokeStyle = '#929292';
      bumpCtx.lineWidth = 1.4;
      bumpCtx.stroke();
    });
  });

  // Paint all Country Names directly onto Earth texture in crisp 4K
  dayCtx.save();
  dayCtx.textAlign = 'center';
  dayCtx.textBaseline = 'middle';
  countryLabels.forEach((cl) => {
    if (cl.span < 4) return;
    const x = ((cl.lon + 180) / 360) * W;
    const y = ((90 - cl.lat) / 180) * H;
    const fontSize = (cl.span > 500 ? 15 : cl.span > 90 ? 11 : 8.5) * pxScale;
    dayCtx.font = `700 ${fontSize}px "JetBrains Mono", monospace`;
    dayCtx.lineWidth = 2.6 * pxScale;
    dayCtx.strokeStyle = 'rgba(4, 14, 24, 0.9)';
    dayCtx.strokeText(cl.name.toUpperCase(), x, y);
    dayCtx.fillStyle = 'rgba(235, 252, 248, 0.94)';
    dayCtx.fillText(cl.name.toUpperCase(), x, y);
  });
  dayCtx.restore();

  // Paint all Global Cities onto surface texture too (always visible on spin & zoom)
  dayCtx.save();
  dayCtx.textAlign = 'left';
  dayCtx.textBaseline = 'middle';
  GLOBAL_CITIES.forEach((city) => {
    const cx = ((city.lon + 180) / 360) * W;
    const cy = ((90 - city.lat) / 180) * H;

    // Bright surface dot
    dayCtx.beginPath();
    dayCtx.arc(cx, cy, (city.tier === 1 ? 3.2 : 2.2) * pxScale, 0, Math.PI * 2);
    dayCtx.fillStyle = city.tier === 1 ? '#00D69A' : '#38BDF8';
    dayCtx.fill();

    // Subtle city name on map texture
    dayCtx.font = `600 ${(city.tier === 1 ? 8.5 : 7.2) * pxScale}px "Plus Jakarta Sans", sans-serif`;
    dayCtx.lineWidth = 2.2 * pxScale;
    dayCtx.strokeStyle = 'rgba(2, 10, 18, 0.92)';
    dayCtx.strokeText(city.name, cx + 5 * pxScale, cy - 3 * pxScale);
    dayCtx.fillStyle = city.tier === 1 ? '#FFFFFF' : '#C8E2F4';
    dayCtx.fillText(city.name, cx + 5 * pxScale, cy - 3 * pxScale);

    // Night-side golden urban illumination
    const rad = (city.tier === 1 ? 24 : 15) * pxScale;
    const g = nightCtx.createRadialGradient(cx, cy, 0.5, cx, cy, rad);
    g.addColorStop(0, 'rgba(255, 226, 150, 0.98)');
    g.addColorStop(0.28, 'rgba(255, 170, 72, 0.45)');
    g.addColorStop(0.65, 'rgba(0, 214, 154, 0.16)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    nightCtx.fillStyle = g;
    nightCtx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
  });
  dayCtx.restore();

  // Subtle orbital graticule lines
  dayCtx.strokeStyle = 'rgba(110, 195, 210, 0.08)';
  dayCtx.lineWidth = 0.7;
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * H;
    dayCtx.beginPath();
    dayCtx.moveTo(0, y);
    dayCtx.lineTo(W, y);
    dayCtx.stroke();
  }
  for (let lon = -150; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * W;
    dayCtx.beginPath();
    dayCtx.moveTo(x, 0);
    dayCtx.lineTo(x, H);
    dayCtx.stroke();
  }

  // Cloud layer
  const cloudCanvas = document.createElement('canvas');
  cloudCanvas.width = 1024;
  cloudCanvas.height = 512;
  const cloudCtx = cloudCanvas.getContext('2d')!;
  cloudCtx.clearRect(0, 0, 1024, 512);
  for (let i = 0; i < 420; i++) {
    const x = (i * 617) % 1024;
    const y = 30 + ((i * 293) % 452);
    const rx = 20 + (i % 48);
    const ry = 6 + (i % 14);
    const g = cloudCtx.createRadialGradient(x, y, 1, x, y, rx);
    g.addColorStop(0, 'rgba(235, 246, 255, 0.16)');
    g.addColorStop(0.5, 'rgba(215, 235, 250, 0.07)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    cloudCtx.save();
    cloudCtx.translate(x, y);
    cloudCtx.scale(1, ry / rx);
    cloudCtx.fillStyle = g;
    cloudCtx.beginPath();
    cloudCtx.arc(0, 0, rx, 0, Math.PI * 2);
    cloudCtx.fill();
    cloudCtx.restore();
  }

  const dayTex = new THREE.CanvasTexture(dayCanvas);
  dayTex.colorSpace = THREE.SRGBColorSpace;
  dayTex.anisotropy = maxAnisotropy;

  const roughTex = new THREE.CanvasTexture(roughCanvas);
  roughTex.anisotropy = maxAnisotropy;

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.anisotropy = maxAnisotropy;

  const nightTex = new THREE.CanvasTexture(nightCanvas);
  nightTex.colorSpace = THREE.SRGBColorSpace;
  nightTex.anisotropy = maxAnisotropy;

  const cloudTex = new THREE.CanvasTexture(cloudCanvas);
  cloudTex.colorSpace = THREE.SRGBColorSpace;

  return { dayTex, roughTex, bumpTex, nightTex, cloudTex };
}

export const HeroInfrastructure3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const labelsContainerRef = useRef<HTMLDivElement | null>(null);
  const liveTickerRef = useRef<HTMLDivElement | null>(null);
  const autoRotateRef = useRef(true);
  const presetTriggerRef = useRef<((preset: FocusPreset) => void) | null>(null);

  const [fallbackActive, setFallbackActive] = useState(false);
  const [autoSpin, setAutoSpin] = useState(true);
  const [activeRegion, setActiveRegion] = useState<FocusPreset>('global');

  const toggleAutoSpin = () => {
    const next = !autoSpin;
    autoRotateRef.current = next;
    setAutoSpin(next);
  };

  const selectRegion = (preset: FocusPreset) => {
    setActiveRegion(preset);
    presetTriggerRef.current?.(preset);
  };

  useEffect(() => {
    const container = mountRef.current;
    const labelsLayer = labelsContainerRef.current;
    if (!container || !labelsLayer) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let controls: OrbitControls | null = null;
    let pmremGenerator: THREE.PMREMGenerator | null = null;
    let envRenderTarget: THREE.WebGLRenderTarget | null = null;
    let animFrameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let contextLost = false;
    let resumeTimer = 0;
    let isDragging = false;

    const disposables: {
      geometries: THREE.BufferGeometry[];
      materials: THREE.Material[];
      textures: THREE.Texture[];
    } = { geometries: [], materials: [], textures: [] };

    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      disposables.geometries.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T): T => {
      disposables.materials.push(m);
      return m;
    };
    const trackTex = <T extends THREE.Texture>(t: T): T => {
      disposables.textures.push(t);
      return t;
    };

    try {
      const probeCanvas = document.createElement('canvas');
      const glProbe = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!glProbe) {
        setFallbackActive(true);
        return;
      }
      const dbg = glProbe.getExtension('WEBGL_debug_renderer_info');
      const rendererStr = dbg
        ? String(glProbe.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '')
        : '';
      const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);
      glProbe.getExtension('WEBGL_lose_context')?.loseContext();

      const width = container.clientWidth || 720;
      const height = container.clientHeight || 490;

      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: false,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2.5));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.28;
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

      camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 120);
      latLonToVector3(22, 46, 3.85, camera.position);

      pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      envRenderTarget = pmremGenerator.fromScene(roomEnv, 0.04);
      scene.environment = envRenderTarget.texture;
      scene.environmentIntensity = 0.5;
      roomEnv.dispose();

      // Deep Space Universe Sky Sphere (4K on GPU)
      const spaceTex = trackTex(buildSpaceUniverseTexture(!isSoftwareGl));
      const spaceSphere = new THREE.Mesh(
        trackGeo(new THREE.SphereGeometry(32, 32, 24)),
        trackMat(
          new THREE.MeshBasicMaterial({
            map: spaceTex,
            side: THREE.BackSide,
            depthWrite: false
          })
        )
      );
      scene.add(spaceSphere);

      // 3D Parallax Starfield in Space
      const starCount = 1600;
      const starPos = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);
      const cTmp = new THREE.Color();
      for (let i = 0; i < starCount; i++) {
        const r = 8 + ((i * 13) % 20);
        const theta = ((i * 137.5) % 360) * (Math.PI / 180);
        const phi = Math.acos(1 - (2 * ((i + 0.5) / starCount)));
        starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i * 3 + 1] = r * Math.cos(phi);
        starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

        if (i % 7 === 0) cTmp.setHex(0x67e8f9);
        else if (i % 11 === 0) cTmp.setHex(0xfde68a);
        else cTmp.setHex(0xe2e8f0);
        starColors[i * 3] = cTmp.r;
        starColors[i * 3 + 1] = cTmp.g;
        starColors[i * 3 + 2] = cTmp.b;
      }
      const starGeo = trackGeo(new THREE.BufferGeometry());
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
      const starPoints = new THREE.Points(
        starGeo,
        trackMat(
          new THREE.PointsMaterial({
            size: 0.06,
            vertexColors: true,
            transparent: true,
            opacity: 0.88,
            sizeAttenuation: true
          })
        )
      );
      scene.add(starPoints);

      // Solar Lighting + Corona Sprite in Universe
      const hemiLight = new THREE.HemisphereLight(0xa5e4ff, 0x0a1626, 0.82);
      scene.add(hemiLight);

      const sunLight = new THREE.DirectionalLight(0xfff6e5, 2.8);
      sunLight.position.set(7, 3.8, 5.5);
      scene.add(sunLight);

      const rimLight = new THREE.DirectionalLight(0x0ea5a4, 1.15);
      rimLight.position.set(-6, -2.5, -5);
      scene.add(rimLight);

      const sunSprite = new THREE.Sprite(
        trackMat(
          new THREE.SpriteMaterial({
            map: trackTex(buildSunGlowTexture()),
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.78,
            depthWrite: false
          })
        )
      );
      sunSprite.position.set(9.5, 4.8, 7.2);
      sunSprite.scale.set(4.6, 4.6, 1);
      scene.add(sunSprite);

      // OrbitControls for smooth user drag rotation in ANY direction
      controls = new OrbitControls(camera, canvas);
      controls.enablePan = false;
      controls.enableZoom = true;
      controls.enableRotate = true;
      controls.rotateSpeed = 0.9;
      controls.zoomSpeed = 0.8;
      controls.minDistance = 2.3;
      controls.maxDistance = 6.2;
      controls.minPolarAngle = 0.06;
      controls.maxPolarAngle = Math.PI - 0.06;
      controls.enableDamping = !isSoftwareGl;
      controls.dampingFactor = 0.065;

      // Earth Rotating Group
      const earthGroup = new THREE.Group();
      scene.add(earthGroup);

      // Camera transition helper accounting for Earth's live rotation
      let isTransitioning = false;
      const movePreset = (preset: FocusPreset) => {
        const coords: Record<FocusPreset, [number, number, number]> = {
          global: [22, 46, 3.85],
          india: [21, 78, 2.85],
          europe: [48, 12, 2.95],
          americas: [28, -82, 3.2],
          asia: [30, 114, 3.05]
        };
        const [lat, lon, dist] = coords[preset];
        latLonToVector3(lat, lon, dist, _targetCamPos);
        _targetCamPos.applyQuaternion(earthGroup.quaternion);
        isTransitioning = true;
      };
      presetTriggerRef.current = movePreset;

      controls.addEventListener('start', () => {
        canvas.style.cursor = 'grabbing';
        isDragging = true;
        isTransitioning = false;
        window.clearTimeout(resumeTimer);
      });
      controls.addEventListener('end', () => {
        canvas.style.cursor = 'grab';
        resumeTimer = window.setTimeout(() => {
          isDragging = false;
        }, 1400);
      });

      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      const textures = buildEarthTextures(maxAniso, !isSoftwareGl);
      trackTex(textures.dayTex);
      trackTex(textures.roughTex);
      trackTex(textures.bumpTex);
      trackTex(textures.nightTex);
      trackTex(textures.cloudTex);

      // Earth Sphere (96x96 ultra-smooth UHD geometry on hardware GPU)
      const earthSegs = isSoftwareGl ? 64 : 96;
      const earthMesh = new THREE.Mesh(
        trackGeo(new THREE.SphereGeometry(EARTH_RADIUS, earthSegs, earthSegs)),
        trackMat(
          new THREE.MeshStandardMaterial({
            map: textures.dayTex,
            roughnessMap: textures.roughTex,
            roughness: 1.0,
            metalness: 0.08,
            bumpMap: textures.bumpTex,
            bumpScale: 0.028,
            emissiveMap: textures.nightTex,
            emissive: new THREE.Color(0xffc978),
            emissiveIntensity: 0.9
          })
        )
      );
      earthGroup.add(earthMesh);

      // Drifting Clouds Layer
      const cloudMesh = new THREE.Mesh(
        trackGeo(new THREE.SphereGeometry(CLOUD_RADIUS, 48, 48)),
        trackMat(
          new THREE.MeshStandardMaterial({
            map: textures.cloudTex,
            transparent: true,
            opacity: 0.52,
            depthWrite: false,
            roughness: 0.9
          })
        )
      );
      earthGroup.add(cloudMesh);

      // Atmospheric Rayleigh Halo
      const atmosMesh = new THREE.Mesh(
        trackGeo(new THREE.SphereGeometry(ATMOS_RADIUS, 48, 48)),
        trackMat(
          new THREE.ShaderMaterial({
            vertexShader: `
              varying vec3 vNormal;
              varying vec3 vViewPos;
              void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
                vViewPos = -mvPos.xyz;
                gl_Position = projectionMatrix * mvPos;
              }
            `,
            fragmentShader: `
              varying vec3 vNormal;
              varying vec3 vViewPos;
              void main() {
                float intensity = pow(0.64 - dot(vNormal, normalize(vViewPos)), 3.0);
                vec3 glowColor = mix(vec3(0.06, 0.62, 0.88), vec3(0.0, 0.84, 0.60), 0.35);
                gl_FragColor = vec4(glowColor, clamp(intensity, 0.0, 0.85));
              }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true,
            depthWrite: false
          })
        )
      );
      earthGroup.add(atmosMesh);

      // Dual Orbiting Telemetry Rings + Multi-Part Sentinel Satellites in Space
      const orbitGroup = new THREE.Group();
      scene.add(orbitGroup);

      const satRingMat = trackMat(
        new THREE.MeshBasicMaterial({
          color: 0x0ea5a4,
          transparent: true,
          opacity: 0.28
        })
      );
      const orbitRing1 = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(1.76, 0.005, 10, 128)), satRingMat);
      orbitRing1.rotation.x = Math.PI / 2.4;
      orbitRing1.rotation.y = 0.35;
      orbitGroup.add(orbitRing1);

      const orbitRing2 = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(1.94, 0.004, 10, 128)),
        trackMat(new THREE.MeshBasicMaterial({ color: 0x00d69a, transparent: true, opacity: 0.2 }))
      );
      orbitRing2.rotation.x = -Math.PI / 3.1;
      orbitRing2.rotation.z = 0.52;
      orbitGroup.add(orbitRing2);

      // Composite Multi-Part 3D Sentinel Satellite (Metallic Bus + Solar Wings + Telemetry Core)
      const satMesh = new THREE.Group();
      const satBus = new THREE.Mesh(
        trackGeo(new THREE.OctahedronGeometry(0.032, 0)),
        trackMat(new THREE.MeshPhysicalMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.16, clearcoat: 1 }))
      );
      const satCore = new THREE.Mesh(
        trackGeo(new THREE.SphereGeometry(0.016, 12, 12)),
        trackMat(new THREE.MeshBasicMaterial({ color: 0x00d69a }))
      );
      const wingGeo = trackGeo(new THREE.BoxGeometry(0.09, 0.028, 0.004));
      const wingMat = trackMat(new THREE.MeshPhysicalMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.18, clearcoat: 0.9 }));
      const wingL = new THREE.Mesh(wingGeo, wingMat);
      wingL.position.x = -0.068;
      const wingR = new THREE.Mesh(wingGeo, wingMat);
      wingR.position.x = 0.068;
      satMesh.add(satBus, satCore, wingL, wingR);
      orbitRing1.add(satMesh);

      const satMesh2 = satMesh.clone();
      orbitRing2.add(satMesh2);

      // City 3D Surface Beacons + Volumetric Tier-1 Telemetry Pillars
      const cityLocalPositions = GLOBAL_CITIES.map((c) =>
        latLonToVector3(c.lat, c.lon, EARTH_RADIUS + 0.008)
      );
      const cityLocalNormals = cityLocalPositions.map((p) => p.clone().normalize());

      const beaconGeo = trackGeo(new THREE.SphereGeometry(0.016, 12, 12));
      const beaconMat = trackMat(new THREE.MeshBasicMaterial({ color: 0x00d69a }));
      const cityInstanced = new THREE.InstancedMesh(beaconGeo, beaconMat, GLOBAL_CITIES.length);
      const pillarGeo = trackGeo(new THREE.CylinderGeometry(0.003, 0.009, 0.14, 8));
      pillarGeo.translate(0, 0.07, 0);
      const pillarMat = trackMat(
        new THREE.MeshBasicMaterial({ color: 0x00d69a, transparent: true, opacity: 0.65 })
      );
      const tier1Cities = GLOBAL_CITIES.map((c, idx) => ({ c, idx })).filter((x) => x.c.tier === 1);
      const pillarInstanced = new THREE.InstancedMesh(pillarGeo, pillarMat, tier1Cities.length);

      const beaconColor = new THREE.Color();
      GLOBAL_CITIES.forEach((city, idx) => {
        _dummy.position.copy(cityLocalPositions[idx]);
        _dummy.quaternion.identity();
        _dummy.scale.setScalar(city.tier === 1 ? 1.25 : 0.85);
        _dummy.updateMatrix();
        cityInstanced.setMatrixAt(idx, _dummy.matrix);
        beaconColor.setHex(city.tier === 1 ? 0x00d69a : 0x38bdf8);
        cityInstanced.setColorAt(idx, beaconColor);
      });
      cityInstanced.instanceMatrix.needsUpdate = true;
      if (cityInstanced.instanceColor) cityInstanced.instanceColor.needsUpdate = true;
      cityInstanced.computeBoundingSphere();
      earthGroup.add(cityInstanced);

      tier1Cities.forEach((entry, pIdx) => {
        _dummy.position.copy(cityLocalPositions[entry.idx]);
        _dummy.quaternion.setFromUnitVectors(_up, cityLocalNormals[entry.idx]);
        _dummy.scale.set(1, 0.75 + (pIdx % 3) * 0.35, 1);
        _dummy.updateMatrix();
        pillarInstanced.setMatrixAt(pIdx, _dummy.matrix);
      });
      pillarInstanced.instanceMatrix.needsUpdate = true;
      pillarInstanced.computeBoundingSphere();
      earthGroup.add(pillarInstanced);

      // Projected Floating Labels for Key Cities (transform properly with rotating earthGroup!)
      labelsLayer.innerHTML = '';
      const labelEls: HTMLDivElement[] = GLOBAL_CITIES.map((city) => {
        const el = document.createElement('div');
        el.className =
          'absolute top-0 left-0 pointer-events-none select-none font-mono text-[9.5px] leading-none px-1.5 py-0.5 rounded bg-[#07090B]/85 border border-[#1E2936] text-[#D1D9E0] whitespace-nowrap';
        el.innerHTML = `<span class="text-[#00D69A] font-semibold">${city.name}</span> <span class="text-[#8F9CA8]">${city.country}</span>`;
        el.style.opacity = '0';
        labelsLayer.appendChild(el);
        return el;
      });

      // Live Cyber Attacks (Guide Arcs + Bright Animated Comet Trails + Photon Packets + Shockwave Ripples)
      const packetGeo = trackGeo(new THREE.SphereGeometry(0.025, 10, 10));
      const packetMat = trackMat(new THREE.MeshBasicMaterial({ color: 0xffffff }));
      const packetInstanced = new THREE.InstancedMesh(packetGeo, packetMat, ATTACK_COUNT);
      packetInstanced.frustumCulled = false;
      earthGroup.add(packetInstanced);

      const rippleGeo = trackGeo(new THREE.RingGeometry(0.018, 0.036, 24));
      const ripples: RippleState[] = [];
      for (let i = 0; i < ATTACK_COUNT; i++) {
        const rMesh = new THREE.Mesh(
          rippleGeo,
          trackMat(
            new THREE.MeshBasicMaterial({
              color: 0xff4d6d,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0,
              depthWrite: false
            })
          )
        );
        rMesh.visible = false;
        earthGroup.add(rMesh);
        ripples.push({ mesh: rMesh, active: false, age: 0, duration: 1.15 });
      }

      const kindLabels: Record<AttackKind, { tag: string; hex: number; cls: string }> = {
        intrusion: { tag: 'INTRUSION', hex: 0xff4d6d, cls: '#FF4D6D' },
        anomaly: { tag: 'DDoS FLOOD', hex: 0xe5b84b, cls: '#E5B84B' },
        mitigated: { tag: 'MITIGATED', hex: 0x00d69a, cls: '#00D69A' }
      };
      const kinds: AttackKind[] = ['intrusion', 'intrusion', 'anomaly', 'mitigated'];

      const assignAttackRoute = (ev: AttackEvent, seed: number) => {
        const srcIdx = Math.floor((seed * 7 + Math.random() * 29) % GLOBAL_CITIES.length);
        let dstIdx =
          (srcIdx + 3 + Math.floor(Math.random() * (GLOBAL_CITIES.length - 4))) %
          GLOBAL_CITIES.length;
        if (dstIdx === srcIdx) dstIdx = (srcIdx + 1) % GLOBAL_CITIES.length;

        const kind = kinds[Math.floor(Math.random() * kinds.length)];
        const start = cityLocalPositions[srcIdx];
        const end = cityLocalPositions[dstIdx];
        const chordDist = start.distanceTo(end);
        const arcLift = Math.min(0.86, 0.16 + chordDist * 0.28);

        _mid.copy(start).add(end).multiplyScalar(0.5).normalize().multiplyScalar(EARTH_RADIUS + arcLift);

        ev.srcIdx = srcIdx;
        ev.dstIdx = dstIdx;
        ev.kind = kind;
        ev.color.setHex(kindLabels[kind].hex);
        ev.curve.v0.copy(start);
        ev.curve.v1.copy(_mid);
        ev.curve.v2.copy(end);

        // Update faint full-trajectory guide arc
        const guidePos = ev.guideLine.geometry.getAttribute('position') as THREE.BufferAttribute;
        for (let s = 0; s <= GUIDE_SEGMENTS; s++) {
          ev.curve.getPoint(s / GUIDE_SEGMENTS, _v1);
          guidePos.setXYZ(s, _v1.x, _v1.y, _v1.z);
        }
        guidePos.needsUpdate = true;
        (ev.guideLine.material as THREE.LineBasicMaterial).color.copy(ev.color);
        (ev.trailLine.material as THREE.LineBasicMaterial).color.copy(ev.color);

        // Update live telemetry ticker DOM smoothly
        if (liveTickerRef.current) {
          const sCity = GLOBAL_CITIES[srcIdx];
          const dCity = GLOBAL_CITIES[dstIdx];
          const meta = kindLabels[kind];
          liveTickerRef.current.innerHTML = `<span style="color:${meta.cls}">[${meta.tag}]</span> ${sCity.name} (${sCity.country}) &rarr; ${dCity.name} (${dCity.country})`;
        }
      };

      const attacks: AttackEvent[] = [];
      for (let i = 0; i < ATTACK_COUNT; i++) {
        const guideGeo = trackGeo(new THREE.BufferGeometry());
        guideGeo.setAttribute(
          'position',
          new THREE.BufferAttribute(new Float32Array((GUIDE_SEGMENTS + 1) * 3), 3)
        );
        const guideLine = new THREE.Line(
          guideGeo,
          trackMat(new THREE.LineBasicMaterial({ color: 0xff4d6d, transparent: true, opacity: 0.2 }))
        );
        guideLine.frustumCulled = false;
        earthGroup.add(guideLine);

        const trailPositions = new Float32Array((TRAIL_SEGMENTS + 1) * 3);
        const trailGeo = trackGeo(new THREE.BufferGeometry());
        const trailPosAttr = new THREE.BufferAttribute(trailPositions, 3);
        trailGeo.setAttribute('position', trailPosAttr);

        const trailLine = new THREE.Line(
          trailGeo,
          trackMat(new THREE.LineBasicMaterial({ color: 0xff4d6d, transparent: true, opacity: 0.95 }))
        );
        trailLine.frustumCulled = false;
        earthGroup.add(trailLine);

        const ev: AttackEvent = {
          srcIdx: 0,
          dstIdx: 1,
          kind: 'intrusion',
          progress: (i / ATTACK_COUNT) % 1,
          speed: 0.25 + (i % 5) * 0.05,
          curve: new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3()
          ),
          guideLine,
          trailLine,
          trailPosAttr,
          trailPositions,
          color: new THREE.Color(0xff4d6d)
        };
        assignAttackRoute(ev, i + 1);
        attacks.push(ev);
      }

      const triggerImpactRipple = (cityIdx: number, color: THREE.Color) => {
        const slot = ripples.find((r) => !r.active) || ripples[0];
        slot.active = true;
        slot.age = 0;
        slot.mesh.visible = true;
        slot.mesh.position.copy(cityLocalNormals[cityIdx]).multiplyScalar(EARTH_RADIUS + 0.012);
        slot.mesh.quaternion.setFromUnitVectors(_up, cityLocalNormals[cityIdx]);
        slot.mesh.scale.setScalar(1);
        const mat = slot.mesh.material as THREE.MeshBasicMaterial;
        mat.color.copy(color);
        mat.opacity = 0.95;
      };

      const onContextLost = (e: Event) => {
        e.preventDefault();
        contextLost = true;
      };
      const onContextRestored = () => {
        contextLost = false;
      };
      canvas.addEventListener('webglcontextlost', onContextLost);
      canvas.addEventListener('webglcontextrestored', onContextRestored);

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

      const updateLabels = (viewW: number, viewH: number) => {
        if (!camera) return;
        _camDir.copy(camera.position).normalize();
        const dist = camera.position.length();

        GLOBAL_CITIES.forEach((city, idx) => {
          const el = labelEls[idx];
          _worldNorm.copy(cityLocalNormals[idx]).applyQuaternion(earthGroup.quaternion);
          const facing = _worldNorm.dot(_camDir);

          const minFacing = city.tier === 1 ? 0.36 : dist < 3.1 ? 0.44 : 1.1;
          if (facing < minFacing) {
            el.style.opacity = '0';
            return;
          }

          _worldPos.copy(cityLocalPositions[idx]).applyMatrix4(earthGroup.matrixWorld);
          _proj.copy(_worldPos).project(camera!);
          const sx = ((_proj.x + 1) * 0.5) * viewW;
          const sy = ((-_proj.y + 1) * 0.5) * viewH;

          if (sx < 16 || sx > viewW - 92 || sy < 24 || sy > viewH - 46) {
            el.style.opacity = '0';
            return;
          }

          el.style.transform = `translate3d(${Math.round(sx + 7)}px, ${Math.round(sy - 7)}px, 0)`;
          el.style.opacity = String(Math.min(0.92, (facing - 0.25) * 1.45));
        });
      };

      const afterDraw = (cb: () => void) => {
        const gl = renderer!.getContext() as WebGL2RenderingContext;
        if (!gl || typeof gl.fenceSync !== 'function') {
          animFrameId = window.setTimeout(cb, 60);
          return;
        }
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            animFrameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            animFrameId = window.setTimeout(cb, 65);
          }
        };
        animFrameId = window.setTimeout(poll, 5);
      };

      const stepAndRender = () => {
        if (contextLost || !renderer || !scene || !camera || !controls) return;

        const dt = Math.min(0.12, Math.max(0.016, clock.getDelta()));
        const elapsed = clock.elapsedTime;

        if (isTransitioning) {
          camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, 5.0, dt);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, 5.0, dt);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, 5.0, dt);
          if (camera.position.distanceTo(_targetCamPos) < 0.03) {
            isTransitioning = false;
          }
        }

        // Live automatic Earth & Universe rotation on EVERY platform (yields when user drags)
        if (autoRotateRef.current && !isDragging && !isTransitioning) {
          earthGroup.rotation.y += dt * 0.14;
        }
        cloudMesh.rotation.y += dt * 0.025;
        starPoints.rotation.y += dt * 0.008;
        satMesh.position.set(Math.cos(elapsed * 0.9) * 1.76, Math.sin(elapsed * 0.9) * 1.76, 0);
        satMesh.lookAt(0, 0, 0);
        satMesh2.position.set(Math.cos(-elapsed * 0.72 + 1.4) * 1.94, Math.sin(-elapsed * 0.72 + 1.4) * 1.94, 0);
        satMesh2.lookAt(0, 0, 0);

        earthGroup.updateMatrixWorld(true);
        controls.update();

        // Advance all 20 cyber-attack projectiles & trailing arcs
        for (let i = 0; i < ATTACK_COUNT; i++) {
          const ev = attacks[i];
          ev.progress += dt * ev.speed;

          if (ev.progress >= 1.0) {
            triggerImpactRipple(ev.dstIdx, ev.color);
            ev.progress = 0;
            assignAttackRoute(ev, i + Math.floor(elapsed * 100));
          }

          const headT = ev.progress;
          const tailSpan = 0.28;
          const tailT = Math.max(0, headT - tailSpan);

          for (let s = 0; s <= TRAIL_SEGMENTS; s++) {
            const frac = s / TRAIL_SEGMENTS;
            const t = tailT + (headT - tailT) * frac;
            ev.curve.getPoint(t, _v1);
            ev.trailPositions[s * 3] = _v1.x;
            ev.trailPositions[s * 3 + 1] = _v1.y;
            ev.trailPositions[s * 3 + 2] = _v1.z;
          }
          ev.trailPosAttr.needsUpdate = true;

          ev.curve.getPoint(headT, _v2);
          _dummy.position.copy(_v2);
          _dummy.scale.setScalar(1.0);
          _dummy.updateMatrix();
          packetInstanced.setMatrixAt(i, _dummy.matrix);
          packetInstanced.setColorAt(i, ev.color);
        }
        packetInstanced.instanceMatrix.needsUpdate = true;
        if (packetInstanced.instanceColor) packetInstanced.instanceColor.needsUpdate = true;

        for (let i = 0; i < ripples.length; i++) {
          const r = ripples[i];
          if (!r.active) continue;
          r.age += dt;
          const t = r.age / r.duration;
          if (t >= 1) {
            r.active = false;
            r.mesh.visible = false;
          } else {
            r.mesh.scale.setScalar(1 + t * 4.5);
            (r.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.9;
          }
        }

        const viewW = container.clientWidth || width;
        const viewH = container.clientHeight || height;
        updateLabels(viewW, viewH);

        renderer.render(scene, camera);

        if (isSoftwareGl) afterDraw(stepAndRender);
        else animFrameId = requestAnimationFrame(stepAndRender);
      };

      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }

      animFrameId = requestAnimationFrame(stepAndRender);

      return () => {
        window.clearTimeout(resumeTimer);
        window.clearTimeout(animFrameId);
        cancelAnimationFrame(animFrameId);
        canvas.removeEventListener('webglcontextlost', onContextLost);
        canvas.removeEventListener('webglcontextrestored', onContextRestored);
        if (resizeObserver) resizeObserver.disconnect();
        if (controls) controls.dispose();

        disposables.geometries.forEach((g) => g.dispose());
        disposables.materials.forEach((m) => m.dispose());
        disposables.textures.forEach((t) => t.dispose());
        if (envRenderTarget) envRenderTarget.dispose();
        if (pmremGenerator) pmremGenerator.dispose();
        if (renderer) renderer.dispose();
      };
    } catch {
      setFallbackActive(true);
    }
  }, []);

  if (fallbackActive) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#03050a]">
        <div className="w-56 h-56 rounded-full border border-[#00D69A]/40 bg-[#0D1116] flex items-center justify-center text-xs font-mono text-[#00D69A]">
          3D EARTH UNIVERSE
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full select-none bg-[#03050a]">
      {/* Isolated WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Projected 3D City / Country Labels Layer */}
      <div
        ref={labelsContainerRef}
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      />

      {/* Top-Left Live Attack Stream Indicator (Static icon + crisp ticker) */}
      <div className="absolute top-3 left-3 right-3 pointer-events-none flex flex-wrap items-center justify-between gap-2">
        <div className="px-2.5 py-1.5 rounded-lg bg-[#07090B]/90 border border-[#1E2936] text-[10px] font-mono text-[#D1D9E0] flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-[#FF4D6D]" />
          <span>LIVE GLOBAL CYBER TELEMETRY</span>
          <span className="text-[#1E2936]">|</span>
          <span className="text-[#00D69A]">DRAG TO ROTATE</span>
        </div>

        <div
          ref={liveTickerRef}
          className="px-2.5 py-1.5 rounded-lg bg-[#07090B]/90 border border-[#1E2936] text-[10px] font-mono text-[#D1D9E0] truncate max-w-[260px]"
        >
          MONITORING 46 GLOBAL NODES
        </div>
      </div>

      {/* Compact Bottom Dock Controls */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#07090B]/90 border border-[#1E2936] text-[10px] font-mono max-w-[96%] overflow-x-auto">
        {(['global', 'india', 'asia', 'europe', 'americas'] as FocusPreset[]).map((region) => (
          <button
            key={region}
            type="button"
            onClick={() => selectRegion(region)}
            className={`px-2 py-1 rounded uppercase cursor-pointer transition-colors whitespace-nowrap ${
              activeRegion === region
                ? 'bg-[#00D69A] text-[#07090B] font-bold'
                : 'text-[#8F9CA8] hover:text-[#F4F7F6]'
            }`}
          >
            {region}
          </button>
        ))}
        <span className="text-[#1E2936]">|</span>
        <button
          type="button"
          onClick={toggleAutoSpin}
          className={`px-2 py-1 rounded cursor-pointer transition-colors whitespace-nowrap ${
            autoSpin ? 'text-[#00D69A]' : 'text-[#E5B84B]'
          }`}
        >
          {autoSpin ? 'LIVE SPIN: ON' : 'SPIN: PAUSED'}
        </button>
      </div>
    </div>
  );
};
