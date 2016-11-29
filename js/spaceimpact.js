/*global THREE*/

//open /Applications/Google\ Chrome.app --args --allow-file-access-from-files

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////VARIABLES////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

var camera = [], activeCamera, scene, HUDCamera, renderer;

var geometry, mesh;

var cube;

var windowWidth  = window.innerWidth;           //Window width
var windowHeight = window.innerHeight;          //Window height
var aspect_ratio = windowWidth / windowHeight;  //Window aspect ratio

var axisHelper = new THREE.AxisHelper(10);

var spaceship;

var clock = new THREE.Clock();

var accelerationFlag = 0;  //1 if the aceleration is positive, -1 if negative, 0 if null

var acceleration = 10;  //acceleration applied to the spaceship when moving in a direction

var velocity = 0;  //spaceship's velocity

var maxSpeed = 5;  //spaceship's maximum speed

var bulletSpeed = 20;  //spaceship's shot speed

var alienSpeed = 10;  //alien's moving speed

var pixSize = 1;  //proportion of the game's objects, increasing will increase every object's size

var boardLimit = 50 * pixSize;  //board size

var bullets = [];  //bullets array

var aliens = [];  //aliens array

var walls = [];  //walls array

var sun;  //directional light

var stars = [];  //array of pointlights

var spotlight;  //spaceship's light

var shading = 0;  //0 means Gourand, 1 means Phong

var basic = 0; //0 means lighting is off

var pause = 0; //0 means the game is not paused, 1 means it is paused

var aliensKilled = 0;  //number of aliens killed during the game

var lives = [];  //number of lives remaining

var res = 0;  //flag restart

var end = 0;  //flag end game

var loader = new THREE.TextureLoader();  //texture loader

var gameOverMess;  //Game Over object to add texture with the message

var pauseMess;  //Pause object to add texture with the message

var victoryMess;  //Victory object to add texture with the message


//////////////////////////////////////VIEWS//////////////////////////////////////////////////////////////
var views = [{ left: 0, bottom: 0, width: 1, height: 1, background: new THREE.Color(0xffffff, 0) },
             { left: 0, bottom: 0, width: 1, height: 1, background: new THREE.Color(0xffffff, 0) }
            ];

//////////////////////////////////////MATERIALS//////////////////////////////////////////////////////////
var boardMaterialBasic = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false });
var boardMaterial = boardMaterialBasic;

//var invisibleMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, wireframe: false, //transparent: true, opacity: 0 });

var spaceshipMaterialBasic = new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: false});
var spaceshipMaterial = spaceshipMaterialBasic;

var bulletMaterialBasic = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false});
var bulletMaterial = bulletMaterialBasic;

var alienMaterialBasic = new THREE.MeshBasicMaterial({ color: 0x006f00, wireframe: false});
var alienMaterial = alienMaterialBasic;
/////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////MATERIALS PHONG////////////////////////////////////////////////////
var boardMaterialPhong = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: false, shininess: 90, specular:  0xffffff});

//var invisibleMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, wireframe: false, //transparent: true, opacity: 0 });

var spaceshipMaterialPhong = new THREE.MeshPhongMaterial({ color: 0x808080, wireframe: false, shininess: 90, specular:  0xffffff});

var bulletMaterialPhong = new THREE.MeshPhongMaterial({ color: 0xff0000, wireframe: false, shininess: 90, specular:  0xffffff});

var alienMaterialPhong = new THREE.MeshPhongMaterial({ color: 0x006f00, wireframe: false, shininess: 90, specular:  0xffffff});
/////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////MATERIALS GOURAND//////////////////////////////////////////////////
var boardMaterialGourand = new THREE.MeshLambertMaterial({ color: 0xffffff, wireframe: false });

//var invisibleMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, wireframe: false, //transparent: true, opacity: 0 });

var spaceshipMaterialGourand = new THREE.MeshLambertMaterial({ color: 0x808080, wireframe: false});

var bulletMaterialGourand = new THREE.MeshLambertMaterial({ color: 0xff0000, wireframe: false});

var alienMaterialGourand = new THREE.MeshLambertMaterial({ color: 0x006f00, wireframe: false});
/////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////END VARIABLES//////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////




/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////CODE///////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////RENDER///////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function render() {
    'use strict';
    renderer.clear();
  
    var left   = Math.floor(windowWidth * views[0].left);
    var bottom = Math.floor(windowHeight * views[0].bottom);
    var width  = Math.floor(windowWidth * views[0].width);
    var height = Math.floor(windowHeight * views[0].height);
    renderer.setViewport(left, bottom, width, height);

    camera[activeCamera].updateProjectionMatrix();
    renderer.render(scene, camera[activeCamera]);
    
    left   = Math.floor(windowWidth * views[1].left);
    bottom = Math.floor(windowHeight * views[1].bottom);
    width  = Math.floor(windowWidth * views[1].width);
    height = Math.floor(windowHeight * views[1].height);
    renderer.setViewport(left, bottom, width, height);

    HUDCamera.updateProjectionMatrix();
    renderer.render(scene, HUDCamera);
    
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////CAMERAS CREATION/////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

