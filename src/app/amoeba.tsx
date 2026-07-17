'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// 1. Shaders (Shared by all amoeba instances on the GPU)
const vertexShader = `
  varying vec3 vPosition;
  varying float vAngle;

  void main() {
    vPosition = position;
    vAngle = atan(position.y, position.x);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vPosition;
  varying float vAngle;

  const vec4 purpleGlass = vec4(90.0/255.0, 24.0/255.0, 154.0/255.0, 0.25);
  const vec4 pinkGlass = vec4(255.0/255.0, 42.0/255.0, 133.0/255.0, 0.25);
  const vec4 greenGlass = vec4(57.0/255.0, 255.0/255.0, 20.0/255.0, 0.25);

  const float PI = 3.14159265359;

  void main() {
    float dist = distance(vPosition.xy, vec2(0.0));
    float nucleusRadius = 0.5;

    if (dist < nucleusRadius) {
      gl_FragColor = purpleGlass;
    } else {
      float angleNormalized = (vAngle + PI) / (2.0 * PI);
      vec4 gradientColor;
      
      if (angleNormalized < 0.5) {
        gradientColor = mix(purpleGlass, pinkGlass, angleNormalized * 2.0);
      } else {
        gradientColor = mix(pinkGlass, greenGlass, (angleNormalized - 0.5) * 2.0);
      }

      gl_FragColor = gradientColor;
    }
  }
`;

// 2. Data Structure tracking each unique amoeba's movement states
interface AmoebaInstance {
  group: THREE.Group;
  strokeGeometry: THREE.RingGeometry;
  originalDistances: Float32Array;
  
  // Custom properties per background cell
  baseRadius: number;
  roughness: number;
  speedModifier: number;
  seed: number;
  
  // Kinematics
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface AmoebaBackgroundProps {
  count?: number; // How many amoebas to spawn
}

export default function AmoebaBackground({ count = 4 }: AmoebaBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    
    // Set viewbounds to easily map 1:1 with typical CSS coordinates if needed
    const viewSize = 15;
    const aspect = width / height;
    const camera = new THREE.OrthographicCamera(
      (-viewSize * aspect) / 2,
      (viewSize * aspect) / 2,
      viewSize / 2,
      -viewSize / 2,
      0.1,
      1000
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Shared Shared Material definitions to save space
    const strokeMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });
    
    const nucleusMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x5a189a, 
      opacity: 0.25, 
      transparent: true 
    });
    const nucleusGeometry = new THREE.CircleGeometry(0.5, 32);

    const amoebas: AmoebaInstance[] = [];

    // Calculate maximum orthographic camera boundaries for screen edge collisions
    const getCamBounds = () => {
      const currentAspect = width / height;
      return {
        xMax: (viewSize * currentAspect) / 2,
        yMax: viewSize / 2
      };
    };

    let bounds = getCamBounds();

    // 3. Spawning System
    for (let i = 0; i < count; i++) {
      const amoebaGroup = new THREE.Group();

      // Variations per instance
      const baseRadius = 1.2 + Math.random() * 1.5; 
      const roughness = 0.3 + Math.random() * 0.4;
      const strokeThickness = 0.01 + Math.random() * 0.1;
      const speedModifier = 0.6 + Math.random() * 0.8;
      const seed = Math.random() * 100;

      // Construct Ribbon Geometry
      const innerRadius = baseRadius - strokeThickness / 2;
      const outerRadius = baseRadius + strokeThickness / 2;
      const strokeGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 90);

      // Extract original radius matrices
      const posAttr = strokeGeometry.attributes.position;
      const originalDistances = new Float32Array(posAttr.count);
      for (let j = 0; j < posAttr.count; j++) {
        const x = posAttr.getX(j);
        const y = posAttr.getY(j);
        originalDistances[j] = Math.sqrt(x * x + y * y);
      }

      // Assemble Subcomponents
      const nMesh = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
      const sMesh = new THREE.Mesh(strokeGeometry, strokeMaterial);
      
      amoebaGroup.add(nMesh);
      amoebaGroup.add(sMesh);
      scene.add(amoebaGroup);

      // Random Initial position layout inside view coordinates
      const posX = (Math.random() - 0.5) * bounds.xMax * 1.5;
      const posY = (Math.random() - 0.5) * bounds.yMax * 1.5;

      // Drifting Speeds (Very low values keep it relaxing)
      const vx = (Math.random() - 0.5) * 0.015;
      const vy = (Math.random() - 0.5) * 0.015;

      amoebas.push({
        group: amoebaGroup,
        strokeGeometry,
        originalDistances,
        baseRadius,
        roughness,
        speedModifier,
        seed,
        x: posX,
        y: posY,
        vx,
        vy
      });
    }

    // 4. Integrated Kinetic Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();
      bounds = getCamBounds();

      amoebas.forEach((amoeba) => {
        // Linear Drifting Configuration
        amoeba.x += amoeba.vx;
        amoeba.y += amoeba.vy;

        // Viewport Border Boundaries Collisions (Bouncing calculations)
        const paddedX = bounds.xMax - amoeba.baseRadius;
        const paddedY = bounds.yMax - amoeba.baseRadius;

        if (Math.abs(amoeba.x) > paddedX) {
          amoeba.vx *= -1;
          amoeba.x = Math.sign(amoeba.x) * paddedX;
        }
        if (Math.abs(amoeba.y) > paddedY) {
          amoeba.vy *= -1;
          amoeba.y = Math.sign(amoeba.y) * paddedY;
        }

        // Apply updated position state arrays back to ThreeJS Scene node
        amoeba.group.position.set(amoeba.x, amoeba.y, 0);

        // Independent organic vertex deformation calculations
        const time = elapsedTime * 1.2 * amoeba.speedModifier + amoeba.seed;
        const posAttr = amoeba.strokeGeometry.attributes.position;

        for (let j = 0; j < posAttr.count; j++) {
          const x = posAttr.getX(j);
          const y = posAttr.getY(j);
          const angle = Math.atan2(y, x);
          
          const currentBaseRadius = amoeba.originalDistances[j];

          const noise = 
            Math.sin(angle * 3 + time) * 0.4 + 
            Math.cos(angle * 7 - time * 0.8) * 0.25 + 
            Math.sin(angle * 11 + time * 1.5) * 0.15;

          const finalRadius = currentBaseRadius + noise * amoeba.roughness;
          posAttr.setXY(j, Math.cos(angle) * finalRadius, Math.sin(angle) * finalRadius);
        }
        posAttr.needsUpdate = true;
      });

      renderer.render(scene, camera);
    };
    animate();

    // 5. Smart Resize Handling
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      
      renderer.setSize(width, height);
      
      const newAspect = width / height;
      camera.left = (-viewSize * newAspect) / 2;
      camera.right = (viewSize * newAspect) / 2;
      camera.top = viewSize / 2;
      camera.bottom = -viewSize / 2;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 6. Memory and Hardware Resource Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      
      amoebas.forEach((amoeba) => {
        amoeba.strokeGeometry.dispose();
      });
      nucleusGeometry.dispose();
      strokeMaterial.dispose();
      nucleusMaterial.dispose();
      renderer.dispose();
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [count]);

  return (
    <div 
      ref={containerRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,             // Forces it to stay behind text and content panels
        pointerEvents: 'none',   // Makes sure it does not block mouse clicks on elements below
        overflow: 'hidden',
        backgroundColor: 'transparent'
      }} 
    />
  );
}
