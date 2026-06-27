import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export type MorphMode = 'scattered' | 'text';

interface MorphingParticlesProps {
  count?: number;
  mode?: MorphMode;
  textValue?: string;
  particleColor?: string;
}

/**
 * Generates 3D target coordinates by rendering text to a hidden 2D Canvas 
 * and sampling the non-transparent pixel positions.
 */
function getTextTargets(text: string, count: number, viewportWidth: number, viewportHeight: number): Float32Array {
  const targets = new Float32Array(count * 3);
  
  // Default to random scatter if no text
  if (!text) {
    for(let i=0; i<count*3; i++) {
      targets[i] = (Math.random() - 0.5) * 20;
    }
    return targets;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return targets;

  // Use a reasonable resolution for sampling
  const w = 512;
  const h = 256;
  canvas.width = w;
  canvas.height = h;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  ctx.font = 'bold 80px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);

  const imgData = ctx.getImageData(0, 0, w, h).data;
  const validPixels: {x: number, y: number}[] = [];

  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const idx = (y * w + x) * 4;
      const r = imgData[idx];
      if (r > 128) {
        // Map 2D canvas coordinates to 3D world space
        // Canvas origin is top-left, WebGL origin is center
        const mapX = ((x / w) - 0.5) * (viewportWidth * 0.8);
        const mapY = -((y / h) - 0.5) * (viewportHeight * 0.8);
        validPixels.push({ x: mapX, y: mapY });
      }
    }
  }

  if (validPixels.length === 0) return targets;

  // Shuffle array to prevent linear chunking visually
  for (let i = validPixels.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [validPixels[i], validPixels[j]] = [validPixels[j], validPixels[i]];
  }

  // Assign valid pixels to target array
  for (let i = 0; i < count; i++) {
    const pixel = validPixels[i % validPixels.length];
    const i3 = i * 3;
    
    // Add tiny random spread for thickness
    targets[i3] = pixel.x + (Math.random() - 0.5) * 0.2;
    targets[i3 + 1] = pixel.y + (Math.random() - 0.5) * 0.2;
    targets[i3 + 2] = (Math.random() - 0.5) * 0.5; // slight depth
  }

  return targets;
}

export const MorphingParticles: React.FC<MorphingParticlesProps> = ({ 
  count = 5000, 
  mode = 'scattered', 
  textValue = 'CIPHERTEXT',
  particleColor = '#00f0ff'
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  const [targetPositions, setTargetPositions] = useState<Float32Array | null>(null);

  // Initialize raw arrays
  const { positions, originalPositions, velocities, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const color1 = new THREE.Color('#ffffff');
    const color2 = new THREE.Color(particleColor);
    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      const x = (Math.random() - 0.5) * (viewport.width * 1.5);
      const y = (Math.random() - 0.5) * (viewport.height * 1.5);
      const z = (Math.random() - 0.5) * 10;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      originalPositions[i3] = x;
      originalPositions[i3 + 1] = y;
      originalPositions[i3 + 2] = z;

      velocities[i3] = 0;
      velocities[i3 + 1] = 0;
      velocities[i3 + 2] = 0;

      tempColor.lerpColors(color1, color2, Math.random() * 0.8);
      colors[i3] = tempColor.r;
      colors[i3 + 1] = tempColor.g;
      colors[i3 + 2] = tempColor.b;

      sizes[i] = Math.random() * 2.0;
    }

    return { positions, originalPositions, velocities, colors, sizes };
  }, [count, viewport.width, viewport.height, particleColor]);

  // Update targets when mode or text changes
  useEffect(() => {
    if (mode === 'text' && textValue) {
      setTargetPositions(getTextTargets(textValue, count, viewport.width, viewport.height));
    } else {
      setTargetPositions(null); // Return to original scattered positions
    }
  }, [mode, textValue, count, viewport.width, viewport.height]);

  const pointer3D = useRef(new THREE.Vector3(0, 0, 0));
  const targetPointer = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      targetPointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      targetPointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const x = (targetPointer.current.x * viewport.width) / 2;
    const y = (targetPointer.current.y * viewport.height) / 2;
    pointer3D.current.lerp(new THREE.Vector3(x, y, 0), 0.1);

    const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();

    // Physics parameters adapt based on mode
    const isGathering = mode === 'text';
    const friction = isGathering ? 0.85 : 0.92;
    const pullStrength = isGathering ? 0 : 8.0; // Disable cursor attract when gathering
    const springStrength = isGathering ? 4.0 : 1.5; 
    const interactionRadius = 4.0;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const px = positionsArray[i3];
      const py = positionsArray[i3 + 1];
      const pz = positionsArray[i3 + 2];

      // Target is either the formed text coordinates or the original scattered coordinates
      const tx = targetPositions ? targetPositions[i3] : originalPositions[i3];
      const ty = targetPositions ? targetPositions[i3 + 1] : originalPositions[i3 + 1];
      const tz = targetPositions ? targetPositions[i3 + 2] : originalPositions[i3 + 2];

      let vx = velocities[i3];
      let vy = velocities[i3 + 1];
      let vz = velocities[i3 + 2];

      // 1. Cursor Attraction (only if scattered)
      if (!isGathering) {
        const dx = pointer3D.current.x - px;
        const dy = pointer3D.current.y - py;
        const dz = pointer3D.current.z - pz;
        const distSq = dx * dx + dy * dy + dz * dz;
        const dist = Math.sqrt(distSq);

        if (dist < interactionRadius) {
          const force = pullStrength * (1.0 - dist / interactionRadius);
          vx += (dx / dist) * force * delta;
          vy += (dy / dist) * force * delta;
          vz += (dz / dist) * force * delta;
        }
      } else {
        // Subtle repel from cursor if gathered, just for interactivity
        const dx = px - pointer3D.current.x;
        const dy = py - pointer3D.current.y;
        const dz = pz - pointer3D.current.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < 2.0) {
          vx += (dx / dist) * 10.0 * delta;
          vy += (dy / dist) * 10.0 * delta;
        }
      }

      // 2. Spring Force to Target
      vx += (tx - px) * springStrength * delta;
      vy += (ty - py) * springStrength * delta;
      vz += (tz - pz) * springStrength * delta;

      // 3. Organic Drift (Noise)
      // Reduce noise amplitude when forming text so it's readable
      const noiseAmp = isGathering ? 0.05 : 0.5;
      const noiseX = Math.sin(time * 0.5 + tx) * noiseAmp;
      const noiseY = Math.cos(time * 0.6 + ty) * noiseAmp;
      const noiseZ = Math.sin(time * 0.4 + tz) * noiseAmp;
      
      vx += noiseX * delta;
      vy += noiseY * delta;
      vz += noiseZ * delta;

      // 4. Apply Friction
      vx *= friction;
      vy *= friction;
      vz *= friction;

      // 5. Update Arrays
      velocities[i3] = vx;
      velocities[i3 + 1] = vy;
      velocities[i3 + 2] = vz;

      positionsArray[i3] = px + vx;
      positionsArray[i3 + 1] = py + vy;
      positionsArray[i3 + 2] = pz + vz;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const CustomParticleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * pixelRatio * (30.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          vec2 xy = gl_PointCoord.xy - vec2(0.5);
          float ll = length(xy);
          if(ll > 0.5) discard;
          float opacity = smoothstep(0.5, 0.0, ll);
          gl_FragColor = vec4(vColor, opacity * 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} usage={THREE.DynamicDrawUsage} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
      </bufferGeometry>
      <primitive object={CustomParticleMaterial} attach="material" />
    </points>
  );
};
