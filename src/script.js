import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Timer } from 'three/addons/misc/Timer.js'
import GUI from 'lil-gui'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { Sky } from 'three/addons/objects/Sky.js'


/**
 * Base
 */
// Debug
const gui = new GUI()
gui.hide()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const textureLoader = new THREE.TextureLoader();

const floorAlphaTexture = textureLoader.load('./floor/alpha.jpg');

const floorColorTexture = textureLoader.load('./floor/concrete/concrete_diff.jpg');
floorColorTexture.repeat.set(8, 8);
floorColorTexture.wrapS = THREE.RepeatWrapping;
floorColorTexture.wrapT = THREE.RepeatWrapping;
floorColorTexture.colorSpace = THREE.SRGBColorSpace;

const floorARMTexture = textureLoader.load('./floor/concrete/concrete_arm.jpg');
floorARMTexture.repeat.set(8, 8);
floorARMTexture.wrapS = THREE.RepeatWrapping;
floorARMTexture.wrapT = THREE.RepeatWrapping;

const floorNormalTexture = textureLoader.load('./floor/concrete/concrete_nor_gl.jpg');
floorNormalTexture.repeat.set(8, 8);
floorNormalTexture.wrapS = THREE.RepeatWrapping;
floorNormalTexture.wrapT = THREE.RepeatWrapping;

const floorDisplacementTexture = textureLoader.load('./floor/concrete/concrete_disp.jpg');
floorDisplacementTexture.repeat.set(8, 8);
floorDisplacementTexture.wrapS = THREE.RepeatWrapping;
floorDisplacementTexture.wrapT = THREE.RepeatWrapping;

const barrelColorTexture = textureLoader.load('./barrel/green_metal_diff.jpg');
barrelColorTexture.colorSpace = THREE.SRGBColorSpace;
const barrelARMTexture = textureLoader.load('./barrel/green_metal_arm.jpg');
const barrelNormalTexture = textureLoader.load('./barrel/green_metal_nor_gl.jpg');

const stageColorTexture = textureLoader.load('./stage/metal_plate_diff.jpg');
stageColorTexture.colorSpace = THREE.SRGBColorSpace;
stageColorTexture.wrapS = THREE.RepeatWrapping;
stageColorTexture.repeat.set(3, 1);
const stageARMTexture = textureLoader.load('./stage/metal_plate_arm.jpg');
stageARMTexture.wrapS = THREE.RepeatWrapping;
stageARMTexture.repeat.set(3, 1);
const stageNormalTexture = textureLoader.load('./stage/metal_plate_nor_gl.jpg');
stageNormalTexture.wrapS = THREE.RepeatWrapping;
stageNormalTexture.repeat.set(3, 1);

const tableColorTexture = textureLoader.load('./table/rusty_metal_diff.jpg');
tableColorTexture.colorSpace = THREE.SRGBColorSpace;
const tableARMTexture = textureLoader.load('./table/rusty_metal_arm.jpg');
const tableNormalTexture = textureLoader.load('./table/rusty_metal_nor_gl.jpg');

const matcapTexture = textureLoader.load('./matcap/2.png');
matcapTexture.colorSpace = THREE.SRGBColorSpace;

// Text
const fontLoader = new FontLoader()
fontLoader.load('fonts/helvetiker_regular.typeface.json', (font) => {
    const textGeometry = new TextGeometry('ocular.fm', {
            font,
            size: 0.5,
            depth: 0.2,
            curveSegments: 1,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelOffset: 0,
            bevelSegments: 1
        }
    );

    textGeometry.center();
    const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
    const text = new THREE.Mesh(textGeometry, material);
    text.position.set(0, 2, -4);
    scene.add(text);
});

/**
 * Objects
 */

// Floor

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 100, 100),
    new THREE.MeshStandardMaterial( {
        transparent: true,
        alphaMap: floorAlphaTexture,
        map: floorColorTexture,
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        normalMap: floorNormalTexture,
        displacementMap: floorDisplacementTexture,
        displacementScale: 0.03,
        displacementBias: -0.2,
    })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5; // flat floor
scene.add(floor);

const floorDebug = gui.addFolder('Floor');
floorDebug.add(floor.material, 'displacementScale').min(0).max(1).step(0.01);

const stage = new THREE.Group();
stage.position.y = -0.125;
scene.add(stage);

const stageFloor = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.25, 4),
    new THREE.MeshStandardMaterial( {
        map: stageColorTexture,
        aoMap: stageARMTexture,
        roughnessMap: stageARMTexture,
        metalnessMap: stageARMTexture,
        normalMap: stageNormalTexture,
    })
)
stageFloor.receiveShadow = true;
stage.add(stageFloor);

