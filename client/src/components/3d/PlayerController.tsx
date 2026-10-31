import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls as PointerLockControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useStore } from '../../context/StoreContext';
import { collisionSystem } from '../../world/CollisionSystem';
import { soundManager } from '../../audio/soundManager';
import { CheckoutCounterId } from '../../types';

interface KeysPressed {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
}

const COUNTER_COORDS: Record<CheckoutCounterId, [number, number]> = {
  1: [-5.5, 9.8],
  2: [0.0, 9.8],
  3: [5.5, 9.8]
};

export const PlayerController: React.FC = () => {
  const { camera, gl } = useThree();
  const {
    products,
    activeProduct,
    setActiveProduct,
    addToCart,
    setInspectingProduct,
    playerPosition,
    setPlayerPosition,
    setPlayerRotation,
    checkoutStage,
    setCheckoutStage,
    setActiveCounter,
    cart,
    setIsPointerLocked,
    settings,
    setIsCartOpen,
    setIsSearchOpen,
    setIsShoppingListOpen,
    setIsSettingsOpen,
    setIsConvenienceCatalogOpen,
    isUIActive,
    toggleCursor,
    currentFloor,
    elevatorState,
    selectElevatorFloor,
    isNearElevator,
    mobileMoveVector,
    mobileLookDelta,
    setMobileLookDelta
  } = useStore();

  const keys = useRef<KeysPressed>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false
  });

  const controlsRef = useRef<PointerLockControlsImpl | null>(null);
  const headBobTimer = useRef<number>(0);
  const footstepTimer = useRef<number>(0);

  // Initialize PointerLockControls for desktop mouse look
  useEffect(() => {
    const controls = new PointerLockControlsImpl(camera, gl.domElement);
    controlsRef.current = controls;

    const onLock = () => {
      setIsPointerLocked(true);
    };

    const onUnlock = () => {
      setIsPointerLocked(false);
    };

    controls.addEventListener('lock', onLock);
    controls.addEventListener('unlock', onUnlock);

    // Only lock when clicking the 3D canvas and NO UI/MODAL is open!
    const onCanvasClick = () => {
      if (isUIActive) return;
      if (!controls.isLocked) {
        controls.lock();
      }
    };

    gl.domElement.addEventListener('click', onCanvasClick);

    return () => {
      controls.removeEventListener('lock', onLock);
      controls.removeEventListener('unlock', onUnlock);
      gl.domElement.removeEventListener('click', onCanvasClick);
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl, isUIActive, setIsPointerLocked]);

  // AUTOMATIC CURSOR MANAGEMENT
  useEffect(() => {
    if (isUIActive) {
      if (controlsRef.current && controlsRef.current.isLocked) {
        controlsRef.current.unlock();
      }
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      setIsPointerLocked(false);
      keys.current = { forward: false, backward: false, left: false, right: false, sprint: false };
    }
  }, [isUIActive, setIsPointerLocked]);

  // Desktop Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') return;

      // Alt key toggles cursor freely anytime without opening a modal!
      if (e.code === 'AltLeft' || e.code === 'AltRight') {
        e.preventDefault();
        toggleCursor();
        return;
      }

      if (isUIActive) {
        if (e.code === 'Tab') {
          e.preventDefault();
          setIsConvenienceCatalogOpen(false);
        }
        return;
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = true;
          break;
        case 'KeyE':
          handleInteract();
          break;
        case 'KeyF':
          if (activeProduct) {
            setInspectingProduct(activeProduct);
          }
          break;
        case 'KeyQ':
          setIsSearchOpen(true);
          break;
        case 'KeyC':
          setIsCartOpen(true);
          break;
        case 'KeyL':
          setIsShoppingListOpen(true);
          break;
        case 'Tab':
          e.preventDefault();
          setIsConvenienceCatalogOpen(true);
          break;
        case 'Escape':
          setIsSettingsOpen(true);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeProduct, checkoutStage, cart, playerPosition, isUIActive, toggleCursor, currentFloor, isNearElevator, elevatorState]);

  const handleInteract = () => {
    // 1. Elevator interaction
    if (isNearElevator || elevatorState.isPlayerInside) {
      if (elevatorState.isPlayerInside) {
        // Toggle floor: if on Ground (0), go to 1st Floor (1); else go to Ground (0)
        const nextFloor = currentFloor === 0 ? 1 : 0;
        selectElevatorFloor(nextFloor);
        return;
      } else {
        // If elevator is currently at the other floor, call it down/up!
        if (elevatorState.targetFloor !== currentFloor) {
          selectElevatorFloor(currentFloor);
          return;
        }
      }
    }

    // 2. Checkout Counters (Ground floor only)
    if (currentFloor === 0) {
      for (const [idStr, [cx, cz]] of Object.entries(COUNTER_COORDS)) {
        const cId = Number(idStr) as CheckoutCounterId;
        const dist = Math.hypot(playerPosition[0] - cx, playerPosition[2] - cz);
        if (dist < 3.2 && checkoutStage === 'SHOPPING' && cart.length > 0) {
          setActiveCounter(cId);
          setCheckoutStage('SCANNING');
          soundManager.playConveyorMotor();
          if (document.pointerLockElement) {
            document.exitPointerLock?.();
          }
          return;
        }
      }
    }

    // 3. Product pick
    if (activeProduct) {
      addToCart(activeProduct, 1);
    }
  };

  useFrame((_, delta) => {
    // Mobile Touch Camera Rotation
    if (Math.abs(mobileLookDelta.x) > 0.001 || Math.abs(mobileLookDelta.y) > 0.001) {
      const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
      const sens = (settings.mouseSensitivity || 1.0) * 0.0035;
      euler.y -= mobileLookDelta.x * sens;
      euler.x = Math.max(-1.4, Math.min(1.4, euler.x - mobileLookDelta.y * sens));
      camera.quaternion.setFromEuler(euler);
      setMobileLookDelta({ x: 0, y: 0 }); // consume delta
    }

    // If modal/billing is active, skip physics
    if (isUIActive || checkoutStage === 'SCANNING') return;

    // Synchronize vertical position during elevator transit
    if (elevatorState.stage === 'MOVING' && elevatorState.isPlayerInside) {
      camera.position.y = elevatorState.cabinY + 1.65;
      setPlayerPosition([camera.position.x, camera.position.y, camera.position.z]);
      const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
      setPlayerRotation(euler.y);
      return;
    }

    const baseSpeed = keys.current.sprint ? 6.2 : 3.8;
    const moveSpeed = baseSpeed * delta;

    const moveDirection = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    // Keyboard inputs
    if (keys.current.forward) moveDirection.add(forward);
    if (keys.current.backward) moveDirection.sub(forward);
    if (keys.current.right) moveDirection.add(right);
    if (keys.current.left) moveDirection.sub(right);

    // Mobile virtual joystick inputs
    if (Math.abs(mobileMoveVector.x) > 0.05 || Math.abs(mobileMoveVector.y) > 0.05) {
      moveDirection.addScaledVector(forward, -mobileMoveVector.y);
      moveDirection.addScaledVector(right, mobileMoveVector.x);
    }

    const isMoving = moveDirection.lengthSq() > 0.001;
    const targetFloorBaseY = currentFloor === 1 ? 5.6 : 0.0;
    const baseCameraY = targetFloorBaseY + 1.65;

    if (isMoving) {
      moveDirection.normalize();

      const currentX = camera.position.x;
      const currentZ = camera.position.z;

      const targetX = currentX + moveDirection.x * moveSpeed;
      const targetZ = currentZ + moveDirection.z * moveSpeed;

      const isElevatorDoorOpen = elevatorState.doorProgress > 0.4;
      const [resolvedX, resolvedZ] = collisionSystem.resolvePosition(
        currentX,
        currentZ,
        targetX,
        targetZ,
        currentFloor,
        isElevatorDoorOpen,
        elevatorState.isPlayerInside
      );

      camera.position.x = resolvedX;
      camera.position.z = resolvedZ;

      footstepTimer.current += delta * (keys.current.sprint ? 1.6 : 1.0);
      if (footstepTimer.current > 0.45) {
        soundManager.playFootstep();
        footstepTimer.current = 0;
      }

      if (settings.headBob) {
        headBobTimer.current += delta * (keys.current.sprint ? 14 : 10);
        camera.position.y = baseCameraY + Math.sin(headBobTimer.current) * 0.035;
      }
    } else {
      camera.position.y = THREE.MathUtils.damp(camera.position.y, baseCameraY, 8, delta);
    }

    setPlayerPosition([camera.position.x, camera.position.y, camera.position.z]);
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
    setPlayerRotation(euler.y);

    // Proximity targeting (3.8m cone, matches player's current floor)
    let closestProd = null;
    let minDistance = 3.8;

    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);

    for (const prod of products) {
      // Only target products on the current floor!
      const prodFloor = prod.floor ?? 0;
      if (prodFloor !== currentFloor) continue;

      const prodPos = new THREE.Vector3(...prod.shelfPosition);
      const toProd = prodPos.clone().sub(camera.position);
      const dist = toProd.length();

      if (dist < minDistance) {
        toProd.normalize();
        const dot = camDir.dot(toProd);
        if (dot > 0.45) {
          closestProd = prod;
          minDistance = dist;
        }
      }
    }

    setActiveProduct(closestProd);
  });

  return null;
};
