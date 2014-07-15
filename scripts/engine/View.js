var SIDE_VIEW = 'side_view';
var TOP_VIEW = 'top_view';
var FRONT_VIEW = 'front_view';
var FREE_VIEW = 'free_view';
var NEAR = 1;
var FAR = 10000;
var ORTHONEAR = -10000;
var ORTHOFAR = 10000;
var PI = Math.PI;

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
}

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
}

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
}

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
}

View.prototype.get3DMouse = function(mouseX, mouseY)
{
    var localMouseX = Math.abs(this.window.x - mouseX);
    var localMouseY = Math.abs(this.window.y - mouseY);

    var ratioX = localMouseX / this.width;
    var ratioY = localMouseY / this.height;

    var vector = new THREE.Vector3(2 * (ratioX)  - 1, -(1 - ratioY) * 2 + 1, 0);
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
}

View.prototype.pointInsideCube = function(point, bounds)
{
    var xCheck = (point.x > bounds.min.x) && (point.x < bounds.max.x);
    var yCheck = (point.y > bounds.min.y) && (point.y < bounds.max.y);
    var zCheck = (point.z > bounds.min.z) && (point.z < bounds.max.z);

    return xCheck && yCheck && zCheck;
}

View.prototype.containsMouse = function(mouseX, mouseY)
{
    return this.window.contains(mouseX, mouseY);
}

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
}

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
}

View.prototype.mouseUp = function(mouseX, mouseY)
{
    this.listeningMouse = false;
}

View.prototype.zoom = function(mouseX, mouseY, direction)
{
    if (this.window.contains(mouseX, mouseY))
    {
        this.zoomRadius += direction;
        this.updateCamera();
    }
}

View.prototype.setSceneWidth = function(sceneWidth)
{
    this.sceneWidth = sceneWidth;
    this.updateDimensions();
    this.createCamera();
}

View.prototype.setSceneHeight = function(sceneHeight)
{
    this.sceneHeight = sceneHeight;
    this.updateDimensions();
    this.createCamera();
}

View.prototype.setBoundries = function(left, right, top, bottom)
{
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.updateDimensions();
    this.createCamera();
}

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
}

View.prototype.setLeft = function(left)
{
    this.left = left;
    this.updateDimensions();
    this.createCamera();
}
View.prototype.setRight = function(right)
{
    this.right = right;
    this.updateDimensions();
    this.createCamera();
}
View.prototype.setTop = function(top)
{
    this.top = top;
    this.updateDimensions();
    this.createCamera();
}
View.prototype.setBottom = function(bottom)
{
    this.bottom = bottom;
    this.updateDimensions();
    this.createCamera();
}

View.prototype.getCamera = function()
{
    return this.camera;
}

View.prototype.render = function()
{
    this.camera.lookAt(this.cameraLookAt);
    this.renderer.setViewport(this.window.x, this.window.y, this.window.width, this.window.height);
    this.renderer.setScissor(this.window.x, this.window.y, this.window.width, this.window.height);
    this.renderer.enableScissorTest(true);
    this.renderer.setClearColor(this.background);
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
}

View.prototype.interactives = function(interactives)
{
    this.interactiveObjects = interactives;
}