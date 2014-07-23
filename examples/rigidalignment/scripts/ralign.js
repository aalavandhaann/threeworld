var model, scene, bbox, boundsC, radian = 0, selectedAxis = 'y', axisIndex = 0, count = 0;
var bestvolume = {volume: 99999999, rotation: {x: 0, y: 0, z: 0}, volumefound: false, bounds: new THREE.Box3(), shortaxis: 'x'};
function render3D()
{
    requestAnimationFrame(render3D);
    findModelBestFit();
    $("#editor").threeworld('render');
}

function findModelBestFit()
{
    if (model !== undefined)
    {
        if (!bestvolume.volumefound)
        {
            radian += 0.01;
            if (radian > (3.14 * 2))
            {
                radian = 0;
                axisIndex++;
                if (axisIndex > 3)
                {
                    bestvolume.volumefound = true;
                    model.rotation.x = bestvolume.rotation.x;
                    model.rotation.y = bestvolume.rotation.y;
                    model.rotation.z = bestvolume.rotation.z;
                    drawModelAxis(bestvolume.bounds);
                    drawBoundingBox(bestvolume.bounds);
                    return;
                }
            }

//            model.rotation[['y', 'x', 'z'][axisIndex]] = radian;
            model.rotation[['y', 'x', 'z'][0]] = radian;
            model.rotation[['y', 'x', 'z'][1]] = radian;
            model.rotation[['y', 'x', 'z'][2]] = radian;
            model.updateMatrix();
            model.updateMatrixWorld();
            getUpdatedBoundingBox();
            getVolume(model.boundingBox);
            drawBoundingBox(model.boundingBox);
        }
        else
        {
//            console.log('draw best volume');
//            model.rotation[bestvolume.shortaxis] += 0.01;
//            model.updateMatrix();
//            model.updateMatrixWorld();
//            getUpdatedBoundingBox();
//            drawBoundingBox(model.boundingBox);
//            console.log(model.rotation[bestvolume.shortaxis], getBoxVolume(model.boundingBox));
        }
    }
}

function getBoxVolume(bounds)
{
    var width = bounds.max.x - bounds.min.x;
    var height = bounds.max.y - bounds.min.y;
    var depth = bounds.max.z - bounds.min.z;
    var volume = width * depth * height;
    return volume;
}

function getUpdatedBoundingBox()
{
    boundsC = new THREE.Box3();
    boundsC.max.x = boundsC.max.y = boundsC.max.z = -9999999;
    boundsC.min.x = boundsC.min.y = boundsC.min.z = 9999999;

    model.traverse(function(child)
    {
        if (child instanceof THREE.Mesh)
        {
            for (var i = 0; i < child.geometry.vertices.length; i++)
            {
                var vector = child.geometry.vertices[i].clone();
                vector.applyMatrix4(model.matrixWorld);
                boundsC.max.x = Math.max(vector.x, boundsC.max.x);
                boundsC.max.y = Math.max(vector.y, boundsC.max.y);
                boundsC.max.z = Math.max(vector.z, boundsC.max.z);
                boundsC.min.x = Math.min(vector.x, boundsC.min.x);
                boundsC.min.y = Math.min(vector.y, boundsC.min.y);
                boundsC.min.z = Math.min(vector.z, boundsC.min.z);
            }
        }
    });
    model.boundingBox = boundsC.clone();
}

function getVolume(bounds)
{
    var volume = getBoxVolume(bounds);
    var minimumDimension = 0;

    bestvolume.volume = Math.min(bestvolume.volume, volume);
    console.log(bestvolume.volume, volume);
    if (bestvolume.volume === volume)
    {

        bestvolume.bounds = bounds.clone();
        bestvolume.rotation.x = model.rotation.x;
        bestvolume.rotation.y = model.rotation.y;
        bestvolume.rotation.z = model.rotation.z;
        var width = bestvolume.bounds.max.x - bestvolume.bounds.min.x;
        var height = bestvolume.bounds.max.y - bestvolume.bounds.min.y;
        var depth = bestvolume.bounds.max.z - bestvolume.bounds.min.z;
        minimumDimension = Math.min(width, height, depth);
        bestvolume.shortaxis = (minimumDimension === width) ? 'x' : (minimumDimension === height) ? 'y' : 'z';
    }

    count++;
}

function getMidPoint(min, max)
{
    return min + ((max - min) / 2);
}

function drawBoundingBox(bounds)
{
    var bBoxGeometry = new THREE.BoxGeometry(bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y, bounds.max.z - bounds.min.z, 1, 1, 1);
    var bBoxMaterial = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0xFF9900
    });
    if (bbox !== undefined)
    {
        scene.remove(bbox);
    }
    bbox = new THREE.Mesh(bBoxGeometry, bBoxMaterial);
    bbox.updateMatrix();
    bbox.position.x = bounds.min.x + ((bounds.max.x - bounds.min.x) / 2);
    bbox.position.y = bounds.min.y + ((bounds.max.y - bounds.min.y) / 2);
    bbox.position.z = bounds.min.z + ((bounds.max.z - bounds.min.z) / 2);
    scene.add(bbox);
}

function drawModelAxis(bounds)
{
    var box = (bounds === undefined) ? model.boundingBox : bounds;
    var material = new THREE.LineBasicMaterial({
        color: 0xFFFFFF
    });

    var points = [[box.min.x, box.max.x], [box.min.y, box.max.y], [box.min.z, box.max.z]];
    var scene = $("#editor").threeworld('get', 'scene');
    var cubePoints = [];
    for (var i = 0; i < points[0].length; i++)
    {
        var x = points[0][i];
        for (var j = 0; j < points[1].length; j++)
        {
            var y = points[1][j];
            for (var k = 0; k < points[2].length; k++)
            {
                var z = points[2][k];
                var vertex = new THREE.Vector3(x, y, z);
                cubePoints.push(vertex);
            }
        }
    }
    for (var i = 0; i < cubePoints.length / 2; i++)
    {
        var index2 = cubePoints.length - i - 1;
        var geometry = new THREE.Geometry();
        geometry.vertices.push(cubePoints[i]);
        geometry.vertices.push(cubePoints[index2]);
        scene.add(new THREE.Line(geometry, material));
    }
}

function addModel()
{
    $("#editor").threeworld('load', 'http://localhost/models/CaptainAmericaShifted.obj', 'obj');
//    $("#editor").threeworld('load', 'http://localhost/models/ApeTusked.obj', 'obj');
//    $("#editor").threeworld('load', 'http://localhost/models/CaptainAmericaNormal.obj', 'obj');
//    $("#editor").threeworld('load', 'http://localhost/models/Al_shifted.obj', 'obj');
//    $("#editor").threeworld('load', '../../models/HulkShifted.obj', 'obj');
}

//9.834908596350855

function main()
{
    var w = window.innerWidth;
    var h = window.innerHeight;
//    $("#editor").threeworld({worldwidth: w * 1, worldheight: h * 1, columns: 2, axis: false, views: {types: [FRONT_VIEW, TOP_VIEW, SIDE_VIEW, FREE_VIEW]}}).on('meshloadcomplete', function(e)
    $("#editor").threeworld({worldwidth: w * 1, worldheight: h * 1, columns: 2, axis: true, floor: true, defaultlights: true, views: {types: [FREE_VIEW]}}).on('meshloadcomplete', function(e)
    {
        model = e.model;
        model.name = "Captain America";
        scene = $("#editor").threeworld('get', 'scene');
//        drawModelAxis();
    });
    addModel();
    render3D();
}
$(document).ready(main);