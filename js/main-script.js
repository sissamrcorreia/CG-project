import * as THREE from "three";
import { Trailer } from "./trailer.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import { VRButton } from "three/addons/webxr/VRButton.js";
// import * as Stats from "three/addons/libs/stats.module.js";
// import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;
const CLOCK = new THREE.Clock();

let renderer, scene;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff); // Set background color

  // trailer
  const trailer = new Trailer();
  trailer.position.set(0, 0, 0);
  scene.add(trailer);

}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
camera.position.set(0, 5, 50); // Set camera position (x, y, z)


// TODO: remove this line
let controls;

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {}

////////////
/* UPDATE */
////////////
function update() {}

/////////////
/* DISPLAY */
/////////////
function render() {
  renderer.render(scene, camera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    //   alpha: true, // Enable transparency for the background // TODO: Check if it is transparent or not
  });

  renderer.setSize(WIDTH, HEIGHT); // TODO: Resize if window is resized
  document.body.appendChild(renderer.domElement);

  createScene();
  render()

  // TODO: remove this line
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 10;
controls.maxDistance = 200;
controls.maxPolarAngle = Math.PI / 2; // 90 degrees
controls.minPolarAngle = 0;          // top view



  window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
  // TODO: remove after this line
  controls.update(); // only required if controls.enableDamping = true, or autoRotate is true
  requestAnimationFrame(animate);
  render();
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {}

init();
animate();
