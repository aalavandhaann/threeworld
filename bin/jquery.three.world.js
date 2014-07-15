var SIDE_VIEW = 'side_view';
var TOP_VIEW = 'top_view';
var FRONT_VIEW = 'front_view';
var FREE_VIEW = 'free_view';
var NEAR = 1;
var FAR = 10000;
var ORTHONEAR = -10000;
var ORTHOFAR = 10000;
var PI = Math.PI;

/****************************
 
 FlxJS
 http://github.com/petewarden/flxjs
 
 This is a collection of 2D geometry classes implementing the Flex3 interface, originally
 created to help me port OpenHeatMap from Flash to Javascript/HTML5.
 
 I tried to emulate the Adobe classes as closely as possible, so their documentation
 is the best place to start. Here are the links for the three classes I've implemented:
 http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/geom/Matrix.html
 http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/geom/Point.html
 http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/geom/Rectangle.html
 Not all of the functions are implemented, just the ones I needed for my code. If you do
 need to implement any of the missing ones, I'm happy to accept updates from github forks.
 
 Licensed under the 2-clause (ie no advertising requirement) BSD license,
 making it easy to reuse for commercial or GPL projects:
 
 (c) Pete Warden <pete@petewarden.com> http://petewarden.typepad.com/ Aug 19th 2011
 
 Redistribution and use in source and binary forms, with or without modification, are
 permitted provided that the following conditions are met:
 
 1. Redistributions of source code must retain the above copyright notice, this 
 list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright notice, this 
 list of conditions and the following disclaimer in the documentation and/or 
 other materials provided with the distribution.
 3. The name of the author may not be used to endorse or promote products derived 
 from this software without specific prior written permission.
 
 THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR 
 PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, 
 WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
 ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
 OF SUCH DAMAGE.
 
 *****************************/

function Matrix(a, b, c, d, tx, ty)
{
    if (typeof a === 'undefined')
    {
        a = 1;
        b = 0;
        c = 0;
        d = 1;
        tx = 0;
        ty = 0;
    }

    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;

    return this;
}

Matrix.prototype.transformPoint = function(p) {
    var result = new Point(
            (p.x * this.a) + (p.y * this.c) + this.tx,
            (p.x * this.b) + (p.y * this.d) + this.ty
            );

    return result;
};

Matrix.prototype.translate = function(x, y) {
    this.tx += x;
    this.ty += y;

    return this;
};

Matrix.prototype.scale = function(x, y) {

    var scaleMatrix = new Matrix(x, 0, 0, y, 0, 0);
    this.concat(scaleMatrix);

    return this;
};

Matrix.prototype.concat = function(m) {

    this.copy(new Matrix(
            (this.a * m.a) + (this.b * m.c), (this.a * m.b) + (this.b * m.d),
            (this.c * m.a) + (this.d * m.c), (this.c * m.b) + (this.d * m.d),
            (this.tx * m.a) + (this.ty * m.c) + m.tx, (this.tx * m.b) + (this.ty * m.d) + m.ty
            ));

    return this;
};

Matrix.prototype.invert = function() {

    var adbc = ((this.a * this.d) - (this.b * this.c));

    this.copy(new Matrix(
            (this.d / adbc), (-this.b / adbc),
            (-this.c / adbc), (this.a / adbc),
            (((this.c * this.ty) - (this.d * this.tx)) / adbc),
            -(((this.a * this.ty) - (this.b * this.tx)) / adbc)
            ));

    return this;
};

Matrix.prototype.clone = function() {

    var result = new Matrix(
            this.a, this.b,
            this.c, this.d,
            this.tx, this.ty
            );

    return result;
};

Matrix.prototype.zoomAroundPoint = function(center, zoomFactor) {
    var translateToOrigin = new Matrix();
    translateToOrigin.translate(-center.x, -center.y);

    var scale = new Matrix();
    scale.scale(zoomFactor, zoomFactor);

    var translateFromOrigin = new Matrix();
    translateFromOrigin.translate(center.x, center.y);

    var zoom = new Matrix();
    zoom.concat(translateToOrigin);
    zoom.concat(scale);
    zoom.concat(translateFromOrigin);

    this.concat(zoom);
    return this;
}

Matrix.prototype.copy = function(m) {
    this.a = m.a;
    this.b = m.b;
    this.c = m.c;
    this.d = m.d;
    this.tx = m.tx;
    this.ty = m.ty;

    return this;
}

