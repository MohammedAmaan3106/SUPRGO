import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../context/StoreContext';
import { Text } from '@react-three/drei';

export const Elevator3D: React.FC = () => {
  const {
    elevatorState,
    selectElevatorFloor,
    currentFloor,
    isNearElevator
  } = useStore();

  const cabinRef = useRef<THREE.Group>(null);
  const leftCabinDoorRef = useRef<THREE.Mesh>(null);
  const rightCabinDoorRef = useRef<THREE.Mesh>(null);

  const leftGfDoorRef = useRef<THREE.Mesh>(null);
  const rightGfDoorRef = useRef<THREE.Mesh>(null);

  const leftFfDoorRef = useRef<THREE.Mesh>(null);
  const rightFfDoorRef = useRef<THREE.Mesh>(null);

  // Smooth physical door sliding animation
  useFrame((_, delta) => {
    if (cabinRef.current) {
      cabinRef.current.position.y = elevatorState.cabinY;
    }

    // Target door opening: 0 = closed (doors meet at +/-0.35), 1 = open (doors slide to +/-1.1)
    const doorProg = elevatorState.doorProgress;
    const leftTarget = THREE.MathUtils.lerp(-0.38, -1.15, doorProg);
    const rightTarget = THREE.MathUtils.lerp(0.38, 1.15, doorProg);

    // Cabin doors
    if (leftCabinDoorRef.current) {
      leftCabinDoorRef.current.position.x = THREE.MathUtils.damp(leftCabinDoorRef.current.position.x, leftTarget, 8, delta);
    }
    if (rightCabinDoorRef.current) {
      rightCabinDoorRef.current.position.x = THREE.MathUtils.damp(rightCabinDoorRef.current.position.x, rightTarget, 8, delta);
    }

    // Ground floor shaft doors
    const gfOpen = elevatorState.cabinY < 0.2 ? doorProg : 0.0;
    const gfLeft = THREE.MathUtils.lerp(-0.38, -1.15, gfOpen);
    const gfRight = THREE.MathUtils.lerp(0.38, 1.15, gfOpen);
    if (leftGfDoorRef.current) leftGfDoorRef.current.position.x = THREE.MathUtils.damp(leftGfDoorRef.current.position.x, gfLeft, 8, delta);
    if (rightGfDoorRef.current) rightGfDoorRef.current.position.x = THREE.MathUtils.damp(rightGfDoorRef.current.position.x, gfRight, 8, delta);

    // First floor shaft doors
    const ffOpen = elevatorState.cabinY > 5.4 ? doorProg : 0.0;
    const ffLeft = THREE.MathUtils.lerp(-0.38, -1.15, ffOpen);
    const ffRight = THREE.MathUtils.lerp(0.38, 1.15, ffOpen);
    if (leftFfDoorRef.current) leftFfDoorRef.current.position.x = THREE.MathUtils.damp(leftFfDoorRef.current.position.x, ffLeft, 8, delta);
    if (rightFfDoorRef.current) rightFfDoorRef.current.position.x = THREE.MathUtils.damp(rightFfDoorRef.current.position.x, ffRight, 8, delta);
  });

  const getStatusText = () => {
    if (elevatorState.stage === 'MOVING') {
      return elevatorState.targetFloor === 1 ? '▲ MOVING TO 1ST FLOOR' : '▼ MOVING TO GROUND';
    }
    if (elevatorState.stage === 'CLOSING') return 'DOORS CLOSING';
    if (elevatorState.stage === 'OPENING') return 'DOORS OPENING';
    return elevatorState.targetFloor === 1 ? 'LEVEL 1: FASHION' : 'LEVEL G: GROCERY';
  };

  return (
    <group position={[0, 0, -11.5]}>
      {/* ========================================================
          1. VERTICAL ELEVATOR SHAFT (TOWER ENCLOSURE)
          ======================================================== */}
      {/* 4 Structural Vertical Steel Corner Columns */}
      {[
        [-1.65, -1.45],
        [1.65, -1.45],
        [-1.65, 1.45],
        [1.65, 1.45]
      ].map(([x, z], idx) => (
        <mesh key={`shaft-col-${idx}`} position={[x, 5.2, z]}>
          <boxGeometry args={[0.16, 10.6, 0.16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Shaft Glass Back Wall */}
      <mesh position={[0, 5.2, -1.45]}>
        <boxGeometry args={[3.2, 10.4, 0.05]} />
        <meshPhysicalMaterial
          color="#93c5fd"
          transparent
          opacity={0.3}
          roughness={0.1}
          transmission={0.8}
          thickness={0.05}
        />
      </mesh>

      {/* Shaft Glass Left Wall */}
      <mesh position={[-1.65, 5.2, 0]}>
        <boxGeometry args={[0.05, 10.4, 2.9]} />
        <meshPhysicalMaterial
          color="#93c5fd"
          transparent
          opacity={0.3}
          roughness={0.1}
          transmission={0.8}
          thickness={0.05}
        />
      </mesh>

      {/* Shaft Glass Right Wall */}
      <mesh position={[1.65, 5.2, 0]}>
        <boxGeometry args={[0.05, 10.4, 2.9]} />
        <meshPhysicalMaterial
          color="#93c5fd"
          transparent
          opacity={0.3}
          roughness={0.1}
          transmission={0.8}
          thickness={0.05}
        />
      </mesh>

      {/* Counterweight & Cable Guides */}
      <mesh position={[1.5, 5.2, -0.6]}>
        <cylinderGeometry args={[0.02, 0.02, 10.4]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
      </mesh>
      <mesh position={[-1.5, 5.2, -0.6]}>
        <cylinderGeometry args={[0.02, 0.02, 10.4]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
      </mesh>

      {/* ========================================================
          2. GROUND FLOOR ENTRANCE (Y = 0)
          ======================================================== */}
      <group position={[0, 0, 1.48]}>
        {/* Entrance Portal Arch */}
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[3.4, 0.4, 0.2]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-1.45, 1.25, 0]}>
          <boxGeometry args={[0.5, 2.5, 0.2]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[1.45, 1.25, 0]}>
          <boxGeometry args={[0.5, 2.5, 0.2]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Digital Floor Indicator Above Door (GF) */}
        <mesh position={[0, 2.5, 0.11]}>
          <planeGeometry args={[1.6, 0.3]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
        <Text
          position={[0, 2.5, 0.12]}
          fontSize={0.11}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          {getStatusText()}
        </Text>

        {/* Ground Floor Shaft Sliding Doors */}
        <mesh ref={leftGfDoorRef} position={[-0.38, 1.2, 0]}>
          <boxGeometry args={[0.76, 2.35, 0.04]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh ref={rightGfDoorRef} position={[0.38, 1.2, 0]}>
          <boxGeometry args={[0.76, 2.35, 0.04]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Outside Call Button Panel (GF) */}
        <group
          position={[1.15, 1.35, 0.12]}
          onClick={(e) => {
            e.stopPropagation();
            selectElevatorFloor(0);
          }}
        >
          <mesh>
            <boxGeometry args={[0.18, 0.42, 0.04]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.1, 0.025]}>
            <circleGeometry args={[0.045, 16]} />
            <meshBasicMaterial color={elevatorState.cabinY < 0.5 ? '#38bdf8' : '#64748b'} />
          </mesh>
          <mesh position={[0, -0.1, 0.025]}>
            <circleGeometry args={[0.045, 16]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          3. FIRST FLOOR ENTRANCE (Y = 5.6)
          ======================================================== */}
      <group position={[0, 5.6, 1.48]}>
        {/* Entrance Portal Arch */}
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[3.4, 0.4, 0.2]} />
          <meshStandardMaterial color="#1e1b4b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-1.45, 1.25, 0]}>
          <boxGeometry args={[0.5, 2.5, 0.2]} />
          <meshStandardMaterial color="#1e1b4b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[1.45, 1.25, 0]}>
          <boxGeometry args={[0.5, 2.5, 0.2]} />
          <meshStandardMaterial color="#1e1b4b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Digital Floor Indicator Above Door (FF) */}
        <mesh position={[0, 2.5, 0.11]}>
          <planeGeometry args={[1.6, 0.3]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
        <Text
          position={[0, 2.5, 0.12]}
          fontSize={0.11}
          color="#c084fc"
          anchorX="center"
          anchorY="middle"
        >
          {getStatusText()}
        </Text>

        {/* First Floor Shaft Sliding Doors */}
        <mesh ref={leftFfDoorRef} position={[-0.38, 1.2, 0]}>
          <boxGeometry args={[0.76, 2.35, 0.04]} />
          <meshStandardMaterial color="#312e81" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh ref={rightFfDoorRef} position={[0.38, 1.2, 0]}>
          <boxGeometry args={[0.76, 2.35, 0.04]} />
          <meshStandardMaterial color="#312e81" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Outside Call Button Panel (FF) */}
        <group
          position={[1.15, 1.35, 0.12]}
          onClick={(e) => {
            e.stopPropagation();
            selectElevatorFloor(1);
          }}
        >
          <mesh>
            <boxGeometry args={[0.18, 0.42, 0.04]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.1, 0.025]}>
            <circleGeometry args={[0.045, 16]} />
            <meshBasicMaterial color="#c084fc" />
          </mesh>
          <mesh position={[0, -0.1, 0.025]}>
            <circleGeometry args={[0.045, 16]} />
            <meshBasicMaterial color={elevatorState.cabinY > 5.0 ? '#c084fc' : '#64748b'} />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          4. PHYSICALLY MOVING ELEVATOR CABIN (Y = elevatorState.cabinY)
          ======================================================== */}
      <group ref={cabinRef} position={[0, 0, 0]}>
        {/* Cabin Floor (Polished Marble Slab) */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[2.9, 0.08, 2.7]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.3} />
        </mesh>

        {/* Cabin Ceiling with Flush LED Panel */}
        <mesh position={[0, 2.65, 0]}>
          <boxGeometry args={[2.9, 0.08, 2.7]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 2.605, 0]}>
          <boxGeometry args={[1.8, 0.01, 1.6]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
        <pointLight position={[0, 2.45, 0]} intensity={0.9} distance={4} color="#f8fafc" />

        {/* Glass Back Wall */}
        <mesh position={[0, 1.35, -1.32]}>
          <boxGeometry args={[2.85, 2.55, 0.04]} />
          <meshPhysicalMaterial
            color="#bae6fd"
            transparent
            opacity={0.35}
            roughness={0.1}
            transmission={0.8}
            thickness={0.04}
          />
        </mesh>

        {/* Glass Left Wall */}
        <mesh position={[-1.42, 1.35, 0]}>
          <boxGeometry args={[0.04, 2.55, 2.65]} />
          <meshPhysicalMaterial
            color="#bae6fd"
            transparent
            opacity={0.35}
            roughness={0.1}
            transmission={0.8}
            thickness={0.04}
          />
        </mesh>

        {/* Glass Right Wall */}
        <mesh position={[1.42, 1.35, 0]}>
          <boxGeometry args={[0.04, 2.55, 2.65]} />
          <meshPhysicalMaterial
            color="#bae6fd"
            transparent
            opacity={0.35}
            roughness={0.1}
            transmission={0.8}
            thickness={0.04}
          />
        </mesh>

        {/* Stainless Steel Handrails inside cabin */}
        <mesh position={[0, 1.0, -1.25]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 2.6]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
        </mesh>
        <mesh position={[-1.35, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 2.4]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
        </mesh>
        <mesh position={[1.35, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 2.4]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Cabin Front Sliding Doors (Z = 1.34) */}
        <mesh ref={leftCabinDoorRef} position={[-0.38, 1.25, 1.34]}>
          <boxGeometry args={[0.74, 2.35, 0.03]} />
          <meshPhysicalMaterial
            color="#cbd5e1"
            metalness={0.85}
            roughness={0.2}
            transparent
            opacity={0.7}
          />
        </mesh>
        <mesh ref={rightCabinDoorRef} position={[0.38, 1.25, 1.34]}>
          <boxGeometry args={[0.74, 2.35, 0.03]} />
          <meshPhysicalMaterial
            color="#cbd5e1"
            metalness={0.85}
            roughness={0.2}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* Interior Digital Floor Indicator Screen */}
        <mesh position={[0, 2.45, 1.32]}>
          <planeGeometry args={[1.4, 0.25]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
        <Text
          position={[0, 2.45, 1.31]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.1}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          {getStatusText()}
        </Text>

        {/* Interior Interactive Control Column */}
        <group position={[1.38, 1.3, 0.6]} rotation={[0, -Math.PI / 2, 0]}>
          {/* Column Plate */}
          <mesh>
            <boxGeometry args={[0.26, 1.1, 0.04]} />
            <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.15} />
          </mesh>

          {/* Level 1 Button */}
          <group
            position={[0, 0.22, 0.025]}
            onClick={(e) => {
              e.stopPropagation();
              selectElevatorFloor(1);
            }}
          >
            <mesh>
              <circleGeometry args={[0.075, 24]} />
              <meshBasicMaterial color={elevatorState.targetFloor === 1 ? '#a855f7' : '#334155'} />
            </mesh>
            <Text position={[0, 0, 0.01]} fontSize={0.065} color="#ffffff" anchorX="center" anchorY="middle">
              1
            </Text>
          </group>

          {/* Ground Floor Button */}
          <group
            position={[0, -0.08, 0.025]}
            onClick={(e) => {
              e.stopPropagation();
              selectElevatorFloor(0);
            }}
          >
            <mesh>
              <circleGeometry args={[0.075, 24]} />
              <meshBasicMaterial color={elevatorState.targetFloor === 0 ? '#06b6d4' : '#334155'} />
            </mesh>
            <Text position={[0, 0, 0.01]} fontSize={0.065} color="#ffffff" anchorX="center" anchorY="middle">
              G
            </Text>
          </group>

          {/* Door Open / Close Emergency Icons */}
          <mesh position={[0, -0.32, 0.025]}>
            <planeGeometry args={[0.18, 0.08]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
          <Text position={[0, -0.32, 0.03]} fontSize={0.04} color="#94a3b8" anchorX="center" anchorY="middle">
            {"◄►  ►◄"}
          </Text>
        </group>
      </group>
    </group>
  );
};
