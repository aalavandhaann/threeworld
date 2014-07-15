/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function BezierPath()
{
    this.lineObjectGeometry = null;
    this.lineObjectMaterial = new THREE.LineBasicMaterial({
        color: 0xFF0000,
        lineWidth:3,
        fog:true
    });    
    this.points = [];
    return this;
}

BezierPath.prototype.getBezierValue = function(frequency, anchor1, control1, control2, anchor2)
{
    var bezierValue = (Math.pow((1 - frequency), 3) * anchor1)
    + ((3 * frequency) * Math.pow((1 - frequency), 2) * control1)
    + ((3 * Math.pow(frequency, 2)) * (1 - frequency) * control2)
    + (Math.pow(frequency, 3) * anchor2);

    return bezierValue;
}

BezierPath.prototype.getBezierPoint = function(frequency, anchor1, control1, control2, anchor2)
{
    // B(t) = ((1-t)^3 * p0) + (3t * (1-t)^2 * p1) + (3t^2 * (1-t) * p2) + (t^3 * p3);
    var xx = this.getBezierValue(frequency,
        anchor1.x, control1.x,
        control2.x, anchor2.x);
        
    var yy = this.getBezierValue(frequency,
        anchor1.y, control1.y,
        control2.y, anchor2.y);
        
    var zz = this.getBezierValue(frequency,
        anchor1.z, control1.z,
        control2.z, anchor2.z);
    
    
    return new THREE.Vector3(xx, yy, zz);
}

BezierPath.prototype.updatePath = function(points)
{
    var loopTime = ((points.length - 4) / 3) + 1;
    this.lineObjectGeometry.verticesNeedUpdate = true;
    
    var index = 0;
    var curveIndex = 0;
    
    for(var i=0;i<loopTime;i++)
    {
        for(var j=0;j<=1;j+=0.1)
        {
            var anchor1 = this.points[curveIndex];
            var control1 = this.points[curveIndex + 1];
            var control2 = this.points[curveIndex + 2];
            var anchor2 = this.points[curveIndex + 3];
            
            var curvePoint = this.getBezierPoint(j, 
                                                anchor1.position, control1.position, 
                                                control2.position, anchor2.position);
            this.lineObjectGeometry.vertices[index++] = curvePoint;
        }
        curveIndex +=3;
    }
    this.lineObject.updateMatrix();
}

BezierPath.prototype.createPath = function(points)
{
    var loopTime = ((points.length - 4) / 3) + 1;
    var index = 0;
    var curveIndex = 0;
    this.lineObjectGeometry = new THREE.Geometry();
    this.points = points;
   
    for(var i=0;i<loopTime;i++)
    {
        for(var j=0;j<=1;j+=0.1)
        {
            var anchor1 = this.points[curveIndex];
            var control1 = this.points[curveIndex + 1];
            var control2 = this.points[curveIndex + 2];
            var anchor2 = this.points[curveIndex + 3];
            
            var curvePoint = this.getBezierPoint(j, 
                                                anchor1.position, control1.position, 
                                                control2.position, anchor2.position);
            this.lineObjectGeometry.vertices.push(curvePoint);
        }
        curveIndex+=3;
    }
    this.lineObject = null;
    this.lineObject = new THREE.Line(this.lineObjectGeometry, this.lineObjectMaterial);
    this.lineObject.updateMatrix();
}

BezierPath.prototype.getPath = function()
{
    return this.lineObject;
}