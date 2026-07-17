"use client";

import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const fragmentShader = `
  precision mediump float;
  varying vec2 vUv;
  
  uniform vec3 uColorGreen;
  uniform vec3 uColorPurple;
  uniform vec3 uColorPink;
  uniform vec3 uColorWhite;
  uniform float uTime; // Track runtime execution progress

  void main() {
    float t = vUv.y;
    vec3 finalColor;

    if (t < 0.25) {
        float localT = t / 0.25;
        finalColor = mix(uColorGreen, uColorPurple, localT);
    } else if (t < 0.45) {
        float localT = (t - 0.25) / (0.45 - 0.25);
        finalColor = mix(uColorPurple, uColorPink, localT);
    } else {
        float localT = (t - 0.45) / (1.0 - 0.45);
        finalColor = mix(uColorPink, uColorWhite, localT);
    }

    // Base alpha rules
    float alpha = (t >= 0.99) ? 1.0 : 0.25;
    
    // Smooth fade-in over the first 0.8 seconds to eliminate flickers
    float fadeIn = clamp(uTime / 0.8, 0.0, 1.0);
    
    gl_FragColor = vec4(finalColor, alpha * fadeIn);
  }
`;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

function ShaderPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const uniforms = useRef({
    uColorGreen: { value: new THREE.Color("#00FFCC") },
    uColorPurple: { value: new THREE.Color("#5A189A") },
    uColorPink: { value: new THREE.Color("#FF0055") },
    uColorWhite: { value: new THREE.Color("#FFFFFF") },
    uTime: { value: 0.0 } // Initial state is 0 (fully hidden)
  });

  // Native render loop execution hook running at monitor refresh rate
  useFrame((state) => {
    if (materialRef.current) {
      // state.clock.getElapsedTime() tracks seconds cleanly from mount time
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent={true}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
}

export default function BackgroundShader() {
  return (
    <Canvas
      camera={{ position: [0, 0, 1] }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -100,
        pointerEvents: "none"
      }}
    >
      <ShaderPlane />
    </Canvas>
  );
}
