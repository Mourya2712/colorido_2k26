import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import type { CulturalCategory } from '../../types';
import { culturalCategories } from '../../data/festivalData';
import { Flame, Music, Palette, BookOpen, Drama, Sparkles, Users, Cpu, Info } from 'lucide-react';

interface RvrjcOatCanvasProps {
  selectedCategoryId: string;
  hoveredCategoryId: string | null;
  onSelectCategory: (id: string) => void;
  onHoverCategory: (id: string | null) => void;
}

// Icon mapper for Category Hotspots
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
    case 'Users':
      return Users;
    case 'Cpu':
      return Cpu;
    case 'Sparkles':
    default:
      return Sparkles;
  }
};

/**
 * Virtual OAT 3D Architecture
 * Layout matches hand-drawn diagram exactly:
 *   - ONE LARGE MAIN STAGE at the top (with big LED screen/backdrop)
 *   - THREE CONNECTING PATHWAYS: left from left corner, center from center, right from right corner
 *   - ONE SMALLER STAGE at the bottom
 * No stairs, no steps, no extra platforms.
 */
const Oat3DArchitecture: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* ──────────────────────────────────────────────── */}
      {/* 1. GROUND FLOOR / PLAZA                         */}
      {/* ──────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[36, 30]} />
        <meshStandardMaterial color="#0d0b16" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* ──────────────────────────────────────────────── */}
      {/* 2. LARGE MAIN STAGE (TOP)                        */}
      {/* ──────────────────────────────────────────────── */}
      <group position={[0, 0, -3.5]}>
        {/* Main Stage Platform Base */}
        <mesh receiveShadow castShadow>
          <boxGeometry args={[12.0, 0.9, 4.5]} />
          <meshStandardMaterial color="#1a1626" roughness={0.55} metalness={0.3} />
        </mesh>
        {/* Polished Stage Surface */}
        <mesh position={[0, 0.46, 0]} receiveShadow>
          <boxGeometry args={[11.8, 0.04, 4.3]} />
          <meshStandardMaterial color="#2e1f47" roughness={0.25} metalness={0.45} />
        </mesh>
        {/* Front Edge Glow Strip */}
        <mesh position={[0, 0.47, 2.15]}>
          <boxGeometry args={[11.7, 0.03, 0.06]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2.5} />
        </mesh>
        {/* Left Edge Glow Strip */}
        <mesh position={[-5.9, 0.47, 0]}>
          <boxGeometry args={[0.06, 0.03, 4.3]} />
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={2.0} />
        </mesh>
        {/* Right Edge Glow Strip */}
        <mesh position={[5.9, 0.47, 0]}>
          <boxGeometry args={[0.06, 0.03, 4.3]} />
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={2.0} />
        </mesh>
      </group>

      {/* ──────────────────────────────────────────────── */}
      {/* 3. LARGE LED SCREEN / BACKDROP (at back of main stage) */}
      {/* ──────────────────────────────────────────────── */}
      {/* Backdrop Wall */}
      <mesh position={[0, 2.8, -6.2]} receiveShadow castShadow>
        <boxGeometry args={[13.5, 5.5, 0.35]} />
        <meshStandardMaterial color="#181523" roughness={0.7} metalness={0.15} />
      </mesh>
      {/* LED Screen Panel */}
      <mesh position={[0, 3.1, -5.98]}>
        <planeGeometry args={[10.0, 4.0]} />
        <meshStandardMaterial
          color="#0c0720"
          emissive="#581c87"
          emissiveIntensity={0.7}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>
      {/* Screen Inner Glow / Display */}
      <mesh position={[0, 3.1, -5.96]}>
        <planeGeometry args={[9.2, 3.2]} />
        <meshStandardMaterial
          color="#1e0a3c"
          emissive="#a855f7"
          emissiveIntensity={0.5}
          roughness={0.05}
        />
      </mesh>
      {/* Screen Top Neon Bar */}
      <mesh position={[0, 5.08, -5.95]}>
        <boxGeometry args={[10.1, 0.09, 0.05]} />
        <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={3.0} />
      </mesh>
      {/* Screen Bottom Neon Bar */}
      <mesh position={[0, 1.12, -5.95]}>
        <boxGeometry args={[10.1, 0.09, 0.05]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={3.0} />
      </mesh>
      {/* Screen Center Logo Block */}
      <mesh position={[0, 3.1, -5.94]}>
        <boxGeometry args={[3.5, 1.4, 0.02]} />
        <meshStandardMaterial
          color="#ec4899"
          emissive="#a855f7"
          emissiveIntensity={1.5}
          roughness={0.05}
        />
      </mesh>

      {/* ──────────────────────────────────────────────── */}
      {/* 4. THREE CONNECTING PATHWAYS (Main → Small Stage) */}
      {/* ──────────────────────────────────────────────── */}

      {/* LEFT PATHWAY — from left corner of main stage */}
      {/* Starts at x≈-4.2, z=-1.3 and goes to x≈-1.5, z=1.2 */}
      <group position={[-3.6, 0.0, -0.6]} rotation={[0, 0.42, 0]}>
        {/* Pathway Platform */}
        <mesh receiveShadow castShadow position={[0, 0.32, 0]}>
          <boxGeometry args={[1.7, 0.62, 3.4]} />
          <meshStandardMaterial color="#1e1a2e" roughness={0.5} metalness={0.25} />
        </mesh>
        {/* Pathway Surface */}
        <mesh position={[0, 0.64, 0]} receiveShadow>
          <boxGeometry args={[1.58, 0.04, 3.28]} />
          <meshStandardMaterial color="#321a5c" roughness={0.3} metalness={0.35} />
        </mesh>
        {/* Left neon rail */}
        <mesh position={[-0.82, 0.68, 0]}>
          <boxGeometry args={[0.05, 0.04, 3.2]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2.5} />
        </mesh>
        {/* Right neon rail */}
        <mesh position={[0.82, 0.68, 0]}>
          <boxGeometry args={[0.05, 0.04, 3.2]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2.5} />
        </mesh>
      </group>

      {/* CENTER PATHWAY — from center front of main stage */}
      <group position={[0, 0.0, -0.4]}>
        {/* Pathway Platform */}
        <mesh receiveShadow castShadow position={[0, 0.32, 0]}>
          <boxGeometry args={[2.4, 0.62, 3.0]} />
          <meshStandardMaterial color="#1e1a2e" roughness={0.45} metalness={0.3} />
        </mesh>
        {/* Pathway Surface */}
        <mesh position={[0, 0.64, 0]} receiveShadow>
          <boxGeometry args={[2.28, 0.04, 2.88]} />
          <meshStandardMaterial color="#3b1864" roughness={0.3} metalness={0.35} />
        </mesh>
        {/* Left neon rail */}
        <mesh position={[-1.17, 0.68, 0]}>
          <boxGeometry args={[0.05, 0.04, 2.88]} />
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={2.2} />
        </mesh>
        {/* Right neon rail */}
        <mesh position={[1.17, 0.68, 0]}>
          <boxGeometry args={[0.05, 0.04, 2.88]} />
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={2.2} />
        </mesh>
      </group>

      {/* RIGHT PATHWAY — from right corner of main stage */}
      <group position={[3.6, 0.0, -0.6]} rotation={[0, -0.42, 0]}>
        {/* Pathway Platform */}
        <mesh receiveShadow castShadow position={[0, 0.32, 0]}>
          <boxGeometry args={[1.7, 0.62, 3.4]} />
          <meshStandardMaterial color="#1e1a2e" roughness={0.5} metalness={0.25} />
        </mesh>
        {/* Pathway Surface */}
        <mesh position={[0, 0.64, 0]} receiveShadow>
          <boxGeometry args={[1.58, 0.04, 3.28]} />
          <meshStandardMaterial color="#321a5c" roughness={0.3} metalness={0.35} />
        </mesh>
        {/* Left neon rail */}
        <mesh position={[-0.82, 0.68, 0]}>
          <boxGeometry args={[0.05, 0.04, 3.2]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2.5} />
        </mesh>
        {/* Right neon rail */}
        <mesh position={[0.82, 0.68, 0]}>
          <boxGeometry args={[0.05, 0.04, 3.2]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2.5} />
        </mesh>
      </group>

      {/* ──────────────────────────────────────────────── */}
      {/* 5. SMALLER STAGE (BOTTOM)                        */}
      {/* ──────────────────────────────────────────────── */}
      <group position={[0, 0, 1.9]}>
        {/* Small Stage Platform Base */}
        <mesh receiveShadow castShadow>
          <boxGeometry args={[7.0, 0.55, 2.5]} />
          <meshStandardMaterial color="#171324" roughness={0.55} metalness={0.25} />
        </mesh>
        {/* Small Stage Surface */}
        <mesh position={[0, 0.28, 0]} receiveShadow>
          <boxGeometry args={[6.8, 0.04, 2.3]} />
          <meshStandardMaterial color="#3a1d60" roughness={0.3} metalness={0.35} />
        </mesh>
        {/* Front Edge Glow Strip */}
        <mesh position={[0, 0.3, 1.25]}>
          <boxGeometry args={[6.7, 0.03, 0.06]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2.5} />
        </mesh>
        {/* Left Edge Glow Strip */}
        <mesh position={[-3.5, 0.3, 0]}>
          <boxGeometry args={[0.06, 0.03, 2.3]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2.0} />
        </mesh>
        {/* Right Edge Glow Strip */}
        <mesh position={[3.5, 0.3, 0]}>
          <boxGeometry args={[0.06, 0.03, 2.3]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2.0} />
        </mesh>
      </group>

      {/* ──────────────────────────────────────────────── */}
      {/* 6. OVERHEAD TRUSS CANOPY OVER MAIN STAGE         */}
      {/* ──────────────────────────────────────────────── */}
      {/* Support Columns */}
      <mesh position={[-5.5, 2.5, -2.8]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 5.2, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[5.5, 2.5, -2.8]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 5.2, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-5.5, 2.5, -4.8]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 5.2, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[5.5, 2.5, -4.8]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 5.2, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Horizontal Truss Beams */}
      <mesh position={[0, 5.1, -2.8]} castShadow>
        <boxGeometry args={[11.2, 0.22, 0.22]} />
        <meshStandardMaterial color="#4a5568" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 5.1, -4.8]} castShadow>
        <boxGeometry args={[11.2, 0.22, 0.22]} />
        <meshStandardMaterial color="#4a5568" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Canopy Roof */}
      <mesh position={[0, 5.2, -3.8]} castShadow receiveShadow>
        <boxGeometry args={[11.5, 0.15, 2.2]} />
        <meshStandardMaterial color="#2d3748" metalness={0.65} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* ──────────────────────────────────────────────── */}
      {/* 7. STAGE LIGHTING                                */}
      {/* ──────────────────────────────────────────────── */}
      {/* Main Stage Center Spotlight */}
      <spotLight
        position={[0, 7.0, 0]}
        target-position={[0, 0.5, -3.5]}
        intensity={35}
        angle={0.55}
        penumbra={0.55}
        color="#c084fc"
        castShadow
      />
      {/* Left Stage Spotlight */}
      <spotLight
        position={[-4.5, 6.0, 1.0]}
        target-position={[0, 0.5, -3.5]}
        intensity={22}
        angle={0.5}
        penumbra={0.65}
        color="#f472b6"
      />
      {/* Right Stage Spotlight */}
      <spotLight
        position={[4.5, 6.0, 1.0]}
        target-position={[0, 0.5, -3.5]}
        intensity={22}
        angle={0.5}
        penumbra={0.65}
        color="#fbbf24"
      />
      {/* Small Stage Spotlight */}
      <spotLight
        position={[0, 5.0, 5.0]}
        target-position={[0, 0.3, 1.9]}
        intensity={15}
        angle={0.6}
        penumbra={0.7}
        color="#818cf8"
      />
      {/* Footlights */}
      <pointLight position={[0, 0.8, -1.5]} intensity={5} color="#f59e0b" distance={8} />
      <pointLight position={[-3.8, 0.8, -3.5]} intensity={4} color="#a855f7" distance={6} />
      <pointLight position={[3.8, 0.8, -3.5]} intensity={4} color="#ec4899" distance={6} />
      <pointLight position={[0, 0.5, 2.2]} intensity={3} color="#fbbf24" distance={5} />
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

        return (
          <group
            key={category.id}
            position={category.hotspotPosition}
            onClick={(e) => {
              e.stopPropagation();
              onSelectCategory(category.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHoverCategory(category.id);
            }}
            onPointerOut={() => onHoverCategory(null)}
          >
            {/* Pulsing 3D Ground Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
              <ringGeometry args={[0.35, 0.6, 32]} />
              <meshBasicMaterial
                color={isSelected ? '#f59e0b' : isHovered ? '#ec4899' : '#a855f7'}
                transparent
                opacity={isSelected ? 0.95 : isHovered ? 0.85 : 0.5}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Glowing 3D Beacon Pillar */}
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.06, 0.09, 0.7, 16]} />
              <meshStandardMaterial
                color={isSelected ? '#f59e0b' : isHovered ? '#ec4899' : '#c084fc'}
                emissive={isSelected ? '#f59e0b' : isHovered ? '#ec4899' : '#a855f7'}
                emissiveIntensity={isSelected ? 2.5 : 1.2}
              />
            </mesh>

            {/* Floating Glowing Sphere */}
            <Float speed={3} rotationIntensity={0.2} floatIntensity={0.35}>
              <mesh position={[0, 0.85, 0]}>
                <sphereGeometry args={[0.18, 16, 16]} />
                <meshStandardMaterial
                  color={isSelected ? '#fbbf24' : isHovered ? '#f472b6' : '#d8b4fe'}
                  emissive={isSelected ? '#f59e0b' : isHovered ? '#ec4899' : '#9333ea'}
                  emissiveIntensity={isSelected ? 3 : 1.5}
                />
              </mesh>
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
    if (targetCategory && targetCategory.cameraPosition) {
      desiredPos.current.set(
        targetCategory.cameraPosition[0] ?? 0,
        targetCategory.cameraPosition[1] ?? 5.5,
        targetCategory.cameraPosition[2] ?? 10
      );
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
            VIRTUAL OAT
          </span>
          <span className="text-purple-400">•</span>
          <span className="text-slate-300">RVRJC Open Air Theatre</span>
        </div>

        <div className="pointer-events-auto flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
          <span>8 Cultural Categories</span>
        </div>
      </div>

      {/* WebGL Canvas or Fallback */}
      {hasWebGL ? (
        <Canvas
          shadows
          camera={{ position: [0, 5.5, 10], fov: 52 }}
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

          {/* 8 Category Hotspots */}
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
              Amphitheatre venue for Fine Arts, Music & Band, Dance, Choreoday, Dramatics, Fashion Show, Tekraft & Literary.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Category Selector Pills & Bottom Hint Bar */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex flex-col items-center space-y-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center space-x-1.5 p-1.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 max-w-full overflow-x-auto scrollbar-none shadow-2xl">
          {culturalCategories.map((category) => {
            const isSelected = selectedCategoryId === category.id;
            const isHovered = hoveredCategoryId === category.id;
            const IconComponent = getCategoryIcon(category.iconName);
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                onMouseEnter={() => onHoverCategory(category.id)}
                onMouseLeave={() => onHoverCategory(null)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-lg shadow-amber-500/30 border border-amber-300'
                    : isHovered
                    ? 'bg-purple-600/80 text-white border border-purple-400'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        <div className="w-full flex flex-wrap items-center justify-between text-[11px] text-slate-400 pointer-events-none px-2">
          <div className="flex items-center space-x-2 px-3 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 pointer-events-auto">
            <Info className="w-3.5 h-3.5 text-purple-400" />
            <span>Click Beacons or Drag to explore stage view</span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
            <span className="text-amber-400 font-bold">Capacity:</span>
            <span>3,500+ Spectators</span>
          </div>
        </div>
      </div>
    </div>
  );
};
