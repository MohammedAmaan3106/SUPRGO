import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { SupermarketEnvironment } from './SupermarketEnvironment';
import { ShelvesAndAisles } from './ShelvesAndAisles';
import { FashionFloor3D } from './FashionFloor3D';
import { Elevator3D } from './Elevator3D';
import { InteractiveProducts } from './InteractiveProducts';
import { ShoppingTrolley } from './ShoppingTrolley';
import { CheckoutCounter3D } from './CheckoutCounter3D';
import { StorePathNavigation } from './StorePathNavigation';
import { PlayerController } from './PlayerController';

export const SupermarketScene: React.FC = () => {
  return (
    <div id="suprgo-canvas-container" className="relative w-full h-full select-none touch-none">
      <Canvas
        id="suprgo-3d-canvas"
        shadows
        camera={{ position: [0, 1.65, 16.0], fov: 72, near: 0.1, far: 120 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#090d16']} />
        <fog attach="fog" args={['#090d16', 30, 75]} />

        <Suspense fallback={null}>
          <SupermarketEnvironment />
          <ShelvesAndAisles />
          <FashionFloor3D />
          <Elevator3D />
          <InteractiveProducts />
          <ShoppingTrolley />
          <CheckoutCounter3D />
          <StorePathNavigation />
          <PlayerController />
        </Suspense>
      </Canvas>
    </div>
  );
};
