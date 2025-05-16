import * as THREE from "three";


export class Trailer extends THREE.Group {
  constructor() {
    super();
    this._addBox();
    this._addWheels();
    this._addHitch();
    this._addAxis();

    this.rotateOnAxis(
      new THREE.Vector3(0, 1, 0),
      Math.PI
    ); // Rotate the trailer to face the correct direction
    }

  _addBox() {
    this.trailer = new THREE.Object3D();
    //this.trailer.position.set(0, 0, 0);
    this.add(this.trailer);

    this.trailerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(36, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0xcccfcf})
    );
    this.trailer.add(this.trailerMesh);
  }

  _addWheels() {
    const wheelGeometry = new THREE.CylinderGeometry(2, 2, 1, 32);
    const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const wheelPositions = [
      [-8.5, -10, 5],
      [-13.5, -10, 5],
      [-8.5, -10, -5],
      [-13.5, -10, -5],
    ];
    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.x = Math.PI / 2; // Rotate the wheel to be horizontal
      wheel.position.set(...pos);
      this.trailer.add(wheel);
    });
  }

  _addHitch() {
    const geometry = new THREE.BoxGeometry(3, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const hitch = new THREE.Mesh(geometry, material);
    
    hitch.position.set(17, -8, 0);
    
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

  moveForward(value) {
    this.getObject().translateZ(value);
  }

  moveLeft(value) {
    this.getObject().translateX(value);
  }

  update() {
    // Update logic for the trailer
  }
}