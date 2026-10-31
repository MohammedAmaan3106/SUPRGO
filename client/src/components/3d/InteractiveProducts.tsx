import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { createProductLabelTexture } from '../../textures/labelGenerator';

interface Product3DProps {
  product: Product;
  isActive: boolean;
  onSelect: (product: Product) => void;
}

const SingleProductModel: React.FC<Product3DProps> = ({ product, isActive, onSelect }) => {
  const meshRef = useRef<THREE.Group>(null);

  const labelTex = useMemo(() => {
    return createProductLabelTexture(
      product.name,
      product.brand,
      product.color,
      '#0f172a',
      product.modelType,
      product.price,
      product.discount
    );
  }, [product]);

  // Gentle float/pulse when targeted
  useFrame((state) => {
    if (meshRef.current) {
      if (isActive) {
        meshRef.current.position.y = product.shelfPosition[1] + Math.sin(state.clock.elapsedTime * 4.5) * 0.025;
      } else {
        meshRef.current.position.y = product.shelfPosition[1];
      }
    }
  });

  const renderSingleItemGeometry = (emissiveColor: string, emissiveIntensity: number) => {
    switch (product.modelType) {
      case 'apple':
      case 'orange':
      case 'potato':
      case 'onion':
        return (
          <group>
            <mesh castShadow>
              <sphereGeometry args={[0.13, 14, 14]} />
              <meshStandardMaterial
                color={product.color}
                roughness={0.35}
                emissive={emissiveColor}
                emissiveIntensity={emissiveIntensity}
              />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.04]} />
              <meshStandardMaterial color="#451a03" />
            </mesh>
          </group>
        );

      case 'watermelon':
        return (
          <mesh castShadow>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial
              color="#15803d"
              roughness={0.4}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
        );

      case 'grapes':
      case 'strawberry':
        return (
          <group>
            <mesh castShadow>
              <boxGeometry args={[0.22, 0.1, 0.18]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transparent
                opacity={0.65}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[0, -0.01, 0]}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial color={product.color} />
            </mesh>
          </group>
        );

      case 'banana':
      case 'carrot':
        return (
          <mesh castShadow rotation={[0, 0, 0.35]}>
            <cylinderGeometry args={[0.04, 0.025, 0.28, 8]} />
            <meshStandardMaterial
              color={product.color}
              roughness={0.4}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
        );

      case 'croissant':
      case 'bread':
        return (
          <mesh castShadow>
            <capsuleGeometry args={[0.08, 0.22, 8, 14]} />
            <meshStandardMaterial
              color={product.color}
              roughness={0.8}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
        );

      case 'baguette':
        return (
          <mesh castShadow rotation={[0.2, 0, 0.45]}>
            <capsuleGeometry args={[0.05, 0.55, 8, 14]} />
            <meshStandardMaterial
              color="#b45309"
              roughness={0.7}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
        );

      case 'cereal_box':
      case 'pasta_box':
      case 'tissue_box':
      case 'toothpaste_box':
        return (
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.34, 0.12]} />
            <meshStandardMaterial
              map={labelTex}
              roughness={0.4}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
        );

      case 'milk_carton':
        return (
          <group>
            <mesh castShadow position={[0, 0, 0]}>
              <boxGeometry args={[0.16, 0.3, 0.16]} />
              <meshStandardMaterial
                map={labelTex}
                roughness={0.3}
                emissive={emissiveColor}
                emissiveIntensity={emissiveIntensity}
              />
            </mesh>
            <mesh position={[0, 0.17, 0]}>
              <coneGeometry args={[0.11, 0.08, 4]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          </group>
        );

      case 'yogurt_cup':
        return (
          <mesh castShadow>
            <cylinderGeometry args={[0.11, 0.08, 0.15, 16]} />
            <meshStandardMaterial
              map={labelTex}
              roughness={0.3}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
        );

      case 'can_soda':
      case 'can_energy':
        return (
          <group>
            <mesh castShadow>
              <cylinderGeometry args={[0.075, 0.075, 0.24, 20]} />
              <meshStandardMaterial
                map={labelTex}
                metalness={0.85}
                roughness={0.2}
                emissive={emissiveColor}
                emissiveIntensity={emissiveIntensity}
              />
            </mesh>
            <mesh position={[0, 0.121, 0]}>
              <cylinderGeometry args={[0.076, 0.076, 0.01, 20]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>
        );

      case 'juice_bottle':
      case 'oil_bottle':
      case 'shampoo_bottle':
      case 'bodywash_bottle':
        return (
          <group>
            <mesh castShadow position={[0, -0.04, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.26, 16]} />
              <meshStandardMaterial
                map={labelTex}
                roughness={0.25}
                emissive={emissiveColor}
                emissiveIntensity={emissiveIntensity}
              />
            </mesh>
            <mesh position={[0, 0.13, 0]}>
              <cylinderGeometry args={[0.035, 0.06, 0.1, 14]} />
              <meshStandardMaterial color="#cbd5e1" transparent opacity={0.7} />
            </mesh>
            <mesh position={[0, 0.19, 0]}>
              <cylinderGeometry args={[0.038, 0.038, 0.03, 14]} />
              <meshStandardMaterial color={product.color} />
            </mesh>
          </group>
        );

      case 'detergent_jug':
        return (
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.34, 0.14]} />
            <meshStandardMaterial
              map={labelTex}
              roughness={0.4}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
        );

      case 'chips_bag':
      case 'doritos_bag':
        return (
          <mesh castShadow rotation={[0, 0, 0.05]}>
            <boxGeometry args={[0.2, 0.28, 0.09]} />
            <meshStandardMaterial
              map={labelTex}
              metalness={0.5}
              roughness={0.35}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
        );

      case 'shirt_hanger':
      case 'dress_hanger':
      case 'jacket_hanger':
        return (
          <group>
            {/* Clothes Hanger Hook */}
            <mesh position={[0, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.04, 0.008, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.17, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.38]} />
              <meshStandardMaterial color="#b45309" roughness={0.7} />
            </mesh>
            {/* Hanging Fabric Garment */}
            <mesh castShadow position={[0, -0.06, 0]}>
              <boxGeometry
                args={[
                  0.36,
                  product.modelType === 'dress_hanger' ? 0.65 : 0.45,
                  product.modelType === 'jacket_hanger' ? 0.14 : 0.06
                ]}
              />
              <meshStandardMaterial
                color={product.color}
                roughness={0.8}
                emissive={emissiveColor}
                emissiveIntensity={emissiveIntensity}
              />
            </mesh>
          </group>
        );

      case 'folded_garment':
        return (
          <group>
            {/* Neatly Stacked 3 Folded Garments */}
            {[0, 0.06, 0.12].map((y, idx) => (
              <mesh key={`folded-${idx}`} castShadow position={[0, y, 0]}>
                <boxGeometry args={[0.3, 0.055, 0.34]} />
                <meshStandardMaterial
                  color={product.color}
                  roughness={0.85}
                  emissive={idx === 2 ? emissiveColor : '#000000'}
                  emissiveIntensity={idx === 2 ? emissiveIntensity : 0}
                />
              </mesh>
            ))}
          </group>
        );

      case 'shoes_box_pair':
        return (
          <group>
            {/* Branded Shoe Box */}
            <mesh castShadow position={[0, -0.04, 0]}>
              <boxGeometry args={[0.26, 0.14, 0.36]} />
              <meshStandardMaterial color="#1e293b" metalness={0.2} roughness={0.6} />
            </mesh>
            {/* Display Sneaker On Top */}
            <mesh castShadow position={[0, 0.09, 0]} rotation={[0, 0.4, 0]}>
              <capsuleGeometry args={[0.05, 0.16, 6, 12]} />
              <meshStandardMaterial
                color={product.color}
                roughness={0.4}
                emissive={emissiveColor}
                emissiveIntensity={emissiveIntensity}
              />
            </mesh>
          </group>
        );

      case 'handbag':
        return (
          <group>
            <mesh castShadow position={[0, 0, 0]}>
              <boxGeometry args={[0.24, 0.22, 0.12]} />
              <meshStandardMaterial
                color={product.color}
                roughness={0.3}
                emissive={emissiveColor}
                emissiveIntensity={emissiveIntensity}
              />
            </mesh>
            <mesh position={[0, 0.16, 0]} rotation={[0, 0, 0]}>
              <torusGeometry args={[0.08, 0.012, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.15} />
            </mesh>
          </group>
        );

      case 'cap_hat':
        return (
          <group position={[0, 0, 0]}>
            <mesh castShadow position={[0, 0.06, 0]}>
              <sphereGeometry args={[0.11, 14, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial
                color={product.color}
                roughness={0.7}
                emissive={emissiveColor}
                emissiveIntensity={emissiveIntensity}
              />
            </mesh>
            <mesh castShadow position={[0, 0.03, 0.1]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.15, 0.015, 0.12]} />
              <meshStandardMaterial color={product.color} roughness={0.7} />
            </mesh>
          </group>
        );

      default:
        return (
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.24, 0.12]} />
            <meshStandardMaterial
              map={labelTex}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
        );
    }
  };

  const emissiveColor = isActive ? '#06b6d4' : '#000000';
  const emissiveIntensity = isActive ? 0.38 : 0;

  return (
    <group
      ref={meshRef}
      position={product.shelfPosition}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(product);
      }}
    >
      {/* Front row targeted item */}
      {renderSingleItemGeometry(emissiveColor, emissiveIntensity)}

      {/* DENSE STOCK: Multiple units placed neatly in depth & width (10-14 items per rack slot) */}
      <group position={[0, 0, -0.22]} scale={0.96}>
        {renderSingleItemGeometry('#000000', 0)}
      </group>
      <group position={[0, 0, -0.44]} scale={0.94}>
        {renderSingleItemGeometry('#000000', 0)}
      </group>
      <group position={[0.22, 0, 0]} scale={0.96}>
        {renderSingleItemGeometry('#000000', 0)}
      </group>
      <group position={[0.22, 0, -0.22]} scale={0.94}>
        {renderSingleItemGeometry('#000000', 0)}
      </group>
      <group position={[0.22, 0, -0.44]} scale={0.92}>
        {renderSingleItemGeometry('#000000', 0)}
      </group>
      <group position={[-0.22, 0, 0]} scale={0.96}>
        {renderSingleItemGeometry('#000000', 0)}
      </group>
      <group position={[-0.22, 0, -0.22]} scale={0.94}>
        {renderSingleItemGeometry('#000000', 0)}
      </group>
      <group position={[-0.22, 0, -0.44]} scale={0.92}>
        {renderSingleItemGeometry('#000000', 0)}
      </group>

      {/* Smooth glowing focus ring when customer is looking at this item */}
      {isActive && (
        <group position={[0, -0.16, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.22, 0.28, 24]} />
            <meshBasicMaterial color="#06b6d4" side={THREE.DoubleSide} />
          </mesh>
          <pointLight intensity={0.6} distance={1.2} color="#06b6d4" />
        </group>
      )}
    </group>
  );
};

export const InteractiveProducts: React.FC = () => {
  const { products, activeProduct, setInspectingProduct } = useStore();

  const handleSelect = (product: Product) => {
    setInspectingProduct(product);
  };

  return (
    <group>
      {products.map((product) => {
        const isActive = activeProduct?.id === product.id;
        return (
          <SingleProductModel
            key={product.id}
            product={product}
            isActive={isActive}
            onSelect={handleSelect}
          />
        );
      })}
    </group>
  );
};
