var cube, billboard;
function render3D()
{
    requestAnimationFrame(render3D);
    if(cube !== undefined)
    {
        cube.rotation.x +=0.01;
    }
//    billboard.lookAt($("#editor1").threeworld('get','camera').position);
    
    $("#editor").threeworld('render');
//    $("#editor1").threeworld('render');
}

function addBillboard()
{
    var planeGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
    var planeMaterial = new THREE.MeshBasicMaterial({
                wireframe: false,
                color: 0x0000FF
            });
    billboard = new THREE.Mesh(planeGeometry, planeMaterial);
    $("#editor1").threeworld('add',billboard);
}

function addCube()
{
    var cubeGeometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
    var cubeMaterial = new THREE.MeshBasicMaterial({
                wireframe: false,
                color: 0xCCCCCC
            });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    $("#editor").threeworld('add', cube);
}

function addModel()
{
    $("#editor").threeworld('load', 'http://localhost/models/CaptainAmericaShifted.obj', 'obj').threeworld('load', 'http://localhost/models/CaptainAmericaShifted.dae', 'collada');
    
    console.log($("#editor").threeworld("get", "collada"));
        
//    $("#editor").threeworld();
//    $("#editor").threeworld('load', 'http://localhost/models/Woola_OBJ.OBJ', 'obj');
//    $("#editor1").threeworld('load', 'http://localhost/models/Captain_America.obj', 'obj');
}

function main()
{
    var w = window.innerWidth;
    var h = window.innerHeight;
    $("#editor").threeworld({worldwidth:w*1, worldheight:h*1, columns: 2, views: {types: [FRONT_VIEW, TOP_VIEW, SIDE_VIEW, FREE_VIEW]}});  
//    $("#editor1").threeworld({worldwidth:w*0.49, worldheight:h*1});
//    console.log($("#editor").threeworld.get('scene'));
//    console.log($("#editor1").threeworld.get('scene'));
//    addCube();
    addModel();
//    addBillboard();
    render3D();
}
$(document).ready(main);