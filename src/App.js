import * as THREE from "three";
import React, {useRef, Suspense } from "react";
import { shaderMaterial } from '@react-three/drei';
import {Canvas, extend, useFrame, useLoader} from '@react-three/fiber';
import glsl from "babel-plugin-glsl/macro";
import './App.css';

const WaveShaderMaterial = shaderMaterial(
  // Uniforms
  {uTime : 0,
   uColor : new THREE.Color(0.0, 0.0, 0.0),
   uTexture: new THREE.Texture(),
  },
  // Vertex Shader
  glsl `
    precision mediump float;

    varying vec2 vUv;
    varying float vWave;

    uniform float uTime;

    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);
    
    void main(){
      vUv = uv;

      vec3 pos = position;
      float noiseFreq = 1.5;
      float noiseAmp = 0.25;
      vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
      pos.z += snoise3(noisePos) * noiseAmp;
      vWave = pos.z;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader
  glsl `
    precision mediump float;

    uniform vec3 uColor;
    uniform float uTime;
    uniform sampler2D uTexture;

    varying vec2 vUv;
    varying float vWave;

    void main(){
      float wave = vWave * 0.05;
      float r = texture2D(uTexture, vUv + wave).r;
      float g = texture2D(uTexture, vUv).g;
      float b = texture2D(uTexture, vUv + wave).b;

      vec3 texture = vec3(r,g,b);
      gl_FragColor = vec4(texture, 1.0);
    }
  `
);

extend({WaveShaderMaterial});

const Wave = () =>
{
  const ref = useRef();
  useFrame(({clock}) =>(ref.current.uTime = clock.getElapsedTime()));

  const urlImage = "https://sm.ign.com/t/ign_br/screenshot/default/bojack-1_twg8.1200.jpg"
  const [image] = useLoader(THREE.TextureLoader, 
    ["cors-anywhere.herokuapp.com/" + urlImage]);
  return(
    <mesh>
      <planeBufferGeometry args={[0.4, 0.6, 16, 16]} />
      <waveShaderMaterial uColor={"lightblue"} ref={ref} uTexture={image}/>
    </mesh>
  );
}

const Scene = () =>
{
  return(
    <Canvas camera={{fov: 10, position: [0,0,5]}}>
      <Suspense fallback={null}>
        <Wave/>
      </Suspense>
    </Canvas>
  )
}

const App = () =>
{
  return <Scene />
}

export default App;
