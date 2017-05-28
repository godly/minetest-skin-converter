// requires uvareas.js, threee.js

/*
Usage:
Make sure to load uvareas.js before uvcharacter.js:
<script src="three.min.js" type="text/javascript"></script>
<script src="uvareas.js" type="text/javascript"></script>
<script src="uvcharacter.js" type="text/javascript"></script>

Add an element to the HTML page to render the 3D character:
<div id="characterElementId"><!-- Placeholder for the 3d Character --></div>

Create a new instance and supply the element ID of the 3D character:
var minecraftCharacter = new MinecraftCharacter('characterElementId');

Get references to some variables you may want to modify:
var localScene = minecraftCharacter.scene; // The THREE.js scene
var localCharacterCanvas = minecraftCharacter.canvas; // The canvas which contains the UV map of the skin

Create or load a UV map and assign it to the canvas:
var characterImage = new Image(); // now do something
localCharacterCanvas.getContext("2d").drawImage(characterImage, 0, 0);

Finally call render to show the character:
minecraftCharacter.render;
*/
class MinecraftCharacter {
	constructor(characterRenderElementIdName) {
		console.log("MinecraftCharacter(" + characterRenderElementIdName + ")");
		characterElementId = characterRenderElementIdName;
		createCharacter();
	}
	get canvas() {
		return characterCanvas;
	}
	get scene() {
		return scene;
	}

	get render() {
		characterImageLoaded();
		return null;
	}
	get reRender() {
		reSetupScene();
		return null;
	}
}


// ---------------------------------------------------------------------------
// Everything below is private even though Javascript does not support this.
// Using these vars in other loaded JS files may break this class
// ---------------------------------------------------------------------------


// canvas to store the skin image
var characterCanvas = document.createElement('canvas');

// element name to display the 3d character in
var characterElementId = 'characterElementId';

// All meshes are stored here so one can access them later
var characterMeshes = {};

// TODO: Move to constructor instead of const
const constCharacterScale = 4;

var isInitialized = false;
var radius = 32;
var alpha = 0;
var renderer; // THREE.WebGLRenderer
var camera; // THREE.PerspectiveCamera
var scene = new THREE.Scene();

var skinTexture = new THREE.Texture(characterCanvas);
skinTexture.magFilter = THREE.NearestFilter;
skinTexture.minFilter = THREE.NearestMipMapNearestFilter;

// Set the material for character and cloth
var materialFigure = new THREE.MeshBasicMaterial({map: skinTexture, side: THREE.FrontSide});
var materialCloth = new THREE.MeshBasicMaterial({map: skinTexture, transparent: true, opacity: 1, alphaTest: 0.5, side: THREE.DoubleSide});

