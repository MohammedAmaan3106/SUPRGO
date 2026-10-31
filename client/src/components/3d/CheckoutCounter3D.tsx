import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore, CASHIERS } from '../../context/StoreContext';
import { soundManager } from '../../audio/soundManager';
import { Text } from '@react-three/drei';
import { CashierCharacter } from './CashierCharacter';
import { CheckoutCounterId } from '../../types';

interface SingleCounterProps {
  id: CheckoutCounterId;
  position: [number, number, number];
  conveyorTex: THREE.CanvasTexture;
  onConveyorScan?: (delta: number) => void;
}

const SingleCounter: React.FC<SingleCounterProps> = ({ id, position, conveyorTex }) => {
  const {
    cart,
    checkoutStage,
    setCheckoutStage,
    activeCounter,
    setActiveCounter,
    scannedIndex,
    setScannedIndex,
    pricing,
    playerPosition
  } = useStore();

  const cashierInfo = CASHIERS[id];
  const laserRef = useRef<THREE.Mesh>(null);
  const scanTimerRef = useRef<number>(0);

  const isActive = activeCounter === id && checkoutStage !== 'SHOPPING';

  // Distance to this specific counter
  const distToCounter = Math.hypot(playerPosition[0] - position[0], playerPosition[2] - position[2]);
  const isNear = distToCounter < 3.2;

  useFrame((_, delta) => {
    if (isActive && checkoutStage === 'SCANNING') {
      // Animate laser pulse
      if (laserRef.current) {
        laserRef.current.scale.y = 1 + Math.sin(Date.now() * 0.02) * 0.25;
      }

      // Timer to scan next item on this counter
      scanTimerRef.current += delta;
      if (scanTimerRef.current > 1.1) {
        scanTimerRef.current = 0;
        soundManager.playBarcodeBeep();

        setScannedIndex((prev) => {
          const next = prev + 1;
          if (next >= cart.length) {
            soundManager.playCashRegister();
            setTimeout(() => {
              setCheckoutStage('INVOICE');
            }, 600);
          }
          return next;
        });
      }
    }
  });

  const handleStartCheckout = () => {
    setActiveCounter(id);
    setCheckoutStage('SCANNING');
    soundManager.playConveyorMotor();
  };

  return (
    <group position={position}>
      {/* 1. Main Checkout Desk */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[3.2, 0.9, 1.4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Brushed Aluminum Countertop Trim */}
      <mesh position={[0, 0.91, 0]}>
        <boxGeometry args={[3.25, 0.04, 1.45]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 2. Moving Rubber Conveyor Belt */}
      <mesh position={[-0.45, 0.935, 0]}>
        <boxGeometry args={[2.0, 0.02, 0.65]} />
        <meshStandardMaterial map={conveyorTex} roughness={0.6} />
      </mesh>

      {/* Conveyor Belt Side Guard Rails */}
      <mesh position={[-0.45, 0.98, -0.34]}>
        <boxGeometry args={[2.05, 0.07, 0.03]} />
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.45, 0.98, 0.34]}>
        <boxGeometry args={[2.05, 0.07, 0.03]} />
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* 3. Barcode Scanner Window & Red Laser Beam */}
      <group position={[0.42, 0.94, 0]}>
        <mesh position={[0, 0.005, 0]}>
          <boxGeometry args={[0.22, 0.02, 0.45]} />
          <meshPhysicalMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
            roughness={0.1}
          />
        </mesh>
        {isActive && checkoutStage === 'SCANNING' && (
          <mesh ref={laserRef} position={[0, 0.16, 0]}>
            <boxGeometry args={[0.015, 0.3, 0.44]} />
            <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
          </mesh>
        )}
      </group>

      {/* 4. Touchscreen POS Cashier Terminal */}
      <group position={[0.9, 1.15, -0.25]} rotation={[0, -Math.PI / 6, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.38, 0.28, 0.04]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
        <mesh position={[0, 0.05, 0.022]} rotation={[-0.2, 0, 0]}>
          <planeGeometry args={[0.35, 0.25]} />
          <meshBasicMaterial color={cashierInfo.avatarColor} />
        </mesh>
        <Text
          position={[0, 0.08, 0.025]}
          rotation={[-0.2, 0, 0]}
          fontSize={0.03}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {isActive && checkoutStage === 'SCANNING'
            ? `Scanning: ${scannedIndex}/${cart.length}`
            : isActive && (checkoutStage === 'INVOICE' || checkoutStage === 'PAYMENT')
            ? `Total: ₹${pricing.total}`
            : `Lane 0${id} Ready`}
        </Text>
      </group>

      {/* 5. Customer Bagging Area & Brown Kraft Paper Grocery Bags */}
      <group position={[1.2, 0.94, 0.15]}>
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[0.26, 0.36, 0.22]} />
          <meshStandardMaterial color="#b45309" roughness={0.9} />
        </mesh>
      </group>

      {/* 6. Overhead Suspended Illuminated Sign */}
      <group position={[0, 3.2, 0]}>
        <mesh>
          <boxGeometry args={[2.0, 0.55, 0.15]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Glowing Face */}
        <mesh position={[0, 0, 0.08]}>
          <planeGeometry args={[1.9, 0.46]} />
          <meshBasicMaterial color={cashierInfo.avatarColor} />
        </mesh>
        <Text
          position={[0, 0.06, 0.085]}
          fontSize={0.11}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {`COUNTER 0${id}`}
        </Text>
        <Text
          position={[0, -0.09, 0.085]}
          fontSize={0.055}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
        >
          {id === 1 ? 'EXPRESS (1-10 ITEMS) ● OPEN' : id === 2 ? 'REGULAR CHECKOUT ● OPEN' : 'CARDS & UPI ● OPEN'}
        </Text>

        {/* Backside */}
        <mesh position={[0, 0, -0.08]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.9, 0.46]} />
          <meshBasicMaterial color={cashierInfo.avatarColor} />
        </mesh>
        <Text
          position={[0, 0.06, -0.085]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.11}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {`COUNTER 0${id}`}
        </Text>
      </group>

      {/* 7. Dedicated Animated Cashier Character behind desk */}
      <CashierCharacter
        counterId={id}
        cashierInfo={cashierInfo}
        position={[0.3, 0, -0.85]}
        rotation={[0, 0, 0]}
      />

      {/* 8. Conveyor Items moving past scanner */}
      {isActive &&
        checkoutStage === 'SCANNING' &&
        cart.map((cartItem, idx) => {
          const progress = Math.max(0, Math.min(1, (scannedIndex - idx + 1) / 1.5));
          const itemX = -1.2 + progress * 1.6;
          return (
            <mesh
              key={`counter-${id}-item-${cartItem.product.id}`}
              position={[itemX, 1.05, 0]}
              scale={0.8}
            >
              <boxGeometry args={[0.18, 0.22, 0.14]} />
              <meshStandardMaterial color={cartItem.product.color} />
            </mesh>
          );
        })}

      {/* 9. Floating Prompt when near this specific counter */}
      {isNear && checkoutStage === 'SHOPPING' && cart.length > 0 && (
        <group position={[0, 1.8, 0]} onClick={handleStartCheckout}>
          <mesh>
            <boxGeometry args={[2.0, 0.38, 0.04]} />
            <meshBasicMaterial color="#0f766e" transparent opacity={0.9} />
          </mesh>
          <Text
            position={[0, 0.05, 0.03]}
            fontSize={0.085}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {`Press [E] for Counter 0${id}`}
          </Text>
          <Text
            position={[0, -0.08, 0.03]}
            fontSize={0.055}
            color="#a7f3d0"
            anchorX="center"
            anchorY="middle"
          >
            {`Dock Trolley with ${cashierInfo.name}`}
          </Text>
        </group>
      )}
    </group>
  );
};

