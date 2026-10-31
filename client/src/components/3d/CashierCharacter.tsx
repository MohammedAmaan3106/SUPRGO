import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { CheckoutCounterId, CashierInfo } from '../../types';
import { useStore } from '../../context/StoreContext';

interface CashierCharacterProps {
  counterId: CheckoutCounterId;
  cashierInfo: CashierInfo;
  position: [number, number, number];
  rotation?: [number, number, number];
}

export const CashierCharacter: React.FC<CashierCharacterProps> = ({
  counterId,
  cashierInfo,
  position,
  rotation = [0, 0, 0]
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightHandRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Group>(null);

  const { checkoutStage, activeCounter, scannedIndex, cart } = useStore();

  const isCurrentActiveCounter = activeCounter === counterId && checkoutStage !== 'SHOPPING';

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // 1. Subtle idle breathing & weight shift
    if (bodyRef.current) {
      bodyRef.current.position.y = 0.95 + Math.sin(t * 2) * 0.015;
    }

    if (headRef.current) {
      // Natural subtle head scanning
      headRef.current.rotation.y = Math.sin(t * 0.8) * 0.12;
      headRef.current.rotation.x = Math.sin(t * 1.5) * 0.04;
    }

    // 2. Active checkout behaviors
    if (isCurrentActiveCounter) {
      if (checkoutStage === 'SCANNING') {
        // Scanning item animation with right arm
        const scanCycle = (t * 3.5) % Math.PI;
        if (rightArmRef.current) {
          // Reach to conveyor, slide over scanner, push to bagging
          rightArmRef.current.rotation.x = -0.4 + Math.sin(scanCycle) * 0.55;
          rightArmRef.current.rotation.z = -0.2 - Math.cos(scanCycle) * 0.35;
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -0.3 + Math.sin(t * 1.5) * 0.08;
        }
      } else if (checkoutStage === 'INVOICE' || checkoutStage === 'PAYMENT') {
        // Welcoming gesture towards terminal
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.6;
          rightArmRef.current.rotation.z = -0.4;
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -0.2;
        }
      }
    } else {
      // Default idle arms resting lightly behind counter
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.25 + Math.sin(t * 1.2 + counterId) * 0.05;
        rightArmRef.current.rotation.z = -0.05;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.25 + Math.cos(t * 1.2 + counterId) * 0.05;
        leftArmRef.current.rotation.z = 0.05;
      }
    }
  });

  // Dynamic dialogue text for the speech bubble
  const getSpeechText = () => {
    if (!isCurrentActiveCounter) {
      return `Counter 0${counterId} Open`;
    }
    if (checkoutStage === 'SCANNING') {
      return `Scanning (${scannedIndex}/${cart.length})...`;
    }
    if (checkoutStage === 'INVOICE') {
      return 'Receipt ready! Tap to pay.';
    }
    if (checkoutStage === 'PAYMENT') {
      return 'Please complete payment on terminal.';
    }
    if (checkoutStage === 'COMPLETED') {
      return 'Thank you! Have a great day!';
    }
    return cashierInfo.voiceGreeting;
  };

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Humanoid Body Group */}
      <group ref={bodyRef} position={[0, 0.95, 0]}>
        {/* Torso & Retail Uniform Apron */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.42, 0.56, 0.22]} />
          <meshStandardMaterial color="#0f766e" roughness={0.7} />
        </mesh>

        {/* Crisp White Shirt Collar */}
        <mesh position={[0, 0.26, 0.02]}>
          <boxGeometry args={[0.22, 0.08, 0.2]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>

        {/* Staff ID Badge */}
        <mesh position={[-0.12, 0.12, 0.115]}>
          <boxGeometry args={[0.08, 0.06, 0.005]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.12, 0.12, 0.118]}>
          <boxGeometry args={[0.06, 0.02, 0.002]} />
          <meshBasicMaterial color={cashierInfo.avatarColor} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.1, 12]} />
          <meshStandardMaterial color="#d4a373" roughness={0.6} />
        </mesh>

        {/* Head & Hair */}
        <group ref={headRef} position={[0, 0.44, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshStandardMaterial color="#d4a373" roughness={0.5} />
          </mesh>
          {/* Hair style */}
          <mesh position={[0, 0.06, -0.02]}>
            <sphereGeometry args={[0.135, 16, 16]} />
            <meshStandardMaterial color="#1e1b4b" roughness={0.9} />
          </mesh>
          {/* Retail headset / earpiece */}
          <mesh position={[0.135, 0, 0.02]}>
            <boxGeometry args={[0.02, 0.05, 0.04]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
        </group>

        {/* Right Shoulder & Arm (Scanner Arm) */}
        <group ref={rightArmRef} position={[0.26, 0.2, 0]}>
          <mesh position={[0, -0.16, 0]}>
            <capsuleGeometry args={[0.055, 0.26, 8, 12]} />
            <meshStandardMaterial color="#0f766e" roughness={0.7} />
          </mesh>
          {/* Forearm & Hand */}
          <group position={[0, -0.3, 0]}>
            <mesh ref={rightHandRef} position={[0, -0.1, 0]}>
              <capsuleGeometry args={[0.045, 0.18, 8, 12]} />
              <meshStandardMaterial color="#d4a373" roughness={0.5} />
            </mesh>
          </group>
        </group>

        {/* Left Shoulder & Arm */}
        <group ref={leftArmRef} position={[-0.26, 0.2, 0]}>
          <mesh position={[0, -0.16, 0]}>
            <capsuleGeometry args={[0.055, 0.26, 8, 12]} />
            <meshStandardMaterial color="#0f766e" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <capsuleGeometry args={[0.045, 0.18, 8, 12]} />
            <meshStandardMaterial color="#d4a373" roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* Trousers / Legs */}
      <mesh position={[-0.1, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.07, 0.9, 12]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
      <mesh position={[0.1, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.07, 0.9, 12]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Retail Shoes */}
      <mesh position={[-0.1, 0.05, 0.04]}>
        <boxGeometry args={[0.11, 0.08, 0.22]} />
        <meshStandardMaterial color="#020617" roughness={0.4} />
      </mesh>
      <mesh position={[0.1, 0.05, 0.04]}>
        <boxGeometry args={[0.11, 0.08, 0.22]} />
        <meshStandardMaterial color="#020617" roughness={0.4} />
      </mesh>

      {/* Floating 3D Cashier Speech & Info Bubble */}
      <group position={[0, 1.85, 0]}>
        {/* Backing pill */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.5, 0.32, 0.02]} />
          <meshBasicMaterial color="#020617" transparent opacity={0.85} />
        </mesh>
        {/* Cashier Name & Role */}
        <Text
          position={[0, 0.07, 0.015]}
          fontSize={0.075}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          {`${cashierInfo.name} • ${cashierInfo.title}`}
        </Text>
        {/* Real-time Dialogue Text */}
        <Text
          position={[0, -0.06, 0.015]}
          fontSize={0.06}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {getSpeechText()}
        </Text>
      </group>
    </group>
  );
};