const stageFloorDebug = gui.addFolder('Stage Floor');

const table = new THREE.Group()
stage.add(table)
const tableDebug = gui.addFolder('Table');
tableDebug.add(table.position, 'x', -5, 5)
tableDebug.add(table.position, 'y', -5, 5)
tableDebug.add(table.position, 'z', -5, 5)

const tableSurface = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.125, 1),
    new THREE.MeshStandardMaterial({
        map: tableColorTexture,
        aoMap: tableARMTexture,
        roughnessMap: tableARMTexture,
        metalnessMap: tableARMTexture,
        normalMap: tableNormalTexture,
    })
)

tableSurface.position.y += 1;
tableSurface.castShadow = true;
table.add(tableSurface)

const legPositions = [
    [-0.75+(0.125/2), 0.5, -0.5+(0.125/2)],
    [-0.75+(0.125/2), 0.5, 0.5-(0.125/2)],
    [0.75-(0.125/2), 0.5, -0.5-(-0.125/2)],
    [0.75-(0.125/2), 0.5, 0.5-(0.125/2)]
];

const legGeometry = new THREE.BoxGeometry(0.125, 1-0.125, 0.125);
const legMaterial = new THREE.MeshStandardMaterial({
    map: tableColorTexture,
    aoMap: tableARMTexture,
    roughnessMap: tableARMTexture,
    metalnessMap: tableARMTexture,
    normalMap: tableNormalTexture,
});

for(let i = 0; i < 4; i++)
{
    const tableLeg = new THREE.Mesh(
        legGeometry,
        legMaterial
    )
    tableLeg.position.x += legPositions[i][0];
    tableLeg.position.y += legPositions[i][1];
    tableLeg.position.z += legPositions[i][2];
    tableLeg.castShadow = true;
    table.add(tableLeg);
}

const barrelGeometry = new THREE.CylinderGeometry(0.3,0.3,0.9,32);
const barrelMaterial = new THREE.MeshStandardMaterial( {
    map: barrelColorTexture,
    aoMap: barrelARMTexture,
    roughnessMap: barrelARMTexture,
    metalnessMap: barrelARMTexture,
    normalMap: barrelNormalTexture,
});

const barrels = new THREE.Group();
scene.add(barrels);

for(let i = 0; i < 15; i++)
{
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 4;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const barrel = new THREE.Mesh(
        barrelGeometry,
        barrelMaterial
    )
    barrel.position.set(x, 0.25, z)

    barrels.add(barrel);
}

const djSetup = new THREE.Group();
scene.add(djSetup);

const djControllerGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.6);
const djControllerMaterial = new THREE.MeshStandardMaterial({
    color: '#000',
});

const djControllerLeft = new THREE.Mesh(
    djControllerGeometry,
    djControllerMaterial
)
djControllerLeft.position.set(-0.5, 1, 0)
djSetup.add(djControllerLeft);

const djControllerWheelLeft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.15, 32),
    new THREE.MeshStandardMaterial({
        color: '#3e3e3e',
    })
)
djControllerWheelLeft.position.set(-0.5, 1, 0)
djSetup.add(djControllerWheelLeft);

const djControllerWheelRight = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.15, 32),
    new THREE.MeshStandardMaterial({
        color: '#3e3e3e',
    })
)
djControllerWheelRight.position.set(0.5, 1, 0)
djSetup.add(djControllerWheelRight);

const djControllerRight = new THREE.Mesh(
    djControllerGeometry,
    djControllerMaterial
)
djControllerRight.position.set(0.5, 1, 0)
djSetup.add(djControllerRight);

const djMixerGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.4);
const djMixerMaterial = new THREE.MeshStandardMaterial({
    color: '#000',
});

const djMixer = new THREE.Mesh(
    djMixerGeometry,
    djMixerMaterial
)
djMixer.position.set(0, 1, 0)
djSetup.add(djMixer);

const speakerBoxGeometry = new THREE.BoxGeometry(0.5, 0.75, 0.3);
const speakerBoxMaterial = new THREE.MeshStandardMaterial({
    color: '#000',
});

const speakerStandGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.25, 32);
const speakerStandMaterial = new THREE.MeshStandardMaterial({
    color: '#000',
})

const speakerLeft = new THREE.Group();
stage.add(speakerLeft);

