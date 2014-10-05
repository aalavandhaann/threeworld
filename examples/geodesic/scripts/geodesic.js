var scene, originalCubeMaterial, originalCube, covarianceMatrix, model;

function render3D()
{
    requestAnimationFrame(render3D);
    $("#editor").threeworld('render');
}

function drawPrincipalAxis(eigenObject)
{
//    var eigenVectors = eigenObject.E.x;
    var eigenVectors = eigenObject.U;
//    var lambdas = eigenObject.lambda.x ;
    var lambdas = eigenObject.S ;
    var lineMaterial = new THREE.LineBasicMaterial({color: 0xFFFFFF});
    var lineNormalMaterial = new THREE.LineBasicMaterial({color: 0x00FF00});
    var origin = new THREE.Vector3();
    console.log(eigenVectors);
    for (var i = 0; i < eigenVectors.length; i++)
    {
        var lineGeometry = new THREE.Geometry();
        var lineNormalGeometry = new THREE.Geometry();
        
        var vectorArray = eigenVectors[i];
        var nextVectorArray = eigenVectors[(i + 1) % 3];
        
        var eigenVector = new THREE.Vector3(vectorArray[0], vectorArray[1], vectorArray[2]);
        var nextEigenVector = new THREE.Vector3(nextVectorArray[0], nextVectorArray[1], nextVectorArray[2]);
        var normalVector = nextEigenVector.cross(eigenVector);
        var line, normal;
        
        normalVector.multiplyScalar(2);
        
//        eigenVector.multiplyScalar(lambdas[i]);
        lineGeometry.vertices.push(origin);
        lineGeometry.vertices.push(eigenVector);
       
        lineNormalGeometry.vertices.push(origin);
        lineNormalGeometry.vertices.push(normalVector);

        line = new THREE.Line(lineGeometry, lineMaterial);
        normal = new THREE.Line(lineNormalGeometry, lineNormalMaterial);
        
        console.log('ADD NORMAL LINE ',normalVector);
        scene.add(normal);
        scene.add(line);        
    }

}

function secondOrderCovarianceMatrix(mesh)
{
    var matrixSum = new THREE.Matrix3(0, 0, 0, 0, 0, 0, 0, 0, 0);
    var covariances = [];
    var covarianceMatrix = [];
    var tempArray = [];
    var n = mesh.geometry.vertices.length;
    var arr;

    //Calculation of a covariance matrix from a vector v = [x y z] is by
    //|v.x * v.x , v.x* v.y , v.x * v.z|
    //|v.x * v.x , v.x* v.y , v.x * v.z|
    //|v.x * v.x , v.x* v.y , v.x * v.z|
    //That results in a 3x3 matrix from a 1x3 vector/point
    //So if a mesh has 10 vertices calcualte all the 10 covariance matrix from 
    //the 10 vectors and sum them all up. This will result in a 3x3 matrix.
    //Then multiply each of the elements in this 3x3 matrix with the scalar value
    // 1 / totalVerticesInMesh to get the covariance matrix;

    for (var i = 0; i < n; i++)
    {
        var v = mesh.geometry.vertices[i];
        var matrix = new THREE.Matrix3();

        matrix.fromArray([
            v.x * v.x, v.x * v.y, v.x * v.z,
            v.y * v.x, v.y * v.y, v.y * v.z,
            v.z * v.x, v.z * v.y, v.z * v.z
        ]);
        covariances.push(matrix);
    }

    for (var i = 0; i < covariances.length - 1; i++)
    {
        var covarianceM = covariances[i];
        for (var j = 0; j < matrixSum.elements.length; j++)
        {
            matrixSum.elements[j] += covarianceM.elements[j];
        }
    }

    for (var i = 0; i < matrixSum.elements.length; i++)
    {
        matrixSum.elements[i] *= 1 / (n);
    }

    tempArray = matrixSum.toArray();

    for (var i = 0; i < tempArray.length; i++)
    {
        if ((i % 3) === 0)
        {
            arr = [];
            covarianceMatrix.push(arr);
        }
        arr.push(tempArray[i]);
    }

    return covarianceMatrix;
}

