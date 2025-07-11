import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";

//////////////////////
/* GLOBAL CONSTANTS */
//////////////////////
const COLORS = Object.freeze({
  darkBlue: new THREE.Color(0x000099),
  darkPurple: new THREE.Color(0x4b0082),
  lilac: new THREE.Color(0xB89FB8),
  green: new THREE.Color(0x55cc55),
  darkGreen: new THREE.Color(0x5e8c61),
  red: new THREE.Color(0xe63946),
  skyBlue: new THREE.Color(0x87ceeb),
  lightCyan: new THREE.Color(0xb0e0e6),
  brown: new THREE.Color(0x8b5a2b),
  orange: new THREE.Color(0xffa500),
  lightBlue: new THREE.Color(0x9ec4d2),
  blue: new THREE.Color(0x4682b4),
  white: new THREE.Color(0xffffff),
  yellow: new THREE.Color(0xffd700),
  moonYellow: new THREE.Color(0xf0c05a),
});

const MATERIAL_PARAMS = {
  skyDome: () => ({ color: COLORS.darkBlue, side: THREE.BackSide }),
  terrain: () => ({
    color: COLORS.green,
    side: THREE.DoubleSide,
    bumpMap: terrainHeightMap,
    bumpScale: 1,
    displacementMap: terrainHeightMap,
    displacementScale: 5,
  }),
  
  moon: () => ({ color: COLORS.moonYellow, emissive: COLORS.moonYellow, emissiveIntensity: 0.5 }),
  
  treeTrunk: () => ({ color: COLORS.brown }),
  treePrimaryBranch: () => ({ color: COLORS.brown }),
  treeSecondaryBranch: () => ({ color: COLORS.brown }),
  treeLeaf: () => ({ color: COLORS.darkGreen }),
  
  ovniBody: () => ({ color: COLORS.red }),
  ovniCockpit: () => ({ color: COLORS.skyBlue, opacity: 0.75, transparent: true }),
  ovniSpotlight: () => ({ color: COLORS.lightCyan}),
  ovniSphere: () => ({ color: COLORS.lightCyan }),
  
  houseWalls: () => ({ color: COLORS.white, side: THREE.DoubleSide }),
  houseWindows: () => ({ color: COLORS.lightBlue, side: THREE.DoubleSide }),
  houseDoor: () => ({ color: COLORS.blue, side: THREE.DoubleSide }),
  houseRoof: () => ({ color: COLORS.orange, side: THREE.DoubleSide }),
};

const LIGHT_INTENSITY = Object.freeze({
  ambient: 3,
  directional: 1,
  ovniSpotlight: 500,
  ovniSphere: 2,
});

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
  houseWindows: createHouseWindowsGeometry(),
  houseDoor: createHouseDoorGeometry(),
  houseRoof: createHouseRoofGeometry(),
};

const OVNI_SPHERE_COUNT = 8;

const ELLIPSOID_SCALING = {
  treePrimaryBranchLeaf: new THREE.Vector3(2.3, 1.1, 1.5),
  treeSecondaryBranchLeaf: new THREE.Vector3(3, 1.375, 2.5),
  ovniBody: new THREE.Vector3(3.5, 1, 3.5),
};
const OVNI_ANGULAR_SPEED = Math.PI / 2; // Radians per second
const OVNI_LINEAR_SPEED = 20; // Units per second

const clock = new THREE.Clock();

// Key states
const keysPressed = {
  _1: false, _2: false, _7: false,
  d: false, p: false, s: false,
  r: false, q: false, w: false, e: false,
  _1_prev: false, _2_prev: false, _7_prev: false,
  d_prev: false, p_prev: false, s_prev: false,
  r_prev: false, q_prev: false, w_prev: false, e_prev: false,
  ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false
};

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let renderer, scene, activecamera, perspectivecamera, rootGroup, terrainHeightMap;
let terrain, skyDome; // Store references to terrain and sky dome meshes
let floralTexture, starrySkyTexture; // Store the canvas textures
let isFloralFieldActive = true;
let isStarrySkyActive = true;

let moonLight;
let ovni;
let pointLights = [];
let spotlight;

// Flags for light states
let isPointLightsOn = true;
let isSpotlightOn = true;
let isLightCalculationsEnabled = true;

