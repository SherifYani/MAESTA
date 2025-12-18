/**
 * @file RegistrationPage.jsx
 * @description Main registration page with 3D background and welcome content
 * @author Shahd Mohay
 * @version 2.1.0
 * @date 11-10-2025
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-12-11
 */

import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { ArrowLeft, Sparkles, TrendingUp, Users } from "lucide-react";
import "../../styles/pages/registration-page.css";
import "../../styles/globals.css";
import RegisterForm from "../../components/forms/RegisterForm";

/**
 * EnhancedBubble Component
 * @description Renders a 3D animated sphere for the background using colors from CSS variables.
 * @returns {JSX.Element} The rendered 3D bubble component
 */
function EnhancedBubble() {
  const [maestaColors, setMaestaColors] = useState({
    accent: "#B8860B",
    vivid: "#DAA520",
    light: "#FFF8DC",
    silver: "#C0C0C0",
  });

  useEffect(() => {
    // Fetch colors from CSS variables on component mount
    const rootStyles = getComputedStyle(document.documentElement);
    const accentColor = rootStyles
      .getPropertyValue("--color-accent-pink")
      .trim();
    const vividColor = rootStyles.getPropertyValue("--color-vivid-pink").trim();
    const lightColor = rootStyles.getPropertyValue("--color-light-pink").trim();
    const silverColor = "#C0C0C0"; // Retaining a specific metallic color for the core

    if (accentColor && vividColor && lightColor) {
      setMaestaColors({
        accent: accentColor,
        vivid: vividColor,
        light: lightColor,
        silver: silverColor,
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

      {/* Enhanced lighting setup */}
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
 * RegistrationPage Component
 * @description Main registration page component with 3D background and form
 * @returns {JSX.Element} The rendered registration page
 */
function RegistrationPage() {
  const features = [
    { icon: Sparkles, text: "AI-Powered Matching" },
    { icon: TrendingUp, text: "Career Growth Tools" },
    { icon: Users, text: "Global Network" },
  ];

  return (
    <div className="registration-page">
      <button className="registration-page__back-button" aria-label="Go back">
        <ArrowLeft size={20} />
      </button>

      <div className="registration-page__left-section">
        <div className="registration-page__canvas-container">
          <Canvas camera={{ position: [0, 0, 7], fov: 50 }}>
            <EnhancedBubble />
            <OrbitControls
              enableZoom={false}
              autoRotate
              autoRotateSpeed={1.2}
              enablePan={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.5}
            />
          </Canvas>
          <div className="registration-page__floating-particles">
            <div className="registration-page__particle registration-page__particle--1"></div>
            <div className="registration-page__particle registration-page__particle--2"></div>
            <div className="registration-page__particle registration-page__particle--3"></div>
            <div className="registration-page__particle registration-page__particle--4"></div>
            <div className="registration-page__particle registration-page__particle--5"></div>
          </div>
        </div>

        <div className="registration-page__welcome-content">
          <div className="registration-page__badge">
            <Sparkles size={14} className="registration-page__badge-icon" />
            <span>Trusted by 100K+ professionals</span>
          </div>

          <h1 className="registration-page__welcome-title">
            Transform Your
            <br />
            <span className="registration-page__gradient-text">
              Career Journey
            </span>
          </h1>

          <p className="registration-page__welcome-description">
            Join the next generation of professionals. Connect with
            opportunities, grow your network, and unlock your full potential.
          </p>

          <div className="registration-page__features-list">
            {features.map((feature, index) => (
              <div key={index} className="registration-page__feature-item">
                <div className="registration-page__feature-icon">
                  <feature.icon size={18} />
                </div>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="registration-page__right-section">
        <RegisterForm />
      </div>
    </div>
  );
}

export default RegistrationPage;
