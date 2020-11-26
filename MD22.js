import * as THREE from "./three.js-dev/build/three.module.js";
import { StereoEffect } from "./three.js-dev/examples/jsm/effects/StereoEffect.js";
import { OrbitControls } from './three.js-dev/examples/jsm/controls/OrbitControls.js';
import { VRButton } from "./three.js-dev/examples/jsm/webxr/VRButton.js";
import { XRControllerModelFactory } from "./three.js-dev/examples/jsm/webxr/XRControllerModelFactory.js";
import { GUI } from "./three.js-dev/examples/jsm/libs/dat.gui.module.js";


export function md2() {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		10000
	);
    
	const renderer = new THREE.WebGLRenderer();
	const loader = new THREE.TextureLoader();
	const effect = new StereoEffect(renderer);
	const directional_light = new THREE.DirectionalLight(0xffcc00, 1);

    directional_light.position.set(0, 0, -50);

	let windowHalfX = window.innerWidth / 2;
	let windowHalfY = window.innerHeight / 2;

	let mouseX = 0;
	let mouseY = 0;

	let mesh1;

	const controls = new OrbitControls( camera, renderer.domElement );

	camera.position.set(0, 0, -20);
	controls.update();
	renderer.setSize(window.innerWidth, window.innerHeight);

	//Geometry
	const geometry = new THREE.BoxGeometry();
	const geometry1 = createGeometry();

    //Material
    let uniform = {
		time: { value: 1 }
	};

	const material = new THREE.ShaderMaterial({
		uniforms: uniform,
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragmentShader').textContent
	});

    const material1 = new THREE.MeshBasicMaterial({
		map: loader.load("./texture.jpg"),
		flatShading: true,
		morphTargets: true
	});

	const material2 = new THREE.MeshPhongMaterial({
		color: 0xff2626,
		flatShading: true,
		morphTargets: true
	});

    //Cube
    const cube = new THREE.Mesh(geometry, material);
    const cube1 = new THREE.Mesh(geometry, material1);

	mesh1 = new THREE.Mesh( geometry1, material2 );
	mesh1.position.set(8, 0, 0);
	scene.add( mesh1 );

	let mesh;
	let mesh_arr = [];
	let mesh_arr1 = [];
	
	for (let this_x = 0; this_x < 2; this_x++) {
		for (let this_y = -2; this_y < 2; this_y++) {
			for (let this_z = -2; this_z < 2; this_z++) {
				mesh = cube1.clone();
				mesh.position.set(this_x * 2, this_y * 2, this_z * 2);
				mesh_arr.push(mesh);
				scene.add(mesh);
			}
		}
	}

	for (let this_x = -2; this_x < 0; this_x++) {
		for (let this_y = -2; this_y < 2; this_y++) {
			for (let this_z = -2; this_z < 2; this_z++) {
				mesh = cube.clone();
				mesh.position.set(this_x * 2, this_y * 2, this_z * 2);
				mesh_arr1.push(mesh);
				scene.add(mesh);
			}
		}
	}

	scene.add(directional_light);
	initGUI();

	renderer.setAnimationLoop(function () {
	
		//Rotation
		mesh_arr1.forEach(function (mesh_object) {   
			mesh_object.rotation.y += Math.PI / 180;
			mesh_object.rotation.x += Math.PI / 180;
			mesh_object.rotation.z += Math.PI / 180;
		});

		uniform['time'].value = performance.now() / 1000;

		controls.update();

		effect.render(scene, camera);
	});

	function createGeometry() {
		const geometry1 = new THREE.BoxBufferGeometry( 2, 2, 2, 32, 32, 32 );

		geometry1.morphAttributes.position = [];

		const positions = geometry1.attributes.position.array;
		const spherePositions = [];
		const twistPositions = [];
		const direction = new THREE.Vector3( 1, 0, 0 ).normalize();
		const vertex = new THREE.Vector3();

		for ( let i = 0; i < positions.length; i += 3 ) {
			const x = positions[ i ];
			const y = positions[ i + 1 ];
			const z = positions[ i + 2 ];

			spherePositions.push(
				x * Math.sqrt( 1 - ( y * y / 2 ) - ( z * z / 2 ) + ( y * y * z * z / 3 ) ),
				y * Math.sqrt( 1 - ( z * z / 2 ) - ( x * x / 2 ) + ( z * z * x * x / 3 ) ),
				z * Math.sqrt( 1 - ( x * x / 2 ) - ( y * y / 2 ) + ( x * x * y * y / 3 ) )
			);

			vertex.set( x * 2, y, z );
			vertex.applyAxisAngle( direction, Math.PI * x / 2 ).toArray( twistPositions, twistPositions.length );
		}
		
		geometry1.morphAttributes.position[ 0 ] = new THREE.Float32BufferAttribute( spherePositions, 3 );
		geometry1.morphAttributes.position[ 1 ] = new THREE.Float32BufferAttribute( twistPositions, 3 );

		return geometry1;
	}

	function initGUI() {
		const params = {
			Twist: 0,
		};
		
		const gui = new GUI();
		const folder = gui.addFolder('Morph Targets');

		folder.add( params, 'Twist', 0, 1 ).step( 0.01 ).onChange( function ( value ) {
			mesh1.morphTargetInfluences[ 1 ] = value;
		});

		folder.open();
	}

	document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));
}
