import * as THREE from "three";


export class Leg extends THREE.Group {
    constructor(right = false) {
        super();
        this.right = right;
        this._addUperLeg();
        this._addBottomLeg();
        this._addWheels();

        this._addFeet(); // Add feet
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
        const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        let wheelPositions = [
        [-0.5, -7.5, -4.7],
        [-0.5, -12, -4.7],
        ];

        if(this.right) {
            wheelPositions = [
                [-0.5, -7.5, 0.7],
                [-0.5, -12, 0.7],
            ];
        }

        wheelPositions.forEach((pos) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.x = Math.PI / 2; // Rotate the wheel to be horizontal
        wheel.position.set(...pos);
        
        this.leg.add(wheel);
        });
    }

    _addFeet() {
    // Criar um pivô para o pé
    const footPivot = new THREE.Object3D();
    
    // Posicionar o pivô no ponto de articulação (tornozelo, por exemplo)
    footPivot.position.set(-1.5, -13.5, -2); // Ajuste conforme necessário
    
    // Criar a geometria e material do pé
    const footGeometry = new THREE.BoxGeometry(3, 2, 3.5);
    const footMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const foot = new THREE.Mesh(footGeometry, footMaterial);
    
    // Posicionar o pé em relação ao pivô (deslocar para baixo para que o pivô esteja na borda superior do pé)
    foot.position.set(0, -1, 0); // Ajuste para que o pé fique abaixo do pivô
    
    // Adicionar o pé ao pivô
    footPivot.add(foot);
    
    // Adicionar o pivô ao this.leg
    this.leg.add(footPivot);
    
    // Guardar o pivô para usar na rotação
    this.footPivot = footPivot;
}

    updateFeet(value) {
        console.log("value", value);
        // const min = Math.PI / 2;
        // const max = 0;

        // const angle = this.footPivot.rotation.z + value;
        // const newAngle = Math.min(Math.max(angle, min), max);
        this.footPivot.rotation.z += value;
    }

    updateLeg(value) {
        const min = Math.PI / 2;
        const max = 0;

        const angle = this.footPivot.rotation.z + value;
        const newAngle = Math.min(Math.max(angle, min), max);
        this.footPivot.rotation.z = newAngle;
    }

}
