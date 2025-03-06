import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from 'react-three-fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

// Simple Avatar component
const Avatar = ({ position = [0, -1, 0], scale = 1.5 }) => {
  const group = useRef();
  
  // Animation with GSAP
  useEffect(() => {
    if (group.current) {
      gsap.to(group.current.rotation, {
        y: Math.PI * 2,
        duration: 20,
        repeat: -1,
        ease: "none"
      });
      
      gsap.to(group.current.position, {
        y: position[1] + 0.1,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    }
  }, [position]);

  // Simple geometry for avatar
  return (
    <group ref={group} position={position} scale={scale}>
      {/* Body */}
      <mesh position={[0, 0.8, 0]}>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#f6e05e" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[0.2, 1.9, 0.4]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.2, 1.9, 0.4]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
};

// Background particles
const Particles = () => {
  const points = useRef();
  const particlesCount = 2000;
  const positions = new Float32Array(particlesCount * 3);
  
  for (let i = 0; i < particlesCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  
  useFrame(() => {
    if (points.current) {
      points.current.rotation.x += 0.0005;
      points.current.rotation.y += 0.0005;
    }
  });
  
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#4299e1" sizeAttenuation />
    </points>
  );
};

// Main scene component
const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Avatar />
      <Particles />
      <OrbitControls enableZoom={false} enablePan={false} />
    </>
  );
};

// Exported component with Canvas
const LoginScene = () => {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Scene />
      </Canvas>
    </div>
  );
};

export default LoginScene;