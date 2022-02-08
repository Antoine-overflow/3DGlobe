
import {GLTFLoader} from '../module_three/GLTFLoader.js';
import { OrbitControls } from '../module_three/OrbitControls.js';


///////////////////////////////
//// creation de la scene /////
///////////////////////////////

var scene = new THREE.Scene();
scene.background = new THREE.Color( );

//definition of 2 lights 
scene.add(new THREE.AmbientLight(0x333333));
var light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5,3,5);
scene.add(light);

var aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera( 45, aspect, 0.1, 1000 );
camera.position.z = 5;
var renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

///////////////////////////////
//// creation de la Terre /////
///////////////////////////////

var geometry = new THREE.SphereGeometry( 0.5, 64, 64 );
var fond_carte = new THREE.TextureLoader().load( "../images/earth_4k.jpg" );
var texture = new THREE.TextureLoader().load( "../images/bump.jpg" );

var material = new THREE.MeshPhongMaterial( { 
    map: fond_carte,
    shininess: 5,
    bumpMap :  texture,
    bumpScale :0.005,
    side: THREE.DoubleSide,
    specularMap : new THREE.TextureLoader().load('../images/specular.png'),
    specular  : new THREE.Color('grey')
} );

var terre = new THREE.Mesh( geometry, material );
scene.add( terre );

////////////////////////////////////
//// Satellite object creation /////
////////////////////////////////////

var stick = new THREE.Object3D();
var x=0; var y=0; var z=0; // coordinates where the satellite is above
var point = new THREE.Object3D();
point.translateZ(z);

var target = new THREE.Vector3();
point.getWorldPosition(target);

stick.lookAt( target );
terre.add( point ); 
point.add(stick);


///////////////////////////////////////
//// Satellite extrusion from GLTF /////
///////////////////////////////////////

var loader = new GLTFLoader();
loader.load('../satellite/scene.gltf', function (gltf) { 
    var satelliteMesh = gltf.scene.getObjectByName('OSG_Scene');

    var r = 1.065; // Parameter for the distance from the earth >1 for being in the sky
    satelliteMesh.scale.set(0.0001,0.0001,0.0001);
    satelliteMesh.position.set( 0, 0, r ); 
    stick.add( satelliteMesh );   
    stick.rotateZ(0.01);
});


//////////////////////////
//// Trails creation /////
//////////////////////////

function Ktrail(k){
    var res = [];
    for(var i=0; i<k; i++){
        var trail = new THREE.Object3D();
        var op = 1/Math.exp(0.05*i);
        material = new THREE.MeshLambertMaterial({
            color: 0x9900FF,
            transparent: true, 
            opacity: op});
        var trailsGeom =  new THREE.PlaneGeometry( 0.02, 0.35/(k+1)); // Parameters for the size of "trail"
        var trailMesh = new THREE.Mesh( trailsGeom, material );
        var r = 1.065; // Parameter for the distance from the earth >1 for being in the sky
        trailMesh.position.set(0,0.065+(0.25/(k+1))*i,r);
        trail.add(trailMesh);
        res.push(trailMesh);
    }
    return res;
}

var K = 35;
var res = Ktrail(K);
const group = new THREE.Group();
for(var i=0; i<K; i++){group.add(res[i])}
group.add(point);
scene.add(group);

///////////////////////////////
//// creation des Nuages /////
///////////////////////////////


var geometry_cloud = new THREE.SphereGeometry(0.505, 64, 64)
var material_cloud	= new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('../images/cloud_white.png'),
        transparent: true,
        
} )

var clouds = new THREE.Mesh( geometry_cloud, material_cloud );
scene.add( clouds )

///////////////////////////////
// creation de l'atmosphere ///
///////////////////////////////


var customMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: {  },
		vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
		side: THREE.BackSide,
		blending: THREE.AdditiveBlending,
		transparent: true
	}   );
		
var ballGeometry = new THREE.SphereGeometry( 0.6, 50, 50);
var ball = new THREE.Mesh( ballGeometry, customMaterial );
scene.add( ball );


///////////////////////////////
//// creation du Fond  /////
///////////////////////////////

var geometry_fond = new THREE.SphereGeometry(200, 64, 64)
var material_fond = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('../images/etoiles.png'),
    side: THREE.BackSide
})

var fond = new THREE.Mesh( geometry_fond, material_fond);
scene.add( fond )

// to actualize the Frame 
function render() {
    requestAnimationFrame( render);
    terre.rotation.y += 0.001;
    clouds.rotation.y +=0.0015;
   

    var t = 0.0015; // Variation of the satellite     
    group.rotateX(t);
    group.rotateY(0.0001);
    
    renderer.render( scene, camera );
}

// To control the earth 
let controls = new OrbitControls( camera ,renderer.domElement);
controls.enablePan = true;
controls.enableZoom = true;
controls.enableRotate = true;
controls.minDistance = 1
controls.maxDistance = 10
controls.minPolarAngle
controls.maxPolarAngle

render();
