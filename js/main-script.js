import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import { VRButton } from "three/addons/webxr/VRButton.js";
// import * as Stats from "three/addons/libs/stats.module.js";
// import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL CONSTANTS */
//////////////////////
const COLORS = Object.freeze({
  darkBlue: new THREE.Color(0x00008b),
  darkPurple: new THREE.Color(0x632cd4),
  lilac: new THREE.Color(0xc8a2c8),
  green: new THREE.Color(0x55cc55),
  darkGreen: new THREE.Color(0x5e8c61),
  red: new THREE.Color(0xf03a47),
  skyBlue: new THREE.Color(0x84cae7),
  lightCyan: new THREE.Color(0xc9e4e7),
  brown: new THREE.Color(0xa96633),
  orange: new THREE.Color(0xea924b),
  lightBlue: new THREE.Color(0xb8e9ee),
  blue: new THREE.Color(0x1e90ff),
  white: new THREE.Color(0xffffff),
  yellow: new THREE.Color(0xffff00),
  moonYellow: new THREE.Color(0xebc815),
});

const MATERIAL_PARAMS = {
  skyDome: () => ({ color: COLORS.darkBlue, side: THREE.BackSide }),
  terrain: () => ({
    color: COLORS.green,
    side: THREE.DoubleSide,
    bumpMap: terrainHeightMap,
    bumpScale: 1,
    shininess: 10,
    displacementMap: terrainHeightMap,
    displacementScale: 5,
  }),
  
  moon: () => ({ color: COLORS.moonYellow, shininess: 50 }),
  
  treeTrunk: () => ({ color: COLORS.brown, shininess: 10 }),
  treePrimaryBranch: () => ({ color: COLORS.brown, shininess: 10 }),
  treeSecondaryBranch: () => ({ color: COLORS.brown, shininess: 10 }),
  treeLeaf: () => ({ color: COLORS.darkGreen, shininess: 20 }),
  
  ovniBody: () => ({ color: COLORS.red, shininess: 100 }),
  ovniCockpit: () => ({ color: COLORS.skyBlue, opacity: 0.75, transparent: true, shininess: 50 }),
  ovniSpotlight: () => ({ color: COLORS.lightCyan, shininess: 100 }),
  ovniSphere: () => ({ color: COLORS.lightCyan, shininess: 100 }),
  
  houseWalls: () => ({ color: COLORS.white, shininess: 30 }),
  houseRoof: () => ({ color: COLORS.orange, shininess: 20 }),
  houseWindows: () => ({ color: COLORS.lightBlue, shininess: 50 }),
  houseDoor: () => ({ color: COLORS.blue, shininess: 30 }),
};

const TERRAIN_HEIGHT_MAP_PATH = 'assets/height_map.png';

const DOME_RADIUS = 64;
const MOON_DOME_PADDING = 10;
const MOON_POSITION_COORD = Math.sqrt((DOME_RADIUS - MOON_DOME_PADDING) ** 2 / 2);
const MOON_POSITION = new THREE.Vector3(
  MOON_POSITION_COORD / 2,
  MOON_POSITION_COORD,
  -MOON_POSITION_COORD / 2
);
const CYLINDER_SEGMENTS = 32;
const SPHERE_SEGMENTS = 32;
const GEOMETRY = {
  skyDome: new THREE.SphereGeometry(
    DOME_RADIUS,
    SPHERE_SEGMENTS,
    SPHERE_SEGMENTS,
    0,
    2 * Math.PI,
    0,
    Math.PI / 2
  ),
  terrain: new THREE.CircleGeometry(DOME_RADIUS, 128),
  
  moon: new THREE.SphereGeometry(5, SPHERE_SEGMENTS, SPHERE_SEGMENTS),
  
  treeTrunk: new THREE.CylinderGeometry(0.5, 0.5, 1, CYLINDER_SEGMENTS),
  treePrimaryBranch: new THREE.CylinderGeometry(0.5, 0.5, 4, CYLINDER_SEGMENTS),
  treeSecondaryBranch: new THREE.CylinderGeometry(0.4, 0.4, 4, CYLINDER_SEGMENTS),
  treeLeaf: new THREE.SphereGeometry(1, SPHERE_SEGMENTS, SPHERE_SEGMENTS),
  
  ovniBody: new THREE.SphereGeometry(1, SPHERE_SEGMENTS, SPHERE_SEGMENTS),
  ovniCockpit: new THREE.SphereGeometry(1.5, SPHERE_SEGMENTS, SPHERE_SEGMENTS),
  ovniSpotlight: new THREE.CylinderGeometry(1.5, 1.5, 0.5, CYLINDER_SEGMENTS),
  ovniSphere: new THREE.SphereGeometry(0.25, SPHERE_SEGMENTS, SPHERE_SEGMENTS),
  
  houseWalls: createHouseWallsGeometry(),
  houseRoof: createHouseRoofGeometry(),
  houseWindows: createHouseWindowsGeometry(),
  houseDoor: createHouseDoorGeometry(),
};

