var scene, originalCubeMaterial, originalCube, covarianceMatrix;

function render3D()
{
    requestAnimationFrame(render3D);
    $("#editor").threeworld('render');
}

function secondOrderCovarianceMatrix(mesh)
{
    var matrixSum = new THREE.Matrix3(0, 0, 0, 0, 0, 0, 0, 0, 0);
    var covariances = [];
    var n = mesh.geometry.vertices.length;
    
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

        matrix.set(
                    v.x * v.x, v.x * v.y, v.x * v.z,
                    v.y * v.x, v.y * v.y, v.y * v.z,
                    v.z * v.x, v.z * v.y, v.z * v.z
                    );
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
        matrixSum.elements[i] *= 1 / n;
    }
    return matrixSum;
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
    
    for (var i = 0; i < newGeometry.vertices.length; i++)
    {
        var vertex = newGeometry.vertices[i];
        vertex.x -= origin.x;
        vertex.y -= origin.y;
        vertex.z -= origin.z;
    }

    //The below step is equivalent to iterating through all the vertices of 
    //the geometry and reducing the origin.x, origin.y and origin.z values 
    //from the vertices. 
    //e.g. geometry.vertices[i].x - origin.x
    //e.g. geometry.vertices[i].y - origin.y
    //e.g. geometry.vertices[i].z - origin.z

//    newGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(new THREE.Vector3(-origin.x, -origin.y, -origin.z)));

    if (updateMesh)
    {
        mesh.geometry = newGeometry.clone();
        mesh.geometry.verticesNeedUpdate = true;
//        
    }
    return newGeometry;
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
//    $("#editor").threeworld({worldwidth: w * 1, worldheight: h * 1, columns: 2, axis: false, floor: true, defaultlights: true, views: {types: [FREE_VIEW, SIDE_VIEW, FRONT_VIEW, TOP_VIEW]}});
    $("#editor").threeworld({worldwidth: w * 1, worldheight: h * 1, columns: 2, axis: false, floor: true, defaultlights: true, views: {types: [FREE_VIEW]}});
    scene = $("#editor").threeworld('get', 'scene');
    showCubeForPCA();
    calculateMeanMatrix(originalCube, true);
    render3D();
}
$(document).ready(main);