import * as THREE from "three";

import { Arm } from "./arm.js";
import { Head } from "./head.js";
import { Leg } from "./leg.js";

export class Body extends THREE.Group {
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
    const wheelGeometry = new THREE.CylinderGeometry(2, 2, 1, 32);
    const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const wheelPositions = [
      [2, -9, 5],
      [2, -9, -5],
    ];
    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.x = Math.PI / 2; // Rotate the wheel to be horizontal
      wheel.position.set(...pos);
      this.body.add(wheel);
    });
  }

  ///////////////////////
  /* ADD ARMS */
  ///////////////////////
  _addArms() {
    // Create left arm
    const leftArm = new Arm(false); // false for left arm
    leftArm.position.set(-3.5, 1, -4); // Position on the left side of the chest
    this.body.add(leftArm);

    // Create right arm
    const rightArm = new Arm(true); // true for right arm
    rightArm.position.set(-3.5, 1, 12); // Position on the right side of the chest
    this.body.add(rightArm);
  }

  ///////////////////////
  /* ADD HEAD */
  ///////////////////////
  _addHead() {
    const head = new Head();
    head.position.set(0, 4.5, 0);
    this.body.add(head);

    return head;
  }

  ///////////////////////
  /* ADD LEGS */
  ///////////////////////

  _addLegs() {
    // Create left leg
    const leftLeg = new Leg();
    leftLeg.position.set(-2, -8, -0.5); // Position on the left side of the abdomen
    this.body.add(leftLeg);

    // Create right leg
    const rightLeg = new Leg(true);
    rightLeg.position.set(-2, -8, 4.5); // Position on the right side of the abdomen
    this.body.add(rightLeg);
  }
  ///////////////////////


  getHead() {
    return this.head;
  }

  update() {
    // Update logic for the body
  }
}
