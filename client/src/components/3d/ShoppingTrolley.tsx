import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../context/StoreContext';
import { Text } from '@react-three/drei';
import { CheckoutCounterId } from '../../types';

const DOCK_COORDS: Record<CheckoutCounterId, [number, number]> = {
  1: [-6.2, 9.8],
  2: [-0.7, 9.8],
  3: [4.8, 9.8]
};

export const ShoppingTrolley: React.FC = () => {
  const trolleyRef = useRef<THREE.Group>(null);
  const frontLeftWheelRef = useRef<THREE.Group>(null);
  const frontRightWheelRef = useRef<THREE.Group>(null);
  const backLeftWheelRef = useRef<THREE.Mesh>(null);
  const backRightWheelRef = useRef<THREE.Mesh>(null);

  const { playerPosition, playerRotation, cart, pricing, checkoutStage, activeCounter } = useStore();

  const prevPos = useRef<[number, number]>([playerPosition[0], playerPosition[2]]);
  const wheelRotation = useRef<number>(0);

  // Smooth following physics in front of the player
  useFrame((_, delta) => {
    if (!trolleyRef.current) return;

    // If docked at one of the 3 checkout counters
    if (checkoutStage !== 'SHOPPING') {
      const [dockX, dockZ] = DOCK_COORDS[activeCounter] || DOCK_COORDS[1];
      trolleyRef.current.position.set(dockX, 0, dockZ);
      trolleyRef.current.rotation.set(0, -Math.PI / 2, 0);
      return;
    }

    // Natural follow distance (1.35m in front of camera)
    const trolleyDist = 1.35;
    const forwardX = -Math.sin(playerRotation);
    const forwardZ = -Math.cos(playerRotation);

    const targetX = playerPosition[0] + forwardX * trolleyDist;
    const targetZ = playerPosition[2] + forwardZ * trolleyDist;

    // Smooth dampening to eliminate jittering
    trolleyRef.current.position.x = THREE.MathUtils.damp(trolleyRef.current.position.x, targetX, 11, delta);
    trolleyRef.current.position.z = THREE.MathUtils.damp(trolleyRef.current.position.z, targetZ, 11, delta);
    
    // Support Ground Floor (Y=0), First Floor (Y=5.6), and Elevator vertical transit
    const floorY = Math.max(0, playerPosition[1] - 1.65);
    trolleyRef.current.position.y = THREE.MathUtils.damp(trolleyRef.current.position.y, floorY, 12, delta);

    // Align smoothly with player heading
    const currentRotY = trolleyRef.current.rotation.y;
    trolleyRef.current.rotation.y = THREE.MathUtils.damp(currentRotY, playerRotation, 9, delta);

    // Realistic caster wheel spinning
    const dx = playerPosition[0] - prevPos.current[0];
    const dz = playerPosition[2] - prevPos.current[1];
    const dist = Math.hypot(dx, dz);

    if (dist > 0.001) {
      wheelRotation.current += dist * 8;
      if (backLeftWheelRef.current) backLeftWheelRef.current.rotation.x = wheelRotation.current;
      if (backRightWheelRef.current) backRightWheelRef.current.rotation.x = wheelRotation.current;
      if (frontLeftWheelRef.current) frontLeftWheelRef.current.rotation.x = wheelRotation.current;
      if (frontRightWheelRef.current) frontRightWheelRef.current.rotation.x = wheelRotation.current;
    }

    prevPos.current = [playerPosition[0], playerPosition[2]];
  });

  const totalItemCount = useMemo(() => cart.reduce((acc, it) => acc + it.quantity, 0), [cart]);

  // Dynamic non-overlapping item placement inside basket
  const renderedBasketItems = useMemo(() => {
    const items: Array<{
      id: string;
      modelType: string;
      color: string;
      pos: [number, number, number];
      rot: [number, number, number];
    }> = [];

    let count = 0;
    cart.forEach((cartItem) => {
      for (let i = 0; i < Math.min(cartItem.quantity, 5); i++) {
        if (count >= 24) break;

        const col = count % 3;
        const row = Math.floor((count % 9) / 3);
        const layer = Math.floor(count / 9);

        const x = (col - 1) * 0.16 + (Math.sin(count * 2) * 0.02);
        const z = (row - 1) * 0.22 + (Math.cos(count * 3) * 0.02);
        const y = 0.44 + layer * 0.13;

        items.push({
          id: `${cartItem.product.id}-${i}`,
          modelType: cartItem.product.modelType,
          color: cartItem.product.color,
          pos: [x, y, z],
          rot: [0, (count * 0.45) % Math.PI, 0]
        });
        count++;
      }
    });

    return items;
  }, [cart]);

  return (
    <group ref={trolleyRef} position={[0, 0, 14.5]}>
      {/* 1. Chromed Wire Mesh Basket */}
      <group position={[0, 0.56, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <boxGeometry args={[0.54, 0.02, 0.72]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} wireframe />
        </mesh>
        <mesh position={[0, 0, -0.36]}>
          <boxGeometry args={[0.54, 0.38, 0.02]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} wireframe />
        </mesh>
        <mesh position={[0, 0.02, 0.36]}>
          <boxGeometry args={[0.54, 0.42, 0.02]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} wireframe />
        </mesh>
        <mesh position={[-0.27, 0, 0]}>
          <boxGeometry args={[0.02, 0.38, 0.72]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} wireframe />
        </mesh>
        <mesh position={[0.27, 0, 0]}>
          <boxGeometry args={[0.02, 0.38, 0.72]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} wireframe />
        </mesh>

        {/* Red Protective Trim & Bumpers */}
        <mesh position={[0, 0.19, -0.36]}>
          <boxGeometry args={[0.56, 0.03, 0.03]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
        <mesh position={[-0.28, 0.19, 0]}>
          <boxGeometry args={[0.03, 0.03, 0.74]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
        <mesh position={[0.28, 0.19, 0]}>
          <boxGeometry args={[0.03, 0.03, 0.74]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
        <mesh position={[-0.27, 0.1, -0.36]}>
          <boxGeometry args={[0.06, 0.22, 0.06]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} />
        </mesh>
        <mesh position={[0.27, 0.1, -0.36]}>
          <boxGeometry args={[0.06, 0.22, 0.06]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} />
        </mesh>
      </group>

      {/* 2. Push Handle Bar */}
      <group position={[0, 0.88, 0.44]}>
        <mesh position={[-0.26, -0.14, -0.06]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.35]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.26, -0.14, -0.06]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.35]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, 0.58]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.22, 0.03, 0.04]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* 3. Lower Chassis Frame */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.48, 0.03, 0.68]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 4. Caster Wheels */}
      <group ref={frontLeftWheelRef} position={[-0.24, 0.08, -0.28]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.075, 0.075, 0.03, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.035, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
        </mesh>
      </group>

      <group ref={frontRightWheelRef} position={[0.24, 0.08, -0.28]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.075, 0.075, 0.03, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.035, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
        </mesh>
      </group>

      <mesh ref={backLeftWheelRef} position={[-0.24, 0.08, 0.28]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.075, 0.075, 0.03, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      <mesh ref={backRightWheelRef} position={[0.24, 0.08, 0.28]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.075, 0.075, 0.03, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* 5. Physical Mini 3D Products stacked dynamically inside trolley basket */}
      {renderedBasketItems.map((item) => (
        <group key={item.id} position={item.pos} rotation={item.rot}>
          {item.modelType.includes('can') ? (
            <mesh>
              <cylinderGeometry args={[0.045, 0.045, 0.14, 12]} />
              <meshStandardMaterial color={item.color} metalness={0.8} roughness={0.2} />
            </mesh>
          ) : item.modelType.includes('apple') || item.modelType.includes('orange') || item.modelType.includes('tomato') ? (
            <mesh>
              <sphereGeometry args={[0.065, 10, 10]} />
              <meshStandardMaterial color={item.color} roughness={0.4} />
            </mesh>
          ) : (
            <mesh>
              <boxGeometry args={[0.11, 0.15, 0.07]} />
              <meshStandardMaterial color={item.color} roughness={0.4} />
            </mesh>
          )}
        </group>
      ))}

      {/* 6. Floating 3D HUD Badge Above Handle */}
      {totalItemCount > 0 && (
        <group position={[0, 1.15, 0.44]}>
          <mesh>
            <boxGeometry args={[0.52, 0.13, 0.02]} />
            <meshBasicMaterial color="#020617" transparent opacity={0.85} />
          </mesh>
          <Text
            position={[0, 0, 0.015]}
            fontSize={0.055}
            color="#38bdf8"
            anchorX="center"
            anchorY="middle"
          >
            {`🛒 ${totalItemCount} Items | ₹${pricing.total}`}
          </Text>
        </group>
      )}
    </group>
  );
};