export const CheckoutCounter3D: React.FC = () => {
  const { checkoutStage } = useStore();
  const conveyorBeltTexRef = useRef<THREE.CanvasTexture | null>(null);

  // Ribbed rubber conveyor belt texture
  const conveyorTex = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#0f172a';
    for (let y = 0; y < 256; y += 16) {
      ctx.fillRect(0, y, 256, 8);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 4);
    conveyorBeltTexRef.current = tex;
    return tex;
  }, []);

  useFrame((_, delta) => {
    if (checkoutStage === 'SCANNING' && conveyorBeltTexRef.current) {
      conveyorBeltTexRef.current.offset.y -= delta * 0.8;
    }
  });

  return (
    <group>
      {/* COUNTER 01 - Express (Left) */}
      <SingleCounter
        id={1}
        position={[-5.5, 0, 9.8]}
        conveyorTex={conveyorTex}
      />

      {/* COUNTER 02 - Regular (Center) */}
      <SingleCounter
        id={2}
        position={[0.0, 0, 9.8]}
        conveyorTex={conveyorTex}
      />

      {/* COUNTER 03 - Priority / Cards & UPI (Right) */}
      <SingleCounter
        id={3}
        position={[5.5, 0, 9.8]}
        conveyorTex={conveyorTex}
      />
    </group>
  );
};