// See http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/geom/Point.html
function Point(x, y)
{
    if (typeof x === 'undefined')
    {
        x = 0;
        y = 0;
    }

    this.x = (Number)(x);
    this.y = (Number)(y);

    return this;
}

Point.prototype.add = function(p) {
    var result = new Point((this.x + p.x), (this.y + p.y));
    return result;
};

Point.prototype.subtract = function(p) {
    var result = new Point((this.x - p.x), (this.y - p.y));
    return result;
};

Point.prototype.dot = function(p) {
    var result = ((this.x * p.x) + (this.y * p.y));
    return result;
};

Point.prototype.cross = function(p) {
    var result = ((this.x * p.y) - (this.y * p.x));
    return result;
};

Point.prototype.clone = function() {
    return new Point(this.x, this.y);
};

// See http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/geom/Rectangle.html
function Rectangle(x, y, width, height)
{
    if (typeof x === 'undefined')
        x = 0;

    if (typeof y === 'undefined')
        y = 0;

    if (typeof width === 'undefined')
        width = 0;

    if (typeof height === 'undefined')
        height = 0;

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    return this;
}

Rectangle.prototype.bottom = function(newY) {
    if (typeof newY !== 'undefined')
        this.height = (newY - this.y);
    return (this.y + this.height);
};

Rectangle.prototype.bottomRight = function() {
    return new Point(this.right(), this.bottom());
};

Rectangle.prototype.left = function(newX) {
    if (typeof newX !== 'undefined')
    {
        this.width += (this.x - newX);
        this.x = newX;
    }
    return this.x;
};

Rectangle.prototype.right = function(newX) {
    if (typeof newX !== 'undefined')
        this.width = (newX - this.x);
    return (this.x + this.width);
};

Rectangle.prototype.size = function() {
    return new Point(this.width, this.height);
};

Rectangle.prototype.top = function(newY) {
    if (typeof newY !== 'undefined')
    {
        this.height += (this.y - newY);
        this.y = newY;
    }
    return this.y;
};

Rectangle.prototype.topLeft = function() {
    return new Point(this.x, this.y);
};

Rectangle.prototype.clone = function() {
    return new Rectangle(this.x, this.y, this.width, this.height);
};

Rectangle.prototype.contains = function(x, y) {
    var isInside =
            (x >= this.x) &&
            (y >= this.y) &&
            (x < this.right()) &&
            (y < this.bottom());
    return isInside;
};

Rectangle.prototype.containsPoint = function(point) {
    return this.contains(point.x, point.y);
};

Rectangle.prototype.containsRect = function(rect) {
    var isInside =
            (rect.x >= this.x) &&
            (rect.y >= this.y) &&
            (rect.right() <= this.right()) &&
            (rect.bottom() <= this.bottom());
    return isInside;
};

Rectangle.prototype.equals = function(toCompare) {
    var isIdentical =
            (toCompare.x === this.x) &&
            (toCompare.y === this.y) &&
            (toCompare.width === this.width) &&
            (toCompare.height === this.height);
    return isIdentical;
};

Rectangle.prototype.inflate = function(dx, dy) {
    this.x -= dx;
    this.y -= dy;
    this.width += (2 * dx);
    this.height += (2 * dy);
};

Rectangle.prototype.inflatePoint = function(point) {
    this.inflate(point.x, point.y);
};

Rectangle.prototype.inclusiveRangeContains = function(value, min, max) {
    var isInside =
            (value >= min) &&
            (value <= max);

    return isInside;
};

Rectangle.prototype.intersectRange = function(aMin, aMax, bMin, bMax) {

    var maxMin = Math.max(aMin, bMin);
    if (!this.inclusiveRangeContains(maxMin, aMin, aMax) ||
            !this.inclusiveRangeContains(maxMin, bMin, bMax))
        return null;

    var minMax = Math.min(aMax, bMax);

    if (!this.inclusiveRangeContains(minMax, aMin, aMax) ||
            !this.inclusiveRangeContains(minMax, bMin, bMax))
        return null;

    return {min: maxMin, max: minMax};
};