const speakerLeftBox = new THREE.Mesh(
    speakerBoxGeometry,
    speakerBoxMaterial
)
speakerLeftBox.position.set(-1.25, 1.5, 1.25)
speakerLeftBox.rotation.y = Math.PI * 0.75;
speakerLeftBox.castShadow = true;
speakerLeft.add(speakerLeftBox);

const speakerLeftStand = new THREE.Mesh(
    speakerStandGeometry,
    speakerStandMaterial
);
speakerLeftStand.position.set(-1.25, 0.5, 1.25)
speakerLeftStand.castShadow = true;
speakerLeft.add(speakerLeftStand);

const speakerRight = new THREE.Group();
stage.add(speakerRight);

const speakerRightBox = new THREE.Mesh(
    speakerBoxGeometry,
    speakerBoxMaterial
)
speakerRightBox.castShadow = true;
speakerRightBox.position.set(1.25, 1.5, 1.25)
speakerRightBox.rotation.y = -Math.PI * 0.75;
speakerRight.add(speakerRightBox);

const speakerRightStand = new THREE.Mesh(
    speakerStandGeometry,
    speakerStandMaterial
);
speakerRightStand.castShadow = true;
speakerRightStand.position.set(1.25, 0.5, 1.25)
speakerRight.add(speakerRightStand);



/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0x444444)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#ff0000', 0.2)
directionalLight.position.set(3, 2, -8)
//directionalLight.castShadow = true;
scene.add(directionalLight)

const spotLight1 = new THREE.SpotLight('#ff0000', 10)
spotLight1.castShadow = true;
spotLight1.angle = 0.3;
spotLight1.penumbra = 0.2;
spotLight1.decay = 2;
spotLight1.distance = 50;
spotLight1.position.set(2, 3, 2)
scene.add(spotLight1)
scene.add(spotLight1.target)

const spotLight2 = new THREE.SpotLight('#00ff00', 10)
spotLight2.castShadow = true;
spotLight2.angle = 0.3;
spotLight2.penumbra = 0.2;
spotLight2.decay = 2;
spotLight2.distance = 50;
spotLight2.position.set(-2, 3, 2)
scene.add(spotLight2)
scene.add(spotLight2.target)

const spotLight3 = new THREE.SpotLight('#0000ff', 10)
spotLight3.castShadow = true;
spotLight3.angle = 0.3;
spotLight3.penumbra = 0.2;
spotLight3.decay = 2;
spotLight3.distance = 50;
spotLight3.position.set(0, 3, -2)
scene.add(spotLight3)
scene.add(spotLight3.target)

const spotLightDebug = gui.addFolder('Spot Light');
spotLightDebug.add(spotLight1, 'intensity').min(0).max(10).step(0.01);
spotLightDebug.add(spotLight1.position, 'x', -10, 10)
spotLightDebug.add(spotLight1.position, 'y', -10, 10)
spotLightDebug.add(spotLight1.position, 'z', -10, 10)
spotLightDebug.add(spotLight1, 'angle').min(0).max(Math.PI*2).step(0.01)
spotLightDebug.add(spotLight1, 'penumbra').min(0).max(1).step(0.01);
spotLightDebug.add(spotLight1, 'decay').min(0).max(10).step(0.01);
spotLightDebug.add(spotLight1, 'distance').min(0).max(10).step(0.01);

const spotLight1Helper = new THREE.SpotLightHelper(spotLight1)
//scene.add(spotLight1Helper)
const spotLight2Helper = new THREE.SpotLightHelper(spotLight2)
//scene.add(spotLight2Helper)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 2.5
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

const sky = new Sky()
sky.scale.set(100,100,100)
//scene.add(sky)
sky.material.uniforms['turbidity'].value = 10
sky.material.uniforms['rayleigh'].value = 3
sky.material.uniforms['mieCoefficient'].value = 0.1
sky.material.uniforms['mieDirectionalG'].value = 0.95
sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95)

scene.fog = new THREE.FogExp2('#1e233c', 0.1)


/**
 * Animate
 */
const timer = new Timer()

const tick = () =>
{
    // Timer
    timer.update()
    const elapsedTime = timer.getElapsed()

    // Update controls
    controls.update()

    spotLight1.target.position.x = -Math.cos(elapsedTime * 3)
    spotLight1.target.position.z = -Math.sin(elapsedTime * 3)
    spotLight1Helper.update()

    spotLight2.target.position.x = Math.cos(elapsedTime * 4)
    spotLight2.target.position.z = Math.sin(elapsedTime * 2)
    spotLight2Helper.update()

    spotLight3.target.position.x = -Math.cos(elapsedTime * 2)
    spotLight3.target.position.z = Math.sin(elapsedTime * 4)

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()