import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

export function Scene({ autoRotate = true }: { autoRotate?: boolean }) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const boxesRef = useRef<THREE.Group>(null);
  const [rotationSpeed, setRotationSpeed] = useState(0.2);

  useEffect(() => {
    if (boxesRef.current) {
      boxesRef.current.children.forEach((box, i) => {
        box.position.set(
          Math.sin(i) * 2,
          Math.cos(i) * 2,
          Math.sin(i * 0.5) * 2
        );
      });
    }
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (sphereRef.current && autoRotate) {
      sphereRef.current.rotation.y += rotationSpeed * 0.01;
    }

    if (boxesRef.current) {
      if (autoRotate) {
        boxesRef.current.rotation.y += rotationSpeed * 0.005;
      }
      boxesRef.current.children.forEach((box, i) => {
        box.position.y += Math.sin(time + i) * 0.002;
      });
    }
  });

  return (
    <>
      <Sphere ref={sphereRef} args={[1, 32, 32]}>
        <meshStandardMaterial
          color="#4338ca"
          roughness={0.4}
          metalness={0.8}
          wireframe
        />
      </Sphere>

      <group ref={boxesRef}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Box key={i} args={[0.2, 0.2, 0.2]}>
            <meshStandardMaterial
              color="#818cf8"
              roughness={0.3}
              metalness={0.8}
            />
          </Box>
        ))}
      </group>

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
    </>
  );
}