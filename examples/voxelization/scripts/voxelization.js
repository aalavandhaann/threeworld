var scene, camera, model, mesh;
var voxels =
        {
            voxels: [],
            totalwidth: 0,
            totalheight: 0,
            totaldepth: 0,
            unitwidth: 0,
            unitheight: 0,
            unitdepth: 0,
            totalvoxels: 0
        };
var resolution = 50;
var billboard;

function render3D()
{
    requestAnimationFrame(render3D);
    if((camera !== undefined) && (billboard !== undefined))
    {
        billboard.lookAt(camera.position);
    }
    $("#editor").threeworld('render');
}

function createBillBoard()
{
    billboard = new THREE.Mesh(new THREE.PlaneGeometry(7,7,1,1), new THREE.MeshLambertMaterial({color: 0x000077, wireframe: false}));
    scene.add(billboard);
}

function initializeVoxelMap(bounds)
{
    var width = bounds.max.x - bounds.min.x, height = bounds.max.y - bounds.min.y, depth = bounds.max.z - bounds.min.z;
    var unitwidth = (width / resolution), unitheight = (height / resolution), unitdepth = (depth / resolution);

    voxels =
            {
                allvoxels: [],
                voxels: [],
                startx: bounds.min.x,
                starty: bounds.min.y,
                startz: bounds.min.z,
                totalwidth: width,
                totalheight: height,
                totaldepth: depth,
                unitwidth: unitwidth,
                unitheight: unitheight,
                unitdepth: unitdepth,
                totalvoxels: 0
            };
}

function getVoxel(xindex, yindex, zindex)
{
    var id = 'voxel_' + xindex + '_' + yindex + '_' + zindex;

    if (voxels[id] === undefined)
    {
        voxels[id] = {id: id, vertices: [], xindex: xindex, yindex: yindex, zindex: zindex, x: 0, y: 0, z: 0};
        voxels.voxels.push(voxels[id]);
        voxels.totalvoxels++;
    }
    return voxels[id];
}

function drawVoxel(x, y, z)
{
//    var mesh = THREE.SceneUtils.createMultiMaterialObject(new THREE.BoxGeometry(voxels.unitwidth, voxels.unitheight, voxels.unitdepth, 1, 1, 1), 
//    [new THREE.MeshLambertMaterial({color: 0x007700}),new THREE.MeshBasicMaterial({color: 0x222222, wireframe: true})]);
    var mesh = new THREE.Mesh(
            new THREE.BoxGeometry(voxels.unitwidth, voxels.unitheight, voxels.unitdepth, 1, 1, 1),
            new THREE.MeshLambertMaterial({color: 0x007700, wireframe: false})
            );
    mesh.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(x, y, z));

    scene.add(mesh);
}

function createVoxel(vertex, vertexindex)
{
    var sx = voxels.startx, sy = voxels.starty, sz = voxels.startz;
    var unitwidth = voxels.unitwidth, unitheight = voxels.unitheight, unitdepth = voxels.unitdepth;
    var xindex = Math.floor((vertex.x - sx) / unitwidth);
    var yindex = Math.floor((vertex.y - sy) / unitheight);
    var zindex = Math.floor((vertex.z - sz) / unitdepth);

    var voxel = getVoxel(xindex, yindex, zindex);
    var vertexinfo = new Object();

    voxel.x = sx + (xindex * unitwidth);
    voxel.y = sy + (yindex * unitheight);
    voxel.z = sz + (zindex * unitdepth);

    vertexinfo.index = vertexindex;
    vertexinfo.vertex = vertex;
    vertexinfo.xindex = xindex;
    vertexinfo.yindex = yindex;
    vertexinfo.zindex = zindex;

    voxel.vertices.push(vertexinfo);
}