//top view orthographic camera
function createCamera() {
    'use strict';
    
    camera[0] = new THREE.OrthographicCamera(-70 * aspect_ratio, 70 * aspect_ratio, 70, -70, 1, 1000);
    camera[0].position.x = 0;
    camera[0].position.y = 30;
    camera[0].position.z = 0;
    camera[0].lookAt(scene.position);
    scene.add(camera[0]);
}

//perspective view from behind the board camera
function createCamera2() {
    'use strict';

    camera[1] = new THREE.PerspectiveCamera(70, aspect_ratio, 1, 1000);
    camera[1].position.x = 0;
    camera[1].position.y = 50;
    camera[1].position.z = 90;
    camera[1].lookAt(scene.position);
    scene.add(camera[1]);
}

//perspective from spaceship's behind camera
function createCamera3() {
    'use strict';
    
    camera[2] = new THREE.PerspectiveCamera(70, aspect_ratio, 1, 1000);
    camera[2].position.x = 0;
    camera[2].position.y = 10;
    camera[2].position.z = 50;
    camera[2].lookAt(scene.position);
    scene.add(camera[2]);
    
}

//orographic camera for HUD
function createHUDCamera() {
    'use strict';
    
    HUDCamera = new THREE.OrthographicCamera(-70 * aspect_ratio, 70 * aspect_ratio, 70, -70, 1, 1000);
    HUDCamera.position.x = 500;
    HUDCamera.position.y = 30;
    HUDCamera.position.z = 500;
    HUDCamera.lookAt(new THREE.Vector3(500, 0, 500));
    scene.add(HUDCamera);
    
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////CUBE CREATION//////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function createCube(sizeX, sizeY, sizeZ, posX, posY, posZ, material) {
    'use strict';
    
    geometry = new THREE.CubeGeometry(sizeX, sizeY, sizeZ);
    
    cube = new THREE.Mesh(geometry, material);
    
    cube.position.x = posX + (pixSize / 2);
    cube.position.y = posY;
    cube.position.z = posZ + (pixSize / 2);
    
    return cube;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////BOARD CREATION//////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function createBoard() {
    'use strict';
    //os materiais sao para mudar para invisibleMaterial!!!!
    var rightLimit = createCube(pixSize, 10 * pixSize, 2 * boardLimit, boardLimit, 0, 0, boardMaterial);
    var leftLimit = createCube(pixSize, 10 * pixSize, 2 * boardLimit, -boardLimit, 0, 0, boardMaterial);
    var topLimit = createCube(2 * boardLimit, 10 * pixSize, pixSize, 0, 0, -boardLimit, boardMaterial);
    var bottomLimit = createCube(2 * boardLimit, 10 * pixSize, pixSize, 0, 0, boardLimit, boardMaterial);
    
    walls.push(rightLimit);     //aliens[0]
    walls.push(leftLimit);      //aliens[1]
    walls.push(topLimit);       //aliens[2]
    walls.push(bottomLimit);    //aliens[3]
    
    scene.add(rightLimit);
    scene.add(leftLimit);
    scene.add(topLimit);
    scene.add(bottomLimit);
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////SUN CREATION////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function createSun() {
    'use strict';
    sun = new THREE.DirectionalLight(0xffffff, 5);
    sun.position.set(boardLimit, 100, boardLimit);
    scene.add(sun);
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////SPOTLIGHT CREATION/////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function createSpotlight() {
    'use strict';
    spotlight = new THREE.SpotLight(0xffffff, 1, boardLimit);
    spaceship.add(spotlight);
    spotlight.position.set(0, 0, -4 * pixSize);
    
    spaceship.add(spotlight.target);
    spotlight.target.position.set(0, 0, -5 * pixSize);
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////STARS CREATION//////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function createStars() {
    'use strict';
    var lightColor = 0xffffff;
    var altitude = 10 * pixSize;
    //First star
    var light = new THREE.PointLight(lightColor, 1, 100);
    light.position.set(2 * boardLimit / 3, altitude, 2 * boardLimit / 3);
    stars.push(light);  //stars[0]
    scene.add(light);
    
    //Second star
    light = new THREE.PointLight(lightColor, 1, 100);
    light.position.set(0, altitude, 2 * boardLimit / 3);
    stars.push(light);  //stars[1]
    scene.add(light);
    
    //Third star
    light = new THREE.PointLight(lightColor, 1, 100);
    light.position.set(-2 * boardLimit / 3, altitude, 2 * boardLimit / 3);
    stars.push(light);  //stars[2]
    scene.add(light);
    
    //Forth star
    light = new THREE.PointLight(lightColor, 1, 100);
    light.position.set(2 * boardLimit / 3, altitude, -2 * boardLimit / 3);
    stars.push(light);  //stars[3]
    scene.add(light);
    
    //Fifth star
    light = new THREE.PointLight(lightColor, 1, 100);
    light.position.set(0, altitude, -2 * boardLimit / 3);
    stars.push(light);  //stars[4]
    scene.add(light);
    
    //Sixth star
    light = new THREE.PointLight(lightColor, 1, 100);
    light.position.set(-2 * boardLimit / 3, altitude, -2 * boardLimit / 3);
    stars.push(light);  //stars[5]
    scene.add(light);
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////CREATE ALIENS AND SPACESHIP/////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function createAliensSpaceship() {
    'use strict';
    for (var n = 0; n < 2; n++) {
        for (var i = 0; i < 4; i++) {
            createMonster(-boardLimit / 2 + i * 20 * pixSize, 2 * pixSize, -boardLimit / 1.7 + n * 15 * pixSize);      
        }
    }
    createSpaceship(0, 2 * pixSize, boardLimit / 1.1);
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////ALIEN CREATION////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function createMonsterBody(group) {
    'use strict';
    var cubeMesh;
    for (var n = 0; n < 7 * pixSize; n += pixSize) {
        for(var i = 0; i < 6 * pixSize; i += pixSize) {
            if(n == pixSize && i == pixSize) {continue;}
            else if(n == 5 * pixSize && i == pixSize) {continue;}
            else if(pixSize <= n && n < 6 * pixSize && i == 4 * pixSize) {continue;}
            else if((n == 0 || n == 3 * pixSize || n == 6 * pixSize)
                    && i == 5 * pixSize) {continue;}
            else{
                cubeMesh = createCube(pixSize, 3 * pixSize, pixSize, n - 3.5, 0, i - 3, alienMaterial);
                group.add(cubeMesh);
            }
        }
    }
}


