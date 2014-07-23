var scene, originalCubeMaterial, pcaCubeMaterial, originalCube, pcaCube, covarianceMatrix;
function render3D()
{
    requestAnimationFrame(render3D);
    $("#editor").threeworld('render');
}

function secondOrderCovarianceMatrix()
{
    var matrixSum = new THREE.Matrix3(0, 0, 0, 0, 0, 0, 0, 0, 0);
    var covariances = [];
    var n = pcaCube.geometry.vertices.length;

    for (var i = 0; i < n; i++)
    {
        var v = pcaCube.geometry.vertices[i];
        var matrix = new THREE.Matrix3();

        matrix.set(v.x * v.x, v.x * v.y, v.x * v.z,
                v.y * v.x, v.y * v.y, v.y * v.z,
                v.z * v.x, v.z * v.y, v.z * v.z);
        covariances.push(matrix);
    }

    for (var i = 0; i < covariances.length - 1; i++)
    {
        var covarianceM = covariances[i];
        for (var j = 0;j < matrixSum.elements.length; j++)
        {
            matrixSum.elements[j] += covarianceM.elements[j];
        }
    }

    for (var i = 0; i < matrixSum.elements.length; i++)
    {
        matrixSum.elements[i] *= 1 / n;
    }
    
    console.log(matrixSum, matrixSum.transpose());
    return matrixSum;
}

function drawPCA(covarianceMatrix)
{
//    var eigenVectors = [];
    var lineMaterial = new THREE.LineBasicMaterial({color: 0xFFFFFF});
    
    var eigenVectors = [
        [-1 , -1 , 1],
        [1 , 0 , 1],
        [-1 , 1 , 0]
    ];
    
    
    for(var i=0;i<3;i++)
    {
//        var eigenVector = new THREE.Vector3(covarianceMatrix.elements[i],covarianceMatrix.elements[i+3],covarianceMatrix.elements[i+6]);
        var eigenVector = new THREE.Vector3(eigenVectors[i][0],eigenVectors[i][1],eigenVectors[i][2]);
        var lineGeometry = new THREE.Geometry();
        var line;
        lineGeometry.vertices.push(new THREE.Vector3());
        lineGeometry.vertices.push(eigenVector);
        line = new THREE.Line(lineGeometry, lineMaterial);
        
        scene.add(line);
        console.log('add line ', eigenVector);
//        eigenVectors.push(eigenVector);
    }
}

function cubeToGeometricalOrigin()
{
    var origin = new THREE.Vector3();
    var oneByN = 1 / originalCube.geometry.vertices.length;
    var newGeometry = originalCube.geometry.clone();

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

    for (var i = 0; i < newGeometry.vertices.length; i++)
    {
        var vertex = newGeometry.vertices[i];
        vertex.x = vertex.x - origin.x;
        vertex.y = vertex.y - origin.y;
        vertex.z = vertex.z - origin.z;
    }
    pcaCubeMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00, wireframe: true});
    pcaCube = new THREE.Mesh(newGeometry, pcaCubeMaterial);
    scene.add(pcaCube);
    console.log(oneByN, origin);
}

function applyPCAForCube()
{
    cubeToGeometricalOrigin();
    covarianceMatrix = secondOrderCovarianceMatrix();
    drawPCA(covarianceMatrix);
}

function showCubeForPCA()
{
    var geometry = new THREE.BoxGeometry(3, 3, 3, 1, 1, 1);
    originalCubeMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000, wireframe: true});
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(1.5 + 3, 1.5, 1.5 + 3));
    originalCube = new THREE.Mesh(geometry, originalCubeMaterial);
    scene.add(originalCube);
}

function main()
{
    var w = window.innerWidth;
    var h = window.innerHeight;
//    $("#editor").threeworld({worldwidth: w * 1, worldheight: h * 1, columns: 2, axis: false, views: {types: [FRONT_VIEW, TOP_VIEW, SIDE_VIEW, FREE_VIEW]}}).on('meshloadcomplete', function(e)
    $("#editor").threeworld({worldwidth: w * 1, worldheight: h * 1, columns: 2, axis: false, floor: true, defaultlights: true, views: {types: [FREE_VIEW, SIDE_VIEW, FRONT_VIEW, TOP_VIEW]}});
    scene = $("#editor").threeworld('get', 'scene');
    showCubeForPCA();
    applyPCAForCube();
    render3D();
}
$(document).ready(main);