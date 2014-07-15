var cube;
function render3D()
{
    requestAnimationFrame(render3D);
    if(cube !== undefined)
    {
        cube.rotation.x +=0.01;
    }
    $("#editor").threeworld.render();
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
//    $("#editor").threeworld.load('http://localhost/models/Captain_America.obj', 'obj');
}

function main()
{
    var w = window.innerWidth;
    var h = window.innerHeight;
    $("#editor").threeworld();
//    $("#editor").threeworld({worldwidth: w, worldheight: h, views : {types:[FREE_VIEW], boundries: [[0, 1, 0, 1]]}});
//    $("#editor").threeworld(
//            {
//                worldwidth: w, 
//                worldheight: h, 
//                views : 
//                        {
//                            types:[FREE_VIEW], 
//                            boundries: 
//                            [
//                                [0, 0.5, 0.5, 1]
//                            ]
//                        }
//                    });
    addCube();
//    addModel();
//    $("#editor").threeworld.removeAllViews();
//    $("#editor").threeworld.addView(FRONT_VIEW, [0, 0.5, 0, 0.5]);
//    $("#editor").threeworld.addView(SIDE_VIEW, [0.5, 1, 0, 0.5]);
//    $("#editor").threeworld.addView(TOP_VIEW, [0.5, 1, 0.5, 1]);
    
    
    render3D();
}
$(document).ready(main);