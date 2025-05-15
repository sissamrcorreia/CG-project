import * as THREE from "three";


export class Arm extends THREE.Group {
  constructor() {
    super();
    this._addUpperArm();
    this._addAnthenna();
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

  _addAnthenna() {
    const geometry = new THREE.BoxGeometry(1, 5, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xafafaf });
    const anthenna = new THREE.Mesh(geometry, material);

    anthenna.position.set(0, 3.5, -1.5);

    this.arm.add(anthenna);
  }

  _addJunction() {
    const geometry = new THREE.BoxGeometry(2, 2, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xafafaf });
    const junction = new THREE.Mesh(geometry, material);

    junction.position.set(0, 0.75, 1.5);

    this.arm.add(junction);
  }

  _addLowerArm() {
    const geometry = new THREE.BoxGeometry(4, 2, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const lowerArm = new THREE.Mesh(geometry, material);

    lowerArm.position.set(-1, -3.5, 0);

    this.arm.add(lowerArm);
  }

  update() {
    // Update logic for the arm
  }

}
