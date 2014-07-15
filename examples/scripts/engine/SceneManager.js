/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function SceneManager(width, height, containerDiv)
{
    this.sceneHTML = $('<div class="scene"></div>');
    this.sceneSpace3D = $('<div class="sceneSpace3d"></div>');
    this.sceneSpace3DHandles = $('<div class="sceneSpace3dHandles"></div>');

    this.holder = $(containerDiv);
    this.width = Math.round(width);
    this.height = Math.round(height);

    this.mouseX = 0;
    this.mouseY = 0;
    this.interactiveObjects = [];
    this.selectedObject = null;
    this.highlightedObject = null;
    this.constantScale = 1;

    this.sceneHTML.append(this.sceneSpace3D);
    this.sceneHTML.append(this.sceneSpace3DHandles);
    this.holder.append(this.sceneHTML);

    //Refer to the html container where the webgl has to be rendered    
    this.container = this.sceneSpace3D;

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

    //Set up all the renderer parameters;
    this.renderer.setSize(this.width, this.height);

    //Create the statistics window
    this.stats = new Stats();
    //Create the scene element;
    this.scene = new THREE.Scene();


    this.container.mousedown(this.onDocumentMouseDown3d);
    this.container.mouseup(this.onDocumentMouseUp3d);
    this.container.mousemove(this.onDocumentMouseMove3d);
    this.container.bind('mousewheel', this.onDocumentMouseWheel3d);
    this.container.data('scope', this);

    this.addStandardLights();
    this.addAxisHelper();
    this.addWireframeFloor();
    this.createView();

    //Append the final html elements to the div
    this.container.append(this.renderer.domElement);
    this.container.parent().parent().append(this.stats.domElement);

    this.render();
    $(this.stats.domElement).attr('class', 'statusbox');
    return this;

}
;

SceneManager.prototype.createView = function()
{
    this.view = new View(this.width, this.height, FREE_VIEW, this.scene, this.renderer, 0x333333, this);
    this.view.setBoundries(0, 1, 0, 1);
};

SceneManager.prototype.addStandardLights = function()
{
    for (var i = 0; i < 2; i++)
    {
        var dir = (i === 0) ? 1 : -1;
        this.lightZ = new THREE.DirectionalLight(0xffffff);
        this.lightZ.position.set(0, 0, 50 * dir);
        this.scene.add(this.lightZ);
    }
};

SceneManager.prototype.addAxisHelper = function()
{
    var axis = new THREE.AxisHelper(10);
    //Axis helper RED LINE - X AXIS, GREEN LINE - Y AXIS, BLUE LINE - Z AXIS
    this.scene.add(axis);
};

SceneManager.prototype.addWireframeFloor = function()
{
    //Add the grid and the three axis helper to the scene    
    this.grid = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10, 30, 30),
            new THREE.MeshBasicMaterial({
                color: 0x111111,
                wireframe: true,
                transparent: false
            }));
    this.grid.rotation.x = 3.14 / 2;
    this.scene.add(this.grid);
};

SceneManager.prototype.onDocumentMouseWheel3d = function(event, delta)
{
    var engine = ($(this).data('scope'));
    var dir = event.originalEvent.wheelDelta;
    dir = Math.abs(dir) / dir;

    engine.mouseX = event.pageX - this.offsetLeft;
    engine.mouseY = event.pageY - this.offsetTop;

    engine.view.zoom(engine.mouseX, engine.height - engine.mouseY, dir);

    event.preventDefault();
    event.stopPropagation();
};

SceneManager.prototype.onDocumentMouseDown3d = function(event)
{
    var engine = ($(this).data('scope'));
    engine.mouseX = event.pageX - this.offsetLeft;
    engine.mouseY = event.pageY - this.offsetTop;
    engine.view.mouseDown(engine.mouseX, engine.height - engine.mouseY);

};

SceneManager.prototype.onDocumentMouseMove3d = function(event)
{
    var engine = ($(this).data('scope'));

    engine.mouseX = event.pageX - this.offsetLeft;
    engine.mouseY = event.pageY - this.offsetTop;
    engine.view.mouseMove(engine.mouseX, engine.height - engine.mouseY);
//    
//    if(engine.freeView)
//    {
//        engine.billboard.lookAt(engine.freeView.getCamera().position);
//        for(var i=0;i<engine.billboard.geometry.vertices.length;i++)
//        {
//            var vertex = engine.billboard.geometry.vertices[i];
//            var worldVertex = engine.billboard.localToWorld(vertex.clone());
//        }        
//    }
};

SceneManager.prototype.onDocumentMouseUp3d = function(event)
{
    var engine = ($(this).data('scope'));

    engine.mouseX = event.pageX - this.offsetLeft;
    engine.mouseY = event.pageY - this.offsetTop;
    
    engine.view.mouseUp(engine.mouseX, engine.height - engine.mouseY);
};

SceneManager.prototype.render = function()
{
    this.view.render();
    this.stats.update();
};