function createCharacter() {
	// Head Parts
	// UV Map: https://solutiondesign.com/blog/-/blogs/webgl-and-three-js-texture-mappi-1/
	/* We have 16x16 areas in the range (0/0)-(1/1). Each area is 0.0625×0.0625.
		0/0 is bottom left and 1/1 top right */
	
	var uvFaceWidth = 1/constUvWidth;
	var i = 0;
	// scale the character a little lit larger
	var areaPartScale = 4;
	for (var part in constBodyParts) {
		var bodyPart = constBodyParts[part];
		var areaPart = new UvArea(eval("const" + bodyPart));
		//console.log(bodyPart, areaPart);
		
		// Define the geometry
		// Set the size (Character / Clothes)
		if ( (bodyPart == constHead) || (bodyPart == constBody) || (bodyPart == constArmLeft) || (bodyPart == constArmRight) || (bodyPart == constLegRight) || (bodyPart == constLegLeft) ) {
			areaPartScale = constCharacterScale;
		} else {
			// The Hat, Jacket, Sleeves and Trousers are a little bit larger
			areaPartScale = constCharacterScale * 1.125;
		};
		var partBox = new THREE.BoxGeometry(areaPartScale * areaPart.width, areaPartScale * areaPart.height, areaPartScale * areaPart.depth, 1, 1, 1);
		
		// Purge exisiting UV definitions
		partBox.faceVertexUvs[0] = [];
		i = 0;
		// Create new UV definitions for all 6 faces
		for (var face in constBoxFaces) {
			var boxFace = constBoxFaces[face];
			// locate the area on the loaded image with 4 points: Bottom/Left, Bottom/Right, Top/Right, Top/Left
			// to create a face
			var partFace = [
				new THREE.Vector2(uvFaceWidth * (eval("areaPart."+boxFace+".x")), uvFaceWidth * (constUvWidth - eval("areaPart."+boxFace+".y") - eval("areaPart."+boxFace+".h"))), 
				new THREE.Vector2(uvFaceWidth * (eval("areaPart."+boxFace+".x") + eval("areaPart."+boxFace+".w")), uvFaceWidth * (constUvWidth - eval("areaPart."+boxFace+".y") - eval("areaPart."+boxFace+".h"))),
				new THREE.Vector2(uvFaceWidth * (eval("areaPart."+boxFace+".x") + eval("areaPart."+boxFace+".w")), uvFaceWidth * (constUvWidth - eval("areaPart."+boxFace+".y"))),
				new THREE.Vector2(uvFaceWidth * (eval("areaPart."+boxFace+".x")), uvFaceWidth * (constUvWidth - eval("areaPart."+boxFace+".y")))
			];

			// Map the face to the cube. 2 triangles for each rectangle / square
			partBox.faceVertexUvs[0][i] = [partFace[3], partFace[0], partFace[2]]; i++;
			partBox.faceVertexUvs[0][i] = [partFace[0], partFace[1], partFace[2]]; i++;
		}
		// Select the material (Character or Cloth)
		var partMesh = null;
		if ( (bodyPart == constHead) || (bodyPart == constArmLeft) || (bodyPart == constArmRight) || (bodyPart == constLegRight) || (bodyPart == constLegLeft) ) {
			partMesh = new THREE.Mesh(partBox, materialFigure);
		} else {
			partMesh = new THREE.Mesh(partBox, materialCloth);
		}
		partMesh.name = String(bodyPart);
		
		// Move the cube(bodyPart) to the right position to create the figure
		if ( (bodyPart == constHead) || (bodyPart == constHat) ) {
			// don't move the Head
		} else if ( (bodyPart == constBody) || (bodyPart == constJacket) ) {
			// place the Body under the Head 
			partMesh.position.y = -constCharacterScale * (areaHead.height/2 + areaBody.height/2);
		} else if ( (bodyPart == constArmLeft) || (bodyPart == constSleeveLeft) ) {
			// place the Arm next to the Body
			partMesh.position.y = -constCharacterScale * (areaHead.height/2 + areaBody.height/2);
			partMesh.position.x = constCharacterScale * (areaBody.width/2 + areaArmLeft.width/2);
		} else if ( (bodyPart == constArmRight) || (bodyPart == constSleeveRight) ) {
			// place the Arm next to the Body
			partMesh.position.y = -constCharacterScale * (areaHead.height/2 + areaBody.height/2);
			partMesh.position.x = -constCharacterScale * (areaBody.width/2 + areaArmRight.width/2);
		} else if ( (bodyPart == constLegRight) || (bodyPart == constTrouserRight) ) {
			// place the Leg under the Body + Head
			partMesh.position.y = -constCharacterScale * (areaHead.height/2 + areaBody.height + areaLegRight.height/2);
			partMesh.position.x = -constCharacterScale * (areaLegRight.width/2);
		} else if ( (bodyPart == constLegLeft) || (bodyPart == constTrouserLeft) ) {
			// place the Leg under the Body + Head
			partMesh.position.y = -constCharacterScale * (areaHead.height/2 + areaBody.height + areaLegLeft.height/2);
			partMesh.position.x = constCharacterScale * (areaLegLeft.width/2);
		}
		scene.add(partMesh);
		characterMeshes[bodyPart] = partMesh;
	}
}

function characterImageLoaded() {
	skinTexture.needsUpdate = true;
	materialFigure.needsUpdate = true;
	materialCloth.needsUpdate = true;
	if  (isInitialized == false) {
		isInitialized = true;
		//createCharacter();
		setupScene();
		
		Animate();
	}
}

