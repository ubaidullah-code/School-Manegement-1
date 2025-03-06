import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from 'react-three-fiber';
import { OrbitControls } from '@react-three/drei';
import { gsap } from 'gsap';

const Avatar = ({ skinColor = '#f6e05e', hairColor = '#4a5568', shirtColor = '#3182ce' }) => {
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
        y: 0.1,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    }
  }, []);

  return (
    <group ref={group} position={[0, 0, 0]} scale={1.5}>
      {/* Body/Shirt */}
      <mesh position={[0, 0.8, 0]}>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      
      {/* Hair */}
      <mesh position={[0, 2.05, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color={hairColor} />
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
      
      {/* Mouth */}
      <mesh position={[0, 1.7, 0.4]} rotation={[0, 0, 0]}>
        <capsuleGeometry args={[0.05, 0.2, 4, 8]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#e53e3e" />
      </mesh>
    </group>
  );
};

// Main scene component
const Scene = ({ skinColor, hairColor, shirtColor }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Avatar skinColor={skinColor} hairColor={hairColor} shirtColor={shirtColor} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </>
  );
};

// Exported component with Canvas
const StudentAvatar = ({ skinColor, hairColor, shirtColor, className }) => {
  return (
    <div className={`${className || 'h-64 w-64'}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Scene 
          skinColor={skinColor} 
          hairColor={hairColor} 
          shirtColor={shirtColor} 
        />
      </Canvas>
    </div>
  );
};

export default StudentAvatar;