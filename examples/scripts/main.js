var quadView;
var quadView1;
var loader;
var bezierControls;
var toolboxon = false;



function render3D()
{
    requestAnimationFrame(render3D);
//    quadView.render();
//    quadView1.render();
     $("#editor").threeworld.render();
     
}

function fileUploadModule()
{
    $('#fileupload').fileupload({
        dataType: 'json',
        start: function(e) {
            $('#progress .bar').css('width', progress + '%');
        },
        done: function(e, data) {
            $.each(data.result.files, function(index, file)
            {
                quadView.addModelToSceneURL(file.url);
                //                $('<p/>').text(file.name).appendTo(document.body);                
            });
        },
        progressall: function(e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#progress .bar').css(
                    'width',
                    progress + '%'
                    );
        }
    });
}

function main()
{
    var w = window.innerWidth;
    var h = window.innerHeight;
    
//    $("#editor").threeworld({worldwidth: w, worldheight: h, views : {types:[FREE_VIEW], boundries: [[0, 1, 0, 1]]}});
    $("#editor").threeworld({worldwidth: w, worldheight: h});
    
//    quadView = new QuadViewRenderer(w * 1, h * 0.99, '#editor');
//    quadView = new SceneManager(w * 1, h * 0.5, '#editor');
//    quadView1 = new SceneManager(w * 1, h * 0.5, '#editor');
    
    toolboxFunctions();
    render3D();
    fileUploadModule();
}

function toolboxFunctions()
{
    $('#alltools').hide();
    $('.hidetoolbox').click(function()
    {
        toolboxon = !toolboxon;
        $('#alltools').toggle();
        if (!toolboxon)
        {
            $('#showhidebox').switchClass('glyphicon-arrow-up', 'glyphicon-arrow-down');
        }
        else
        {
            $('#showhidebox').switchClass('glyphicon-arrow-down', 'glyphicon-arrow-up');
        }
    });

    $('.modelrotation').slider(
            {
                min: 0,
                max: 360,
                orientation: 'vertical',
                slide: function()
                {
                    var rx = Number($("#rotX").slider("value"));
                    var ry = Number($("#rotY").slider("value"));
                    var rz = Number($("#rotZ").slider("value"));
                    quadView.rotateModel(rx, ry, rz);
                }
            });
    $('.modelscale').slider(
            {
                min: 0.1,
                max: 1,
                value: 1,
                step: 0.01,
                orientation: 'vertical',
                slide: function()
                {
                    var scale = Number($("#scale").slider("value"));
                    quadView.scaleModel(scale);
                },
                change: function()
                {
                    var scale = Number($("#scale").slider("value"));
                    quadView.scaleModel(scale);
                }
            });
    $('.modelopacity').slider(
            {
                min: 1,
                max: 100,
                step: 1,
                orientation: 'vertical',
                slide: function()
                {
                    var opacity = Number($(this).slider("value"));
                    if ($(this).hasClass('eopacity'))
                    {
                        quadView.modelOpacity(opacity / 100);
                    }
                }
            });

    $('#tools').draggable({
        handle: '#header'
    });
}


$(document).ready(main);