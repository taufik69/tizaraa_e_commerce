"use client";

import React, { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";

interface ProductViewer3DProps {
  productName: string;
  selectedColor?: string;
  selectedMaterial?: string;
  images: string[]; // Required array of images
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-600 font-medium">Loading 3D View...</p>
      </div>
    </div>
  );
}

// 3D Product Model Component
function ProductModel({ images }: { images: string[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load texture for current image
  const texture = useTexture(images[currentIndex]);

  // Configure texture for exact color reproduction
  React.useMemo(() => {
    if (!texture) return;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
  }, [texture]);

  // Auto rotation with image switching
  useFrame((_, delta) => {
    if (groupRef.current && !hovered) {
      groupRef.current.rotation.y += delta * 0.5;

      // Switch images based on rotation if multiple images
      if (images.length > 1) {
        const rotationDegrees =
          ((groupRef.current.rotation.y % (Math.PI * 2)) * 180) / Math.PI;
        const imagePerDegree = 360 / images.length;
        const newIndex = Math.floor(rotationDegrees / imagePerDegree);
        setCurrentIndex(Math.abs(newIndex % images.length));
      }
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Main Product Image - showing actual image */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[3.2, 3.8]} />
        <meshBasicMaterial
          map={texture}
          side={THREE.DoubleSide}
          toneMapped={false}
          transparent={true}
        />
      </mesh>

      {/* Thin white border frame for depth */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.25, 3.85, 0.03]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.1} />
      </mesh>
    </group>
  );
}

// Main Component
export default function ProductViewer3D({
  productName,
  selectedColor,
  images,
}: ProductViewer3DProps) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoom, setZoom] = useState(6);

  const handleZoomIn = () => {
    setZoom((prev) => Math.max(prev - 1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.min(prev + 1, 12));
  };

  const handleReset = () => {
    setZoom(6);
    setAutoRotate(true);
  };

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-lg">
      <Suspense fallback={<LoadingSkeleton />}>
        <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, zoom]} fov={50} />

          {/* Simple bright lighting to show image clearly */}
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, -5, -5]} intensity={0.3} />

          {/* Product Model */}
          <ProductModel images={images} />

          {/* Controls */}
          <OrbitControls
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            enablePan={false}
            enableZoom={true}
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={3}
            maxDistance={12}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Canvas>
      </Suspense>

      {/* Enhanced Control Panel */}
      <div className="absolute top-4 right-4 space-y-2">
        {/* Auto Rotate Toggle */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className="p-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl hover:bg-white transition-all hover:scale-105 border border-gray-200 group"
          title={autoRotate ? "Pause rotation" : "Start rotation"}
        >
          {autoRotate ? (
            <svg
              className="w-5 h-5 text-blue-600 group-hover:text-blue-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-gray-600 group-hover:text-gray-800"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </button>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="p-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl hover:bg-white transition-all hover:scale-105 border border-gray-200 group disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom in"
          disabled={zoom <= 3}
        >
          <svg
            className={`w-5 h-5 transition-colors ${
              zoom <= 3
                ? "text-gray-300"
                : "text-gray-600 group-hover:text-gray-800"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
            />
          </svg>
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="p-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl hover:bg-white transition-all hover:scale-105 border border-gray-200 group disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom out"
          disabled={zoom >= 12}
        >
          <svg
            className={`w-5 h-5 transition-colors ${
              zoom >= 12
                ? "text-gray-300"
                : "text-gray-600 group-hover:text-gray-800"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
            />
          </svg>
        </button>

        {/* Reset View */}
        <button
          onClick={handleReset}
          className="p-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl hover:bg-white transition-all hover:scale-105 border border-gray-200 group"
          title="Reset view"
        >
          <svg
            className="w-5 h-5 text-gray-600 group-hover:text-gray-800"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Enhanced Info Badge */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2.5 border border-gray-200">
        <p className="text-xs text-gray-700 leading-relaxed">
          <span className="font-semibold text-gray-900">360° View</span>
          <span className="mx-1.5 text-gray-400">•</span>
          Drag to rotate
          <span className="mx-1.5 text-gray-400">•</span>
          Scroll to zoom
          <span className="mx-1.5 text-gray-400">•</span>
          Hover to pause
        </p>
      </div>

      {/* Enhanced Product Name Badge */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2.5 border border-gray-200">
        <p className="text-sm font-semibold text-gray-900">{productName}</p>
        {selectedColor && (
          <div className="flex items-center gap-2 mt-1.5">
            <div
              className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="text-xs text-gray-600 font-medium">
              Current Color
            </span>
          </div>
        )}
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-1.5 border border-gray-200">
        <p className="text-xs text-gray-600 font-medium">
          {Math.round(((12 - zoom) / 9) * 100)}% zoom
        </p>
      </div>
    </div>
  );
}
