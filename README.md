# jQuery.three.world

ThreeWorld is an attempt to combine the awesomeness of Three.js with the superpowers of jquery. ThreeWorld comes as a plugin to make it easy for the following

The aim of this library is to

 * Implement the ease of jQuery to create threejs scenes
 * Create multiple views inside the scene
 * Create multiple webgl rendering windows on the same html page (I am seriously wondering the use of this)


Actually, jquery.three.world started as a simple javascript class but soon due to the requirements in my research, was made into a jquery plugin so that the entire world can either benefit or suffer from it.

In a nutshell, it is easy as this

```javascript
$(function(){
  $('div').threeworld();
});
```

to create this


![Alt text](/screenshots/basic.png?raw=true "Basic Usage")


This is [on GitHub](https://github.com/jbt/markdown-editor) so let me know if I've b0rked it somewhere.


Props to Mr. Doob and his [code editor](http://mrdoob.com/projects/code-editor/), from which
the inspiration to this, and some handy implementation hints, came.

### Stuff used to make this:

 * [marked](https://github.com/chjj) for Markdown parsing
 * [CodeMirror](http://codemirror.net/) for the awesome syntax-highlighted editor
 * [highlight.js](http://softwaremaniacs.org/soft/highlight/en/) for syntax highlighting in output code blocks
 * [js-deflate](https://github.com/dankogai/js-deflate) for gzipping of data to make it fit in URLs
