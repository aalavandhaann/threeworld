var scene, model;

function render3D()
{
    requestAnimationFrame(render3D);
    $("#editor").threeworld('render');
}

function createBoxHelper(color, bounds, mesh)
{
    var width = (bounds.max.x - bounds.min.x );
    var height = (bounds.max.y - bounds.min.y );
    var depth = (bounds.max.z - bounds.min.z );
    var sx = (width/2) + bounds.min.x;
    var sy = (height/2) + bounds.min.y;
    var sz = (depth/2) + bounds.min.z;
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth, 1, 1, 1), new THREE.MeshBasicMaterial({color: color, wireframe: true}));
    var cube = new THREE.BoxHelper( mesh );
    cube.material.color.set( color );
    mesh.geometry.applyMatrix(new THREE.Matrix4().applyTranslation(sx,sy,sz));
    return cube;
}

function onModelLoaded(e)
{
    model = e.model;
    model.traverse(function(child)
    {
        if(child instanceof THREE.Mesh)
        {
            child.geometry.applyMatrix(new THREE.Matrix4().makeScale(0.1,0.1,0.1));
            child.updateMatrix();
            child.updateMatrixWorld();
            scene.add(createBoxHelper(0x0000FF, child.geometry.boundingBox));
        }
    });
}

function loadModel()
{
    $("#editor").threeworld('load', 'http://localhost/models/Captain_America.obj', 'obj');
}

function main()
{
    var w = window.innerWidth;
    var h = window.innerHeight;
//    $("#editor").threeworld({worldwidth: w * 1, worldheight: h * 1, columns: 2, axis: false, views: {types: [FRONT_VIEW, TOP_VIEW, SIDE_VIEW, FREE_VIEW]}}).on('meshloadcomplete', function(e)
//    $("#editor").threeworld({worldwidth: w * 1, worldheight: h * 1, columns: 2, axis: false, floor: true, defaultlights: true, views: {types: [FREE_VIEW, SIDE_VIEW, FRONT_VIEW, TOP_VIEW]}});
    $("#editor").threeworld({worldwidth: w * 1, worldheight: h * 1, columns: 2, axis: false, floor: true, defaultlights: true, views: {types: [FREE_VIEW]}}).on('meshloadcomplete', onModelLoaded);
    scene = $("#editor").threeworld('get', 'scene');
    loadModel();
    render3D();
}
$(document).ready(main);