function calculateMeanMatrix(mesh, updateMesh)
{
    var origin = new THREE.Vector3();
    var oneByN = 1 / mesh.geometry.vertices.length;
    var newGeometry = mesh.geometry.clone();


    //This step is merely to align a geometry to origin
    //It uses the mean or average mathematical method
    //e.g. if array a = [1,2,3,4,17,6,7,8];
    //The total number of elements = 8;
    //Then the mean value is (1 + 2 + 3 + 4 + 17 + 6 + 7 + 8) / 8 = 48 / 8 = 6
    //The Mean Matrix will be ( 1 - 6, 2 - 6, 3 - 6, 4 - 6, 17 - 6, 6 - 6, 7 - 6, 8 - 6)
    //Resulting in Mean Matrix which is (-5, -4, -3, -2, 11, 0, 1, 2)

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

    //The below step is equivalent to iterating through all the vertices of 
    //the geometry and reducing the origin.x, origin.y and origin.z values 
    //from the vertices. 
    //e.g. geometry.vertices[i].x - origin.x
    //e.g. geometry.vertices[i].y - origin.y
    //e.g. geometry.vertices[i].z - origin.z
    
    newGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(-origin.x, -origin.y, -origin.z));
    
    if (updateMesh)
    {
        mesh.geometry = newGeometry.clone();
        mesh.geometry.verticesNeedUpdate = true;
    }
    return newGeometry;
}

function showCubeForPCA()
{
    var geometry = new THREE.BoxGeometry(3, 3, 3, 1, 1, 1);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(1.5 + 3, 1.5, 1.5 + 3));
    originalCube = new THREE.Mesh(geometry, originalCubeMaterial);
    scene.add(addBoxHelper(originalCube, 0xFF0000));
}

function addBoxHelper(mesh, color)
{
    var cube = new THREE.BoxHelper( mesh );
    cube.material.color.set( color );
    return cube;
}

function main()
{
    var w = window.innerWidth;
    var h = window.innerHeight;
//    $("#editor").threeworld({worldwidth: w * 1, worldheight: h * 1, columns: 2, axis: false, views: {types: [FRONT_VIEW, TOP_VIEW, SIDE_VIEW, FREE_VIEW]}}).on('meshloadcomplete', function(e)
//    $("#editor").threeworld({worldwidth: w * 1, worldheight: h * 1, columns: 2, axis: false, floor: true, defaultlights: true, views: {types: [FREE_VIEW, SIDE_VIEW, FRONT_VIEW, TOP_VIEW]}});
    $("#editor").threeworld({worldwidth: w * 1, worldheight: h * 1, columns: 2, axis: false, floor: true, defaultlights: true, views: {types: [FREE_VIEW]}});
    
    scene = $("#editor").threeworld('get', 'scene');
    
//    $("#editor").threeworld('load', '../../models/CaptainAmericaShifted.obj', 'obj').on('meshloadcomplete', function(e)
//    {
//        scene = $("#editor").threeworld('get', 'scene');
//        model = e.model;
//        model.traverse(function(child)
//        {
//            if (child instanceof THREE.Mesh)
//            {
//                calculateMeanMatrix(child, true);
//                drawPrincipalAxis(numeric.eig(secondOrderCovarianceMatrix(child)));
////                model.visible = false;
//            }
//        });
//    });


    showCubeForPCA();
    scene.add(addBoxHelper(new THREE.Mesh(calculateMeanMatrix(originalCube, false), new THREE.MeshBasicMaterial({color: 0x0000FF, wireframe: true})), 0x0000FF));
//    drawPrincipalAxis(numeric.eig(secondOrderCovarianceMatrix(originalCube)));
    drawPrincipalAxis(numeric.svd(secondOrderCovarianceMatrix(originalCube)));
    render3D();
}
$(document).ready(main);