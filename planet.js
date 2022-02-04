var scene = new THREE.Scene();
scene.background = new THREE.Color(  );

const light = new THREE.PointLight(0xffffff, 2)
light.position.set(10, 10, 10)
scene.add(light)

var aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera( 75, aspect, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.SphereGeometry( 1, 32, 32 );

var fond_carte = new THREE.TextureLoader().load( "planete.jpg" );
var texture = new THREE.TextureLoader().load( "texture.jpg" );



var material = new THREE.MeshPhongMaterial( { 
    map: fond_carte,
    bumpMap :  texture,
    bumpScale :0.05,
    side: THREE.DoubleSide,
    //specularMap : new THREE.TextureLoader().load('lightness.jpg'),
    //specular  : new THREE.Color('grey')
} );


var terre = new THREE.Mesh( geometry, material );
scene.add( terre );

material = new THREE.MeshLambertMaterial({
    color: 0x0992299});

var stick = new THREE.Object3D();
var point = new THREE.Vector3( 1, 1, 1 );
stick.lookAt( point );
terre.add( stick );

var geometrySat = new THREE.BoxGeometry( 0.11, 0.18, 0.06); // Parameters for the size of "satellite"
var mesh = new THREE.Mesh( geometrySat, material );
var r = 3; // Parameter for the distance from the earth
mesh.position.set( 0, 0, r ); 
stick.add( mesh );    

camera.position.z = 5;
let controls = new THREE.OrbitControls( camera ,renderer.domElement);

function render() {
    requestAnimationFrame( render);
    terre.rotation.y += 0.001;
    controls.update();
    renderer.render( scene, camera );
}

controls.enablePan = true;
controls.enableZoom = true;
controls.enableRotate = true;
controls.minDistance
controls.maxDistance
controls.minPolarAngle
controls.maxPolarAngle


render();