const OVNI_SPHERE_COUNT = 8;
const ELLIPSOID_SCALING = {
  treePrimaryBranchLeaf: new THREE.Vector3(2.3, 1.1, 1.5),
  treeSecondaryBranchLeaf: new THREE.Vector3(3, 1.375, 2.5),
  ovniBody: new THREE.Vector3(3.5, 1, 3.5),
};
const OVNI_ANGULAR_SPEED = Math.PI / 2; // Radians per second
const OVNI_LINEAR_SPEED = 20; // Units per second

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let renderer, scene, camera, rootGroup, terrainHeightMap;
let terrain, skyDome; // Store references to terrain and sky dome meshes
let floralTexture, starrySkyTexture; // Store the canvas textures
let isFloralFieldActive = false;
let isStarrySkyActive = false;
let isKey1Pressed = false;
let isKey2Pressed = false;
let ovni;
let pointLights = [];
let spotlight;
let isPointLightsOn = true;
let isSpotlightOn = true;
const keysPressed = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false
};

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
  scene = new THREE.Scene();
  rootGroup = new THREE.Group();
  rootGroup.position.y = -5;
  scene.add(rootGroup);

  createTerrain();
  createSkyDome();
  createMoon();
  createHouse();
  //createOakTree(3, new THREE.Vector3(24, 2.25, 34), new THREE.Euler(0, 0, 0));
  createOakTree(1.5, new THREE.Vector3(-28, 2.75, 17), new THREE.Euler(0, Math.PI / 2, 0));
  //createOakTree(4, new THREE.Vector3(-41, 2.75, -14), new THREE.Euler(0, Math.PI / 6, 0));
  createOakTree(4, new THREE.Vector3(-14, 2.25, -23), new THREE.Euler(0, -Math.PI / 2, 0));
  createOakTree(8, new THREE.Vector3(15, 2.75, -26), new THREE.Euler(0, Math.PI / 3, 0));
  createOvni(new THREE.Vector3(0, 20, 0));

  createLights();
}

function createTerrain() {
  const material = new THREE.MeshPhongMaterial(MATERIAL_PARAMS.terrain());
  terrain = new THREE.Mesh(GEOMETRY.terrain, material);
  terrain.rotateX(-Math.PI / 2);
  rootGroup.add(terrain);
}

function createSkyDome() {
  const material = new THREE.MeshBasicMaterial(MATERIAL_PARAMS.skyDome());
  skyDome = new THREE.Mesh(GEOMETRY.skyDome, material);
  rootGroup.add(skyDome);
}

function createMoon() {
  const material = new THREE.MeshPhongMaterial(MATERIAL_PARAMS.moon());
  const moon = new THREE.Mesh(GEOMETRY.moon, material);
  moon.position.copy(MOON_POSITION);
  rootGroup.add(moon);
}