let activeMaterial = 'phong'; // Default material
let requestedMaterial = 'phong';

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
  
  createOakTree(3, new THREE.Vector3(-35, 1.5, 25), new THREE.Euler(0, Math.PI / 2, 0));
  createOakTree(4, new THREE.Vector3(-20, 1.5, -30), new THREE.Euler(0, -Math.PI / 2, 0));
  createOakTree(6, new THREE.Vector3(25, 3, -35), new THREE.Euler(0, Math.PI / 3, 0));
  createOakTree(3, new THREE.Vector3(30, 3, 25), new THREE.Euler(0, -Math.PI / 4, 0));
  createOakTree(2, new THREE.Vector3(55, 1.5, 15), new THREE.Euler(0, Math.PI / 6, 0));
  createOakTree(2.5, new THREE.Vector3(-45, 1.5, 15), new THREE.Euler(0, -Math.PI / 6, 0));
  createOakTree(3, new THREE.Vector3(-55, 1.5, -15), new THREE.Euler(0, Math.PI / 4, 0));
  createOakTree(2, new THREE.Vector3(-10, 2, -25), new THREE.Euler(0, -Math.PI / 3, 0));
  createOakTree(5, new THREE.Vector3(45, 1.75, 20), new THREE.Euler(0, Math.PI / 5, 0));
  createOakTree(4, new THREE.Vector3(-30, 1.3, -10), new THREE.Euler(0, Math.PI / 2, 0));
  createOakTree(3.5, new THREE.Vector3(25, 1.75, 10), new THREE.Euler(0, -Math.PI / 5, 0));
  
  createOvni(new THREE.Vector3(0, 20, 0));

  createLights();
}

function createTerrain() {
  const material = createMaterial('phong', MATERIAL_PARAMS.terrain());
  terrain = new THREE.Mesh(GEOMETRY.terrain, material);
  terrain.rotateX(-Math.PI / 2);
  terrain.material.map = floralTexture;
  rootGroup.add(terrain);
}

function createSkyDome() {
  const material = new THREE.MeshBasicMaterial(MATERIAL_PARAMS.skyDome());
  skyDome = new THREE.Mesh(GEOMETRY.skyDome, material);
  skyDome.material.map = isStarrySkyActive ? starrySkyTexture : null;
  skyDome.material.color.set(isStarrySkyActive ? COLORS.white : COLORS.darkBlue);
  rootGroup.add(skyDome);
}

function createMoon() {
  const material = createMaterial('phong', MATERIAL_PARAMS.moon());
  const moon = new THREE.Mesh(GEOMETRY.moon, material);
  moon.position.copy(MOON_POSITION);
  rootGroup.add(moon);
}

function createHouse() {
  const house = new THREE.Group();
  house.position.set(10, 2.1, 9.5);
  house.rotateY(Math.PI);
  rootGroup.add(house);

  const walls = new THREE.Mesh(GEOMETRY.houseWalls, createMaterial('phong', MATERIAL_PARAMS.houseWalls()));
  const roof = new THREE.Mesh(GEOMETRY.houseRoof, createMaterial('phong', MATERIAL_PARAMS.houseRoof()));
  const windows = new THREE.Mesh(GEOMETRY.houseWindows, createMaterial('phong', MATERIAL_PARAMS.houseWindows()));
  const door = new THREE.Mesh(GEOMETRY.houseDoor, createMaterial('phong', MATERIAL_PARAMS.houseDoor()));
  house.add(walls, roof, windows, door);
}