Rectangle.prototype.intersection = function(toIntersect) {
    var xSpan = this.intersectRange(
            this.x, this.right(),
            toIntersect.x, toIntersect.right());

    if (!xSpan)
        return null;

    var ySpan = this.intersectRange(
            this.y, this.bottom(),
            toIntersect.y, toIntersect.bottom());

    if (!ySpan)
        return null;

    var result = new Rectangle(
            xSpan.min,
            ySpan.min,
            (xSpan.max - xSpan.min),
            (ySpan.max - ySpan.min));

    return result;
};

Rectangle.prototype.intersects = function(toIntersect) {
    var intersection = this.intersection(toIntersect);

    return (intersection !== null);
};

Rectangle.prototype.isEmpty = function() {
    return ((this.width <= 0) || (this.height <= 0));
};

Rectangle.prototype.offset = function(dx, dy) {
    this.x += dx;
    this.y += dy;
};

Rectangle.prototype.offsetPoint = function(point) {
    this.offset(point.x, point.y);
};

Rectangle.prototype.setEmpty = function() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
};

Rectangle.prototype.toString = function() {
    var result = '{';
    result += '"x":' + this.x + ',';
    result += '"y":' + this.y + ',';
    result += '"width":' + this.width + ',';
    result += '"height":' + this.height + '}';

    return result;
};

Rectangle.prototype.union = function(toUnion) {
    var minX = Math.min(toUnion.x, this.x);
    var maxX = Math.max(toUnion.right(), this.right());
    var minY = Math.min(toUnion.y, this.y);
    var maxY = Math.max(toUnion.bottom(), this.bottom());

    var result = new Rectangle(
            minX,
            minY,
            (maxX - minX),
            (maxY - minY));

    return result;
};

function View(sceneWidth, sceneHeight, viewType, scene, renderer, background)
{
    this.background = new THREE.Color(background);
    this.view = viewType;
    this.left = 0;
    this.right = 0;
    this.top = 0;
    this.bottom = 0;
    this.sceneWidth = sceneWidth;
    this.sceneHeight = sceneHeight;
    this.width = 0;
    this.height = 0;
    this.x = 0;
    this.y = 0;
    this.fov = 45;
    this.camera = null;
    this.zoomRadius = 10;
    this.phi = 60;
    this.theta = 45;
    this.oldPhi = this.phi;
    this.oldTheta = this.theta;
    this.startMouseX = 0;
    this.startMouseY = 0;
    this.window = new Rectangle(0, 0, 0, 0);
    this.listeningMouse = false;
    this.selectedMouseObject = null;
    this.highlightedObject = null;

    this.projector = new THREE.Projector();

    this.interactiveObjects = [];

    this.orthoAspect = 0;

    this.scene = scene;
    this.renderer = renderer;
    this.cameraLookAt = this.scene.position.clone();
    this.mouseClickDiff = new THREE.Vector3();

    this.updateDimensions();
    this.createCamera();

    return this;
}
;


View.prototype.createCamera = function()
{
    var oldPosition = (this.view == FREE_VIEW) ? new THREE.Vector3(3, 5, 7) : new THREE.Vector3();
    if (this.camera !== null)
    {
        if (this.view === FREE_VIEW)
        {
            oldPosition.x = this.camera.position.x;
            oldPosition.y = this.camera.position.y;
            oldPosition.z = this.camera.position.z;
        }
        this.camera = null;
    }

    if (this.view === FREE_VIEW)
    {
        this.camera = new THREE.PerspectiveCamera(this.fov, this.width / this.height, NEAR, FAR);
    }
    else
    {
        var aspectRatio = this.width / this.height;
        var viewSize = this.zoomRadius;

        this.camera = new THREE.OrthographicCamera(
                -aspectRatio * viewSize / 2, aspectRatio * viewSize / 2,
                viewSize / 2, -viewSize / 2,
                ORTHONEAR, ORTHOFAR);
        this.orthoAspect = aspectRatio;
    }

    this.camera.position.x = oldPosition.x;
    this.camera.position.y = oldPosition.y;
    this.camera.position.z = oldPosition.z;

    switch (this.view)
    {
        case TOP_VIEW:
            this.camera.position.y = this.zoomRadius;
            break;
        case SIDE_VIEW:
            this.camera.position.x = this.zoomRadius;
            break;
        case FRONT_VIEW:
            this.camera.position.z = this.zoomRadius;
            break;
    }

    this.camera.updateMatrix();
};

