import * as THREE from "three";


export class Body extends THREE.Group {
    constructor() {
    super();

    this._addChest();
    this._addAbdomen();
    this._addWaist();
    this._addWheels();
  }

  _addChest() {
    this.body = new THREE.Object3D();
    this.add(this.body);

    const geometry = new THREE.BoxGeometry(5, 5, 12);
    const material = new THREE.MeshBasicMaterial({ color: 0xed2424 });
    const chest = new THREE.Mesh(geometry, material);

    chest.position.set(0, 0, 1.5);

    this.body.add(chest);
  }

  _addAbdomen() {
    const geometry = new THREE.BoxGeometry(5, 5, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const abdomen = new THREE.Mesh(geometry, material);

    abdomen.position.set(0, -7, 0);

    this.body.add(abdomen);
  }

  _addWaist() {
    const geometry = new THREE.BoxGeometry(5, 5, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xafafaf });
    const waist = new THREE.Mesh(geometry, material);

    waist.position.set(0, -11.5, 0.5);

    this.body.add(waist);
  }


  _addWheels() {
      const wheelGeometry = new THREE.CylinderGeometry(2, 2, 1, 32);
      const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const wheelPositions = [
        [-8, -10, 7],
        [-8, -10, -7]
      ];
      wheelPositions.forEach((pos) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.x = Math.PI / 2; // Rotate the wheel to be horizontal
        wheel.position.set(...pos);
        this.trailer.add(wheel);
      });
    }

  update() {
    // Update logic for the body
  }
}