function createOakTree(trunkHeight, position, rotation) {
  const treeGroup = new THREE.Group();
  treeGroup.position.copy(position);
  treeGroup.rotation.copy(rotation);
  rootGroup.add(treeGroup);

  // Trunk
  const trunk = new THREE.Mesh(GEOMETRY.treeTrunk, createMaterial('phong', MATERIAL_PARAMS.treeTrunk()));
  trunk.scale.setY(trunkHeight);
  trunk.position.setY(trunkHeight / 2);
  
  // Primary branch
  const primaryBranch = new THREE.Mesh(GEOMETRY.treePrimaryBranch, createMaterial('phong', MATERIAL_PARAMS.treePrimaryBranch()));
  
  // Calculate position and rotation for primary branch
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
  
  // Secondary branch
  const secondaryBranch = new THREE.Mesh(GEOMETRY.treeSecondaryBranch, createMaterial('phong', MATERIAL_PARAMS.treeSecondaryBranch()));
  
  // Calculate position and rotation for secondary branch
  const secondaryBranchIncl = Math.PI / 3;
  secondaryBranch.position.set(
    -GEOMETRY.treeSecondaryBranch.parameters.height / 4,
    trunkHeight + GEOMETRY.treeSecondaryBranch.parameters.height / 2,
    0
  );
  secondaryBranch.rotation.set(0, 0, secondaryBranchIncl);
  
  // Leaves
  const primaryBranchLeaf = new THREE.Mesh(GEOMETRY.treeLeaf, createMaterial('phong', MATERIAL_PARAMS.treeLeaf()));
  primaryBranchLeaf.position.set(
    primaryBranchX * 2,
    trunkHeight + primaryBranchY * 2 + ELLIPSOID_SCALING.treePrimaryBranchLeaf.y / 2,
    0
  );
  primaryBranchLeaf.scale.copy(ELLIPSOID_SCALING.treePrimaryBranchLeaf);
  const secondaryBranchLeaf = new THREE.Mesh(GEOMETRY.treeLeaf, createMaterial('phong', MATERIAL_PARAMS.treeLeaf()));
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

  const body = new THREE.Mesh(GEOMETRY.ovniBody, createMaterial('phong', MATERIAL_PARAMS.ovniBody()));
  body.scale.copy(ELLIPSOID_SCALING.ovniBody);
  const cockpit = new THREE.Mesh(GEOMETRY.ovniCockpit, createMaterial('phong', MATERIAL_PARAMS.ovniCockpit()));
  cockpit.position.set(0, ELLIPSOID_SCALING.ovniBody.y / 2, 0);
  const spotlightMesh = new THREE.Mesh(GEOMETRY.ovniSpotlight, createMaterial('phong', MATERIAL_PARAMS.ovniSpotlight()));
  spotlightMesh.position.set(0, -ELLIPSOID_SCALING.ovniBody.y, 0);

  // Create spotlight
  spotlight = new THREE.SpotLight(COLORS.lightCyan, LIGHT_INTENSITY.ovniSpotlight, 50, Math.PI / 6, 0.5, 1.7);
  spotlight.position.set(0, -ELLIPSOID_SCALING.ovniBody.y, 0);
  spotlight.target.position.set(0, -ELLIPSOID_SCALING.ovniBody.y - 1, 0); // Point downward
  ovni.add(spotlight, spotlight.target);

  ovni.add(body, cockpit, spotlightMesh);

  // Create small spheres with point lights
  for (let i = 0; i < OVNI_SPHERE_COUNT; i++) {
    const sphereGroup = new THREE.Group();
    sphereGroup.rotation.set(0, (i * 2 * Math.PI) / OVNI_SPHERE_COUNT, 0);
    ovni.add(sphereGroup);
    const sphere = new THREE.Mesh(GEOMETRY.ovniSphere, createMaterial('phong', MATERIAL_PARAMS.ovniSphere()));
    const sphereY = -ELLIPSOID_SCALING.ovniBody.y / 2;
    const sphereX = Math.sqrt(
      ELLIPSOID_SCALING.ovniBody.x ** 2 * (1 - sphereY ** 2 / ELLIPSOID_SCALING.ovniBody.y ** 2)
    );
    sphere.position.set(sphereX, sphereY, 0);
    // Add point light
    const pointLight = new THREE.PointLight(COLORS.lightCyan, LIGHT_INTENSITY.ovniSphere, 20);
    pointLight.position.set(sphereX, sphereY, 0);
    sphereGroup.add(sphere, pointLight);
    pointLights.push(pointLight);
  }
}

