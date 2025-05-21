import * as THREE from "three";
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
const BACKGROUND = new THREE.Color(0xd5edf5);

// Input flags
let pressed = {
  wireframe: false,
  trailer_up: false,
  trailer_down: false,
  trailer_left: false,
  trailer_right: false,
  arm_left: false,
  arm_right: false,
  legs_up: false,
  legs_down: false,
  feet_up: false,
  feet_down: false,
  head_up: false,
  head_down: false,
  camera_1: false,
  camera_2: false,
  camera_3: false,
  camera_4: false
};

let isAnimating = false;
let animationStartTime = 0;
const animationDuration = 2;
const connectionPoint = new THREE.Vector3(0, 0, 0);

let body, trailer;
let body_box, trailer_box;

let cameras = [], camera;

let renderer, scene;


///////////////////////
/* CLASS DEFINITIONS */
///////////////////////
class Arm extends THREE.Group {
  constructor(right = false) {
    super();
    this.right = right;
    this._addUpperArm();
    this._addAntennas();
    this._addJunction();
    this._addLowerArm();
  }

  _addUpperArm() {
    this.arm = new THREE.Object3D();
    this.arm.position.set(5, -1, -4);
    this.add(this.arm);
    
    const geometry = new THREE.BoxGeometry(2, 5, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const upperArm = new THREE.Mesh(geometry, material);
    this.arm.add(upperArm);
  }

  _addAntennas() {
    const geometry = new THREE.BoxGeometry(1, 4, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xafafaf });
    const anthenna = new THREE.Mesh(geometry, material);

    if(this.right) {
      anthenna.position.set(0, 3, 1.5);
    } else {
      anthenna.position.set(0, 3, -1.5);
    }

    this.arm.add(anthenna);
  }

  _addJunction() {
    const geometry = new THREE.BoxGeometry(1, 2, 3);
    const material = new THREE.MeshBasicMaterial({ color: 0xafafaf });
    const junction = new THREE.Mesh(geometry, material);

    if(this.right) {
      junction.position.set(0, 0.75, -2);
    }
    else {
      junction.position.set(0, 0.75, 2);
    }

    this.arm.add(junction);
  }

  _addLowerArm() {
    const geometry = new THREE.BoxGeometry(4, 2, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const lowerArm = new THREE.Mesh(geometry, material);
    lowerArm.position.set(-1, -3.5, 0);
    this.arm.add(lowerArm);
  }

  update(z) {
    const minZ = this.right ? -7 : -4;
    const maxZ = this.right ? -4 : -1;
    let newZ = this.arm.position.z + z;
    newZ = Math.max(minZ, Math.min(maxZ, newZ));
    this.arm.position.z = newZ;
  }
}

class Head extends THREE.Group {
  constructor() {
    super();
    this._addHead();
    this._addEyes();
    this._addAntennas();
  }

  _addHead() {
    this.head = new THREE.Object3D();
    this.add(this.head);
    
    const geometry = new THREE.BoxGeometry(4, 4, 5);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const head = new THREE.Mesh(geometry, material);
    head.position.set(0, 0, 0);
    this.head.add(head);
  }

  _addEyes() {
    const geometry = new THREE.BoxGeometry(0.5, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xefefef });

    const leftEye = new THREE.Mesh(geometry, material);
    const rightEye = new THREE.Mesh(geometry, material);

    leftEye.position.set(-2, 0, -1.5);
    rightEye.position.set(-2, 0, 1.5);

    const eyes = new THREE.Object3D();
    eyes.add(leftEye);
    eyes.add(rightEye);
    this.head.add(eyes);
  }

  _addAntennas() {
    const geometry = new THREE.BoxGeometry(1, 3, 1);
    const materialL = new THREE.MeshBasicMaterial({ color: 0xafafaf });
    const materialR = new THREE.MeshBasicMaterial({ color: 0xafafaf });

    const leftAntenna = new THREE.Mesh(geometry, materialL);
    const rightAntenna = new THREE.Mesh(geometry, materialR);

    leftAntenna.position.set(0, 1.5, -3);
    rightAntenna.position.set(0, 1.5, 3);

    const antennas = new THREE.Object3D();
    antennas.add(leftAntenna);
    antennas.add(rightAntenna);
    this.head.add(antennas);
  }

  update(value) {
    const min = -2*Math.PI / 2;
    const max = 0;
    const angle = this.head.rotation.z + value;
    const newAngle = Math.min(Math.max(angle, min), max);
    this.head.rotation.z = newAngle;
  }
}

