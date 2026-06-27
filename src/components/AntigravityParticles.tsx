import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface AntigravityParticlesProps {
  count?: number;
}

export const AntigravityParticles: React.FC<AntigravityParticlesProps> = ({ count = 5000 }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  // Create GPU-accelerated typed arrays for raw performance
  const { positions, velocities, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    // Bright, vibrant colors for a Light Theme
    const palette = [
      new THREE.Color('#00f0ff'), // Cyber Teal
      new THREE.Color('#b026ff'), // Cyber Purple
      new THREE.Color('#ff0055'), // Vibrant Pink
      new THREE.Color('#0055ff')  // Deep Blue
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Scatter randomly across the screen
      positions[i3] = (Math.random() - 0.5) * (viewport.width * 1.5);
      positions[i3 + 1] = (Math.random() - 0.5) * (viewport.height * 1.5);
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      velocities[i3] = 0;
      velocities[i3 + 1] = 0;
      velocities[i3 + 2] = 0;

      // Assign a random vibrant color
      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Randomize sizes
      sizes[i] = Math.random() * 2.0 + 1.0; 
    }

    return { positions, velocities, colors, sizes };
  }, [count, viewport.width, viewport.height]);

  const pointer3D = useRef(new THREE.Vector3(0, 0, 0));
  const targetPointer = useRef(new THREE.Vector2(0, 0));

  // Native mouse tracking to guarantee it works even behind UI elements
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

    // Convert screen coordinates to 3D space
    const x = (targetPointer.current.x * viewport.width) / 2;
    const y = (targetPointer.current.y * viewport.height) / 2;
    pointer3D.current.lerp(new THREE.Vector3(x, y, 0), 0.1);

    const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();

    // Physics Tuning
    const friction = 0.90;      // Damping (air resistance)
    const pullStrength = 15.0;  // How hard the cursor pulls particles
    const swirlStrength = 5.0;  // Tangential force for orbiting around cursor
    const interactionRadius = 8.0; 
    const randomDrift = 0.5;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      let px = positionsArray[i3];
      let py = positionsArray[i3 + 1];
      let pz = positionsArray[i3 + 2];

      let vx = velocities[i3];
      let vy = velocities[i3 + 1];
      let vz = velocities[i3 + 2];

      // Distance to cursor
      const dx = pointer3D.current.x - px;
      const dy = pointer3D.current.y - py;
      const dz = pointer3D.current.z - pz;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Force Field: Cursor Attraction + Orbital Swirl
      if (dist < interactionRadius && dist > 0.1) {
        // Force gets stronger as it gets closer, up to a limit
        const force = pullStrength * (1.0 - (dist / interactionRadius));
        
        // Direct Attraction Vector
        vx += (dx / dist) * force * delta;
        vy += (dy / dist) * force * delta;
        vz += (dz / dist) * force * delta;

        // Tangential Vector (Cross Product for Swirling/Orbiting)
        // Vector pointing perpendicular to the center to create a vortex
        vx += (-dy / dist) * swirlStrength * force * delta;
        vy += (dx / dist) * swirlStrength * force * delta;
      }

      // Organic Perlin-like Noise Drift
      // Uses unique offsets based on initial positions so they don't move uniformly
      vx += Math.sin(time * 0.5 + px) * randomDrift * delta;
      vy += Math.cos(time * 0.6 + py) * randomDrift * delta;
      vz += Math.sin(time * 0.4 + pz) * randomDrift * delta;

      // Boundaries: Wrap around screen if they fly too far
      const halfW = viewport.width / 2 + 2;
      const halfH = viewport.height / 2 + 2;
      
      if (px > halfW) px = -halfW;
      if (px < -halfW) px = halfW;
      if (py > halfH) py = -halfH;
      if (py < -halfH) py = halfH;
      
      // Damping (Friction)
      vx *= friction;
      vy *= friction;
      vz *= friction;

      // Update Kinematics
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
          
          // Soft solid circle with blur edge
          float opacity = smoothstep(0.5, 0.1, ll);
          gl_FragColor = vec4(vColor, opacity);
        }
      `,
      transparent: true,
      blending: THREE.NormalBlending, // Changed to NormalBlending so it works perfectly on light backgrounds
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
