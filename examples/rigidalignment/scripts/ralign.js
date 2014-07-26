var model, scene, boundingBox, bbox, radian = 0, resolution = 0.01;
var bestvolume =
        {
            volume: 99999999,
            rotation: {x: 0, y: 0, z: 0},
            volumefound: false,
            bounds: new THREE.Box3(),
            shortaxis: 'x',
            radian: 0,
            resolution: 0.01,
            fullcycle: 3.14 * 2,
            axis: ['z', 'x', 'y'],
            oneIterationComplete: false,
            volumeFound: function()
            {
                return (this.axis.length === 0);
            },
            getAxis: function(model)
            {
                if (this.radian > this.fullcycle)
                {
                    this.radian = 0;
                    this.alignModelToBestVolume(model);
                    this.axis.shift();
                }
                return this.axis[0];
            },
            getVolume: function(bounds)
            {
                var width = bounds.max.x - bounds.min.x;
                var height = bounds.max.y - bounds.min.y;
                var depth = bounds.max.z - bounds.min.z;
                var volume = width * depth * height;
                return volume;
            },
            alignModelToBestVolume: function(model)
            {
                var ref = this;
                model.traverse(function(child)
                {
                    if (child instanceof THREE.Mesh)
                    {
                        child.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(ref.rotation.x));
                        child.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(ref.rotation.y));
                        child.geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(ref.rotation.z));
                        ref.rotation.x = ref.rotation.y = ref.rotation.z = 0;
                        model.rotation.x = model.rotation.y = model.rotation.z = 0;
                        child.geometry.verticesNeedUpdate = true;
                    }
                });
            },
            computeBestVolume: function(bounds, model)
            {
                var volume = this.getVolume(bounds);
                var minimumDimension = 0;
                var width, height, depth;
                var oldvolume = this.volume;
                this.volume = Math.min(this.volume, volume);
                if (this.volume === volume)
                {
                    console.log('VOLUME REDUCED FROM ::: ', oldvolume, ' TO :::: ', this.volume);
                    this.bounds = bounds.clone();
                    this.rotation.x = model.rotation.x;
                    this.rotation.y = model.rotation.y;
                    this.rotation.z = model.rotation.z;
                    width = this.bounds.max.x - this.bounds.min.x;
                    height = this.bounds.max.y - this.bounds.min.y;
                    depth = this.bounds.max.z - this.bounds.min.z;
                    minimumDimension = Math.min(width, height, depth);
                    this.shortaxis = (minimumDimension === width) ? 'x' : (minimumDimension === height) ? 'y' : 'z';
                    this.alignModelToBestVolume(model);
                }
            },
            findBestVolume: function(model)
            {
//                if (this.axis.length === 0)
//                {
//                    if (!this.oneIterationComplete)
//                    {
//                        this.oneIterationComplete = true;
//                        this.axis = ['y', 'x', 'z'];
//                        this.radian = 0;
//                        this.alignModelToBestVolume(model);
//                    }
//                }
                if (!this.volumeFound())
                {
                    this.radian += this.resolution;
                    model.rotation[this.getAxis(model)] = this.radian;
                    model.boundingBox.setFromObject(model);
                    this.computeBestVolume(model.boundingBox, model);
                }
                else
                {
                    if (!this.volumefound)
                    {
                        this.volumefound = true;
                        model.traverse(function(child)
                        {
                            if (child instanceof THREE.Mesh)
                            {
                                meshToGeometricalOrigin(child);
                            }
                        });
                        console.log('FINAL VOLUME ::: ', this.getVolume(model.boundingBox), this.volume);
                    }
                }
            }
        };
function render3D()
{
    requestAnimationFrame(render3D);
    if (model !== undefined)
    {
        model.boundingBox.setFromObject(model);
        bestvolume.findBestVolume(model);
        drawBoundingBox(model.boundingBox);
    }
    $("#editor").threeworld('render');
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


function meshToGeometricalOrigin(mesh)
{
    var origin = new THREE.Vector3();
    var oneByN = 1 / mesh.geometry.vertices.length;
    console.log(mesh.geometry.vertices.length);
    for (var i = 0; i < mesh.geometry.vertices.length; i++)
    {
        var vertex = mesh.geometry.vertices[i];
        origin.x += vertex.x;
        origin.y += vertex.y;
        origin.z += vertex.z;
    }

    origin.x = origin.x * oneByN;
    origin.y = origin.y * oneByN;
    origin.z = origin.z * oneByN;

    mesh.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-origin.x, -origin.y, -origin.z));

//    for (var i = 0; i < mesh.geometry.vertices.length; i++)
//    {
//        var vertex = mesh.geometry.vertices[i];
//        vertex.x = vertex.x - origin.x;
//        vertex.y = vertex.y - origin.y;
//        vertex.z = vertex.z - origin.z;
//    }
}

function addModel()
{
//    $("#editor").threeworld('load', 'http://localhost/models/CaptainAmericaShifted.obj', 'obj');
//    $("#editor").threeworld('load', 'http://localhost/models/ApeTusked.obj', 'obj');
//    $("#editor").threeworld('load', 'http://localhost/models/CaptainAmericaNormal.obj', 'obj');
//    $("#editor").threeworld('load', 'http://localhost/models/Al_shifted.obj', 'obj');
    $("#editor").threeworld('load', 'http://localhost/models/HulkShifted.obj', 'obj');
//    $("#editor").threeworld('load', 'http://localhost/models/Hulk.obj', 'obj');
}
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
        model.traverse(function(child)
        {
            if (child instanceof THREE.Mesh)
            {
                console.log(child);
                meshToGeometricalOrigin(child);
            }
        });
        model.position.x = model.position.y = model.position.z = 0;
        model.boundingBox.setFromObject(model);
        drawBoundingBox(model.boundingBox);
    });
    addModel();
    render3D();
}
$(document).ready(main);