class Leg extends THREE.Group {
  constructor(right = false) {
    super();
    this.right = right;
    this._addUperLeg();
    this._addBottomLeg();
    this._addWheels();
    this._addFeet();
  }

  _addUperLeg() {
    this.leg = new THREE.Object3D();
    this.add(this.leg);
    
    const geometry = new THREE.BoxGeometry(2, 3, 1.5);
    const material = new THREE.MeshBasicMaterial({color: 0xafafaf});
    const upperLeg = new THREE.Mesh(geometry, material);
    upperLeg.position.set(0, -3, -2);
    this.leg.add(upperLeg);
  }

  _addBottomLeg() {
    const geometry = new THREE.BoxGeometry(3.5, 9, 3.5);
    const material = new THREE.MeshBasicMaterial({color: 0x0000ff});
    const bottomLeg = new THREE.Mesh(geometry, material);
    bottomLeg.position.set(0, -9, -2);
    this.leg.add(bottomLeg);
  }

  _addWheels() {
    const wheelGeometry = new THREE.CylinderGeometry(2, 2, 2, 32);
    let wheelPositions = [
      [-1, -7.5, -4.7],
      [-1, -12, -4.7],
    ];

    if(this.right) {
      wheelPositions = [
        [-1, -7.5, 0.7],
        [-1, -12, 0.7],
      ];
    }

    wheelPositions.forEach((pos) => {
      const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false });
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(...pos);
      this.leg.add(wheel);
    });
  }

  _addFeet() {
    const footPivot = new THREE.Object3D();
    footPivot.position.set(-1.5, -13.5, -2);
    
    const footGeometry = new THREE.BoxGeometry(3, 2, 3.5);
    const footMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const foot = new THREE.Mesh(footGeometry, footMaterial);
    foot.position.set(0, -1, 0);
    
    footPivot.add(foot);
    this.leg.add(footPivot);
    this.footPivot = footPivot;
  }

  updateFeet(value) {
    const min = Math.PI / 2;
    const max = 0;
    const angle = this.footPivot.rotation.z + value;
    const newAngle = THREE.MathUtils.clamp(angle, max, min);
    this.footPivot.rotation.z = newAngle;
  }

  updateLeg(value) {
    const min = Math.PI / 2;
    const max = 0;
    const angle = this.leg.rotation.z + value;
    const newAngle = THREE.MathUtils.clamp(angle, max, min);
    this.leg.rotation.z = newAngle;
  }
}

class Body extends THREE.Group {
  constructor() {
    super();
    this._addChest();
    this._addAbdomen();
    this._addBack();
    this._addWaist();
    this._addWheels();
    this._addArms();
    this.head = this._addHead();
    this._addLegs();
  }

  _addChest() {
    this.body = new THREE.Object3D();
    this.add(this.body);

    const geometry = new THREE.BoxGeometry(3, 5, 12);
    const material = new THREE.MeshBasicMaterial({ color: 0xed2424 });
    const chest = new THREE.Mesh(geometry, material);
    chest.position.set(-1, 0, 0);
    this.body.add(chest);
  }

  _addBack() {
    const geometry = new THREE.BoxGeometry(2, 5, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xed2424 });
    const back = new THREE.Mesh(geometry, material);
    back.position.set(1.5, 0, 0);
    this.body.add(back);
  }

  _addAbdomen() {
    const geometry = new THREE.BoxGeometry(5, 5, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const abdomen = new THREE.Mesh(geometry, material);
    abdomen.position.set(0, -5, 0);
    this.body.add(abdomen);
  }

  _addWaist() {
    const geometry = new THREE.BoxGeometry(6, 2, 9);
    const material = new THREE.MeshBasicMaterial({ color: 0xafafaf });
    const waist = new THREE.Mesh(geometry, material);
    waist.position.set(-0.5, -8.5, 0);
    this.body.add(waist);
  }

  _addWheels() {
    const wheelGeometry = new THREE.CylinderGeometry(2, 2, 2, 32);
    const wheelPositions = [
      [2, -9, 5.5],
      [2, -9, -5.5],
    ];

    wheelPositions.forEach((pos) => {
      const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(...pos);
      this.body.add(wheel);
    });
  }

  _addArms() {
    const leftArm = new Arm(false);
    leftArm.position.set(-3.5, 1, -4);
    this.body.add(leftArm);
    this.leftArm = leftArm;

    const rightArm = new Arm(true);
    rightArm.position.set(-3.5, 1, 12);
    this.body.add(rightArm);
    this.rightArm = rightArm;
  }

  _addHead() {
    const head = new Head();
    head.position.set(0.5, 4.5, 0);
    this.body.add(head);
    return head;
  }

  _addLegs() {
    const leftLeg = new Leg();
    leftLeg.position.set(0, -8, -0.5);
    this.body.add(leftLeg);
    this.leftLeg = leftLeg;

    const rightLeg = new Leg(true);
    rightLeg.position.set(0, -8, 4.5);
    this.body.add(rightLeg);
    this.rightLeg = rightLeg;
  }

  getHead() { return this.head; }
  getLeftLeg() { return this.leftLeg; }
  getRightLeg() { return this.rightLeg; }
  getLegs() { return [this.leftLeg, this.rightLeg]; }
  getLeftArm() { return this.leftArm; }
  getRightArm() { return this.rightArm; }
  update() {}
}

