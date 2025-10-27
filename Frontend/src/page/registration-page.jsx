/**
 * @file RegistrationPage.jsx
 * @description Main registration page with 3D background and welcome content
 * @author Job Magnet Development Team
 * @version 2.0.0
 * @date 10-10-2025
 */

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, MeshDistortMaterial, Sphere } from "@react-three/drei";
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import "../styles/registration-page.css";
import RegisterForm from "../components/RegisterForm";

/**
 * EnhancedBubble Component
 * @description Renders a 3D animated sphere for the background
 * @returns {JSX.Element} The rendered 3D bubble component
 */
function EnhancedBubble() {
  return (
    <group>
      {/* Main sphere with enhanced glass effect */}
      <Sphere args={[2.2, 128, 128]} scale={1}>
        <MeshDistortMaterial
          color="#ff1a75"
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
          color="#ff0080"
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
          color="#e6005c"
          transparent
          opacity={0.06}
          wireframe
        />
      </Sphere>

      {/* Core light sphere */}
      <Sphere args={[1.2, 64, 64]} scale={1}>
        <meshStandardMaterial
          color="#ff80b3"
          emissive="#ff80b3"
          emissiveIntensity={0.3}
          transparent
          opacity={0.2}
        />
      </Sphere>

      {/* Enhanced lighting setup */}
      <pointLight position={[6, 6, 6]} intensity={2.5} color="#ffffff" />
      <pointLight position={[-6, -6, 6]} intensity={1.5} color="#0000ff" />
      <pointLight position={[0, 0, -6]} intensity={1} color="#ffff00" />
      <pointLight position={[6, -6, 0]} intensity={0.8} color="#ff0066" />
      <ambientLight intensity={0.4} />
      <hemisphereLight intensity={0.5} color="#ffffff" groundColor="#ffb3d1" />
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
            <span className="registration-page__gradient-text">Career Journey</span>
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