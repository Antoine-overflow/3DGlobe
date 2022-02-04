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
    emissive: new THREE.Color('blue'),
    bumpMap :  texture,
    bumpScale :0.005,
    side: THREE.DoubleSide,
    specularMap : new THREE.TextureLoader().load('specular.png'),
    specular  : new THREE.Color('grey')
} );

var terre = new THREE.Mesh( geometry, material );
scene.add( terre )


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


// to actualize the Frame 
function render() {
    requestAnimationFrame( render);
    terre.rotation.y += 0.001;
    clouds.rotation.y +=0.0015;
    clouds.rotation.x +=0.0001;
    
    controls.update();
    renderer.render( scene, camera );
}

// To control the earth 
let controls = new THREE.OrbitControls( camera ,renderer.domElement);
controls.enablePan = true;
controls.enableZoom = true;
controls.enableRotate = true;
controls.minDistance
controls.maxDistance
controls.minPolarAngle
controls.maxPolarAngle


render();
