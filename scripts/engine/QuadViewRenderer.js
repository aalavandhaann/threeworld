/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var engine;
function QuadViewRenderer(width, height, containerDiv)
{
    var holder = $(containerDiv);
    var workspace = $('<div id="editorspace">\n\
                            <div id="editorSpace3d"></div>\n\
                            <div id="editorSpace3dHandles"></div>\n\
                        </div>');

    this.holder = holder;
    this.width = Math.round(width);
    this.height = Math.round(height);
    this.mouseX = 0;
    this.mouseY = 0;
    this.interactiveObjects = [];
    this.selectedObject = null;
    this.highlightedObject = null;
    this.constantScale = 1;

    holder.append(workspace);
    //Refer to the html container where the webgl has to be rendered    
    this.container = $('#editorSpace3d');

    //Initialize webgl
    if (Detector.webgl)
    {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            anaglyph: false
        });
    }
    else
    {
        this.renderer = new THREE.CanvasRenderer({});
        Detector.addGetWebGLMessage();
    }

    //Create the statistics window
    this.stats = new Stats();


    //Create the scene element;
    this.scene = new THREE.Scene();
    
    this.billboard = new THREE.Mesh(
            new THREE.PlaneGeometry(3, 3, 1, 1),
            new THREE.MeshNormalMaterial({
                color: 0xCCCCCC,
                opacity: 0.8,
                wireframe: false,
                transparent: true
            }));

    //Add the grid and the three axis helper to the scene    
    this.grid = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10, 30, 30),
            new THREE.MeshBasicMaterial({
                color: 0x111111,
                wireframe: true,
                transparent: false
            }));

    console.log('DISABLE GRID ROTATION');
//    this.grid.rotation = new THREE.Vector3(0, 0, 3.14 / 2);
    this.grid.rotation.x = 3.14 / 2;
    this.scene.add(this.grid);
    
    //Axis helper RED LINE - X AXIS, GREEN LINE - Y AXIS, BLUE LINE - Z AXIS
    var axis = new THREE.AxisHelper(10);
    this.scene.add(axis);
    this.scene.add(this.billboard);
    
//    this.billboard.up.set(0,0,1);
    

//    var sphereGeometry = new THREE.SphereGeometry(1, 10, 10, 0, 6.28, 0, 6.28);
//    var spherMaterial = new THREE.MeshBasicMaterial({
//        color:0xFFFFFF
//    });
//    var sphere = new THREE.Mesh(sphereGeometry, spherMaterial);
//    
//    this.scene.add(sphere)
//    sphere.position = new THREE.Vector3(0, 5, 0);

    for (var i = 0; i < 2; i++)
    {
        var dir = (i === 0) ? 1 : -1;
        this.lightZ = new THREE.DirectionalLight(0xffffff);
        this.lightZ.position.set(0, 0, 50 * dir);
        this.scene.add(this.lightZ);
    }

    //Set up all the renderer parameters;
    this.renderer.setSize(this.width, this.height);

    //Create all the views
    this.frontView = new View(this.width, this.height, FRONT_VIEW, this.scene, this.renderer, 0x333333, this);
    this.topView = new View(this.width, this.height, TOP_VIEW, this.scene, this.renderer, 0x333333, this);
    this.sideView = new View(this.width, this.height, SIDE_VIEW, this.scene, this.renderer, 0x333333, this);
    this.freeView = new View(this.width, this.height, FREE_VIEW, this.scene, this.renderer, 0x333333, this);


    this.views = [this.frontView, this.topView, this.sideView, this.freeView];
    this.labels = [];

    this.boundries = [
        [0, 0.5, 0, 0.5],
        [0, 0.5, 0.5, 1],
        [0.5, 1, 0, 0.5],
        [0.5, 1, 0.5, 1]
    ];

    engine = this;
    this.container.mousedown(this.onDocumentMouseDown3d);
    this.container.mouseup(this.onDocumentMouseUp3d);
    this.container.mousemove(this.onDocumentMouseMove3d);
    this.container.bind('mousewheel', this.onDocumentMouseWheel3d);
    this.container.scope = this;

    this.freeView.zoom(this.width * 0.75, this.height * 0.75, 1);
    this.model = null;

    //Append the final html elements to the div
    this.container.append(this.renderer.domElement);
    this.container.parent().parent().append(this.stats.domElement);

    this.createResizingFrames();
    this.createLabels();
    this.setBoundriesAndLabels();
    this.render();

    $(this.stats.domElement).attr('class', 'statusbox');
    return this;
}

QuadViewRenderer.prototype.onBezierPointUpdate = function()
{
    this.bezierControl.updateLineGeometry();
}

QuadViewRenderer.prototype.resize3DWindowHorizontal = function(event)
{
    engine.resizeHorizontal((event.pageX - engine.container.position().left));
}

QuadViewRenderer.prototype.resize3DWindowVertical = function(event)
{
    engine.resizeVertical((event.pageY - engine.container.position().top));
}