class Trailer extends THREE.Group {
  constructor() {
    super();
    this._addBox();
    this._addWheels();
    this._addHitch();
    this._addAxis();
    this.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
  }

  _addBox() {
    this.trailer = new THREE.Object3D();
    this.trailerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(36, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0xcccfcf})
    );
    this.trailer.add(this.trailerMesh);
    this.add(this.trailer);
  }

  _addWheels() {
    const wheelGeometry = new THREE.CylinderGeometry(2, 2, 2, 32);
    const wheelPositions = [
      [-8.5, -10, 5.5],
      [-13.5, -10, 5.5],
      [-8.5, -10, -5.5],
      [-13.5, -10, -5.5],
    ];

    wheelPositions.forEach((pos) => {
      const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(...pos);
      this.trailer.add(wheel);
    });
  }

  _addHitch() {
    const geometry = new THREE.BoxGeometry(3, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const hitch = new THREE.Mesh(geometry, material);
    hitch.position.set(17, -8.5, 0);
    hitch.rotation.z = Math.PI / 2;
    this.trailer.add(hitch);
  }

  _addAxis() {
    const geometry = new THREE.BoxGeometry(10, 3, 9);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const axis = new THREE.Mesh(geometry, material);
    axis.position.set(-11, -8.5 , 0);
    this._axis = axis;
    this.trailer.add(axis);
  }

  moveForward(value) { this.getObject().translateZ(value); }
  moveLeft(value) { this.getObject().translateX(value); }
  updateX(x) { this.trailer.position.x += x; }
  updateZ(z) { this.trailer.position.z += z; }
}


/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
  scene = new THREE.Scene();
  scene.background = BACKGROUND;

  trailer = new Trailer();
  trailer.position.set(10, 0, 0);
  scene.add(trailer);

  body = new Body();
  body.position.set(-25, -1, 0);
  scene.add(body);

  // AABB boxes
  trailer_box = new THREE.Box3().setFromObject(trailer);
  body_box = new THREE.Box3().setFromObject(body);
}


//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function setupCameras() {
  const positions = [
    [-40, 0, 0],     // frontal
    [0, 0, 30],      // lateral
    [-25, 30, 0],    // topo
    [-50, 20, 25]    // perspetiva
  ];

  for (let i = 0; i < 4; i++) {
    if (i == 3) {
      camera = new THREE.PerspectiveCamera(95, WIDTH / HEIGHT, 1, 1000);
    } else {
      camera = new THREE.OrthographicCamera(
        WIDTH / -20, WIDTH / 20,
        HEIGHT / 20, HEIGHT / -20,
        -50, 1000
      );
    }

    camera.position.set(positions[i][0], positions[i][1], positions[i][2]);
    if(i == 2 || i == 3) {
      camera.lookAt(-25, -1, 0);
    }
    if(i == 0) {
      camera.lookAt(0, 0, 0);
    }
    cameras.push(camera);
  }
  camera = cameras[0];
}

function setCamera(index) {
  if (index < 0 || index >= cameras.length) index = 0;
  camera = cameras[index];
}


//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {
  if (trailer_box.intersectsBox(body_box)) {
    console.log("Collision Detected!"); // REMOVE THIS
    handleCollisions();
  }
}


///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {
  if (!isAnimating) {
    isAnimating = true;
    animationStartTime = CLOCK.getElapsedTime();
  }
}

function toggleWireframe() {
  scene.traverse(node => {
    if (node instanceof THREE.Mesh) node.material.wireframe = !node.material.wireframe;
  });
}


