import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import type { CulturalCategory } from '../../types';
import { culturalCategories } from '../../data/festivalData';
import { Flame, Music, Palette, BookOpen, Drama, Sparkles, Eye, Info } from 'lucide-react';

interface RvrjcOatCanvasProps {
  selectedCategoryId: string;
  hoveredCategoryId: string | null;
  onSelectCategory: (id: string) => void;
  onHoverCategory: (id: string | null) => void;
  onOpenPhotoGallery: () => void;
}

// Icon mapper for 3D HTML Hotspots
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Flame':
      return Flame;
    case 'Music':
      return Music;
    case 'Palette':
      return Palette;
    case 'BookOpen':
      return BookOpen;
    case 'Drama':
      return Drama;
    case 'Sparkles':
    default:
      return Sparkles;
  }
};

/**
 * Procedural Realistic 3D Model of the RVRJC Open Air Theatre (OAT)
 * Based directly on the provided photographs:
 * - Raised main stage platform with wooden/granite surface
 * - Curved tiered stepped amphitheatre seating radiating outward
 * - Overhead curved steel truss canopy and pillars
 * - Stage backdrop & side walls
 * - Dynamic stage spots, warm footlights, and rim beams
 */
const Oat3DArchitecture: React.FC = () => {
  // Semicircular stepped amphitheatre tiers
  const tiers = useMemo(() => {
    const tierList = [];
    const numTiers = 7;
    for (let i = 0; i < numTiers; i++) {
      const innerRadius = 3.5 + i * 0.9;
      const outerRadius = innerRadius + 0.75;
      const height = (i + 1) * 0.28;
      tierList.push({ innerRadius, outerRadius, height, index: i });
    }
    return tierList;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Main Ground Plaza */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 1.5]} receiveShadow>
        <planeGeometry args={[30, 26]} />
        <meshStandardMaterial color="#111116" roughness={0.85} metalness={0.15} />
      </mesh>

      {/* 2. Raised Proscenium Stage (RVRJC OAT Stage) */}
      {/* Stage Base */}
      <mesh position={[0, 0.45, -1.8]} receiveShadow castShadow>
        <boxGeometry args={[9.5, 0.9, 4.2]} />
        <meshStandardMaterial color="#22202b" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Polished Stage Surface */}
      <mesh position={[0, 0.91, -1.8]} receiveShadow>
        <boxGeometry args={[9.3, 0.04, 4.0]} />
        <meshStandardMaterial
          color="#3c2f4d"
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>

      {/* Stage Front Apron Curve */}
      <mesh position={[0, 0.45, 0.35]} receiveShadow castShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.9, 32, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#2b263b" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Stage Backdrop Wall */}
      <mesh position={[0, 2.5, -3.9]} receiveShadow castShadow>
        <boxGeometry args={[11, 4.5, 0.4]} />
        <meshStandardMaterial color="#1a1824" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Central Festival Backdrop Banner Wall */}
      <mesh position={[0, 2.7, -3.65]}>
        <planeGeometry args={[7.2, 3.4]} />
        <meshStandardMaterial
          color="#4c1d95"
          emissive="#2e1065"
          emissiveIntensity={0.35}
          roughness={0.4}
        />
      </mesh>

      {/* COLORIDO 2K26 Digital Wall Projection (Simulated) */}
      <Html position={[0, 3.2, -3.6]} transform distanceFactor={5.5}>
        <div className="select-none pointer-events-none text-center p-3 rounded-xl bg-purple-950/80 border border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.6)] backdrop-blur-sm">
          <div className="text-[10px] tracking-widest text-amber-300 font-bold uppercase">
            RVR & JC COLLEGE OF ENGINEERING
          </div>
          <div className="text-xl font-black tracking-widest text-white uppercase font-['Outfit'] drop-shadow-[0_0_12px_rgba(236,72,153,0.8)]">
            COLORIDO 2K26
          </div>
          <div className="text-[9px] text-purple-200 tracking-wider">
            OPEN AIR THEATRE (OAT)
          </div>
        </div>
      </Html>

      {/* 3. Steel Overhead Canopy Truss Structure (Iconic RVRJC OAT Roof) */}
      {/* Structural Support Columns */}
      <mesh position={[-4.8, 2.5, -2.5]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 5, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[4.8, 2.5, -2.5]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 5, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-4.8, 2.5, 0.5]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 5, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[4.8, 2.5, 0.5]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 5, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Curved Overhead Space Canopy */}
      <group position={[0, 4.8, -1.0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[5.2, 5.2, 4.4, 32, 1, true, -Math.PI / 2 - 0.5, 1.0]} />
          <meshStandardMaterial
            color="#334155"
            metalness={0.65}
            roughness={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* 4. Tiered Semicircular Amphitheatre Seating */}
      {tiers.map((tier) => (
        <group key={tier.index} position={[0, 0, 0.5]}>
          <mesh
            position={[0, tier.height / 2, 0]}
            rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
            receiveShadow
          >
            <ringGeometry args={[tier.innerRadius, tier.outerRadius, 48, 1, 0, Math.PI]} />
            <meshStandardMaterial
              color={tier.index % 2 === 0 ? '#1f2029' : '#171821'}
              roughness={0.7}
              metalness={0.2}
            />
          </mesh>
          {/* Tier step riser */}
          <mesh position={[0, tier.height / 2, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry
              args={[tier.outerRadius, tier.outerRadius, tier.height, 48, 1, true, 0, Math.PI]}
            />
            <meshStandardMaterial color="#161720" roughness={0.8} metalness={0.1} />
          </mesh>
        </group>
      ))}

      {/* 5. Amphitheatre Radial Aisles / Stairways */}
      {[-0.6, 0, 0.6].map((angle, idx) => (
        <mesh
          key={idx}
          position={[Math.sin(angle) * 6, 0.8, Math.cos(angle) * 6]}
          rotation={[0, -angle, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.9, 0.05, 6.2]} />
          <meshStandardMaterial color="#2d2238" roughness={0.5} />
        </mesh>
      ))}

      {/* 6. Dynamic Stage Spotlights */}
      <spotLight
        position={[0, 6.5, 3]}
        target-position={[0, 0.9, -1.8]}
        intensity={28}
        angle={0.6}
        penumbra={0.6}
        color="#c084fc"
        castShadow
      />
      <spotLight
        position={[-3.5, 5, 2]}
        target-position={[0, 0.9, -1.8]}
        intensity={18}
        angle={0.55}
        penumbra={0.7}
        color="#f472b6"
      />
      <spotLight
        position={[3.5, 5, 2]}
        target-position={[0, 0.9, -1.8]}
        intensity={18}
        angle={0.55}
        penumbra={0.7}
        color="#fbbf24"
      />

      {/* Warm footlights along stage edge */}
      <pointLight position={[0, 1.2, 0.2]} intensity={4} color="#f59e0b" distance={6} />
      <pointLight position={[-3, 1.2, -1]} intensity={4} color="#a855f7" distance={6} />
      <pointLight position={[3, 1.2, -1]} intensity={4} color="#ec4899" distance={6} />
    </group>
  );
};

/**
 * Interactive 3D Category Hotspots mapped across the OAT
 */
const CategoryHotspots: React.FC<{
  categories: CulturalCategory[];
  selectedCategoryId: string;
  hoveredCategoryId: string | null;
  onSelectCategory: (id: string) => void;
  onHoverCategory: (id: string | null) => void;
}> = ({
  categories,
  selectedCategoryId,
  hoveredCategoryId,
  onSelectCategory,
  onHoverCategory,
}) => {
  return (
    <>
      {categories.map((category) => {
        const isSelected = selectedCategoryId === category.id;
        const isHovered = hoveredCategoryId === category.id;
        const IconComponent = getCategoryIcon(category.iconName);

        return (
          <group key={category.id} position={category.hotspotPosition}>
            {/* Pulsing 3D Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
              <ringGeometry args={[0.35, 0.55, 32]} />
              <meshBasicMaterial
                color={isSelected ? '#f59e0b' : isHovered ? '#ec4899' : '#a855f7'}
                transparent
                opacity={isSelected ? 0.9 : isHovered ? 0.8 : 0.45}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Floating 3D HTML Hotspot Pin */}
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.25}>
              <Html center distanceFactor={8} zIndexRange={[100, 0]}>
                <button
                  onClick={() => onSelectCategory(category.id)}
                  onMouseEnter={() => onHoverCategory(category.id)}
                  onMouseLeave={() => onHoverCategory(null)}
                  className={`group relative flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all duration-300 transform -translate-y-4 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-pink-500 border-amber-300 text-white shadow-[0_0_25px_rgba(245,158,11,0.8)] scale-110'
                      : isHovered
                      ? 'bg-purple-600/90 border-pink-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.7)] scale-105'
                      : 'bg-black/80 border-purple-500/50 text-purple-200 hover:border-purple-300 shadow-lg'
                  }`}
                  aria-label={`Select category ${category.name}`}
                >
                  <span className="p-1 rounded-full bg-white/20">
                    <IconComponent className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-black tracking-wider uppercase whitespace-nowrap">
                    {category.name}
                  </span>

                  {/* Little beacon pulse */}
                  <span
                    className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                      isSelected
                        ? 'bg-amber-400 animate-ping'
                        : isHovered
                        ? 'bg-pink-400 animate-ping'
                        : 'bg-purple-400'
                    }`}
                  />
                </button>
              </Html>
            </Float>
          </group>
        );
      })}
    </>
  );
};

/**
 * Camera Controller that smoothly transitions camera when selecting category hotspots
 */
const SmoothCameraController: React.FC<{
  selectedCategoryId: string;
  categories: CulturalCategory[];
}> = ({ selectedCategoryId, categories }) => {
  const { camera } = useThree();
  const targetCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) || categories[0],
    [selectedCategoryId, categories]
  );

  const desiredPos = useRef(new THREE.Vector3(0, 4.2, 8.8));

  React.useEffect(() => {
    if (targetCategory) {
      desiredPos.current.set(...targetCategory.cameraPosition);
    }
  }, [targetCategory]);

  useFrame((_, delta) => {
    camera.position.lerp(desiredPos.current, Math.min(1, delta * 2.2));
  });

  return null;
};

export const RvrjcOatCanvas: React.FC<RvrjcOatCanvasProps> = ({
  selectedCategoryId,
  hoveredCategoryId,
  onSelectCategory,
  onHoverCategory,
  onOpenPhotoGallery,
}) => {
  const [hasWebGL, setHasWebGL] = useState(true);

  // Check WebGL availability gracefully
  React.useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  return (
    <div className="relative w-full h-[520px] sm:h-[620px] rounded-3xl overflow-hidden border border-purple-500/30 bg-[#090711] shadow-[0_0_60px_rgba(168,85,247,0.2)]">
      {/* Top Banner & Venue Badge */}
      <div className="absolute top-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/75 border border-purple-500/40 backdrop-blur-md text-xs text-purple-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-extrabold uppercase tracking-wider">
            RVRJC OAT 3D TWIN
          </span>
          <span className="text-purple-400">•</span>
          <span className="text-slate-300">Open Air Theatre Experience</span>
        </div>

        {/* Real Reference Photographs Action Button */}
        <button
          onClick={onOpenPhotoGallery}
          className="pointer-events-auto flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-700/80 to-pink-700/80 hover:from-purple-600 hover:to-pink-600 border border-purple-400/50 text-white text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Eye className="w-4 h-4 text-amber-300" />
          <span>View Real OAT Photos (5)</span>
        </button>
      </div>

      {/* WebGL Canvas or Fallback */}
      {hasWebGL ? (
        <Canvas
          shadows
          camera={{ position: [0, 4.2, 8.8], fov: 48 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <color attach="background" args={['#090711']} />
          <fog attach="fog" args={['#090711', 12, 28]} />

          {/* Ambient & Directional Lighting */}
          <ambientLight intensity={0.4} color="#818cf8" />
          <directionalLight
            position={[8, 12, 6]}
            intensity={1.2}
            color="#fed7aa"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          {/* Realistic OAT Architecture */}
          <Oat3DArchitecture />

          {/* 6 Category Hotspots */}
          <CategoryHotspots
            categories={culturalCategories}
            selectedCategoryId={selectedCategoryId}
            hoveredCategoryId={hoveredCategoryId}
            onSelectCategory={onSelectCategory}
            onHoverCategory={onHoverCategory}
          />

          {/* Smooth Camera Transition on Hotspot Click */}
          <SmoothCameraController
            selectedCategoryId={selectedCategoryId}
            categories={culturalCategories}
          />

          {/* Interactive Orbit Controls with bounded angles */}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={4}
            maxDistance={15}
            maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going under floor
            minPolarAngle={Math.PI / 8}
          />
        </Canvas>
      ) : (
        /* Fallback View with high-res real OAT photo */
        <div className="relative w-full h-full bg-cover bg-center" style={{ backgroundImage: 'url(/assets/oat1.jpeg)' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-2xl font-black text-white uppercase font-['Outfit']">
              RVRJC OPEN AIR THEATRE
            </h3>
            <p className="text-sm text-purple-200 mt-2 max-w-md">
              Amphitheatre venue for Dance, Music, Fine Arts, Literary, Dramatic & Fashion.
            </p>
            <button
              onClick={onOpenPhotoGallery}
              className="mt-4 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase"
            >
              Inspect Real Venue Photos
            </button>
          </div>
        </div>
      )}

      {/* Bottom Hint Bar */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex flex-wrap items-center justify-between text-xs text-slate-400 pointer-events-none">
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 pointer-events-auto">
          <Info className="w-3.5 h-3.5 text-purple-400" />
          <span>Click Hotspots or Drag 3D Model to explore OAT venue</span>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
          <span className="text-amber-400 font-bold">Capacity:</span>
          <span>3,500+ Spectators</span>
        </div>
      </div>
    </div>
  );
};
