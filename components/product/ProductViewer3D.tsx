"use client";

import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface ProductViewer3DProps {
  productName: string;
  selectedColor?: string;
  images: string[];
  modelUrl?: string;
  selectedMaterial?: string;
}

// Loading component
function LoadingSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-600 font-medium">Loading 3D Model...</p>
      </div>
    </div>
  );
}

// Camera Controller for smooth zoom
function CameraController({ zoom }: { zoom: number }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.z = zoom;
    camera.updateProjectionMatrix();
  }, [zoom, camera]);

  return null;
}

// 3D Model Component with color change
function Model({
  url,
  autoRotate,
  selectedColor,
}: {
  url: string;
  autoRotate: boolean;
  selectedColor?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);
  const clonedScene = scene.clone();

  // Apply color to all meshes in the model
  useEffect(() => {
    if (!selectedColor) return;

    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          const material = child.material.clone() as THREE.MeshStandardMaterial;
          material.color = new THREE.Color(selectedColor);
          child.material = material;
        }
      }
    });
  }, [selectedColor, clonedScene]);

  // Auto rotate
  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <primitive
      ref={groupRef}
      object={clonedScene}
      scale={1.5}
      position={[0, -0.5, 0]}
    />
  );
}

// 2D Image Viewer Component
function ImageViewer({
  image,
  productName,
}: {
  image: string;
  productName: string;
}) {
  const [zoom, setZoom] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Native wheel event listener to prevent page scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY > 0 ? -10 : 10;
      setZoom((prev) => Math.min(Math.max(prev + delta, 50), 300));
    };

    // Add event listener with passive: false to allow preventDefault
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 100) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(100);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-linear-to-br from-gray-50 via-white to-gray-100 overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img
        src={image}
        alt={productName}
        style={{
          transform: `scale(${zoom / 100}) translate(${position.x / (zoom / 100)}px, ${position.y / (zoom / 100)}px)`,
          transition: isDragging ? "none" : "transform 0.2s ease-out",
          maxWidth: "90%",
          maxHeight: "90%",
          objectFit: "contain",
          userSelect: "none",
          pointerEvents: "none",
        }}
        draggable={false}
      />

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <button
          onClick={() => setZoom((prev) => Math.min(prev + 20, 300))}
          disabled={zoom >= 300}
          className="p-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl hover:bg-white transition-all hover:scale-105 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          title="Zoom in"
        >
          <svg
            className={`w-5 h-5 transition-colors ${
              zoom >= 300
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

        <button
          onClick={() => setZoom((prev) => Math.max(prev - 20, 50))}
          disabled={zoom <= 50}
          className="p-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl hover:bg-white transition-all hover:scale-105 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          title="Zoom out"
        >
          <svg
            className={`w-5 h-5 transition-colors ${
              zoom <= 50
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

      {/* Zoom Indicator */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-1.5 border border-gray-200">
        <p className="text-xs text-gray-600 font-medium">{zoom}% zoom</p>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2.5 border border-gray-200">
        <p className="text-xs text-gray-700">
          <span className="font-semibold text-gray-900">2D View</span>
          <span className="mx-1.5 text-gray-400">•</span>
          Scroll to zoom
          {zoom > 100 && (
            <>
              <span className="mx-1.5 text-gray-400">•</span>
              Drag to pan
            </>
          )}
        </p>
      </div>
    </div>
  );
}
// Main Viewer
export default function ProductViewer3D({
  productName,
  selectedColor,
  selectedMaterial,
  images,
  modelUrl,
}: ProductViewer3DProps) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModelView, setIsModelView] = useState(!!modelUrl);

  const handleZoomIn = () => {
    setZoom((prev) => Math.max(prev - 1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.min(prev + 1, 12));
  };

  const handleReset = () => {
    setZoom(1);
    setAutoRotate(true);
  };

  const toggleView = () => {
    if (modelUrl) {
      setIsModelView(!isModelView);
    }
  };

  return (
    <div className="relative w-full space-y-4">
      {/* Main Viewer */}
      <div className="relative w-full h-125 bg-linear-to-br from-gray-50 via-white to-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-lg">
        {/* Show 2D Image Viewer when not in model view */}
        {!isModelView ? (
          <ImageViewer
            image={images[currentImageIndex]}
            productName={productName}
          />
        ) : (
          // Show 3D Canvas when in model view
          <Canvas shadows>
            <CameraController zoom={zoom} />

            <Suspense fallback={null}>
              <ambientLight intensity={0.7} />
              <directionalLight
                position={[10, 10, 5]}
                intensity={1}
                castShadow
              />
              <directionalLight position={[-10, -10, -5]} intensity={0.5} />
              <pointLight position={[0, 5, 0]} intensity={0.5} />
              <spotLight position={[5, 5, 5]} intensity={0.3} />

              {modelUrl && (
                <Model
                  url={modelUrl}
                  autoRotate={autoRotate}
                  selectedColor={selectedColor}
                />
              )}

              <OrbitControls
                autoRotate={autoRotate}
                autoRotateSpeed={0.6}
                enablePan={false}
                enableZoom={true}
                minDistance={3}
                maxDistance={12}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 1.5}
              />
            </Suspense>
          </Canvas>
        )}

        {/* Only show 3D controls when in model view */}
        {isModelView && (
          <>
            <div className="absolute top-4 right-4 space-y-2  space-x-1">
              {modelUrl && (
                <button
                  onClick={toggleView}
                  className="p-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl hover:bg-white transition-all hover:scale-105 border border-gray-200 group"
                  title="Switch to 2D images"
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              )}

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

              <button
                onClick={handleZoomIn}
                disabled={zoom <= 3}
                className="p-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl hover:bg-white transition-all hover:scale-105 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                title="Zoom in"
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

              <button
                onClick={handleZoomOut}
                disabled={zoom >= 12}
                className="p-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl hover:bg-white transition-all hover:scale-105 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                title="Zoom out"
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

            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2.5 border border-gray-200">
              <p className="text-xs text-gray-700">
                <span className="font-semibold text-gray-900">360° View</span>
                <span className="mx-1.5 text-gray-400">•</span>
                Drag to rotate
                <span className="mx-1.5 text-gray-400">•</span>
                Scroll to zoom
              </p>
            </div>

            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-1.5 border border-gray-200">
              <p className="text-xs text-gray-600 font-medium">
                {Math.round(((12 - zoom) / 9) * 100)}% zoom
              </p>
            </div>
          </>
        )}

        {/* Toggle button for 2D view */}
        {!isModelView && modelUrl && (
          <div className="absolute top-4 right-4">
            <button
              onClick={toggleView}
              className="p-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl hover:bg-white transition-all hover:scale-105 border border-gray-200 group"
              title="Switch to 3D model"
            >
              <svg
                className="w-5 h-5 text-green-600 group-hover:text-blue-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Product Info */}
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
          {isModelView && modelUrl && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">3D Model</span>
            </div>
          )}
          {!isModelView && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-xs text-gray-500">2D Image</span>
            </div>
          )}
        </div>
      </div>

      {/* Image Thumbnails */}
      <div className="w-full">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-sm font-semibold text-gray-900">
              Product Images
            </h3>
            <span className="text-xs text-gray-500">({images.length})</span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentImageIndex(index);
                  if (modelUrl) {
                    setIsModelView(false);
                  }
                }}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                  !isModelView && currentImageIndex === index
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <img
                  src={image}
                  alt={`${productName} view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {!isModelView && currentImageIndex === index && (
                  <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            ))}

            {/* 3D Model Thumbnail */}
            {modelUrl && (
              <button
                onClick={() => setIsModelView(true)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 bg-linear-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center ${
                  isModelView
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <svg
                  className="w-8 h-8 text-blue-600 mb-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <span className="text-xs font-medium text-blue-600">
                  3D View
                </span>
                {isModelView && (
                  <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center absolute top-2 right-2">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