function createHouse() {
  const house = new THREE.Group();
  house.position.set(10, 2.1, 9.5);
  house.rotateY(Math.PI);
  rootGroup.add(house);

  const walls = new THREE.Mesh(GEOMETRY.houseWalls, new THREE.MeshPhongMaterial(MATERIAL_PARAMS.houseWalls()));
  const roof = new THREE.Mesh(GEOMETRY.houseRoof, new THREE.MeshPhongMaterial(MATERIAL_PARAMS.houseRoof()));
  const windows = new THREE.Mesh(GEOMETRY.houseWindows, new THREE.MeshPhongMaterial(MATERIAL_PARAMS.houseWindows()));
  const door = new THREE.Mesh(GEOMETRY.houseDoor, new THREE.MeshPhongMaterial(MATERIAL_PARAMS.houseDoor()));
  house.add(walls, roof, windows, door);
}

function createOakTree(trunkHeight, position, rotation) {
  const treeGroup = new THREE.Group();
  treeGroup.position.copy(position);
  treeGroup.rotation.copy(rotation);
  rootGroup.add(treeGroup);

  const trunk = new THREE.Mesh(GEOMETRY.treeTrunk, new THREE.MeshPhongMaterial(MATERIAL_PARAMS.treeTrunk()));
  trunk.scale.setY(trunkHeight);
  trunk.position.setY(trunkHeight / 2);
  const primaryBranch = new THREE.Mesh(GEOMETRY.treePrimaryBranch, new THREE.MeshPhongMaterial(MATERIAL_PARAMS.treePrimaryBranch()));
  const primaryBranchIncl = Math.PI / 6;
  const primaryBranchX =
    Math.sin(primaryBranchIncl) *
      (GEOMETRY.treePrimaryBranch.parameters.height / 2 +
        GEOMETRY.treePrimaryBranch.parameters.radiusBottom / Math.tan(primaryBranchIncl)) -
    GEOMETRY.treeTrunk.parameters.radiusTop;
  const primaryBranchY =
    Math.cos(primaryBranchIncl) *
      (GEOMETRY.treePrimaryBranch.parameters.height / 2 +
        GEOMETRY.treePrimaryBranch.parameters.radiusBottom * Math.tan(primaryBranchIncl)) -
    GEOMETRY.treeTrunk.parameters.radiusTop;
  primaryBranch.position.set(primaryBranchX, trunkHeight + primaryBranchY, 0);
  primaryBranch.rotation.set(0, 0, -primaryBranchIncl);
  const secondaryBranch = new THREE.Mesh(GEOMETRY.treeSecondaryBranch, new THREE.MeshPhongMaterial(MATERIAL_PARAMS.treeSecondaryBranch()));
  const secondaryBranchIncl = Math.PI / 3;
  secondaryBranch.position.set(
    -GEOMETRY.treeSecondaryBranch.parameters.height / 4,
    trunkHeight + GEOMETRY.treeSecondaryBranch.parameters.height / 2,
    0
  );
  secondaryBranch.rotation.set(0, 0, secondaryBranchIncl);
  const primaryBranchLeaf = new THREE.Mesh(GEOMETRY.treeLeaf, new THREE.MeshPhongMaterial(MATERIAL_PARAMS.treeLeaf()));
  primaryBranchLeaf.position.set(
    primaryBranchX * 2,
    trunkHeight + primaryBranchY * 2 + ELLIPSOID_SCALING.treePrimaryBranchLeaf.y / 2,
    0
  );
  primaryBranchLeaf.scale.copy(ELLIPSOID_SCALING.treePrimaryBranchLeaf);
  const secondaryBranchLeaf = new THREE.Mesh(GEOMETRY.treeLeaf, new THREE.MeshPhongMaterial(MATERIAL_PARAMS.treeLeaf()));
  secondaryBranchLeaf.position.set(
    (-GEOMETRY.treeSecondaryBranch.parameters.height * 2) / 3,
    trunkHeight + primaryBranchY * 2 + ELLIPSOID_SCALING.treePrimaryBranchLeaf.y / 2,
    0
  );
  secondaryBranchLeaf.scale.copy(ELLIPSOID_SCALING.treeSecondaryBranchLeaf);
  treeGroup.add(trunk, primaryBranch, secondaryBranch, primaryBranchLeaf, secondaryBranchLeaf);
}

