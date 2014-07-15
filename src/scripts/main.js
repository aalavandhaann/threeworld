function render3D()
{
    requestAnimationFrame(render3D);
    $("#editor").threeworld.render();
}

function addCube()
{
    var cubeGeometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
    var cubeMaterial = new THREE.MeshBasicMaterial({
                wireframe: false,
                color: 0xCCCCCC
            });
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    $("#editor").threeworld.add(cube);
}

function main()
{
    var w = window.innerWidth;
    var h = window.innerHeight;
//    $("#editor").threeworld({worldwidth: w, worldheight: h, views : {types:[FREE_VIEW], boundries: [[0, 1, 0, 1]]}});
    $("#editor").threeworld({worldwidth: w, worldheight: h});
    addCube();
    render3D();
}
$(document).ready(main);