* [X] Create a Three.js application for a rural landscape scene with an alien spaceship
* [X] Generate procedural textures for a floral field and a terrain
* [ ] Model a typically Alentejano house using geometric primitives (cubes, cylinders, etc.) and polygon meshes
* [X] Model a tree using geometric primitives and polygon meshes
* [X] Model an Alentejano montado landscape using geometric primitives and polygon meshes
* [ ] Apply textures to all scene objects that react to lighting
* [ ] Implement a UFO orbiting the scene with:
  * [X] A flattened sphere for the UFO body
  * [X] A spherical cap for the cockpit
  * [X] Multiple small spheres radially placed at the bottom
  * [X] A flattened cylinder at the center of the bottom
  * [ ] Point lights anchored to each small sphere, toggled with 'P' or 'p'
  * [X] Spotlight anchored to the cylinder, pointing downward, toggled with 'S' or 's'
  * [X] Constant angular rotation around its symmetry axis
  * [X] Horizontal movement controlled by arrow keys (up, down, left, right), supporting simultaneous key presses
* [ ] Define three material types for each scene object:
  * [ ] MeshLambertMaterial (Gouraud shading), toggled with 'Q' or 'q'
  * [ ] MeshPhongMaterial (Phong shading), toggled with 'W' or 'w'
  * [ ] MeshToonMaterial (Cartoon shading), toggled with 'E' or 'e'
  * [ ] Toggle lighting calculations with 'R' or 'r'
* [ ] Implement a fixed perspective camera with a view of the entire scene, selectable with '7'
* [ ] Add a THREE.StereoCamera for VR support, following Three.js VR documentation
* [X] Handle window resize events appropriately
