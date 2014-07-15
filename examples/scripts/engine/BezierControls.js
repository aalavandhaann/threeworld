function BezierControls()
{
    this.controlsHolder = new THREE.Object3D();
    this.lineObjectGeometry = new THREE.Geometry();
    this.lineObjectMaterial = new THREE.LineBasicMaterial({
        color: 0x00FF00,
        lineWidth:3,
        fog:true
    });    
    this.lineObject = new THREE.Line(this.lineObjectGeometry, this.lineObjectMaterial);
    this.points = new Array();
    this.path = new BezierPath();
    this.addSegment();
    return this;
}

BezierControls.prototype.updateLineGeometry = function()
{
    this.lineObject.geometry.verticesNeedUpdate = true;
    
    for(var i=0;i<this.points.length;i++)
    {
        if(this.points[i].position != undefined)
        {
            this.lineObjectGeometry.vertices[i].x = this.points[i].position.x;
            this.lineObjectGeometry.vertices[i].y = this.points[i].position.y;
            this.lineObjectGeometry.vertices[i].z = this.points[i].position.z; 
        }
               
    }    
    this.lineObject.updateMatrix();
    this.path.updatePath(this.points);
}

BezierControls.prototype.createLineGeometry = function()
{
    this.lineObjectGeometry = new THREE.Geometry();
    
    for(var i=0;i<this.points.length;i++)
    {
        this.points[i].name = 'point_'+i;
        this.lineObjectGeometry.vertices[i] = (this.points[i].position);
    }
    if(this.lineObject)
    {
        this.controlsHolder.remove(this.lineObject);
        this.lineObject = null;
    }
    
    if(this.path.getPath())
    {
        this.controlsHolder.remove(this.path.getPath());
    }
    
    this.lineObject = new THREE.Line(this.lineObjectGeometry, this.lineObjectMaterial);
    this.lineObject.updateMatrix();
    
    this.path.createPath(this.points);
    
    this.controlsHolder.add(this.path.getPath());
    this.controlsHolder.add(this.lineObject);
    
    this.controlsHolder.updateMatrix();
}

BezierControls.prototype.addSegment = function()
{
    var length = 3;
    
    if(this.points.length === 0)
    {
        length = 4;
        this.points.push(this.getAnchorPoint(), this.getControlPoint(), this.getControlPoint(), this.getAnchorPoint());
    }
    else
    {
        this.points.push(this.getControlPoint(), this.getControlPoint(), this.getAnchorPoint());
    }
    
    for(var i = 0;i < length;i++)
    {
        var index = i + (this.points.length - length);
        var point = this.points[index];
        this.controlsHolder.add(point);
    }
    this.createLineGeometry();    
}

BezierControls.prototype.removeSegment = function()
{
    var length = 3;
    
    if(this.points.length == 0)
    {
        return;
    }
    
    if(this.points.length == 4)
    {
        length = 4;
    }
    
    for(var i = length;i > 0;i--)
    {
        var index = this.points.length - 1;
        var point = this.points[index];
        this.controlsHolder.remove(point);
        this.points.pop();
        point = null;
    }
    this.createLineGeometry();
}

BezierControls.prototype.clearCurve = function()
{
    var diff = this.points.length - 4;
    var runLength = diff + 1;
    
    for(var i=0;i<runLength;i++)
    {
        this.removeSegment();
    }
}


BezierControls.prototype.getPoint = function(color)
{
    var geometry = new THREE.SphereGeometry(0.2, 10, 10, 0, 6.28, 0, 6.28);
    var material = new THREE.MeshBasicMaterial({
        color:color
    });
    
    //    var boundingGeometry = 
    var object = new THREE.Mesh(geometry, material);
    
    var bounds;
    var bBoxGeometry;
    var bBoxMaterial;
    var bBox;
    
    geometry.computeBoundingBox();
    bounds = geometry.boundingBox;
    
    bBoxGeometry = new THREE.CubeGeometry(bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y, bounds.max.z - bounds.min.z, 1, 1, 1);
    bBoxMaterial = new THREE.MeshBasicMaterial({
        wireframe:true,
        color:0xFF9900
    });
    bBox = new THREE.Mesh(bBoxGeometry, bBoxMaterial);
    //     = new THREE.Mesh(geometrvar rectangley, material);
    object.position.x = Math.random() * 5;
    object.position.z = Math.random() * 5;
    object.selector = bBox;
    object.selector.visible = false;
    object.add(bBox);
    return object;
}

BezierControls.prototype.getControlPoint = function()
{
    //    return this.getPoint(0x0099FF);
    return this.getPoint(0xFFFFFF);
}

BezierControls.prototype.getAnchorPoint = function()
{
    return this.getPoint(0x9900FF);
}

BezierControls.prototype.getObject = function()
{
    return this.controlsHolder;
}

BezierControls.prototype.getPoints = function()
{
    return this.points;
}