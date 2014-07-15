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
    console.log(arguments);
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
        var defaults = {
            worldwidth: 500,
            worldheight: 500,
            tools: true,
            status: true,
            axis: true,
            floor: true,
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
        var container = $('<div class="threecontainer"></div>');
        var scenecontainer = $('<div class="threescene"></div>');
        var scene, renderer, grid, axis, statusbox;
        var views = [];

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
                scene.add(grid);
            }
        }

        function addAxis()
        {
            if (threeworld.settings.axis)
            {
                //Axis helper RED LINE - X AXIS, GREEN LINE - Y AXIS, BLUE LINE - Z AXIS
                var axis = new THREE.AxisHelper(10);
                scene.add(axis);
            }
        }


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

            $(this).bind("mousemove", eventHandlers.mousemove)
                    .bind("mouseup", eventHandlers.mouseup)
                    .bind("mousewheel", eventHandlers.mousewheel)
                    .bind("mousedown", eventHandlers.mousedown);
        });

    };
})(jQuery);