function createOvni(initialPosition) {
  ovni = new THREE.Group();
  ovni.position.copy(initialPosition);
  rootGroup.add(ovni);

  const body = new THREE.Mesh(GEOMETRY.ovniBody, new THREE.MeshPhongMaterial(MATERIAL_PARAMS.ovniBody()));
  body.scale.copy(ELLIPSOID_SCALING.ovniBody);
  const cockpit = new THREE.Mesh(GEOMETRY.ovniCockpit, new THREE.MeshPhongMaterial(MATERIAL_PARAMS.ovniCockpit()));
  cockpit.position.set(0, ELLIPSOID_SCALING.ovniBody.y / 2, 0);
  const spotlightMesh = new THREE.Mesh(GEOMETRY.ovniSpotlight, new THREE.MeshPhongMaterial(MATERIAL_PARAMS.ovniSpotlight()));
  spotlightMesh.position.set(0, -ELLIPSOID_SCALING.ovniBody.y, 0);

  // Create spotlight
  spotlight = new THREE.SpotLight(COLORS.lightCyan, 1, 50, Math.PI / 6, 0.5);
  spotlight.position.set(0, -ELLIPSOID_SCALING.ovniBody.y, 0);
  spotlight.target.position.set(0, -ELLIPSOID_SCALING.ovniBody.y - 1, 0); // Point downward
  ovni.add(spotlight, spotlight.target);

  ovni.add(body, cockpit, spotlightMesh);

  // Create small spheres with point lights
  for (let i = 0; i < OVNI_SPHERE_COUNT; i++) {
    const sphereGroup = new THREE.Group();
    sphereGroup.rotation.set(0, (i * 2 * Math.PI) / OVNI_SPHERE_COUNT, 0);
    ovni.add(sphereGroup);
    const sphere = new THREE.Mesh(GEOMETRY.ovniSphere, new THREE.MeshPhongMaterial(MATERIAL_PARAMS.ovniSphere()));
    const sphereY = -ELLIPSOID_SCALING.ovniBody.y / 2;
    const sphereX = Math.sqrt(
      ELLIPSOID_SCALING.ovniBody.x ** 2 * (1 - sphereY ** 2 / ELLIPSOID_SCALING.ovniBody.y ** 2)
    );
    sphere.position.set(sphereX, sphereY, 0);
    // Add point light
    const pointLight = new THREE.PointLight(COLORS.lightCyan, 1, 10);
    pointLight.position.set(sphereX, sphereY, 0);
    sphereGroup.add(sphere, pointLight);
    pointLights.push(pointLight);
  }
}

