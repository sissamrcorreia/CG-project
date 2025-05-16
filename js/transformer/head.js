import * as THREE from "three";


export class Head extends THREE.Group {
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
        const material = new THREE.MeshBasicMaterial({ color: 0xafafaf });

        const leftAntenna = new THREE.Mesh(geometry, material);
        const rightAntenna = new THREE.Mesh(geometry, material);

        leftAntenna.position.set(0, 1.5, -3);
        rightAntenna.position.set(0, 1.5, 3);

        const antennas = new THREE.Object3D();
        antennas.add(leftAntenna);
        antennas.add(rightAntenna);

        this.head.add(antennas);
    }

    update()  {
        // Update the head's position or rotation if needed
    }
}