/*
Usage:
var zoom = new Zooming('elementId');
zoom.to('n'); or zoom.to(n);
	elementId is the id value of an element. All elements are supported, to zoom the whole page use the body.
		E.g.: <body id="myId"> or <div id="myId"> ... var myZoom = new Zooming('myId');
	n is the zoom level. Set to lower than 1 to zoom out and higher than 1 to zoom in. Set to 1 for no zoom.
		E.g.: myZoom.to(1.5s);
Known issues:
	If the image size is specified in "px" and not in "em" zooming does resize the image.
*/

class Zooming {
	constructor(elementId) {
		this.body = document.getElementById(elementId);
		if (this.body.currentStyle) {
			this.fontSize = body.currentStyle["fontSize"];
			this.fontUnit = "pt";
		} else if (window.getComputedStyle) {
			this.fontSize = 16;
			this.fontUnit = "px";
		}
		this.fontSize = parseFloat(this.fontSize);
	}
	to(zoomSize) {
		this.body.style["fontSize"] = this.fontSize * zoomSize + this.fontUnit;
	}
}