QuadViewRenderer.prototype.createResizingFrames = function()
{
    var editor = $(this.container);
    var framesHolder = $('<div id="editorFrames"><div id="verticalFrame"></div><div id="horizontalFrame"></div></div>');

    //    this.holder.append(framesHolder);
    $('#editorSpace3dHandles').append(framesHolder);
    //    this.container.parent().append(framesHolder);

    $('#verticalFrame').draggable({
        axis: 'x',
        drag: this.resize3DWindowHorizontal,
        containment: '#' + $(this.container).attr('id')
    });
    $('#horizontalFrame').draggable({
        axis: 'y',
        drag: this.resize3DWindowVertical,
        containment: '#' + $(this.container).attr('id')
    });


    $('#verticalFrame').css('height', editor.height() + 'px');
    $('#horizontalFrame').css('width', editor.width() + 'px');

    $('#horizontalFrame').css('top', (editor.height() / 2) + 'px');
    $('#horizontalFrame').css('left', editor.position().left + 'px');

    $('#verticalFrame').css('top', '0px');
    $('#verticalFrame').css('left', (editor.position().left + (editor.width() / 2)) + 'px');


}

QuadViewRenderer.prototype.createLabel = function(text)
{
    var label;
    if (text != 'Free View')
    {
        label = $('<span class="view3DLabel">\n\
                        <span class="sceneup glyphicon glyphicon-arrow-up"></span>\n\
                        <span class="scenemiddle">\n\
                            <span class="sceneleft glyphicon glyphicon-arrow-left"></span>\n\
                            <span class="viewlabel">' + text + '</span>\n\
                            <span class="sceneright glyphicon glyphicon-arrow-right"></span>\n\
                        </span>\n\
                        <span class="scenedown glyphicon glyphicon-arrow-down"></span>\n\
                </span>');
    }
    else
    {
        label = $('<span class="view3DLabel">' + text + '</span>');
    }
    return label;
}

QuadViewRenderer.prototype.createLabels = function()
{
    this.labels.push(
            this.createLabel("Front View"),
            this.createLabel("Top View"),
            this.createLabel("Side View"),
            this.createLabel("Free View")
            );

    for (var i = 0; i < this.labels.length; i++)
    {
        //        this.container.parent().append(this.labels[i]);
        $('#editorSpace3dHandles').append(this.labels[i]);
    }

}

QuadViewRenderer.prototype.rotateModel = function(rx, ry, rz)
{

    if (this.model !== null)
    {
        this.model.rotation.x = (rx / 180) * 3.14;
        this.model.rotation.y = (ry / 180) * 3.14;
        this.model.rotation.z = (rz / 180) * 3.14;
        this.model.updateMatrix();
    }
}

QuadViewRenderer.prototype.scaleModel = function(scale)
{
    if (this.model !== null)
    {
        scale *= this.constantScale;
        this.model.scale.set(scale, scale, scale);
        this.model.updateMatrix();
    }
}

QuadViewRenderer.prototype.modelOpacity = function(opacity)
{
    if (this.model !== null)
    {
        this.model.material.opacity = opacity;
        this.model.updateMatrix();
    }
}

QuadViewRenderer.prototype.addModelToSceneURL = function(fileURL)
{

    var modelLoader = new THREE.OBJLoader();
    var scene = this.scene;
    var modelHeight = 1;
    modelLoader.convertUpAxis = true;

    modelLoader.load(fileURL, function(object)
    {
        var bounds;
        var bBoxGeometry;
        var bBoxMaterial;
        var bBox;
        if (engine.model !== null)
        {
            var index = engine.interactiveObjects.indexOf(engine.model, 1);
            if (index !== -1)
            {
                engine.interactiveObjects.splice(index, 1);
            }
            engine.scene.remove(engine.model);
        }
        object.traverse(function(child)
        {
            if (child instanceof THREE.Mesh)
            {
                engine.model = child;
                engine.model.geometry.computeBoundingBox();
            }
        });

        engine.model.material.transparent = true;
        engine.model.position.x = 0;
        engine.model.position.y = 0;
        engine.model.position.z = 0;
        engine.model.name = 'model';

//        engine.interactiveObjects.push(engine.model);
//        engine.interactives(engine.interactiveObjects);
        bounds = engine.model.geometry.boundingBox.clone();

        engine.model.traverse(function(child)
        {
            if (child instanceof THREE.Mesh) {
                var childbox = child.geometry.boundingBox.clone();
                childbox.translate(child.localToWorld(new THREE.Vector3()));
                bounds.union(childbox);
            }
        });


        engine.model.geometry.computeBoundingBox();
        
        bBoxGeometry = new THREE.CubeGeometry(bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y, bounds.max.z - bounds.min.z, 1, 1, 1);
        bBoxGeometry2 = new THREE.CubeGeometry(bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y, bounds.max.z - bounds.min.z, 5, 5, 5);
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
        
        engine.model.add(bBox);
        engine.model.add(bBox2);
        engine.model.selector = bBox;
        engine.model.selector.visible = false;
        
        modelHeight = (bounds.max.y - bounds.min.y);
        
        if(modelHeight > 5)
        {
            engine.constantScale = 5 / modelHeight;
            engine.model.scale.set(engine.constantScale,engine.constantScale,engine.constantScale);
        }
        
        engine.model.updateMatrix();
        scene.add(engine.model);
    });
}

