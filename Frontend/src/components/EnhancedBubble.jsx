/**
 * @file EnhancedBubble.jsx
 * @description Enhanced 3D bubble component with auto-rotation, interactive controls,
 * dynamic colors from CSS variables, and enhanced lighting.
 * @author Shahd Mohay
 * @version 2.0.0
 * @date 2025-12-11
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-12-16
 */

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, MeshDistortMaterial, Sphere } from "@react-three/drei";

/**
 * BubbleContent Component
 * @description Renders a 3D animated sphere with dynamic colors from CSS variables.
 * Uses metallic bronze/gold theme from globals.css for light and dark modes.
 * @returns {JSX.Element} Group of sphere meshes with distort materials and enhanced lighting.
 */
function BubbleContent() {
  const [maestaColors, setMaestaColors] = useState({
    accent: "#b8945f",
    vivid: "#c9a152",
    light: "#ede4ce",
    silver: "#C0C0C0",
  });

  useEffect(() => {
    /**
     * Fetches color values from CSS custom properties for theme consistency.
     * Falls back to default values if CSS variables are not defined.
     */
    const rootStyles = getComputedStyle(document.documentElement);
    const accentColor = rootStyles
      .getPropertyValue("--color-accent-pink")
      .trim();
    const vividColor = rootStyles.getPropertyValue("--color-vivid-pink").trim();
    const lightColor = rootStyles.getPropertyValue("--color-light-pink").trim();

    if (accentColor && vividColor && lightColor) {
      setMaestaColors({
        accent: accentColor,
        vivid: vividColor,
        light: lightColor,
        silver: "#C0C0C0",
      });
    }
  }, []);

  return (
    <group>
      {/* Main sphere with enhanced glass effect */}
      <Sphere args={[2.2, 128, 128]} scale={1}>
        <MeshDistortMaterial
          color={maestaColors.accent}
          attach="material"
          distort={0.5}
          speed={2}
          roughness={0.1}
          metalness={0.95}
          transparent
          opacity={0.2}
        />
      </Sphere>

      {/* Secondary inner sphere for depth */}
      <Sphere args={[1.8, 100, 100]} scale={1}>
        <MeshDistortMaterial
          color={maestaColors.vivid}
          distort={0.3}
          speed={1.5}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.15}
        />
      </Sphere>

      {/* Outer glow ring */}
      <Sphere args={[2.4, 64, 64]} scale={1}>
        <meshBasicMaterial
          color={maestaColors.accent}
          transparent
          opacity={0.06}
          wireframe
        />
      </Sphere>

      {/* Core light sphere */}
      <Sphere args={[1.2, 64, 64]} scale={1}>
        <meshStandardMaterial
          color={maestaColors.silver}
          emissive={maestaColors.silver}
          emissiveIntensity={0.3}
          transparent
          opacity={0.2}
        />
      </Sphere>

      {/* Enhanced lighting setup for depth and realism */}
      <pointLight
        position={[6, 6, 6]}
        intensity={2.5}
        color={maestaColors.vivid}
      />
      <pointLight
        position={[-6, -6, 6]}
        intensity={1.5}
        color={maestaColors.silver}
      />
      <pointLight
        position={[0, 0, -6]}
        intensity={1}
        color={maestaColors.accent}
      />
      <pointLight
        position={[6, -6, 0]}
        intensity={0.8}
        color={maestaColors.silver}
      />
      <ambientLight intensity={0.4} />
      <hemisphereLight
        intensity={0.5}
        color="#ffffff"
        groundColor={maestaColors.light}
      />
    </group>
  );
}

/**
 * EnhancedBubble Component
 * @description Main 3D bubble visualization component with auto-rotation and interactive controls.
 * Integrates with the application's theme system through CSS custom properties.
 * @returns {JSX.Element} Canvas element with 3D bubble visualization.
 */
export default function EnhancedBubble() {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 50 }}>
      <BubbleContent />
      <OrbitControls
        enableZoom={false}
        autoRotate
        autoRotateSpeed={1.2}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />
    </Canvas>
  );
}