View.prototype.updateCamera = function()
{
    switch (this.view)
    {
        case FREE_VIEW:
            this.camera.position.x = this.zoomRadius * Math.sin(this.theta * PI / 360) * Math.cos(this.phi * (PI / 360));
            this.camera.position.y = this.zoomRadius * Math.sin(this.phi * (PI / 360));
            this.camera.position.z = this.zoomRadius * Math.cos(this.theta * (PI / 360)) * Math.cos(this.phi * (PI / 360));
//            console.log(this.camera.up);
            break;
        default:
            this.camera.left = -this.orthoAspect * this.zoomRadius / 2;
            this.camera.right = this.orthoAspect * this.zoomRadius / 2;
            this.camera.top = this.zoomRadius / 2;
            this.camera.bottom = -this.zoomRadius / 2;
    }
    this.camera.aspect = this.window.width / this.window.height;
    this.camera.updateMatrix();
};

View.prototype.updateDimensions = function()
{
    var dw = Math.abs(this.right - this.left);
    var dh = Math.abs(this.bottom - this.top);

    this.width = Math.round(this.sceneWidth * dw);
    this.height = Math.round(this.sceneHeight * dh);

    this.x = Math.round(this.sceneWidth * this.left);
    this.y = Math.round(this.sceneHeight * this.top);

    this.window.x = this.x;
    this.window.y = this.y;
    this.window.width = this.width;
    this.window.height = this.height;
};

View.prototype.findMouseObjects = function(mouseX, mouseY)
{
    var localMouseX = Math.abs(this.window.x - mouseX);
    var localMouseY = Math.abs(this.window.y - mouseY);

    var ratioX = localMouseX / this.width;
    var ratioY = localMouseY / this.height;
    var vector = new THREE.Vector3(2 * (ratioX) - 1, -(1 - ratioY) * 2 + 1, 0);
    var intersects;

    var ray = this.projector.pickingRay(vector.clone(), this.camera);
    intersects = ray.intersectObjects(this.viewManager.interactiveObjects);

    if (intersects.length > 0)
    {
        return intersects[0].object;
    }
    else
    {
        return null;
    }
};

View.prototype.get3DMouse = function(mouseX, mouseY)
{
    var localMouseX = Math.abs(this.window.x - mouseX);
    var localMouseY = Math.abs(this.window.y - mouseY);

    var ratioX = localMouseX / this.width;
    var ratioY = localMouseY / this.height;

    var vector = new THREE.Vector3(2 * (ratioX) - 1, -(1 - ratioY) * 2 + 1, 0);
    var dir, pos;
    var distance;
    vector = this.projector.unprojectVector(vector, this.camera);

    if (this.view === FRONT_VIEW)
    {
        vector.z = 0;
    }
    else if (this.view === SIDE_VIEW)
    {
        vector.x = 0;
    }
    else if (this.view === TOP_VIEW)
    {
        vector.y = 0;
    }
    else
    {
        dir = vector.sub(this.camera.position).normalize();
        distance = -this.camera.position.z / dir.z;
        vector = this.camera.position.clone().add(dir.multiplyScalar(distance));
    }

    return vector;
};

View.prototype.pointInsideCube = function(point, bounds)
{
    var xCheck = (point.x > bounds.min.x) && (point.x < bounds.max.x);
    var yCheck = (point.y > bounds.min.y) && (point.y < bounds.max.y);
    var zCheck = (point.z > bounds.min.z) && (point.z < bounds.max.z);

    return xCheck && yCheck && zCheck;
};

View.prototype.containsMouse = function(mouseX, mouseY)
{
    return this.window.contains(mouseX, mouseY);
};

View.prototype.mouseDown = function(mouseX, mouseY)
{
    if (this.window.contains(mouseX, mouseY))
    {
        if (this.view === FREE_VIEW)
        {
            this.oldTheta = this.theta;
            this.oldPhi = this.phi;
            this.startMouseX = mouseX;
            this.startMouseY = mouseY;
            this.listeningMouse = true;
        }
    }
};

View.prototype.mouseMove = function(mouseX, mouseY)
{
    var pos;

    if (this.listeningMouse)
    {
        if (this.view === FREE_VIEW)
        {
            this.theta = -((mouseX - this.startMouseX) * 0.5) + this.oldTheta;
            this.phi = ((this.startMouseY - mouseY) * 0.5) + this.oldPhi;
            this.phi = Math.min(180, Math.max(0, this.phi));
            this.updateCamera();
        }
    }
};