QuadViewRenderer.prototype.addObject = function(object)
{
    this.scene.add(object);
}

QuadViewRenderer.prototype.onDocumentMouseWheel3d = function(event, delta)
{
    var dir = event.originalEvent.wheelDelta;
    dir = Math.abs(dir) / dir;

    engine.mouseX = event.pageX - this.offsetLeft;
    engine.mouseY = event.pageY - this.offsetTop;

    for (var i = 0; i < engine.views.length; i++)
    {
        engine.views[i].zoom(engine.mouseX, engine.height - engine.mouseY, dir);
    }

    event.preventDefault();
    event.stopPropagation();
}

QuadViewRenderer.prototype.onDocumentMouseDown3d = function(event)
{
    engine.mouseX = event.pageX - this.offsetLeft;
    engine.mouseY = event.pageY - this.offsetTop;

    for (var i = 0; i < engine.views.length; i++)
    {
        engine.views[i].mouseDown(engine.mouseX, engine.height - engine.mouseY);
    }

//    event.preventDefault();
//    event.stopPropagation();
}

QuadViewRenderer.prototype.onDocumentMouseMove3d = function(event) 
{

    engine.mouseX = event.pageX - this.offsetLeft;
    engine.mouseY = event.pageY - this.offsetTop;

    for (var i = 0; i < engine.views.length; i++)
    {
        engine.views[i].mouseMove(engine.mouseX, engine.height - engine.mouseY);
    }
    if(engine.freeView)
    {
        engine.billboard.lookAt(engine.freeView.getCamera().position);
        for(var i=0;i<engine.billboard.geometry.vertices.length;i++)
        {
            var vertex = engine.billboard.geometry.vertices[i];
            var worldVertex = engine.billboard.localToWorld(vertex.clone());
//            console.log(i, ' : ',worldVertex.x, worldVertex.y, worldVertex.z);
        }        
    }
    

//    event.preventDefault();
//    event.stopPropagation();
}

QuadViewRenderer.prototype.onDocumentMouseUp3d = function(event)
{
    engine.mouseX = event.pageX - this.offsetLeft;
    engine.mouseY = event.pageY - this.offsetTop;

    for (var i = 0; i < engine.views.length; i++)
    {
        engine.views[i].mouseUp(engine.mouseX, engine.height - engine.mouseY);
    }

//    event.preventDefault();
//    event.stopPropagation();
}

QuadViewRenderer.prototype.getScene = function()
{

}

QuadViewRenderer.prototype.setBoundriesAndLabels = function()
{
    for (var i = 0; i < this.boundries.length; i++)
    {
        var view = this.views[i];
        var boundry = this.boundries[i];
        var label = this.labels[i];
        var labelWidth = label.width();
        var labelHeight = label.height();
        var startX = this.container.position().left;
        var startY = this.container.position().top;
        var left = (this.width * boundry[0]) + startX + (labelWidth / 2);
        var top = (this.height * (1 - boundry[3])) + startY + (labelHeight / 2);

        view.setBoundries(boundry[0], boundry[1], boundry[2], boundry[3]);
        label.css('left', (left) + 'px');
        label.css('top', (top) + 'px');
    }
}

QuadViewRenderer.prototype.resizeHorizontal = function(mx)
{
    var leftRatio = (mx / this.width);

    //Setting the end boundry i.e., rightmost boundry for front and top view
    this.boundries[0][1] = leftRatio;
    this.boundries[1][1] = leftRatio;

    //Setting the start boundry i.e., leftmost boundry for front and side view
    this.boundries[2][0] = leftRatio;
    this.boundries[3][0] = leftRatio;

    this.setBoundriesAndLabels();
}

QuadViewRenderer.prototype.resizeVertical = function(my)
{
    var topRatio = 1 - (my / this.height);

    //Setting the end boundry i.e., bottom boundry for front and side view
    this.boundries[0][3] = topRatio;
    this.boundries[2][3] = topRatio;

    //Setting the end boundry i.e., top boundry for front and side view
    this.boundries[1][2] = topRatio;
    this.boundries[3][2] = topRatio;

    this.setBoundriesAndLabels();
}

QuadViewRenderer.prototype.render = function()
{
    for (var i = 0; i < this.views.length; i++)
    {
        this.views[i].render();
    }    
    this.stats.update();
}



QuadViewRenderer.prototype.interactives = function(interactives)
{
    this.interactiveObjects = interactives;
    for (var i = 0; i < this.views.length; i++)
    {
        this.views[i].interactives(interactives);
    }
}