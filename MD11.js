import * as THREE from "./three.js-dev/build/three.module.js";
import { GUI } from "./three.js-dev/examples/jsm/libs/dat.gui.module.js";

export function md1() {
	const gui_container = new GUI();
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		10000
	);

	const uniforms = {
		u_mouse: { value: { x: window.innerWidth / 2, y: window.innerHeight / 2 } },
		u_resolution: { value: { x: window.innerWidth, y: window.innerHeight } },
		u_time: { value: 0.0 },
		u_color: { value: new THREE.Color(0xFF0000) }
	}
  
	const renderer = new THREE.WebGLRenderer();
	const loader = new THREE.TextureLoader();
    const directional_light = new THREE.DirectionalLight(0xffcc00, 1);

    directional_light.position.set(0, 0, 10);
	camera.position.set(0, 0, 25);

	//Geometry
	const geometry = new THREE.BoxGeometry();

    //Material
    let uniform = {
		time: { value: 1 }
	};

	const material = new THREE.ShaderMaterial({
		uniforms: uniform,
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragmentShader').textContent
	});

    const material1 = new THREE.MeshPhongMaterial({
		color: 0xff0022,
    });

    //Cube
    const cube = new THREE.Mesh(geometry, material);
    const cube1 = new THREE.Mesh(geometry, material1);

	let mesh;
	let mesh_arr = [];
	
	for (let this_x = -5; this_x < 5; this_x++) {
		for (let this_y = -5; this_y < 5; this_y++) {
			for (let this_z = -5; this_z < 5; this_z++) {

					if (Math.random() < 0.5) {
                    mesh = cube.clone();
                } else {
                    mesh = cube1.clone();
                }
				
				mesh.position.set(this_x * 2, this_y * 2, this_z * 2);
				mesh_arr.push(mesh);
				scene.add(mesh);
			}
		}
	}

    scene.add(directional_light);

	renderer.setSize(window.innerWidth, window.innerHeight);
	
	let params = {
        zoom: 25,
    };

    gui_container.add(params, 'zoom', 0, 100).step(1).onChange(function (value) {
        camera.position.z = value;
    });
		
	renderer.setAnimationLoop(function () {
		let rotation_speed = Date.now() * 0.00030;

        camera.position.x = Math.cos(rotation_speed) * 10;
        camera.lookAt(scene.position);

        directional_light.position.x = Math.cos(rotation_speed) * 10;
        directional_light.position.z = Math.sin(rotation_speed) * 10;
        directional_light.lookAt(scene.position);
	
		//Rotation
		mesh_arr.forEach(function (mesh_object) {   
			mesh_object.rotation.y += Math.PI / 180;
			mesh_object.rotation.x += Math.PI / 180;
			mesh_object.rotation.z += Math.PI / 180;
		});

		renderer.render(scene, camera);
	});

  document.body.appendChild(renderer.domElement);
}