function createVoxelMap(mesh)
{
    var geometry = mesh.geometry;
    var iterationLength = geometry.vertices.length;
    var bounds = geometry.boundingBox;
    initializeVoxelMap(bounds);

    for (var i = 0; i < iterationLength; i++)
    {
        var vertex = geometry.vertices[i];
        createVoxel(vertex, i);
    }

    for (var i = 0; i < voxels.voxels.length; i++)
    {
        var voxel = voxels.voxels[i];
        drawVoxel(voxel.x, voxel.y, voxel.z);
    }
    mesh.visible = false;
    console.log('TOTAL VOXELS ::: ', voxels.voxels.length);
}

function createBoxHelper(color, bounds, inboundMesh)
{
    var width = (bounds.max.x - bounds.min.x);
    var height = (bounds.max.y - bounds.min.y);
    var depth = (bounds.max.z - bounds.min.z);
    var sx = (width / 2) + bounds.min.x;
    var sy = (height / 2) + bounds.min.y;
    var sz = (depth / 2) + bounds.min.z;
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth, 1, 1, 1), new THREE.MeshBasicMaterial({color: color, wireframe: true}));
    var cube = new THREE.BoxHelper(mesh);
    cube.material.color.set(color);
    inboundMesh.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-sx, -sy, -sz));
    return cube;
}


function calculateMeanMatrix(mesh, updateMesh)
{
    var origin = new THREE.Vector3();
    var oneByN = 1 / mesh.geometry.vertices.length;
    var newGeometry = mesh.geometry.clone();

    for (var i = 0; i < newGeometry.vertices.length; i++)
    {
        var vertex = newGeometry.vertices[i];
        origin.x += vertex.x;
        origin.y += vertex.y;
        origin.z += vertex.z;
    }

    origin.x = origin.x * oneByN;
    origin.y = origin.y * oneByN;
    origin.z = origin.z * oneByN;

    newGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(-origin.x, -origin.y, -origin.z));

    if (updateMesh)
    {
        mesh.geometry = newGeometry.clone();
        mesh.geometry.verticesNeedUpdate = true;
    }
    return newGeometry;
}

function onModelLoaded(e)
{
    model = e.model;
    model.traverse(function(child)
    {
        if (child instanceof THREE.Mesh)
        {
//            child.geometry.applyMatrix(new THREE.Matrix4().makeScale(0.1,0.1,0.1));
            mesh = child;
            calculateMeanMatrix(child, true);

            child.geometry.computeBoundingBox();
            child.updateMatrix();
            child.updateMatrixWorld();

            scene.add(createBoxHelper(0x0000FF, child.geometry.boundingBox, child));
            return;
        }
    });
//    createBillBoard();
//    createVoxelMap(mesh);
//    model.visible = false;
}

function loadModel()
{
    console.log('LOAD MODEL');
    $("#editor").threeworld('load', '../../models/SpaceShip2.obj', 'objmtl', '../../models/SpaceShip2.mtl');
//    $("#editor").threeworld('load', 'http://localhost/models/CaptainAmericaNormal.obj', 'objmtl', 'http://localhost/models/CaptainAmericaNormal.mtl');
}

function main()
{
    var w = window.innerWidth;
    var h = window.innerHeight;
//    $("#editor").threeworld({worldwidth: w * 1, worldheight: h * 1, columns: 2, axis: false, views: {types: [FRONT_VIEW, TOP_VIEW, SIDE_VIEW, FREE_VIEW]}}).on('meshloadcomplete', function(e)
//    $("#editor").threeworld({worldwidth: w * 1, worldheight: h * 1, columns: 2, axis: false, floor: true, defaultlights: true, views: {types: [FREE_VIEW, SIDE_VIEW, FRONT_VIEW, TOP_VIEW]}});
    $("#editor").threeworld({worldwidth: w * 1, worldheight: h * 1, columns: 2, axis: false, floor: true, defaultlights: true, views: {types: [FREE_VIEW]}}).on('meshloadcomplete', onModelLoaded);
    scene = $("#editor").threeworld('get', 'scene');
    camera = $("#editor").threeworld('get', 'camera');
    loadModel();
    render3D();
}
$(document).ready(main);