<template></template>
  <script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { PencilLinesPass } from "./MobieusPass.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

// initialization of threejs stuffs
// camera and scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 8;
camera.position.y = 0;
// camera.position.x = 2;

// geometry
const geometry = new THREE.TorusKnotGeometry(1, 0.4, 500, 32);
const material = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  emissive: 0x00ff00,
  emissiveIntensity: 0.1,
});
const torus = new THREE.Mesh(geometry, material);
torus.rotation.y = Math.PI;
torus.castShadow = true;
torus.position.set(-4, 0, 0);
scene.add(torus);

const geometry1 = new THREE.DodecahedronGeometry(2, 0);
const material1 = new THREE.MeshStandardMaterial({
  color: 0xfaaa0f,
  emissive: 0xfaaa0f,
  emissiveIntensity: 0.1,
});
const dode = new THREE.Mesh(geometry1, material1);
dode.rotation.y = Math.PI;
dode.castShadow = true;
dode.position.set(4, 0, 0);
scene.add(dode);

// floor
const plane0 = new THREE.Mesh(
  new THREE.PlaneGeometry(18, 18),
  new THREE.MeshStandardMaterial({
    color: 0xffabcd,
    emissive: 0xffabcd,
    emissiveIntensity: 0.1,
  })
);
plane0.position.z = -9;
plane0.receiveShadow = true;
plane0.material.side = THREE.DoubleSide;
scene.add(plane0);

const plane1 = new THREE.Mesh(
  new THREE.PlaneGeometry(18, 18),
  new THREE.MeshStandardMaterial({
    color: 0xabcdff,
    emissive: 0xabcdff,
    emissiveIntensity: 0.1,
  })
);
plane1.rotation.y = Math.PI / 2;
plane1.position.x = -9;
plane1.receiveShadow = true;
plane1.material.side = THREE.DoubleSide;
scene.add(plane1);

const plane2 = new THREE.Mesh(
  new THREE.PlaneGeometry(18, 18),
  new THREE.MeshStandardMaterial({
    color: 0xabffcd,
    emissive: 0xabffcd,
    emissiveIntensity: 0.1,
  })
);
plane2.rotation.y = -Math.PI / 2;
plane2.position.x = 9;
plane2.receiveShadow = true;
plane2.material.side = THREE.DoubleSide;
scene.add(plane2);

const plane3 = new THREE.Mesh(
  new THREE.PlaneGeometry(18, 18),
  new THREE.MeshStandardMaterial({
    color: 0xbcfafd,
    emissive: 0xbcfafd,
    emissiveIntensity: 0.6,
  })
);
plane3.rotation.x = Math.PI / 2;
plane3.position.y = 9;
plane3.receiveShadow = true;
plane3.material.side = THREE.DoubleSide;
scene.add(plane3);

const plane4 = new THREE.Mesh(
  new THREE.PlaneGeometry(18, 18),
  new THREE.MeshStandardMaterial({
    color: 0xfabcdf,
    emissive: 0xfabcdf,
    emissiveIntensity: 0.6,
  })
);
plane4.rotation.x = -Math.PI / 2;
plane4.position.y = -9;
plane4.receiveShadow = true;
plane4.material.side = THREE.DoubleSide;
scene.add(plane4);

const loader = new STLLoader();
loader.load(
  "buser_head.stl",
  function (geometry) {
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: 0x00faca,
        emissive: 0x00faca,
        emissiveIntensity: 0.1,
      })
    );
    mesh.scale.set(0.1, 0.1, 0.1);
    mesh.rotation.x = -Math.PI / 2;
    mesh.geometry.center();
    mesh.castShadow = true;
    scene.add(mesh);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  }
);

// lighting
const directionalLight = new THREE.PointLight(0xf0ead6, 800);
directionalLight.castShadow = true;
directionalLight.position.set(0, 4, 0);
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("#eee");
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.CineonToneMapping;
renderer.toneMappingExposure = 1.75;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0xa1b3f0, 1);
document.body.appendChild(renderer.domElement);

// composers
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const pencilLinePass = new PencilLinesPass(
  renderer.domElement.clientWidth,
  renderer.domElement.clientHeight,
  scene,
  camera
);

const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);

composer.addPass(renderPass);
composer.addPass(gammaCorrectionPass);
composer.addPass(pencilLinePass);

// control
const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener("change", (event) => {
  var newLight = new THREE.Vector3(
    controls.object.position.x + 0,
    controls.object.position.y * 1.5 + 4,
    controls.object.position.z + 8
  );
  directionalLight.position.set(newLight.x, newLight.y, newLight.z);
  pencilLinePass.changeLight(newLight);
});

controls.autoRotate = true;

// for animation
function animate() {
  requestAnimationFrame(animate);
  torus.rotation.y += 0.013 + 0.002 * Math.random();
  torus.rotation.x += 0.007 + 0.008 * Math.random();
  torus.rotation.z += 0.009 + 0.006 * Math.random();

  dode.rotation.x += (0.006 + 0.004 * Math.random()) / 2.0;
  dode.rotation.z -= (0.003 + 0.007 * Math.random()) / 2.0;
  dode.rotation.y -= (0.008 + 0.002 * Math.random()) / 2.0;
  controls.update();
  composer.render();
}

animate();

export default {
  name: "Moebius",
  data() {
    return {};
  },
  computed: {},
  methods: {
    onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      pencilLinePass.resize(
        renderer.domElement.clientWidth,
        renderer.domElement.clientHeight
      );
    },
  },

  async mounted() {
    window.addEventListener("resize", this.onWindowResize);
    pencilLinePass.resize(
      renderer.domElement.clientWidth,
      renderer.domElement.clientHeight
    );
    // change light position
    var newLight = new THREE.Vector3(
      controls.object.position.x + 0,
      controls.object.position.y * 1.5 + 4,
      controls.object.position.z + 8
    );
    directionalLight.position.set(newLight.x, newLight.y, newLight.z);
    pencilLinePass.changeLight(newLight);
  },
};
</script>
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style scoped>
.canvWrapper {
  height: 100vh;
  width: 100vw;
  position: absolute;
  top: 0px;
  left: 0px;
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-size: 20px;
  z-index: 100;
  -webkit-user-select: none;
  /* Safari */
  -ms-user-select: none;
  /* IE 10 and IE 11 */
  user-select: none;
  /* Standard syntax */
  font-weight: bold;
}

.createdBy {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-size: 10px;
  z-index: 100;
  -webkit-user-select: none;
  /* Safari */
  -ms-user-select: none;
  /* IE 10 and IE 11 */
  user-select: none;
  /* Standard syntax */
  font-weight: bold;
}
</style>