function createHouseWallsGeometry() {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    0, 0, 0, 1, 2.5, 0, 0, 2.5, 0, 1, 0, 0, 2.5, 0, 0, 2.5, 1, 0, 1, 0, 0, 4.5, 0, 0, 4.5, 2.5, 0,
    2.5, 2.5, 0, 6, 0, 0, 6, 1, 0, 4.5, 1, 0, 8, 0, 0, 8, 2.5, 0, 6, 2.5, 0, 9.25, 0, 0, 9.25, 2.5, 0,
    11.5, 0, 0, 11.5, 2.5, 0, 13, 0, 0, 13, 1, 0, 11.5, 1, 0, 17, 0, 0, 17, 2.5, 0, 13, 2.5, 0, 18.5, 0, 0,
    18.5, 1, 0, 17, 1, 0, 20, 0, 0, 20, 2.5, 0, 18.5, 2.5, 0, 8, 4, 0, 0, 4, 0, 13, 4, 0, 20, 4, 0,
    20, 0, -3.5, 20, 2.5, -3.5, 20, 0, -5, 20, 1, -5, 20, 1, -3.5, 20, 0, -5.5, 20, 2.5, -5.5,
    20, 2.5, -5, 20, 4, -5.5, 0, 0, -5.5, 0, 4, -5.5, 0, 0, 0, 20, 0, 0, 20, 2.5, 0, 0, 4, 0,
    20, 4, 0, 20, 0, -5.5, 20, 4, -5.5, 0, 0, -5.5, 0, 4, -5.5
  ]);
  const indices = [
    0, 1, 2, 0, 3, 1, 3, 4, 5, 3, 5, 6, 4, 7, 8, 4, 8, 9, 7, 10, 11, 7, 11, 12, 10, 13, 14,
    10, 14, 15, 16, 18, 19, 16, 19, 17, 18, 20, 21, 18, 21, 22, 20, 23, 24, 20, 24, 25,
    23, 26, 27, 23, 27, 28, 26, 29, 30, 26, 30, 31, 2, 14, 32, 2, 32, 33, 14, 25, 34,
    14, 34, 32, 25, 30, 35, 25, 35, 34, 47, 36, 37, 47, 37, 49, 36, 38, 39, 36, 39, 40,
    38, 41, 42, 38, 42, 43, 49, 42, 44, 49, 44, 51, 45, 47, 50, 45, 50, 46, 52, 54, 55,
    52, 55, 53
  ];
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createHouseRoofGeometry() {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    0, 4, 0, 0, 4, -5.5, 20, 4, 0, 20, 4, -5.5, 0, 6, -2.75, 20, 6, -2.75, 0, 4, 0,
    0, 4, -5.5, 20, 4, 0, 20, 4, -5.5, 0, 6, -2.75, 0, 6, -2.75, 20, 6, -2.75, 20, 6, -2.75
  ]);
  const indices = [
    0, 2, 5, 0, 5, 4, 3, 1, 10, 3, 10, 12, 7, 6, 11, 8, 9, 13
  ];
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createHouseWindowsGeometry() {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    1, 1, 0, 2.5, 1, 0, 2.5, 2.5, 0, 1, 2.5, 0, 4.5, 1, 0, 6, 1, 0, 6, 2.5, 0, 4.5, 2.5, 0,
    11.5, 1, 0, 13, 1, 0, 13, 2.5, 0, 11.5, 2.5, 0, 17, 1, 0, 18.5, 1, 0, 18.5, 2.5, 0,
    17, 2.5, 0, 20, 1, -3.5, 20, 1, -5, 20, 2.5, -5, 20, 2.5, -3.5
  ]);
  const indices = [
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19
  ];
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createHouseDoorGeometry() {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    8, 0, 0, 9.25, 0, 0, 9.25, 2.5, 0, 8, 2.5, 0
  ]);
  const indices = [
    0, 1, 2, 0, 2, 3
  ];
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createFloralFieldTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');

  context.fillStyle = COLORS.green.getStyle();
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Define flower colors
  const flowerColors = [
    COLORS.white.getStyle(),
    COLORS.yellow.getStyle(),
    COLORS.lilac.getStyle(),
    COLORS.lightBlue.getStyle()
  ];

  // Draw 500 small circles
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 1 + Math.random() * 2; // Small circles (1-3 pixels)
    const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];

    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

function createStarrySkyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');

  // Create linear gradient from dark blue to dark purple (top to bottom)
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, COLORS.darkBlue.getStyle());
  gradient.addColorStop(1, COLORS.darkPurple.getStyle());
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw 300 small white stars
  context.fillStyle = COLORS.white.getStyle();
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 0.5 + Math.random() * 1.5; // Very small stars (0.5-2 pixels)
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
  camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(-32, 40, -50);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function createLights() {
  const ambientLight = new THREE.AmbientLight(0x404040, 1);
  scene.add(ambientLight);
}