View.prototype.mouseUp = function(mouseX, mouseY)
{
    this.listeningMouse = false;
};

View.prototype.zoom = function(mouseX, mouseY, direction)
{
    if (this.window.contains(mouseX, mouseY))
    {
        this.zoomRadius += direction;
        this.updateCamera();
    }
};

View.prototype.setSceneWidth = function(sceneWidth)
{
    this.sceneWidth = sceneWidth;
    this.updateDimensions();
    this.createCamera();
};

View.prototype.setSceneHeight = function(sceneHeight)
{
    this.sceneHeight = sceneHeight;
    this.updateDimensions();
    this.createCamera();
};

View.prototype.setBoundries = function(left, right, top, bottom)
{
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.updateDimensions();
    this.createCamera();
};

View.prototype.setHorizontalBoundry = function(left, right)
{
    this.left = left;
    this.right = right;
    this.updateDimensions();
    this.createCamera();
}

View.prototype.setVerticalBoundry = function(top, bottom)
{
    this.top = top;
    this.bottom = bottom;
    this.updateDimensions();
    this.createCamera();
};

View.prototype.setLeft = function(left)
{
    this.left = left;
    this.updateDimensions();
    this.createCamera();
};
View.prototype.setRight = function(right)
{
    this.right = right;
    this.updateDimensions();
    this.createCamera();
};
View.prototype.setTop = function(top)
{
    this.top = top;
    this.updateDimensions();
    this.createCamera();
};
View.prototype.setBottom = function(bottom)
{
    this.bottom = bottom;
    this.updateDimensions();
    this.createCamera();
};

View.prototype.getCamera = function()
{
    return this.camera;
};

View.prototype.render = function()
{
    this.camera.lookAt(this.cameraLookAt);
    this.renderer.setViewport(this.window.x, this.window.y, this.window.width, this.window.height);
    this.renderer.setScissor(this.window.x, this.window.y, this.window.width, this.window.height);
    this.renderer.enableScissorTest(true);
    this.renderer.setClearColor(this.background);
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
};

View.prototype.interactives = function(interactives)
{
    this.interactiveObjects = interactives;
};


