import * as THREE from "three";


export class Trailer extends THREE.Group {
  constructor() {
    super();
    this.trailer = new THREE.Object3D();
    this.trailer.position.set(0, 0, 0);
    this.add(this.trailer);

    this.trailerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(36, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0x383333})
    );
    this.trailer.add(this.trailerMesh);

    // Add wheels
    const wheelGeometry = new THREE.CylinderGeometry(2, 2, 1, 32);
    const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const wheelPositions = [
      [-10, -7, 7],
      [-15, -7, 7],
      [-10, -7, -7],
      [-15, -7, -7],
    ];
    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.x = Math.PI / 2; // Rotate the wheel to be horizontal
      wheel.position.set(...pos);
      this.trailer.add(wheel);
    });

   

    // Add hitch
    const hitchGeometry = new THREE.BoxGeometry(3, 1, 1);
    const hitchMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const hitch = new THREE.Mesh(hitchGeometry, hitchMaterial);
    hitch.position.set(18, -7, 0);
    this.trailer.add(hitch);
  }

  update() {
    // Update logic for the trailer
  }
}