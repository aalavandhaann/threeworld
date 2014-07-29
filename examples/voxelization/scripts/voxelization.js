var scene, model;

function render3D()
{
    requestAnimationFrame(render3D);
    $("#editor").threeworld('render');
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
            var bounds = child.geometry.boundingBox;
            console.log(bounds);
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