(function($)
{
    $.fn.threeworld = function(options)
    {
        //All the global, local and class member variables here
        var threeworld = this;
        var container = $('<div class="threecontainer"></div>');
        var scenecontainer = $('<div class="threescene"></div>');
        var scene, renderer, grid, axis, statusbox;
        var views = [];
        var viewtypes = [];
        var viewboundries = [];
        var defaults = {
            worldwidth: 500,
            worldheight: 500,
            tools: true,
            status: true,
            axis: true,
            floor: true,
            defaultLights: true,
            views:
                    {
                        types: [FREE_VIEW],
                        boundries:
                                [
                                    [0, 1, 0, 1]
                                ]
                    }
//            views:
//                    {
//                        types: [FRONT_VIEW, TOP_VIEW, SIDE_VIEW, FREE_VIEW],
//                        boundries: [
//                            [0, 0.5, 0, 0.5],
//                            [0, 0.5, 0.5, 1],
//                            [0.5, 1, 0, 0.5],
//                            [0.5, 1, 0.5, 1]
//                        ]
//                    }
        };

        //private methods
        var eventHandlers =
                {
                    mousewheel: function(event)
                    {
                        var dir = event.originalEvent.wheelDelta;
                        dir = Math.abs(dir) / dir;

                        var mouseX = event.pageX - this.offsetLeft;
                        var mouseY = event.pageY - this.offsetTop;

                        for (var i = 0; i < views.length; i++)
                        {
                            views[i].zoom(mouseX, threeworld.settings.worldheight - mouseY, dir);
                        }

                        event.preventDefault();
                        event.stopPropagation();
                    },
                    mousemove: function(event)
                    {
                        var mouseX, mouseY;
                        mouseX = event.pageX - this.offsetLeft;
                        mouseY = event.pageY - this.offsetTop;

                        for (var i = 0; i < views.length; i++)
                        {
                            views[i].mouseMove(mouseX, threeworld.settings.worldheight - mouseY);
                        }
                    },
                    mouseup: function(event)
                    {
                        var mouseX, mouseY;
                        mouseX = event.pageX - this.offsetLeft;
                        mouseY = event.pageY - this.offsetTop;

                        for (var i = 0; i < views.length; i++)
                        {
                            views[i].mouseUp(mouseX, threeworld.settings.worldheight - mouseY);
                        }
                    },
                    mousedown: function(event)
                    {
                        var mouseX, mouseY;
                        mouseX = event.pageX - this.offsetLeft;
                        mouseY = event.pageY - this.offsetTop;

                        for (var i = 0; i < views.length; i++)
                        {
                            views[i].mouseDown(mouseX, threeworld.settings.worldheight - mouseY);
                        }
                    }
                };
        options = $.extend(defaults, options);
        threeworld.settings = options;


        //Class member private functions

        function initializerenderer()
        {
            //Initialize webgl
            if (Detector.webgl)
            {
                renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    anaglyph: false
                });
            }
            else
            {
                renderer = new THREE.CanvasRenderer({});
                Detector.addGetWebGLMessage();
            }

            //Set up all the renderer parameters;
            renderer.setSize(threeworld.settings.worldwidth, threeworld.settings.worldheight);
            //Append the final html elements to the div
            scenecontainer.append(renderer.domElement);
        }
        ;

        function initializestats()
        {
            if (threeworld.settings.status)
            {
                //Create the statistics window
                statusbox = new Stats();
                container.parent().append(statusbox.domElement);
                $(statusbox.domElement).attr('class', 'statusbox');
            }

        }

        function initializescene()
        {
            scene = new THREE.Scene();
        }

        function initializeviews()
        {
            for (var i = 0; i < threeworld.settings.views.types.length; i++)
            {
                var viewcamera = threeworld.settings.views.types[i];
                var boundry = threeworld.settings.views.boundries[i];
                var worldwidth = threeworld.settings.worldwidth;
                var worldheight = threeworld.settings.worldheight;
                var view = new View(worldwidth, worldheight, viewcamera, scene, renderer, 0x333333);
                view.setBoundries(boundry[0], boundry[1], boundry[2], boundry[3]);
                views.push(view);
            }
        }

        function addFloor()
        {
            if (threeworld.settings.floor)
            {
                //Add the grid and the three axis helper to the scene    
                grid = new THREE.Mesh(
                        new THREE.PlaneGeometry(10, 10, 30, 30),
                        new THREE.MeshBasicMaterial({
                            color: 0x111111,
                            wireframe: true,
                            transparent: false
                        }));
                grid.rotation.x = 3.14 / 2;
                grid.name = 'floor';
                scene.add(grid);
            }
        }

        function addDefaultLights()
        {
            if (threeworld.settings.defaultLights)
            {
                for (var i = 0; i < 2; i++)
                {
                    var dir = (i === 0) ? 1 : -1;
                    var lightZ = new THREE.DirectionalLight(0xffffff);
                    lightZ.position.set(0, 0, 50 * dir);
                    scene.add(lightZ);
                }
            }
        }

        function addAxis()
        {
            if (threeworld.settings.axis)
            {
                //Axis helper RED LINE - X AXIS, GREEN LINE - Y AXIS, BLUE LINE - Z AXIS
                var axis = new THREE.AxisHelper(10);
                axis.name = 'axis';
                scene.add(axis);
            }
        }

        function processModel(model)
        {
            var bounds, bBoxGeometry, bBoxGeometry2, bBoxMaterial, bBoxMaterial2, bBox, bBox2;
            if (model.geometry !== undefined)
            {
                bounds = model.geometry.boundingBox.clone();
            }

            if (bounds === undefined)
            {
                bounds = new THREE.Box3();
            }

            model.traverse(function(child)
            {
                if (child instanceof THREE.Mesh)
                {
                    var childbox;
                    child.geometry.computeBoundingBox();
                    childbox = child.geometry.boundingBox.clone();
                    if (childbox !== undefined)
                    {
                        childbox.translate(child.localToWorld(new THREE.Vector3()));
                        bounds.union(childbox);
                    }
                }
            });
            model.position.x = 0;
            model.position.y = 0;
            model.position.z = 0;

            bBoxGeometry = new THREE.BoxGeometry(bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y, bounds.max.z - bounds.min.z, 1, 1, 1);
            bBoxGeometry2 = new THREE.BoxGeometry(bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y, bounds.max.z - bounds.min.z, 1, 1, 1);
            bBoxMaterial = new THREE.MeshBasicMaterial({
                wireframe: true,
                color: 0xFF9900
            });
            bBoxMaterial2 = new THREE.MeshBasicMaterial({
                wireframe: true,
                color: 0x0000FF
            });
            bBox = new THREE.Mesh(bBoxGeometry, bBoxMaterial);
            bBox2 = new THREE.Mesh(bBoxGeometry2, bBoxMaterial2);
            bBox.position.x = bBox2.position.x = bounds.min.x + ((bounds.max.x - bounds.min.x) / 2);
            bBox.position.y = bBox2.position.y = bounds.min.y + ((bounds.max.y - bounds.min.y) / 2);
            bBox.position.z = bBox2.position.z = bounds.min.z + ((bounds.max.z - bounds.min.z) / 2);

            model.add(bBox);
            model.add(bBox2);
            model.updateMatrix();
            scene.add(model);
        }

        $.fn.threeworld.add = function(object)
        {
            scene.add(object);
            return this;
        };

        $.fn.threeworld.removeAllViews = function()
        {
            threeworld.settings.views.types = [];
            threeworld.settings.views.boundries = [];
            views = [];
            return this;
        };

        $.fn.threeworld.modifyBoundries = function(newboundries)
        {
            if(newboundries.length !== threeworld.settings.boundries.length)
            {
                $.error("The new boundries length do not match existing boundries length");
                return this;
            }
            threeworld.settings.boundries = newboundries.slice(0);
            
            for(var i=0;i<views.length;i++)
            {
                views[i].setBoundries(threeworld.settings.boundries[0], threeworld.settings.boundries[1], threeworld.settings.boundries[2], threeworld.settings.boundries[3]);
            }
            return this;
        };
        
        $.fn.threeworld.addView = function(viewtype, viewboundry)
        {
            var worldwidth = threeworld.settings.worldwidth;
            var worldheight = threeworld.settings.worldheight;
            var view = new View(worldwidth, worldheight, viewtype, scene, renderer, 0x333333);
            
            threeworld.settings.views.types.push(viewtype);
            threeworld.settings.views.boundries.push(viewboundry);
            view.setBoundries(viewboundry[0], viewboundry[1], viewboundry[2], viewboundry[3]);
            views.push(view);
            return this;
        };

        $.fn.threeworld.load = function(url, type)
        {
            var modelLoader;

            if (type === 'obj')
            {
                var manager = new THREE.LoadingManager();
                modelLoader = new THREE.OBJLoader(manager);
                modelLoader.convertUpAxis = true;
                modelLoader.load(url, function(object)
                {
                    processModel(object);
                });
            }
            else if ((type === 'collada') || (type === 'dae'))
            {
                modelLoader = new THREE.ColladaLoader();
                modelLoader.convertUpAxis = true;
                modelLoader.load(url, function(collada)
                {
                    processModel(collada.scene);
                });
            }
            return this;
        };

        $.fn.threeworld.get = function(what)
        {
            if (what === "scene")
            {
                return scene;
            }
            else if (what === "renderer")
            {
                return renderer;
            }
            else if (what === "scenehtml")
            {
                return scenecontainer;
            }
            else if (what === "container")
            {
                return container;
            }
            else
            {
                scene.traverse(function(object)
                {
                    if (object.name === what)
                    {
                        return object;
                    }
                });
                if (console)
                {
                    console.warn(what, " was not found inside the scene, \n\
                                        if you think the object is deeper \n\
                                        inside the hierarchy then get the scene object, \n\
                                        then manually traverese yourself! Good luck! ");
                    return null;
                }
            }
        };


        //Class member public methods
        $.fn.threeworld.render = function()
        {
            for (var i = 0; i < views.length; i++)
            {
                views[i].render();
            }
            statusbox.update();
            return this;
        };


        return this.each(function()
        {
            var $this = $(this);
            var tools;

            if (threeworld.settings.tools)
            {
                tools = $('<div class="threetools"></div>');
                container.append(tools);
            }

            container.append(scenecontainer);
            threeworld.append(container);

            initializerenderer();
            initializestats();
            initializescene();
            initializeviews();

            addFloor();
            addAxis();
            addDefaultLights();
            $(this).bind("mousemove", eventHandlers.mousemove)
                    .bind("mouseup", eventHandlers.mouseup)
                    .bind("mousewheel", eventHandlers.mousewheel)
                    .bind("mousedown", eventHandlers.mousedown);
        });

    };
})(jQuery);