function createMonsterTentacleLeft(group) {
    'use strict';
    var cubeMesh;
    for (var n = pixSize; n < 3 * pixSize; n +=pixSize) {
        for (var i = pixSize; i < 5 * pixSize; i += pixSize) {
            if (n == 2 * pixSize && i == pixSize) {continue;}
            else if(n == pixSize && (i == 3 * pixSize || i == 4 * pixSize)) {continue;}
            else {
                cubeMesh = createCube(pixSize, pixSize, pixSize, -n - 3.5, 0, i - 3, alienMaterial);
                group.add(cubeMesh);
            }
        }
    }
}

function createMonsterTentacleRight(group) {
    'use strict';
    var cubeMesh;
    for (var n = 7 * pixSize; n < 9 * pixSize; n+= pixSize) {
        for (var i = pixSize; i < 5 * pixSize; i += pixSize) {
            if (n == 8 * pixSize && i == pixSize) {continue;}
            else if (n == 7 * pixSize && (i == 3 * pixSize || i == 4 * pixSize)) {continue;}
            else {
                cubeMesh = createCube(pixSize, pixSize, pixSize, n - 3.5, 0, i - 3, alienMaterial);
                group.add(cubeMesh);
            }
        }
    }
}

function createMonsterAntenaLeft(group) {
    'use strict';
    var cubeMesh;
    for (var n = 0; n < 2 * pixSize; n += pixSize) {
        for (var i = pixSize; i < 3 * pixSize; i += pixSize) {
            if (n == 0 && i == pixSize) {continue;}
            else if (n == pixSize && i == 2 * pixSize) {continue;}
            else {
                cubeMesh = createCube(pixSize, pixSize, pixSize, n - 3.5, 0, -3 - i, alienMaterial);
                group.add(cubeMesh);
            }
        }
    }
}

function createMonsterAntenaRight(group) {
    'use strict';
    var cubeMesh;
    for (var n = 5 * pixSize; n < 7 * pixSize; n += pixSize) {
        for (var i = pixSize; i < 3 * pixSize; i += pixSize) {
            if (n == 6 * pixSize && i == pixSize) {continue;}
            else if (n == 5 * pixSize && i == 2 * pixSize) {continue;}
            else {
                cubeMesh = createCube(pixSize, pixSize, pixSize, n - 3.5, 0, -3 - i, alienMaterial);
                group.add(cubeMesh);
            }
        }
    }
}

function createMonster(x, y, z) {
    monster = new THREE.Object3D();
    monster.position.x = x;
    monster.position.y = y;
    monster.position.z = z;
    createMonsterBody(monster);
    createMonsterTentacleLeft(monster);
    createMonsterTentacleRight(monster);
    createMonsterAntenaLeft(monster);
    createMonsterAntenaRight(monster);
    
    randomX = Math.random()*2;
    randomZ = Math.round(Math.random());
    if (randomX <= 1) {
        if (randomZ == 0) { randomZ = randomX - 1.0; }
        else { randomZ = 1.0 - randomX; }
    }
    else { 
        randomX = randomX - 2.0;
        if (randomZ == 0) { randomZ = -randomX - 1.0; }
        else { randomZ = 1.0 + randomX; }
    }
    monster.userData = {x: randomX, z: randomZ}
    
    aliens.push(monster);
    scene.add(monster);
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////SPACESHIP CREATION/////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function createSpaceshipBody(group) {
    'use strict';
    var spaceshipBody = createCube(9 * pixSize, 3 * pixSize, 5 * pixSize, 0, 0, 0, spaceshipMaterial);
    
    //group.add(spaceshipBody);
}