function setupScene() {
	var sceneElement = document.getElementById(characterElementId);
	var containerRect = sceneElement.getBoundingClientRect();
	var width = containerRect.width;
	var height = containerRect.height;
	
	/*
	PerspectiveCamera( fov, aspect, near, far )
	fov — Camera frustum vertical field of view.
	aspect — Camera frustum aspect ratio.
	near — Camera frustum near plane.
	far — Camera frustum far plane.
	*/
	camera = new THREE.PerspectiveCamera(75, 1, 1, 10000);
	camera.position.y = -constCharacterScale * 3;

	renderer = new THREE.WebGLRenderer({alpha: true});
	renderer.setSize(width, width);
	
	sceneElement.addEventListener('resize', reSetupScene, false);

	sceneElement.appendChild(renderer.domElement);	
}
function reSetupScene() {
	if  (isInitialized == true) {
		renderer.setSize(2, 2);
		var sceneElement = document.getElementById(characterElementId);
		var containerRect = sceneElement.getBoundingClientRect();
		var width = containerRect.width;
		renderer.setSize(width, width);
	};
}
function Animate() {
	requestAnimationFrame(Animate);
	
	camera.rotation.y = alpha;
	alpha += Math.PI / 320;
	camera.position.z = radius*Math.cos(alpha);
	camera.position.x = radius*Math.sin(alpha);
	
	var meshLegLeft = characterMeshes[constLegLeft];
	var meshTrouserLeft = characterMeshes[constTrouserLeft];
	var meshLegRight = characterMeshes[constLegRight];
	var meshTrouserRight = characterMeshes[constTrouserRight];
	var meshArmLeft = characterMeshes[constArmLeft];
	var meshSleeveLeft = characterMeshes[constSleeveLeft];
	var meshArmRight = characterMeshes[constArmRight];
	var meshSleeveRight = characterMeshes[constSleeveRight];
	var zOffsetLeg = constCharacterScale * areaLegRight.height/2;
	var yOffsetLeg = constCharacterScale * (areaHead.height/2 + areaBody.height);
	var zOffsetArm = constCharacterScale * areaArmRight.height/2;
	var yOffsetArm = constCharacterScale * areaHead.height/2;

	//Leg Swing
	meshTrouserLeft.rotation.x = meshLegLeft.rotation.x = Math.cos(alpha*4);
	meshTrouserLeft.position.z = meshLegLeft.position.z = -zOffsetLeg*Math.sin(meshLegLeft.rotation.x);
	meshTrouserLeft.position.y = meshLegLeft.position.y = -yOffsetLeg - zOffsetLeg*Math.abs(Math.cos(meshLegLeft.rotation.x));
	meshTrouserRight.rotation.x = meshLegRight.rotation.x = Math.cos(alpha*4 + (Math.PI));
	meshTrouserRight.position.z = meshLegRight.position.z = -zOffsetLeg*Math.sin(meshLegRight.rotation.x);
	meshTrouserRight.position.y = meshLegRight.position.y = -yOffsetLeg - zOffsetLeg*Math.abs(Math.cos(meshLegRight.rotation.x));
	
	//Arm Swing
	meshSleeveLeft.rotation.x = meshArmLeft.rotation.x = Math.cos(alpha*4 + (Math.PI));
	meshSleeveLeft.position.z = meshArmLeft.position.z = -zOffsetArm*Math.sin(meshArmLeft.rotation.x);
	meshSleeveLeft.position.y = meshArmLeft.position.y = -yOffsetArm - zOffsetArm*Math.abs(Math.cos(meshArmLeft.rotation.x));
	meshSleeveRight.rotation.x = meshArmRight.rotation.x = Math.cos(alpha*4);
	meshSleeveRight.position.z = meshArmRight.position.z = -zOffsetArm*Math.sin(meshArmRight.rotation.x);
	meshSleeveRight.position.y = meshArmRight.position.y = -yOffsetArm - zOffsetArm*Math.abs(Math.cos(meshArmRight.rotation.x));
	
	renderer.render(scene, camera);
}