/**
 * @file EnhancedBubble.jsx
 * @description Enhanced 3D bubble component with auto-rotation, interactive controls,
 * dynamic colors from CSS variables, and enhanced lighting.
 * @author Shahd Mohay
 * @version 2.1.0
 * @date 2025-12-11
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-12-19
 *
 * Edit :
 * - Improved lighting setup for better depth and realism.
 * - Adjusted material properties for enhanced glass effect.
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

  const [currentTheme, setCurrentTheme] = useState("light");

  /**
   * Fetches color values from CSS custom properties for theme consistency.
   * Falls back to default values if CSS variables are not defined.
   */
  const fetchColorsFromCSS = () => {
    const rootStyles = getComputedStyle(document.documentElement);

    // Using the exact CSS variable names from globals.css
    const accentColor =
      rootStyles.getPropertyValue("--color-accent-pink").trim() || "#b8945f";

    const vividColor =
      rootStyles.getPropertyValue("--color-vivid-pink").trim() || "#c9a152";

    const lightColor =
      rootStyles.getPropertyValue("--color-light-pink").trim() || "#ede4ce";

    return {
      accent: accentColor,
      vivid: vividColor,
      light: lightColor,
      silver: "#C0C0C0",
    };
  };

  /**
   * Determines the current theme based on document class
   */
  const detectCurrentTheme = () => {
    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  };

  /**
   * Gets metalness value based on current theme
   */
  const getMetalnessForTheme = (theme) => {
    return theme === "dark" ? 0.95 : 0.05;
  };

  /**
   * Gets roughness value based on current theme
   */
  const getRoughnessForTheme = (theme) => {
    return theme === "dark" ? 0.1 : 0.4;
  };

  useEffect(() => {
    const updateThemeAndColors = () => {
      const theme = detectCurrentTheme();
      setCurrentTheme(theme);
      setMaestaColors(fetchColorsFromCSS());
    };

    // Initial fetch
    updateThemeAndColors();

    // Create a function to handle theme changes
    const handleThemeChange = () => {
      setTimeout(() => {
        updateThemeAndColors();
      }, 50);
    };

    // Listen for custom theme change event (if ThemeToggle dispatches it)
    window.addEventListener("themeChange", handleThemeChange);

    // Also listen for storage changes
    const handleStorageChange = (event) => {
      if (event.key === "theme") {
        handleThemeChange();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Watch for class changes on documentElement (when dark class is toggled)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          handleThemeChange();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener("themeChange", handleThemeChange);
      window.removeEventListener("storage", handleStorageChange);
      observer.disconnect();
    };
  }, []);

  // Get material properties based on current theme
  const mainMetalness = getMetalnessForTheme(currentTheme);
  const mainRoughness = getRoughnessForTheme(currentTheme);
  const secondaryMetalness = currentTheme === "dark" ? 0.8 : 0.2;
  const emissiveIntensity = currentTheme === "dark" ? 0.5 : 0.2;

  return (
    <group>
      {/* Main sphere with enhanced glass effect */}
      <Sphere args={[2.2, 128, 128]} scale={1}>
        <MeshDistortMaterial
          color={maestaColors.accent}
          attach="material"
          distort={0.5}
          speed={2}
          roughness={mainRoughness}
          metalness={mainMetalness}
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
          roughness={mainRoughness * 1.5}
          metalness={secondaryMetalness}
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
          emissiveIntensity={emissiveIntensity}
          roughness={mainRoughness}
          metalness={mainMetalness}
          transparent
          opacity={0.2}
        />
      </Sphere>

      {/* Enhanced lighting setup for depth and realism */}
      <pointLight
        position={[6, 6, 6]}
        intensity={currentTheme === "dark" ? 3 : 2}
        color={maestaColors.vivid}
      />
      <pointLight
        position={[-6, -6, 6]}
        intensity={currentTheme === "dark" ? 2 : 1.5}
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
      <ambientLight intensity={currentTheme === "dark" ? 0.3 : 0.4} />
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