function createSpaceshipCanon(group) {
    'use strict';
    var spaceshipCanon = createCube(pixSize, pixSize, pixSize, 0, 0, -4 * pixSize, spaceshipMaterial);
    var spaceshipcannon = createCube(3 * pixSize, 2 * pixSize, pixSize, 0, 0, -3 * pixSize, spaceshipMaterial);
    
    //group.add(spaceshipCanon);
    //group.add(spaceshipcannon);
}

function createSpaceship(x, y, z) {
    spaceship = new THREE.Object3D();
    spaceship.position.x = x;
    spaceship.position.y = y;
    spaceship.position.z = z;
    
    
    
    
    /*OLD ASS WINGS
    //#wings
    var geometry = new THREE.CylinderGeometry( 1, 7-pixSize*3, 17-pixSize*3, 3 );
    var material = spaceshipMaterialBasic;
    cylinder1 = new THREE.Mesh( geometry, material );
    cylinder1.position.set(-7,-1,-5);
    cylinder1.rotation.z = Math.PI/2;
    spaceship.add( cylinder1 );
    
    
    var geometry = new THREE.CylinderGeometry( 7-pixSize*3, 1, 17-pixSize*3, 3 );
    var material = spaceshipMaterialBasic;
    cylinder2 = new THREE.Mesh( geometry, material );
    cylinder2.position.set(8,-1,-5);
    cylinder2.rotation.z = Math.PI/2;
    //cylinder.rotation.y = Math.PI/4;
    spaceship.add( cylinder2 ); */
    
    
    //cannon shooter
    
    var points = [];
    for ( var i = 0; i < 10; i ++ ) {
        points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 10 + 5, ( i - 5 ) * 2 )  );
    }
    var geometry = new THREE.LatheBufferGeometry( points );
    var material = spaceshipMaterial;
    var CS = new THREE.Mesh( geometry, material );
    CS.position.set(.5,1, -10);
    CS.scale.set(1/10,1/10,1/10);
    CS.rotation.x = Math.PI/2;
    //spaceship.add(CS);
    //scene.add( CS );
    
     //----------------------liek dis
    //left small wing
    var geometry = new THREE.Geometry();
    var material = spaceshipMaterial;
    var mesh = new THREE.Mesh( geometry, material );
    

    
    geometry.vertices.push(new THREE.Vector3( 0,  0, 0 ), 
                           new THREE.Vector3( -7, 0, 5 ),
                           new THREE.Vector3(  5, 0   , 5 ));

    geometry.faces.push(new THREE.Face3( 0, 1, 2 ));
    mesh.position.set(0,0,-1);

    geometry.computeFaceNormals();
    geometry.mergeVertices(); // ve vertices repetidos
    geometry.computeVertexNormals();
    spaceship.add(mesh);
    
    //right small wing
    var geometry = new THREE.Geometry();
    var material = spaceshipMaterial;
    var mesh = new THREE.Mesh( geometry, material );
    

    
    geometry.vertices.push(new THREE.Vector3( 0,  0, 0 ),
                           new THREE.Vector3(  7, 0 , 5 ),
                           new THREE.Vector3( -5 , 0, 5 ));

    geometry.faces.push(new THREE.Face3( 0, 2, 1 ));
    mesh.position.set(1,0,-1);

    geometry.computeFaceNormals();
    //geometry.mergeVertices(); // ve vertices repetidos
    geometry.computeVertexNormals();
    spaceship.add(mesh);
    
    
    
    
    
    //------------------------------------
    
    
    //pyramid wings
            //left
    var geometry = new THREE.Geometry();
    var material = spaceshipMaterial;
    var mesh = new THREE.Mesh( geometry, material );
 
    geometry.vertices = [
        new THREE.Vector3( -3.75, 3, 3 ),
        new THREE.Vector3( -3.75, -3, 3 ),
        new THREE.Vector3(-3.75, -3, -3),
        new THREE.Vector3( -3.75, 3, -3 ),
        new THREE.Vector3( 3.75, 0,0)
    ];

    geometry.faces = [
        new THREE.Face3( 0, 1, 2 ),
        new THREE.Face3( 2, 3, 0 ),
        new THREE.Face3( 1, 0, 4 ),
        new THREE.Face3( 2, 1, 4 ),
        new THREE.Face3( 3, 2, 4 ),
        new THREE.Face3( 0, 3, 4 )
    ];  

    
    mesh.rotation.y = Math.PI;
    mesh.position.set(-7.58,0,-3 );
    

    geometry.computeFaceNormals();
    //geometry.mergeVertices(); // ve vertices repetidos
    geometry.computeVertexNormals();
    
    
    
    spaceship.add(mesh);
    
    
    
    
    
    
            //right
    var geometry = new THREE.Geometry();
    var material = spaceshipMaterial;
    var mesh = new THREE.Mesh( geometry, material );
    
    
    
    
    geometry.vertices = [
        new THREE.Vector3( -3.75, 3, 3 ),
        new THREE.Vector3( -3.75, -3, 3 ),
        new THREE.Vector3(-3.75, -3, -3),
        new THREE.Vector3( -3.75, 3, -3 ),
        new THREE.Vector3( 3.75, 0,0)
    ];

    geometry.faces = [
        new THREE.Face3( 0, 1, 2 ),
        new THREE.Face3( 2, 3, 0 ),
        new THREE.Face3( 0, 4, 1 ),
        new THREE.Face3( 1, 4, 2 ),
        new THREE.Face3( 2, 4, 3 ),
        new THREE.Face3( 3, 4, 0 )       
    ];  

    
    //mesh.rotation.z = Math.PI/2;
    mesh.position.set(8.58,0,-3);

    geometry.computeFaceNormals();
    //geometry.mergeVertices(); // ve vertices repetidos
    geometry.computeVertexNormals();
    
    
    
    spaceship.add(mesh);
    
    
    
    //BODY
    
    var geometry = new THREE.Geometry();
    var material = spaceshipMaterial;
    var mesh = new THREE.Mesh( geometry, material );
 
    geometry.vertices = [
        new THREE.Vector3( -4.5, -1.5, -6.5 ),
        new THREE.Vector3( 4.5, -1.5, -6.5 ),
        new THREE.Vector3(4.5, 1.5, -6.5),
        new THREE.Vector3( -4.5, 1.5, -6.5 ), //front
        new THREE.Vector3( -4.5, -1.5, 6.5 ),
        new THREE.Vector3( 4.5, -1.5, 6.5 ),
        new THREE.Vector3( 4.5, 1.5, 6.5 ),
        new THREE.Vector3( -4.5, 1.5, 6.5 ) //back
    ];

    geometry.faces = [
        new THREE.Face3( 2, 1, 0 ),
        new THREE.Face3( 0, 3, 2 ),
        new THREE.Face3( 0, 4, 7 ),
        new THREE.Face3( 7, 3, 0 ),
        new THREE.Face3( 0, 1, 5 ),
        new THREE.Face3( 5, 4, 0 ),  
        new THREE.Face3( 1, 2, 6 ),
        new THREE.Face3( 6, 5, 1 ),
        new THREE.Face3( 2, 3, 7 ),
        new THREE.Face3( 7, 6, 2 ),
        new THREE.Face3( 4, 5, 6 ),
        new THREE.Face3( 6, 7, 4 )
    ];  

    
    //mesh.rotation.y = Math.PI;
    mesh.position.set(.5,0,-3 );
    

    geometry.computeFaceNormals();
    //geometry.mergeVertices(); // ve vertices repetidos
    geometry.computeVertexNormals();
    
    
    
    spaceship.add(mesh);
    
    
    
    
    
    //shooter
    var geometry = new THREE.Geometry();
    var material = spaceshipMaterial;
    var mesh = new THREE.Mesh( geometry, material );
    
    
    
    
    geometry.vertices = [
        new THREE.Vector3( -1.875, .75, .75 ),
        new THREE.Vector3( -1.875, -.75, .75 ),
        new THREE.Vector3(-1.875, -.75, -.75),
        new THREE.Vector3( -1.875, .75, -.75 ),
        new THREE.Vector3( 1.875, 0,0)
    ];

    geometry.faces = [
        new THREE.Face3( 0, 1, 2 ),
        new THREE.Face3( 2, 3, 0 ),
        new THREE.Face3( 0, 4, 1 ),
        new THREE.Face3( 1, 4, 2 ),
        new THREE.Face3( 2, 4, 3 ),
        new THREE.Face3( 3, 4, 0 )       
    ];  

    
    mesh.rotation.y = Math.PI/2;
    mesh.position.set(.5,0,-11  );

    geometry.computeFaceNormals();
    //geometry.mergeVertices(); // ve vertices repetidos
    geometry.computeVertexNormals();
    
    
    
    spaceship.add(mesh);
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    createSpaceshipBody(spaceship);
    createSpaceshipCanon(spaceship);
    createSpaceshipCanon(spaceship);
    scene.add(spaceship);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////BULLET CREATION//////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function createBullet() {
    'use strict';
    var posX = spaceship.position.x;
    var posY = spaceship.position.y;
    var posZ = spaceship.position.z - 13 * pixSize;
    var bullet = createCube(pixSize, pixSize, 3 * pixSize, posX, posY, posZ, bulletMaterial);
    bullets.push(bullet);
    scene.add(bullet);
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////SCENE CREATION//////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function createScene() {
    'use strict';
    
    scene = new THREE.Scene();
    //scene.background = new THREE.Color(0x000000, 0);
    scene.add(axisHelper);
    axisHelper.visible = false;
    
    createSun();
    createStars();
    
    createBoard();
    
    createAliensSpaceship();
    createLives();
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////RESIZE/////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function onResize() {
    'use strict';
    
    renderer.setSize(windowWidth, windowHeight);
    
    if (windowHeight > 0 && windowWidth > 0) {
        if (aspect_ratio > 1) {
            camera[activeCamera].left = -70 * aspect_ratio;
            camera[activeCamera].right = 70 * aspect_ratio;
            camera[activeCamera].top = 70;
            camera[activeCamera].bottom = -70;
        }
        else {
            camera[activeCamera].left = -70;
            camera[activeCamera].right = 70;
            camera[activeCamera].top = 70 / aspect_ratio;
            camera[activeCamera].bottom = -70 / aspect_ratio;
        }
    }
    
    camera[activeCamera].updateProjectionMatrix();
    
    render();
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////KEY INTERACTION//////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function onKeyDown(e) {
    'use strict';

    switch(e.keyCode) {
        //Wireframe on/off
        case 65:  //A
        case 97:  //a
            boardMaterial.wireframe = !boardMaterial.wireframe;
            spaceshipMaterial.wireframe = !spaceshipMaterial.wireframe;
            alienMaterial.wireframe = !alienMaterial.wireframe;
            bulletMaterial.wireframe = !bulletMaterial.wireframe;
            break;
            
        //Move spaceship left
        case 37:  //left arrow
            accelerationFlag = -1;
            break;
            
        //Move spaceship up
        /*case 38: //up arrow
            console.log("basic:"+basic, "shading:"+shading);
            break;*/
            
        //Move spaceship right
        case 39:  //right arrow
            accelerationFlag = 1;
            break;
            
        //Move spaceship down
        /*case 40:  //down arrow
            spaceship.position.z += pixSize;
            break;*/
            
        //Change to camera 1
        case 49:  //number 1
            activeCamera = 0;
            break;
            
        //Change to camera 2
        case 50:  //number 2
            activeCamera = 1;
            break;
            
        //Change to camera 3
        case 51:  //number 3
            activeCamera = 2;
            camera[activeCamera].position.set(spaceship.position.x, 10, 50);
            camera[activeCamera].updateProjectionMatrix();
            break;
        
        //Shoot spaceship's cannon
        case 66:  //B
        case 98:  //b
            if (pause == 0) {
                createBullet();
            }
            break;
            
        //Turn stars on/off
        case 67:  //C
        case 99:  //c
            for (var i = 0; i < stars.length; i++) {
                stars[i].visible = !stars[i].visible;
            }
            break;
        
        case 71:  //G
        case 103: //g
            if(basic == 1) {
                if (shading == 0) {
                    changeToMat("phong");
                    shading = 1;
                }
                else {
                    changeToMat("gourand");
                    shading = 0;
                }
            }
            break;
            
        //Toggle axis helper on/off
        case 72:  //H
        case 104: //h
            spotlight.visible = !spotlight.visible;
            break;
            
        //Toggle axis helper on/off
        case 74:  //J
        case 106: //j
            axisHelper.visible = !axisHelper.visible;
            break;
            
        //Lighting on/off
        case 76:  //L
        case 108: //l
            if(basic == 1){
                changeToMat("basic");
                basic = 0;
                shading = Math.abs(--shading);
            }
            else {
                if (shading == 0) {
                    changeToMat("phong");
                    shading = 1;
                }
                else {
                    changeToMat("gourand");
                    shading = 0;
                }
                basic = 1;
            }
            break;
            
        //Turn sun on/off
        case 78:  //N
        case 110: //n
            sun.visible = !sun.visible;
            break;
            
        //Restart the game
        case 82:  //R
        case 114: //r
            res = 1;
            restart();
            break;
            
        //Pause/resume game
        case 83:  //S
        case 115: //s
            if (end == 0) {
                pauseResume();
            }
            break;
    }

}

