"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";

const MODEL_URL = "models/covered_car_2k.gltf/covered_car_2k.gltf";

function CarModel() {
  const { scene } = useGLTF(MODEL_URL);
  return <primitive object={scene} />;
}

// optional preload
useGLTF.preload(MODEL_URL);

export default function GltfTestPage() {
  return (
    <div className="min-h-screen p-6 bg-zinc-50">
      <h1 className="text-xl font-semibold mb-4">GLTF Viewer Test</h1>

      <div className="h-[520px] w-full rounded-2xl overflow-hidden bg-white border border-zinc-200">
        <Canvas
          camera={{ position: [0, 1.2, 3.5], fov: 45 }}
          shadows
          dpr={[1, 2]}
        >
          {/* Lights */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 6, 4]} intensity={1.2} castShadow />

          {/* Environment */}
          <Environment preset="studio" />

          {/* Controls: rotate + zoom */}
          <OrbitControls enablePan={false} minDistance={2} maxDistance={8} />

          {/* Model */}
          <React.Suspense fallback={null}>
            <CarModel />
          </React.Suspense>
        </Canvas>
      </div>

      <div className="mt-4 text-sm text-zinc-700">
        <p>
          Model URL:{" "}
          <code className="px-2 py-1 bg-zinc-100 rounded">{MODEL_URL}</code>
        </p>
        <p className="mt-2">
          If you see a blank screen, open this URL in the browser:
          <code className="ml-2 px-2 py-1 bg-zinc-100 rounded">
            {MODEL_URL}
          </code>
          (it should show JSON).
        </p>
      </div>
    </div>
  );
}
