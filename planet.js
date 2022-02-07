import {GLTFLoader} from '/GLTFLoader.js';
import { OrbitControls } from './OrbitControls.js';

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
camera.position.z = 1.5;
var renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

///////////////////////////////
//// creation de la Terre /////
///////////////////////////////

var geometry = new THREE.SphereGeometry( 0.5, 32, 32 );
var fond_carte = new THREE.TextureLoader().load( "earth_4k.jpg" );
var texture = new THREE.TextureLoader().load( "bump.jpg" );



var material = new THREE.MeshPhongMaterial( { 
    map: fond_carte,
    shininess: 5,
    // emissive: new THREE.Color('blue'), //For the blue color of earth
    bumpMap :  texture,
    bumpScale :0.005,
    side: THREE.DoubleSide,
    specularMap : new THREE.TextureLoader().load('specular.png'),
    specular  : new THREE.Color('grey')
} );

var terre = new THREE.Mesh( geometry, material );

scene.add( terre );

material = new THREE.MeshLambertMaterial({
    color: 0x0992299});

var stick = new THREE.Object3D();

var x=0; var y=0; var z=0; // coordinates where the satellite is above
var point = new THREE.Object3D();
point.translateZ(z);

var target = new THREE.Vector3();
point.getWorldPosition(target);

stick.lookAt( target );
terre.add( point );

// console.log(target);
// scene.add(trail);

// var geometrySat = new THREE.BoxGeometry( 0.11, 0.18, 0.06); // Parameters for the size of "satellite"
// var mesh = new THREE.Mesh( geometrySat, material );

var loader = new GLTFLoader();
loader.load('./satellite/scene.gltf', function (gltf) { 
    // console.log(gltf.scene);
    var satelliteMesh = gltf.scene.getObjectByName('OSG_Scene');
    // console.log(satelliteMesh);
    // satelliteGeometry = new THREE.InstancedBufferGeometry(); 
    // THREE.BufferGeometry.prototype.copy.call(satelliteGeometry, _satelitteMesh.geometry);

    var r = 1.155; // Parameter for the distance from the earth >1 for being in the sky
    satelliteMesh.scale.set(0.0001,0.0001,0.0001);
    satelliteMesh.position.set( 0, 0, r ); 
    stick.add( satelliteMesh );   
});

function Ktrail(k){
    var res = [];
    for(var i=0; i<k; i++){
        var trail = new THREE.Object3D();
        var op = 0.05 + 0.75/(i+1);
        material = new THREE.MeshLambertMaterial({
            color: 0x3794cf,
            transparent: true, 
            opacity: op});
        var trailsGeom =  new THREE.PlaneGeometry( 0.1, 0.25/(k+1)); // Parameters for the size of "trail"
        var trailMesh = new THREE.Mesh( trailsGeom, material );
        var r = 1.155; // Parameter for the distance from the earth >1 for being in the sky
        trailMesh.position.set(0,0.155*(i+1),r);
        trail.add(trailMesh);

        // console.log(target);
        trail.lookAt( target );
        res.push(trailMesh);
        terre.add(trail);
    }
    return res;
}

var trail = new THREE.Object3D();
material = new THREE.MeshLambertMaterial({
    color: 0x0902009});
var trailsGeom =  new THREE.PlaneGeometry( 0.11, 0.18); // Parameters for the size of "trail"
var trailMesh = new THREE.Mesh( trailsGeom, material );
var r = 1.155; // Parameter for the distance from the earth >1 for being in the sky
trailMesh.position.set(0,0.155,r);
trail.add(trailMesh);


trail.lookAt( target );
terre.add(trail);
 
point.add(stick);

// createTrail(stick, 80, 0.8, 18, scene );

camera.position.z = 5;

///////////////////////////////
//// creation des Nuages /////
///////////////////////////////


var geometry_cloud = new THREE.SphereGeometry(0.505, 32, 32)
var material_cloud	= new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('cloud_white.png'),
        transparent: true,
        
} )

var clouds = new THREE.Mesh( geometry_cloud, material_cloud );
scene.add( clouds )



///////////////////////////////
//// creation du Fond  /////
///////////////////////////////

var geometry_fond = new THREE.SphereGeometry(90, 64, 64)
var material_fond = new THREE.MeshBasicMaterial({
    color:  new THREE.Color('black'),

    side: THREE.BackSide
})

var fond = new THREE.Mesh( geometry_fond, material_fond);
scene.add( fond )


var K = 8;
var res = Ktrail(K);

// to actualize the Frame 
function render() {
    requestAnimationFrame( render);
    terre.rotation.y += 0.001;
    clouds.rotation.y +=0.0015;
    clouds.rotation.x +=0.0001;

    var t = 0.0015; // Variation of the satellite 
    point.rotateX(t);
    point.rotateY(0.0001);
    
    // console.log(point.rotation);
    // point.rotateZ(t);
    // updateTrails();

    // console.log(res);
    for(var i=0; i<K; i++){
        res[i].rotateX(t);
        res[i].rotateY(0.0001);
    }

    trail.rotateX(t);
    trail.rotateY(0.0001);

    renderer.render( scene, camera );
}

// To control the earth 
let controls = new OrbitControls( camera ,renderer.domElement);
controls.enablePan = true;
controls.enableZoom = true;
controls.enableRotate = true;
controls.minDistance
controls.maxDistance
controls.minPolarAngle
controls.maxPolarAngle

render();
