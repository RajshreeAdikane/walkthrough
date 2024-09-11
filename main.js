import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Scene setup
const scene = new THREE.Scene();
// scene.fog = new THREE.FogExp2(0xFFFFC5, 0.4)
const fogColor = new THREE.Color('0xFFFFC5'); // Fog color
const fogNear = 1000;  // Start distance
const fogFar = 5000;   // End distance (increased to see more of the model)
scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// General ambient lighting (lower intensity for a darker environment)
const ambientLight = new THREE.AmbientLight(0x404040, 0.2); // Darker ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Increased intensity
directionalLight.position.set(10, 10, 10).normalize();
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 2, 100); // Increased intensity
pointLight.position.set(5, 10, 5);
scene.add(pointLight);

const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);
scene.add(hemisphereLight); 

// Lighting inside the model
let roomBoundingBox;

// Load the castle room model using DRACOLoader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load('./public/assets/the_king_s_hall/scene.gltf', function (gltf) {
    const room = gltf.scene;
    scene.add(room);

    // Calculate the bounding box of the room
    const box = new THREE.Box3().setFromObject(room);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const size = new THREE.Vector3();
    box.getSize(size); 
    roomBoundingBox = box;

    camera.position.set(center.x, center.y, center.z + 5);
    camera.lookAt(center);

    room.traverse(function (child) {
        // Find a specific object by name
        if (child.isMesh) {
            // console.log('Found the object:', child);
            // console.log(child.name);
    
            // Manipulate the object if needed (position, rotation, scale)
            // child.position.set(0, 2, 0);
            // child.rotation.set(0, Math.PI / 2, 0);
            // child.scale.set(1.5, 1.5, 1.5);
    
            // Change material color
            // child.material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    
            // Create a point light to simulate a lamp effect
            const lampLight = new THREE.PointLight(0xffffff, 1, 50);  // Color, Intensity, Distance
            lampLight.position.set(child.position.x, child.position.y + 2, child.position.z);  // Slightly above the object
    
            // Enable shadows for the light
            lampLight.castShadow = true;
            lampLight.shadow.mapSize.width = 1024;
            lampLight.shadow.mapSize.height = 1024;
            lampLight.shadow.camera.near = 0.5;
            lampLight.shadow.camera.far = 50;
    
            // Add the light to the scene
            // scene.add(lampLight);
    
            // Optional: Add a helper to visualize the light (remove later if not needed)
            const lightHelper = new THREE.PointLightHelper(lampLight);
            scene.add(lightHelper);
        }
    });
    
    // Enable shadow in renderer
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;  // Optional: Use soft shadows
    
    // Ensure the object itself receives and casts shadows
    room.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;  // Make the object cast shadows
            child.receiveShadow = true;  // Make the object receive shadows
        }
    });
    
// console.log(room.traverse.child,, "model")
    

    const roomCenter = new THREE.Vector3();
    new THREE.Box3().setFromObject(room).getCenter(roomCenter);

    // Add lights inside the room at different positions
    const light1 = new THREE.PointLight(0xffffff, 1, 10);  // Bright, small area light
    light1.position.set(center.x + 2, center.y + 2, center.z);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xffd700, 0.5, 20);  // Slightly dimmer warm light
    light2.position.set(center.x - 3, center.y - 1, center.z - 5);
    scene.add(light2);

    const light3 = new THREE.SpotLight(0xffffff, 0.8);  // Spotlight from above
    light3.position.set(center.x, center.y + 5, center.z);
    light3.target = room;  // Make the spotlight point towards the center of the room
    scene.add(light3);

    // Hide the loading screen
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'none';
},
function (xhr) {
    const progress = (xhr.loaded / xhr.total) * 100;
    const loadingProgress = document.getElementById('loading-progress');
    loadingProgress.textContent = Math.round(progress) + '%';
},
function (error) {
    console.error('An error happened:', error);
});

// Movement variables
const moveSpeed = 0.1;
const turnSpeed = 0.05;
const keyboard = {};

// Handle controls
function handleControls() {
    if (keyboard[87]) { // W key
        camera.position.x -= Math.sin(camera.rotation.y) * moveSpeed;
        camera.position.z -= Math.cos(camera.rotation.y) * moveSpeed;
    }
    if (keyboard[83]) { // S key
        camera.position.x += Math.sin(camera.rotation.y) * moveSpeed;
        camera.position.z += Math.cos(camera.rotation.y) * moveSpeed;
    }
    if (keyboard[65]) { // A key
        camera.position.x += Math.sin(camera.rotation.y + Math.PI / 2) * moveSpeed;
        camera.position.z += Math.cos(camera.rotation.y + Math.PI / 2) * moveSpeed;
    }
    if (keyboard[68]) { // D key
        camera.position.x += Math.sin(camera.rotation.y - Math.PI / 2) * moveSpeed;
        camera.position.z += Math.cos(camera.rotation.y - Math.PI / 2) * moveSpeed;
    }
    if (keyboard[37]) { // Left arrow key
        camera.rotation.y -= turnSpeed;
    }
    if (keyboard[39]) { // Right arrow key
        camera.rotation.y += turnSpeed;
    }

    if (roomBoundingBox) {
        const cameraPosition = camera.position.clone();
        cameraPosition.x = THREE.MathUtils.clamp(cameraPosition.x, roomBoundingBox.min.x, roomBoundingBox.max.x);
        cameraPosition.y = THREE.MathUtils.clamp(cameraPosition.y, roomBoundingBox.min.y, roomBoundingBox.max.y);
        cameraPosition.z = THREE.MathUtils.clamp(cameraPosition.z, roomBoundingBox.min.z, roomBoundingBox.max.z);
        camera.position.copy(cameraPosition);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    handleControls();
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', function () {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Handle keyboard input
window.addEventListener('keydown', function (e) {
    keyboard[e.keyCode] = true;
});
window.addEventListener('keyup', function (e) {
    keyboard[e.keyCode] = false;
});