////////////
/* UPDATE */
////////////
function update() {
  if (!isAnimating) {
    // Handle trailer movement
    if (pressed.trailer_down) trailer.updateX(0.3);
    if (pressed.trailer_up) trailer.updateX(-0.3);
    if (pressed.trailer_left) trailer.updateZ(0.3);
    if (pressed.trailer_right) trailer.updateZ(-0.3);
  } else {
    const elapsed = CLOCK.getElapsedTime() - animationStartTime;
    const t = Math.min(elapsed / animationDuration, 1);
    
    const startPosition = trailer.position.clone();
    trailer.position.lerpVectors(startPosition, connectionPoint, t);

    if (t >= 1) {
      isAnimating = false;
      animationStartTime = 0;
      trailer.position.copy(connectionPoint);
    }
  }

  // Handle arm movement
  if(pressed.arm_left) {
    body.getRightArm().update(-0.3);
    body.getLeftArm().update(0.3);
  }
  if(pressed.arm_right) {
    body.getRightArm().update(0.3);
    body.getLeftArm().update(-0.3);
  }

  // Handle leg movement
  if(pressed.legs_up) {
    body.getLegs().forEach(leg => leg.updateLeg(0.1));
  }
  if(pressed.legs_down) {
    body.getLegs().forEach(leg => leg.updateLeg(-0.1));
  }

  // Handle feet movement
  if(pressed.feet_up) {
    body.getLeftLeg().updateFeet(0.3);
    body.getRightLeg().updateFeet(0.3);
  }
  if(pressed.feet_down) {
    body.getLeftLeg().updateFeet(-0.3);
    body.getRightLeg().updateFeet(-0.3);
  }

  // Handle head movement
  if(pressed.head_up) body.getHead().update(0.3);
  if(pressed.head_down) body.getHead().update(-0.3);

  // Handle camera changes
  if(pressed.camera_1) setCamera(0); pressed.camera_1 = false;
  if(pressed.camera_2) setCamera(1); pressed.camera_2 = false;
  if(pressed.camera_3) setCamera(2); pressed.camera_3 = false;
  if(pressed.camera_4) setCamera(3); pressed.camera_4 = false;

  // Update collision boxes
  trailer_box.setFromObject(trailer);
  body_box.setFromObject(body);

  checkCollisions();
}


/////////////
/* DISPLAY */
/////////////
function render() { renderer.render(scene, camera); }


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
    // Camera controls
    case 49: case 97: pressed.camera_1 = true; break;  // 1
    case 50: case 98: pressed.camera_2 = true; break;  // 2
    case 51: case 99: pressed.camera_3 = true; break;  // 3
    case 52: case 100: pressed.camera_4 = true; break; // 4
    
    // Leg controls
    case 119: case 87: pressed.legs_up = true; break;    // W
    case 115: case 83: pressed.legs_down = true; break;  // S
    
    // Feet controls
    case 113: case 81: pressed.feet_up = true; break;    // Q
    case 97: case 65:  pressed.feet_down = true; break;  // A
    
    // Arm controls
    case 101: case 69: pressed.arm_left = true; break;   // E
    case 100: case 68: pressed.arm_right = true; break;  // D
    
    // Head controls
    case 82: case 114: pressed.head_up = true; break;    // R
    case 102: case 70: pressed.head_down = true; break;  // F
    
    // Trailer controls
    case 38: pressed.trailer_up = true; break;    // up
    case 40: pressed.trailer_down = true; break;  // down
    case 37: pressed.trailer_left = true; break;  // left
    case 39: pressed.trailer_right = true; break; // right
    
    // Wireframe toggle
    case 55: case 103: // 7
      if (!pressed.wireframe) {
        toggleWireframe();
        pressed.wireframe = true;
      }
      break;
  }
}


///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
  switch (e.keyCode) {
    // Leg controls
    case 119: case 87: pressed.legs_up = false; break;    // W
    case 115: case 83: pressed.legs_down = false; break;  // S
    
    // Feet controls
    case 113: case 81: pressed.feet_up = false; break;    // Q
    case 97: case 65:  pressed.feet_down = false; break;  // A
    
    // Arm controls
    case 101: case 69: pressed.arm_left = false; break;   // E
    case 100: case 68: pressed.arm_right = false; break;  // D
    
    // Head controls
    case 82: case 114: pressed.head_up = false; break;    // R
    case 102: case 70: pressed.head_down = false; break;  // F
    
    // Trailer controls
    case 38: pressed.trailer_up = false; break;    // up
    case 40: pressed.trailer_down = false; break;  // down
    case 37: pressed.trailer_left = false; break;  // left
    case 39: pressed.trailer_right = false; break; // right

    // Wireframe toggle
    case 55: case 103: pressed.wireframe = false; break;  // 7
  }
}


////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
  document.body.appendChild(renderer.domElement);

  createScene();
  setupCameras();

  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
}


/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
  update();
  requestAnimationFrame(animate);
  render();
}

init();
animate();
