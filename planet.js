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

var geometry = new THREE.SphereGeometry( 1, 64, 32 );

var fond_carte = new THREE.TextureLoader().load( "planete.jpg" );
var texture = new THREE.TextureLoader().load( "texture.jpg" );



var material = new THREE.MeshPhongMaterial( { 
    map: fond_carte,
    bumpMap :  texture,
    bumpScale :0.05,
    side: THREE.DoubleSide,
    wireframe: false
    //specularMap : new THREE.TextureLoader().load('lightness.jpg'),
    //specular  : new THREE.Color('grey')
} );


var terre = new THREE.Mesh( geometry, material );
scene.add( terre );

material = new THREE.MeshLambertMaterial({
    color: 0x0992299});

var stick = new THREE.Object3D();

var x=0; var y=0; var z=1; // coordinates where the satellite is above
var point = new THREE.Object3D();
point.translateZ(z);

var target = new THREE.Vector3();
point.getWorldPosition(target);

stick.lookAt( target );
terre.add( point );

var geometrySat = new THREE.BoxGeometry( 0.11, 0.18, 0.06); // Parameters for the size of "satellite"
var mesh = new THREE.Mesh( geometrySat, material );
var r = 1.5; // Parameter for the distance from the earth >1 for being in the sky
mesh.position.set( 0, 0, r ); 
stick.add( mesh );    
point.add(stick);

createTrail(stick, 80, 0.8, 18, scene );

camera.position.z = 5;
let controls = new THREE.OrbitControls( camera ,renderer.domElement);

function render() {
    requestAnimationFrame( render);
    terre.rotation.y += 0.001;

    var t = 0.005; // Variation of the satellite 
    point.rotateX(t);
    point.rotateY(t);
    // point.rotateZ(t);
    updateTrails();
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