function createHouseWallsGeometry() {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    // Front wall
    0, 0, 0, 1, 2.5, 0, 0, 2.5, 0, 1, 0, 0, 2.5, 0, 0, 2.5, 1, 0, 1, 1, 0, 4.5, 0, 0, 4.5, 2.5, 0,
    2.5, 2.5, 0, 6, 0, 0, 6, 1, 0, 4.5, 1, 0, 8, 0, 0, 8, 2.5, 0, 6, 2.5, 0, 9.25, 0, 0, 9.25, 2.5, 0,
    11.5, 0, 0, 11.5, 2.5, 0, 13, 0, 0, 13, 1, 0, 11.5, 1, 0, 17, 0, 0, 17, 2.5, 0, 13, 2.5, 0, 18.5, 0, 0,
    18.5, 1, 0, 17, 1, 0, 20, 0, 0, 20, 2.5, 0, 18.5, 2.5, 0, 8, 4, 0, 0, 4, 0, 13, 4, 0, 20, 4, 0,
    
    // Right wall
    20, 0, -3.5, 20, 2.5, -3.5, 20, 0, -5, 20, 1, -5, 20, 1, -3.5, 20, 0, -5.5, 20, 2.5, -5.5,
    20, 2.5, -5, 20, 4, -5.5,
    
    // Left wall
    0, 0, -5.5, 0, 4, -5.5,
    
    // Extras
    0, 0, 0, 20, 0, 0, 20, 2.5, 0, 0, 4, 0,
    20, 4, 0, 20, 0, -5.5, 20, 4, -5.5, 0, 0, -5.5, 0, 4, -5.5
  ]);
  const indices = [
    // Front wall
    0, 1, 2, 0, 3, 1, 3, 4, 5, 3, 5, 6, 4, 7, 8, 4, 8, 9, 7, 10, 11, 7, 11, 12, 10, 13, 14,
    10, 14, 15, 16, 18, 19, 16, 19, 17, 18, 20, 21, 18, 21, 22, 20, 23, 24, 20, 24, 25,
    23, 26, 27, 23, 27, 28, 26, 29, 30, 26, 30, 31, 2, 14, 32, 2, 32, 33, 14, 25, 34,
    14, 34, 32, 25, 30, 35, 25, 35, 34,
    
    // Right wall
    48, 36, 37, 48, 37, 49, 36, 38, 39, 36, 39, 40, 38, 41, 42, 38, 42, 43, 49, 42, 44, 49, 44, 51,

    // Left wall
    45, 47, 50, 45, 50, 46,

    // Back wall
    52, 54, 55, 52, 55, 53
  ];
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createHouseRoofGeometry() {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    // Base
    0, 4, 0, 0, 4, -5.5, 20, 4, 0, 20, 4, -5.5,
    
    // Top
    0, 6, -2.75, 20, 6, -2.75,
    
    // Others
    0, 4, 0, 0, 4, -5.5, 20, 4, 0, 20, 4, -5.5, 0, 6, -2.75,
    0, 6, -2.75, 20, 6, -2.75, 20, 6, -2.75
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
    // Window 1
    1, 1, 0, 2.5, 1, 0, 2.5, 2.5, 0, 1, 2.5, 0,
    
    // Window 2
    4.5, 1, 0, 6, 1, 0, 6, 2.5, 0, 4.5, 2.5, 0,
    11.5, 1, 0, 13, 1, 0, 13, 2.5, 0, 11.5, 2.5,
    
    // Window 3
    0, 17, 1, 0, 18.5, 1, 0, 18.5, 2.5, 0, 17, 2.5, 0,
    
    // Side window
    20, 1, -3.5, 20, 1, -5, 20, 2.5, -5, 20, 2.5, -3.5
  ]);
  const indices = [
    // Window 1
    0, 1, 2, 0, 2, 3,
    
    // Window 2
    4, 5, 6, 4, 6, 7,
    
    // Window 3
    8, 9, 10, 8, 10, 11,
    
    // Window 4
    12, 13, 14, 12, 14, 15,
    
    // Side window
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
    const radius = 1 + Math.random() * 2; // Small circles (flowers)
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
    const radius = 0.5 + Math.random() * 0.5; // Small stars
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCameras() {
  perspectivecamera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000);
  perspectivecamera.position.set(-32, 40, -50);
  perspectivecamera.lookAt(0, 0, 0);

  activecamera = perspectivecamera; // Default active camera
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function createLights() {
  const ambientLight = new THREE.AmbientLight(0x404040, LIGHT_INTENSITY.ambient);
  scene.add(ambientLight);

  // Directional light (moon light)
  moonLight = new THREE.DirectionalLight(COLORS.moonYellow, LIGHT_INTENSITY.directional);
  moonLight.position.set(MOON_POSITION.x, MOON_POSITION.y, MOON_POSITION.z);
  moonLight.target.position.set(15, 20, 5);
  rootGroup.add(moonLight);
  rootGroup.add(moonLight.target);
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
  if (keysPressed.ArrowLeft) direction.x += 1;
  if (keysPressed.ArrowRight) direction.x -= 1;
  if (keysPressed.ArrowUp) direction.z += 1;
  if (keysPressed.ArrowDown) direction.z -= 1;

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

  // Toggle floral field texture (key 1)
  if (keysPressed._1 && !keysPressed._1_prev) {
    isFloralFieldActive = !isFloralFieldActive;
    terrain.material.map = isFloralFieldActive ? floralTexture : null;
    terrain.material.needsUpdate = true;
  }

  // Toggle starry sky texture (key 2)
  if (keysPressed._2 && !keysPressed._2_prev) {
    isStarrySkyActive = !isStarrySkyActive;
    skyDome.material.map = isStarrySkyActive ? starrySkyTexture : null;
    skyDome.material.color.set(isStarrySkyActive ? COLORS.white : COLORS.darkBlue);
    skyDome.material.needsUpdate = true;
  }

  // Toggle camera (key 7)
  if (keysPressed._7 && !keysPressed._7_prev) {
    // Logic here
  }

  // Toggle directional light (key D)
  if (keysPressed.d && !keysPressed.d_prev) {
    moonLight.visible = !moonLight.visible;
  }

  // Toggle point lights (key P)
  if (keysPressed.p && !keysPressed.p_prev) {
    isPointLightsOn = !isPointLightsOn;
    pointLights.forEach(light => (light.visible = isPointLightsOn));
  }

  // Toggle spotlight (key S)
  if (keysPressed.s && !keysPressed.s_prev) {
    isSpotlightOn = !isSpotlightOn;
    spotlight.visible = isSpotlightOn;
  }

  // Switch to Gouraud shading (key Q)
  if (keysPressed.q && !keysPressed.q_prev) {
    requestedMaterial = 'gouraud';
  }

  // Switch to Phong shading (key W)
  if (keysPressed.w && !keysPressed.w_prev) {
    requestedMaterial = 'phong';
  }

  // Switch to Cartoon shading (key E)
  if (keysPressed.e && !keysPressed.e_prev) {
    requestedMaterial = 'cartoon';
  }

  // Switch light calculations (key R)
  if (keysPressed.r && !keysPressed.r_prev) {
    const materialType = activeMaterial === 'basic' ? 'phong' : 'basic';
    requestedMaterial = materialType;
    isLightCalculationsEnabled = !isLightCalculationsEnabled;
  }

  // Update materials if requested
  if (activeMaterial !== requestedMaterial) {
    activeMaterial = requestedMaterial;
    updateAllMaterials(activeMaterial);
  }

  // Update previous key states
  keysPressed._1_prev = keysPressed._1;
  keysPressed._2_prev = keysPressed._2;
  keysPressed._7_prev = keysPressed._7;
  keysPressed.d_prev = keysPressed.d;
  keysPressed.p_prev = keysPressed.p;
  keysPressed.s_prev = keysPressed.s;
  keysPressed.q_prev = keysPressed.q;
  keysPressed.w_prev = keysPressed.w;
  keysPressed.e_prev = keysPressed.e;
  keysPressed.r_prev = keysPressed.r;
}

/////////////
/* DISPLAY */
/////////////
function render() {
  renderer.render(scene, activecamera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.shadowMap.enabled = true; // Enable shadow mapping
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.xr.enabled = true; // Enable WebXR for VR support

  document.body.appendChild(renderer.domElement);
  document.body.appendChild(VRButton.createButton(renderer));

  floralTexture = createFloralFieldTexture();
  starrySkyTexture = createStarrySkyTexture();

  const loader = new THREE.TextureLoader();
  terrainHeightMap = loader.load(TERRAIN_HEIGHT_MAP_PATH);

  createScene();
  createCameras();

  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {  
  function animationLoop() {
    const delta = clock.getDelta();
    update(delta);
    render();
  }
  
  // Use setAnimationLoop for VR compatibility
  renderer.setAnimationLoop(animationLoop);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
  activecamera.aspect = window.innerWidth / window.innerHeight;
  activecamera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
  switch (e.key) {
    // 1 -> Floral field
    case '1': keysPressed._1 = true; break;

    // 2 -> Starry sky
    case '2': keysPressed._2 = true; break;

    // 7 -> Toggle prespective camera
    case '7': keysPressed._7 = true; break;

    // Ovni movement
    case 'ArrowLeft': keysPressed.ArrowLeft = true; break;
    case 'ArrowRight': keysPressed.ArrowRight = true; break;
    case 'ArrowUp': keysPressed.ArrowUp = true; break;
    case 'ArrowDown': keysPressed.ArrowDown = true; break;

    // d -> Directional light
    case 'd': case 'D': keysPressed.d = true; break;

    // p -> Point lights
    case 'p': case 'P': keysPressed.p = true; break;

    // s -> Spotlight
    case 's': case 'S': keysPressed.s = true; break;

    // r -> Lighting calculations
    case 'r': case 'R': keysPressed.r = true; break;

    // q -> Gouraud shading
    case 'q': case 'Q': keysPressed.q = true; break;

    // w -> Phong shading
    case 'w': case 'W': keysPressed.w = true; break;

    // e -> Lambert shading
    case 'e': case 'E': keysPressed.e = true; break;
  }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
  switch (e.key) {
    case '1': keysPressed._1 = false; break;
    case '2': keysPressed._2 = false; break;
    case '7': keysPressed._7 = false; break;

    case 'ArrowLeft': keysPressed.ArrowLeft = false; break;
    case 'ArrowRight': keysPressed.ArrowRight = false; break;
    case 'ArrowUp': keysPressed.ArrowUp = false; break;
    case 'ArrowDown': keysPressed.ArrowDown = false; break;

    case 'd': case 'D': keysPressed.d = false; break;
    case 'p': case 'P': keysPressed.p = false; break;
    case 's': case 'S': keysPressed.s = false; break;

    case 'r': case 'R': keysPressed.r = false; break;
    case 'q': case 'Q': keysPressed.q = false; break;
    case 'w': case 'W': keysPressed.w = false; break;
    case 'e': case 'E': keysPressed.e = false; break;
  }
}

function createMaterial(type, params) {
  switch (type) {
    case 'gouraud': return new THREE.MeshLambertMaterial(params);
    case 'phong': return new THREE.MeshPhongMaterial(params);
    case 'cartoon': return new THREE.MeshToonMaterial(params);
    case 'basic': return new THREE.MeshBasicMaterial(params);
    default: return new THREE.MeshPhongMaterial(params);
  }
}

function updateAllMaterials(type) {
  // Moon
  rootGroup.traverse(obj => {
    if (obj.isMesh && obj.geometry === GEOMETRY.moon) {
      obj.material = createMaterial(type, MATERIAL_PARAMS.moon());
      obj.material.needsUpdate = true;
    }
  });

  // House
  rootGroup.traverse(obj => {
    if (obj.isMesh && obj.geometry === GEOMETRY.houseWalls) {
      obj.material = createMaterial(type, MATERIAL_PARAMS.houseWalls());
    }
    if (obj.isMesh && obj.geometry === GEOMETRY.houseRoof) {
      obj.material = createMaterial(type, MATERIAL_PARAMS.houseRoof());
    }
    if (obj.isMesh && obj.geometry === GEOMETRY.houseWindows) {
      obj.material = createMaterial(type, MATERIAL_PARAMS.houseWindows());
    }
    if (obj.isMesh && obj.geometry === GEOMETRY.houseDoor) {
      obj.material = createMaterial(type, MATERIAL_PARAMS.houseDoor());
    }
  });

  // Trees
  rootGroup.traverse(obj => {
    if (obj.isMesh && obj.geometry === GEOMETRY.treeTrunk) {
      obj.material = createMaterial(type, MATERIAL_PARAMS.treeTrunk());
    }
    if (obj.isMesh && obj.geometry === GEOMETRY.treePrimaryBranch) {
      obj.material = createMaterial(type, MATERIAL_PARAMS.treePrimaryBranch());
    }
    if (obj.isMesh && obj.geometry === GEOMETRY.treeSecondaryBranch) {
      obj.material = createMaterial(type, MATERIAL_PARAMS.treeSecondaryBranch());
    }
    if (obj.isMesh && obj.geometry === GEOMETRY.treeLeaf) {
      obj.material = createMaterial(type, MATERIAL_PARAMS.treeLeaf());
    }
  });

  // Ovni
  if (ovni) {
    ovni.traverse(obj => {
      if (obj.isMesh && obj.geometry === GEOMETRY.ovniBody) {
        obj.material = createMaterial(type, MATERIAL_PARAMS.ovniBody());
      }
      if (obj.isMesh && obj.geometry === GEOMETRY.ovniCockpit) {
        obj.material = createMaterial(type, MATERIAL_PARAMS.ovniCockpit());
      }
      if (obj.isMesh && obj.geometry === GEOMETRY.ovniSpotlight) {
        obj.material = createMaterial(type, MATERIAL_PARAMS.ovniSpotlight());
      }
      if (obj.isMesh && obj.geometry === GEOMETRY.ovniSphere) {
        obj.material = createMaterial(type, MATERIAL_PARAMS.ovniSphere());
      }
    });
  }
}

init();
animate();