function onKeyUp(e) {
    'use strict';

    switch(e.keyCode) {
       
        //Stop accelerating spaceship
        case 37:  //left arrow
        case 39:  //right arrow
            accelerationFlag = 0;
            break;

    }

}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////CHANGE MATERIAL////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function changeToMat(material) {
    'use strict';
    if (material == "phong") {
        boardMaterial = boardMaterialPhong;
        spaceshipMaterial = spaceshipMaterialPhong;
        bulletMaterial = bulletMaterialPhong;
        alienMaterial = alienMaterialPhong;
    }
    else if (material == "gourand") {
        boardMaterial = boardMaterialGourand;
        spaceshipMaterial = spaceshipMaterialGourand;
        bulletMaterial = bulletMaterialGourand;
        alienMaterial = alienMaterialGourand;
    }
    else if (material == "basic"){
        boardMaterial = boardMaterialBasic;
        spaceshipMaterial = spaceshipMaterialBasic;
        bulletMaterial = bulletMaterialBasic;
        alienMaterial = alienMaterialBasic;
    }
    
    //WALLS
    for(var i = 0; i < walls.length; i++){
        walls[i].material = boardMaterial;
        walls[i].material.needsUpdate = true;
    }

    //SPACESHIP
    spaceship.traverse(function(child){
        if(child instanceof THREE.Mesh){
            child.material = spaceshipMaterial;
            child.material.needsUpdate = true;
        }
    });

    //BULLETS
    for (var i = 0; i < bullets.length; i++) {
        bullets[i].traverse(function(child){
            if(child instanceof THREE.Mesh){
                child.material = bulletMaterial;
                child.material.needsUpdate = true;
            }
        });
    }

    //ALIENS
    for (var i = 0; i < aliens.length; i++) {
        aliens[i].traverse(function(child){
            if(child instanceof THREE.Mesh){
                child.material = alienMaterial;
                child.material.needsUpdate = true;
            }
        });
    }

    geometry.normalsNeedUpdate = true;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////CHECK SPACESHIP COLLISION//////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function checkSpaceshipCollision() {
    'use strict';
    var distance;
    //Check spaceship colision with walls
    for (var i = 0; i < 2; i++) {
        distance = Math.pow(walls[i].position.x - spaceship.position.x, 2);
        if (Math.pow(12 * pixSize + pixSize / 2, 2) >= distance) {
            return true;
        }
    }
    return false;

}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////CHECK ALIEN COLLISION//////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function checkAlienCollision(index) {
    'use strict';
    var distance, distanceX, distanceZ;
    var alien = aliens[index];
    for (var i = 0; i < 2; i++) {
        distance = Math.pow(walls[i].position.x - alien.position.x, 2);
        if (Math.pow(5.5 * pixSize + pixSize / 2, 2) >= distance) {
            alien.userData.x = -alien.userData.x;
            return true;
        }
    }
    for (i = 2; i < 4; i++) {
        distance = Math.pow(walls[i].position.z - alien.position.z, 2);
        if (Math.pow(4 * pixSize + pixSize / 2, 2) >= distance) {
            alien.userData.z = -alien.userData.z;
            return true;
        }
    }
    for (var k = index+1; k < aliens.length; k++) {
        distanceZ = Math.pow(aliens[k].position.z - alien.position.z, 2);
        distanceX = Math.pow(aliens[k].position.x - alien.position.x, 2);
        distance = distanceX + distanceZ;
        if (Math.pow(5.5 * pixSize + 6 * pixSize, 2) >= distance) {
            alien.userData.z = -alien.userData.z;
            aliens[k].userData.z = -aliens[k].userData.z;
            alien.userData.x = -alien.userData.x;
            aliens[k].userData.x = -aliens[k].userData.x;
            return true;
        }
    }
    return false;
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////BULLET COLLISION///////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function bulletCollision(){
    'use strict';
    var distance, distanceX, distanceZ;
    for (var i = 0; i < bullets.length; i++) {
        distance = Math.pow(bullets[i].position.z - walls[2].position.z, 2);
        if (Math.pow(1.5 * pixSize + pixSize / 2, 2) >= distance) {
            scene.remove(bullets[i]);
            bullets.splice(i, 1);
        }
        else if (bullets.length > 0) {
            for (var j = 0; j < aliens.length; j++) {
                distanceZ = Math.pow(bullets[i].position.z - aliens[j].position.z, 2);
                distanceX = Math.pow(bullets[i].position.x - aliens[j].position.x, 2);
                distance = distanceZ + distanceX;
                if (Math.pow(1.5 * pixSize + 4 * pixSize, 2) >= distance) {
                    scene.remove(bullets[i]);
                    bullets.splice(i, 1);
                    scene.remove(aliens[j]);
                    aliens.splice(j, 1);
                    aliensKilled++;
                    break;
                }
            }
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////CHECK ALIEN HIT/////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
//CHECK IF AN ALIEN HAS HIT THE SHIP
function checkAlienHit() {
    'use strict';
    var distance, distanceX, distanceZ;
    for (var i = 0; i < aliens.length; i++) {
        distanceZ = Math.pow(aliens[i].position.z - spaceship.position.z, 2);
        distanceX = Math.pow(aliens[i].position.x - spaceship.position.x, 2);
        distance = distanceX + distanceZ;
        if (Math.pow(7 * pixSize + 7 * pixSize, 2) >= distance) {
            scene.remove(lives[lives.length-1]);
            lives.pop();
            return true;
        }
    }
    return false;
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////RESTART GAME///////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function restart() {
    'use strict';
    if (res == 1) {
        aliensKilled = 0;
        for (var i = 0; i < lives.length; i++) {
            scene.remove(lives[i]);
        }
        lives = [];
        createLives();
    }
    res = 0;
    for (var j = 0; j < aliens.length; j++) {
        scene.remove(aliens[j]);
    }
    for (var k = 0; k < bullets.length; k++) {
        scene.remove(bullets[k]);
    }
    scene.remove(victoryMess);
    scene.remove(pauseMess);
    scene.remove(gameOverMess);
    aliens = [];
    bullets = [];
    scene.remove(spaceship);
    scene.remove(spotlight);
    velocity = 0;
    createAliensSpaceship();
    createSpotlight();
    pause = 0;
    end = 0;
}




function createLives() {
    'use strict';
    var life, material;
    for (var i = 0; i < 3; i++) {
        lives[i] = new THREE.Object3D;
    }
    loader.load('images/life.png', function (texture) {
        var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
        for (var i = 0; i < 3; i++) {
            lives[i] = createCube(10, pixSize, 10, 600+i*10, 5*pixSize, 440, material);
            scene.add(lives[i]);
        }
    });

}

function pauseResume() {
    'use strict';
    if (pause == 0) {
        pauseMess = new THREE.Group();
        scene.add(pauseMess);
        loader.load('images/pausedmeme.jpg', function (texture) {
                    var geometry = new THREE.CubeGeometry(2*boardLimit + 2*pixSize, pixSize, 2*boardLimit + 2*pixSize);
					var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
					var mesh = new THREE.Mesh(geometry, material);
                    mesh.position.x = 500;
                    mesh.position.y = 5 * pixSize;
                    mesh.position.z = 500;
					pauseMess.add(mesh);
				});
        pause = 1;
    }
    else {
        scene.remove(pauseMess);
        pause = 0;
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////CHECK VICTORY//////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function victory() {
    'use strict';
    victoryMess = new THREE.Group();
    scene.add(victoryMess);
    loader.load('images/victorymeme.jpg', function (texture) {
                    var geometry = new THREE.CubeGeometry(2 * boardLimit + 2 * pixSize, pixSize, 2 * boardLimit + 2 * pixSize);
					var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
					var mesh = new THREE.Mesh(geometry, material);
                    mesh.position.x = 500;
                    mesh.position.y = 5 * pixSize;
                    mesh.position.z = 500;
					victoryMess.add(mesh);
				});
    pause = 1;
    end = 1;
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////GAME OVER///////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function gameOver() {
    'use strict';
    gameOverMess = new THREE.Group();
    scene.add(gameOverMess);
    loader.load('images/gameover.png', function (texture) {
                    var geometry = new THREE.CubeGeometry(2 * boardLimit + 2 * pixSize, pixSize, 2 * boardLimit + 2 * pixSize);
					var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
					var mesh = new THREE.Mesh(geometry, material);
                    mesh.position.x = 500;
                    mesh.position.y = 5 * pixSize;
                    mesh.position.z = 500;
					gameOverMess.add(mesh);
				});
    pause = 1;
    end = 1;
    
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////ANIMATE////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function animate() {
    'use strict';
    var time = clock.getDelta();
    var spaceshipPosition = spaceship.position.x;
    var alienX;
    var alienZ;
    if (pause == 0) {
        bulletCollision();
        //Spaceship's velocity
        if (velocity <= maxSpeed && velocity >= -maxSpeed) {
            velocity += 0.5 * accelerationFlag * acceleration * time;
            if (velocity > maxSpeed) { velocity = maxSpeed; }
            else if (velocity < -maxSpeed) { velocity = -maxSpeed; }
        }
        //Spaceship's position
        spaceship.position.x += velocity * acceleration * time;
        if (checkSpaceshipCollision()) { 
            spaceship.position.x = spaceshipPosition;
            velocity = 0; 
        }

        //updating position of camera 3 to follow the spaceship
        if (activeCamera == 2) {
            camera[activeCamera].position.set(spaceship.position.x, 10, 50);
            camera[activeCamera].updateProjectionMatrix();
        }
    
        //bullets' position
        for (var i = 0; i < bullets.length; i++) {
            bullets[i].position.z -= bulletSpeed * time;
        }
        
        //alien's position
        for (var j = 0; j < aliens.length; j++) {
            monster = aliens[j];
            alienX = monster.position.x;
            alienZ = monster.position.z;
            monster.position.x += monster.userData.x * alienSpeed * time;
            monster.position.z += monster.userData.z * alienSpeed * time;
            if (checkAlienCollision(j)) {
                monster.position.x = alienX;
                monster.position.z = alienZ;
            }
        }
        if (checkAlienHit()) {
            restart();
        }
        if (aliens.length < 1) {
            victory();
        }
        if (lives.length < 1) {
            gameOver();
        }
    }
    
    render();
    requestAnimationFrame(animate);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////INITIALIZER//////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function init() {
    'use strict';
    console.log('some');
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.autoClear = false;
    renderer.setClearColor(0x000000);
    
    renderer.setSize(windowWidth, windowHeight);
    
    document.body.appendChild(renderer.domElement);
    
    clock.getDelta();
    
    createScene();
    createCamera();
    createCamera2();
    createCamera3();
    
    createHUDCamera();
    
    createSpotlight();
    
    activeCamera = 0;
    
    var group = new THREE.Group();
    scene.add( group );
    loader.load('images/galaxy.png', function (texture) {
                    var geometry = new THREE.CubeGeometry(2 * boardLimit, pixSize, 2 * boardLimit);
					var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
					var mesh = new THREE.Mesh(geometry, material);
                    mesh.position.y = -5 * pixSize;
					group.add(mesh);
				});
    
    
    render();
    
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////CODE END///////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////




/////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////END///////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