////////////
/* UPDATE */
////////////
function update(delta) {
  // Rotate ovni around Y-axis
  if (ovni) {
    ovni.rotation.y += OVNI_ANGULAR_SPEED * delta;
  }

  // Move ovni based on key presses
  const direction = new THREE.Vector3();
  if (keysPressed.ArrowLeft) direction.x -= 1;
  if (keysPressed.ArrowRight) direction.x += 1;
  if (keysPressed.ArrowUp) direction.z -= 1;
  if (keysPressed.ArrowDown) direction.z += 1;

  if (direction.lengthSq() > 0) {
    direction.normalize();
    ovni.position.addScaledVector(direction, OVNI_LINEAR_SPEED * delta);

    const maxRadius = DOME_RADIUS - 5;
    const horizontalPos = new THREE.Vector2(ovni.position.x, ovni.position.z);
    if (horizontalPos.length() > maxRadius) {
      horizontalPos.clampLength(0, maxRadius);
      ovni.position.setX(horizontalPos.x);
      ovni.position.setZ(horizontalPos.y);
    }
  }
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
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  floralTexture = createFloralFieldTexture();
  starrySkyTexture = createStarrySkyTexture();

  const loader = new THREE.TextureLoader();
  terrainHeightMap = loader.load(TERRAIN_HEIGHT_MAP_PATH);

  createScene();
  createCamera();

  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
  const delta = 1 / 60;
  requestAnimationFrame(animate);
  update(delta);
  render();
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
  switch (e.key) {
    // 1 -> campo floral
    case '1':
      if (!isKey1Pressed) {
        isKey1Pressed = true;
        isFloralFieldActive = !isFloralFieldActive;
        terrain.material.map = isFloralFieldActive ? floralTexture : null;
        //terrain.material.color.set(COLORS.green);
        terrain.material.needsUpdate = true;
      }
      break;

    // 2 -> céu estrelado
    case '2':
      if (!isKey2Pressed) {
        isKey2Pressed = true;
        isStarrySkyActive = !isStarrySkyActive;
        skyDome.material.map = isStarrySkyActive ? starrySkyTexture : null;
        skyDome.material.color.set(isStarrySkyActive ? COLORS.white : COLORS.darkBlue);
        skyDome.material.needsUpdate = true;
      }
      break;
    
    // 7 -> camera prespetiva
    case '7':
      // TODO
      break;
    
    // ovni movement
    case 'ArrowLeft': keysPressed.ArrowLeft = true; break;
    case 'ArrowRight': keysPressed.ArrowRight = true; break;
    case 'ArrowUp': keysPressed.ArrowUp = true; break;
    case 'ArrowDown': keysPressed.ArrowDown = true; break;
    
    // d -> directional light TODO
    case 'd': case 'D': break;
    
    // p -> point lights FIXME
    case 'p': case 'P':
      isPointLightsOn = !isPointLightsOn;
      pointLights.forEach(light => light.visible = isPointLightsOn);
      break;
    
    // s -> spotlight FIXME
    case 's': case 'S':
      isSpotlightOn = !isSpotlightOn;
      spotlight.visible = isSpotlightOn;
    
    // r -> lighting calculations TODO
    case 'r': case 'R':
      break;
    
    // q -> Gouraud shading TODO
    case 'q': case 'Q':
      break;
    
    // w -> Phong shading TODO
    case 'w': case 'W':
      break;
    
    // e -> Lambert shading TODO
    case 'e': case 'E':
      break;
  }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
  switch (e.key) {
    case '1': isKey1Pressed = false; break;
    case '2': isKey2Pressed = false; break;
    
    case 'ArrowLeft': keysPressed.ArrowLeft = false; break;
    case 'ArrowRight': keysPressed.ArrowRight = false; break;
    case 'ArrowUp': keysPressed.ArrowUp = false; break;
    case 'ArrowDown': keysPressed.ArrowDown = false; break;
    
    case 'r': case 'R':
      break;
    case 'q': case 'Q':
      break;
    case 'w': case 'W':
      break;
    case 'e': case 'E':
      break;
  }
}

init();
animate();