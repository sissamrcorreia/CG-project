# CG-project
Project of Computer Graphics

Interactive 3D scenes developed with Three.js.

## 📐 WorkA: Planning Phase
**Objective**: Design blueprints for subsequent 3D modeling tasks.  
**Key Tasks**:
- Hand-drawn sketches of scenes (WorkB/WorkC) with composition overviews
- Technical drawings with annotated dimensions (canonical views)
- Scene graphs for articulated objects (transform hierarchies, primitives)  
**Deliverables**: 6 sketch sets (2 scenes × [composition + dimensions + graphs])  
**Concepts**: Spatial reasoning, transformation pipelines, low-poly modeling prep

## 🤖 WorkB: Robot-Truck Transformer
**Objective**: Implement interactive scene with kinematics and collisions.  
**Features**:
- **Modeling**: Low-poly robot/truck hybrid + trailer (cylinders, cubes, cones)
- **Interaction**:
  - 4 camera views (ortho/perspective) via keys `1-4`
  - Transformation controls (θ₁: feet, θ₂: waist, δ₁: arms, θ₃: head)
- **Systems**:
  - Custom AABB collision detection
  - Update/display cycle architecture  
**Constraints**: Manual physics/collisions (no external libraries)

## 🌌 WorkC: Alentejo Scene with VR
**Objective**: Advanced scene with PBR materials and stereoscopy.  
**Features**:
- **Environment**:
  - Procedural textures (floral field, starry sky)
  - Heightmap terrain + instanced cork trees
  - UFO with emissive/spotlight effects (orbital path)
- **Rendering**:
  - 3 material types (Lambert/Phong/Toon)
  - Stereoscopic camera (WebXR/VR support)
- **Controls**:
  - Key toggles: lights (`D/P/S`), shading modes (`Q/W/E`)
  - UFO navigation (arrow keys + auto-rotation)  
**Tech Stack**: Three.js, WebGL 2.0, GLSL-compatible shaders
