var cube, billboard;
function render3D()
{
    requestAnimationFrame(render3D);
    if(cube !== undefined)
    {
        cube.rotation.x +=0.01;
    }
    billboard.lookAt($("#editor").threeworld.get('camera').position);
    $("#editor").threeworld.render();
}

function addBillboard()
{
    var planeGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
    var planeMaterial = new THREE.MeshBasicMaterial({
                wireframe: false,
                color: 0x0000FF
            });
    billboard = new THREE.Mesh(planeGeometry, planeMaterial);
    $("#editor").threeworld.add(billboard);
}

function addCube()
{
    var cubeGeometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
    var cubeMaterial = new THREE.MeshBasicMaterial({
                wireframe: false,
                color: 0xCCCCCC
            });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    $("#editor").threeworld.add(cube);
}

function addModel()
{
    $("#editor").threeworld.load('http://localhost/models/ApeTusked.obj', 'obj');
}

function main()
{
    var w = window.innerWidth;
    var h = window.innerHeight;
    $("#editor").threeworld({worldwidth:w, worldheight:h});  
    addModel();
    addBillboard();
    render3D();
}
$(document).ready(main);