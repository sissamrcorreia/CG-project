import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Trailer } from "./trailer/trailer.js";
import { Body } from "./transformer/body.js";
// import { VRButton } from "three/addons/webxr/VRButton.js";
// import * as Stats from "three/addons/libs/stats.module.js";
// import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;
const CLOCK = new THREE.Clock();
let pressed_wireframe = false;
let pressed_trailer_up = false, pressed_trailer_down = false, pressed_trailer_left = false, pressed_trailer_right = false;
let pressed_arm_left = false, pressed_arm_right = false;

let body, trailer;
let body_box, trailer_box;

let cameras = [], camera;

let renderer, scene;

const BACKGROUND = new THREE.Color(0xd5edf5);

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
  scene = new THREE.Scene();
  scene.background = BACKGROUND;

  // TODO: remove this
  // const gridHelper = new THREE.GridHelper(200, 50);
  // gridHelper.position.set(0, -10, 0);
  // scene.add(gridHelper);

  // trailer
  trailer = new Trailer();
  trailer.position.set(0, 0, 0);
  scene.add(trailer);

  body = new Body();
  body.position.set(-25, -1, 0);
  scene.add(body);

  trailer_box = new THREE.Box3().setFromObject(trailer);
  body_box = new THREE.Box3().setFromObject(body);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
const positions = new Array(new Array(-40, 0, 0), // frontal
                            new Array(0, 0, 30), // lateral
                            new Array(-25, 30, 0), // topo
                            new Array(-50, 20, 25)); // perspetiva isométrica - projeção perspetiva

for (let i = 0; i < 4; i++) {
    if (i == 3) {
        camera = new THREE.PerspectiveCamera(95, WIDTH / HEIGHT, 1, 1000);
    } else {
        camera = new THREE.OrthographicCamera(WIDTH / -20,
                                        WIDTH / 20,
                                        HEIGHT / 20,
                                        HEIGHT / -20,
                                        -50,
                                        1000);
    }

    camera.position.set(positions[i][0], positions[i][1], positions[i][2]);
    if(i == 2 || i == 3) {
      camera.lookAt(-25, -1, 0); // Set camera look at position (x, y, z)
    }
    cameras.push(camera);
}

function setCamera(index) {
  if (index < 0 || index >= cameras.length) index = 0;
  camera = cameras[index];
}
camera = cameras[0];

// camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
// camera.position.set(-55, 0, 10); // Set camera position (x, y, z)
// // camera.
// camera.lookAt(0, 0, 0); // Set camera look at position (x, y, z)

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
function checkCollisions() {
  if (trailerBox.intersectsBox(robotBox)) {
    console.log("Collision Detected!");
    // Handle the collision
    handleCollisions();
  } else {
    // If not colliding
  }
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {}

////////////
/* UPDATE */
////////////
function update() {
  if(pressed_trailer_down) {
    trailer.updateX(0.3);
  }
  if(pressed_trailer_up) {
    trailer.updateX(-0.3);
  }
  if(pressed_trailer_left) {
    trailer.updateZ(0.3);
  }
  if(pressed_trailer_right) {
    trailer.updateZ(-0.3);
  }

  if(pressed_arm_left) {
    body.getRightArm().update(-0.3);
    body.getLeftArm().update(0.3);
  }
  if(pressed_arm_right) {
    body.getRightArm().update(0.3);
    body.getLeftArm().update(-0.3);
  }

  checkCollisions();
}

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

  // TODO: remove this part
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 10;
  controls.maxDistance = 200;
  // controls.maxPolarAngle = Math.PI / 2; // 90 degrees
  controls.minPolarAngle = 0; // top view

  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
  // TODO: remove after this line
  update();
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
function onKeyDown(e) {

  switch (e.keyCode) {
    // Frontal camera
    case 49: // 1
    case 97: // 1 (numpad)
      setCamera(0);
      break;
    
    // Lateral camera
    case 50: // 2
    case 98: // 2 (numpad)
      setCamera(1);
      break;

    // Top camera
    case 51: // 3
    case 99: // 3 (numpad)
      setCamera(2);
      break;

    // Prespective camera
    case 52: // 4
    case 100: // 4 (numpad)
      setCamera(3);
      break;

    // To control the waist
    case 119: // w
    case 87: // W
      // body.getLegs().update(1);
      break;

    case 115: // s
    case 83: // S
      // body.getLegs().update(-1);
      break;

    // TO control the feet
    case 113: // q
    case 81: // Q
      body.getLeftLeg().updateFeet(0.3);
      body.getRightLeg().updateFeet(0.3);
      break;

    case 97: // a
    case 65: // A
      body.getLeftLeg().updateFeet(-0.3);
      body.getRightLeg().updateFeet(-0.3);
      break;
    
    // To control the arms
    case 101: // e
    case 69: // E
      pressed_arm_left = true;
      break;

    case 100: // d
    case 68: // D
      pressed_arm_right = true;
      break;
    
    // To control the head
    case 82: // 'R'
    case 114: // 'r'
        body.getHead().update(0.3);
        break;
    
    case 102: // f
    case 70: // F
        body.getHead().update(-0.3);
        break;
    
    
    // To control the trailer
    case 38: // up
      pressed_trailer_up = true;
      break;
      
    case 40: // down
      pressed_trailer_down = true;
      break;
    
    case 37: // left
      pressed_trailer_left = true;
      break;
    
    case 39: // right
      pressed_trailer_right = true;
      break;
    
    
    case 55: // 7
    case 103: // 7 (numpad)
      if (pressed_wireframe) {
        break;
      }

      scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.material.wireframe = !node.material.wireframe;
          pressed_wireframe = true;
        }
      });
      break;
    default:
      // TODO: Remove this line
      console.log("tecla: ", e.keyCode);
      break;
  }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
  switch (e.keyCode) {
    case 55: // 7
      pressed_wireframe = false;
      break;
    
    // To control the waist
    case 119: // w
    case 87: // W

      break;

    case 115: // s
    case 83: // S
      
      break;

    // TO control the feet
    case 113: // q
    case 81: // Q

      break;

    case 97: // a
    case 65: // A

      break;
    
    // To control the arms
    case 101: // e
    case 69: // E
      pressed_arm_left = false;
      break;

    case 100: // d
    case 68: // D
      pressed_arm_right = false;
      break;
    
    // To control the head
    case 82: // 'R'
    case 114: // 'r'

        break;
    
    case 102: // f
    case 70: // F

      break;
    
    // To control the trailer
    case 38: // up
      pressed_trailer_up = false;
      break;
      
    case 40: // down
      pressed_trailer_down = false;
      break;
    
    case 37: // left
      pressed_trailer_left = false;
      break;
    
    case 39: // right
      pressed_trailer_right = false;
      break;
  }
}

init();
animate();
