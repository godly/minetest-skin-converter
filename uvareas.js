// Global string constants to avoid quoted strings in the code
// Body Parts
const constHead = "Head";
const constHat = "Hat";
const constBody = "Body";
const constJacket = "Jacket";
const constArmLeft = "ArmLeft";
const constLegLeft = "LegLeft";
const constSleeveLeft = "SleeveLeft";
const constTrouserLeft = "TrouserLeft";
const constArmRight = "ArmRight";
const constLegRight = "LegRight";
const constSleeveRight = "SleeveRight";
const constTrouserRight = "TrouserRight";
const constBodyParts = {
	1: constHead, 2: constHat, 3: constBody, 4: constJacket,
	5: constArmLeft, 6: constLegLeft, 7: constSleeveLeft, 8: constTrouserLeft,
	9: constArmRight, 10: constLegRight, 11: constSleeveRight, 12: constTrouserRight
};

// Faces
const constFaceTop = "top";
const constFaceBottom = "bottom";
const constFaceLeft = "left";
const constFaceFront = "front";
const constFaceRight = "right";
const constFaceBack = "back";
const constFacesAll = "all";
const constFacesLeftFrontRight = "lfr";
const constFaceUnusedL = "unusedL";
const constFaceUnusedR = "unusedR";
const constBoxFaces = { 1: constFaceRight, 2: constFaceLeft, 3: constFaceTop, 4: constFaceBottom, 5: constFaceFront, 6: constFaceBack };

// Minimum width of the UV map if each face is represented by a pixel.
const constUvWidth = 16;
// Default Minecraft skin width: 64px
const constDefaultUvImageWidth = 64; 
// Default face width: 4px (64px/16). Each arm top and bottom face uses 4px². Each head face uses 8px² (2× 2×UvFaceWidth).
// Recalculate the uvFaceWidth with the (here unknown) uvImageWidth.
var uvFaceWidth = constDefaultUvImageWidth / constUvWidth;

/* faceArea() defines a rectangular / square face (or area).
0/ 0 | 1/0  | 2/0  | ... | 15/0
0/ 1 | 1/1  | 2/1  | ... | 15/1
                     ...
0/15 | 1/15 | 2/15 | ... | 15/15
'x' and 'y' define the start position, 'w' and 'h' define the width and height (not the absolute end point) of the area:
	(2/0)-(2/2) is the head top face
Instead of a single face also a larger rectangular / square area with multiple faces may be defined:
	(0/0)-(15/15) is the whole skin
*/
function faceArea(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}

/*
UvArea defines a boxed area which contains the relevant skin part of the selected body part. Supported body parts:
	Head/Hat, Body/Jacket, LArm/LLeg/LTrouser/LSleeve/RArm/RLeg/RTrouser/RSleeve
	It offers properties to get "all" faces,
	to get the "top", "bottom", "left", "front", "right" and "back"  faces,
	the "lfr" (Left-Front-Right) and the unused "unusedL" and "unusedR" areas.

Typical UV definition for each body part of the character are:
Head and Hat: w=h=d=2
|  | w| w|
+--+--+--+--+--
|  |##|##|  | d (unusedL, top, bottom, unusedR)
|  |##|##|  |
+==+==+==+==+==
|##|##|##|##| h (left, front, right, back)
|##|##|##|##|
+--+--+--+--+--
| d| w| d| w|

Body and Jacket: w=2, h=3 and d=1
| | w| w|
+-+--+--+-+--
| |##|##| | d
+=+==+=**=+==
|#|##|#|##|
|#|##|#|##| h
|#|##|#|##|
+-+--+--+-+--
|d| w|d| w|

Arms and Legs: w=1, h=3 and d=1
| |w|w| |
+-+-+-+-+--
| |#|#| | d
+=+=+=+=+==
|#|#|#|#|
|#|#|#|#| h
|#|#|#|#|
+-+--+--+--
|d|w|d|w|

(w = width, h = height, d = depth)
*/
class UvArea {
	// supported types:
	constructor(type) {
		this.type = type;
		if ( (this.type == constHead) || (this.type == constHat) ) {
			// assume constHead
			this.px = 0;
			this.py = 0;
			this.width = 2;
			this.height = 2;
			this.depth = 2;
			if (this.type == constHat) {
				this.px = 8;
				this.py = 0;
			}
		} else if ( (this.type == constBody) || (this.type == constJacket) ) {
			// assume constBody
			this.px = 4;
			this.py = 4;		
			this.width = 2;
			this.height = 3;
			this.depth = 1;
			if (this.type == constJacket) {
				this.px = 4;
				this.py = 8;
			}
		} else {
			// assume constLegRight
			this.px = 0;
			this.py = 4;
			this.width = 1;
			this.height = 3;
			this.depth = 1;			
			if (this.type == constArmRight) {
				this.px = 10;
				this.py = 4;
			} else if (this.type == constTrouserRight) {
				this.px = 0;
				this.py = 8;
			} else if (this.type == constSleeveRight) {
				this.px = 10;
				this.py = 8;
			} else	if (this.type == constTrouserLeft) {
				this.px = 0;
				this.py = 12;
			} else if (this.type == constLegLeft) {
				this.px = 4;
				this.py = 12;
			} else if (this.type == constArmLeft) {
				this.px = 8;
				this.py = 12;
			} else if (this.type == constSleeveLeft) {
				this.px = 12;
				this.py = 12;
			}
		}
		console.log("INFO\tBoxArea " + this.type + " (" + this.px + "/" + this.py + ") (" + this.width + "/" + this.height + "/" + this.depth + ")");
	}
	get top() {
		return new faceArea(this.px + this.depth, this.py, this.width, this.depth);
	}
	get bottom() {
		return new faceArea(this.px + this.depth + this.width, this.py, this.width, this.depth);
	}
	get left() {
		return new faceArea(this.px, this.py + this.depth, this.depth, this.height);
	}
	get front() {
		return new faceArea(this.px + this.depth, this.py + this.depth, this.width, this.height);
	}
	get right() {
		return new faceArea(this.px + this.depth + this.width, this.py + this.depth, this.depth, this.height);
	}
	get back() {
		return new faceArea(this.px + 2*this.depth + this.width, this.py + this.depth, this.width, this.height);
	}
	get all() {
		return new faceArea(this.px, this.py, 2*(this.depth + this.width), this.depth + this.height);
	}
	get lfr() {
		// Left Front Right
		return new faceArea(this.px, this.py + this.depth, 2*this.depth + this.width, this.height);
	}
	get unusedL() {
		return new faceArea(this.px, this.py, this.depth, this.depth);
	}
	get unusedR() {
		return new faceArea(this.px + this.depth + 2*this.width, this.py, this.depth, this.depth);
	}
}


// Global definition of the rectangular or square skin areas
// Lines 1-4
const areaNull = new faceArea(0, 0, 0, 0); // special, nothing
const areaMinetest = new faceArea(0, 0, 16, 8); // special, the whole Mintest skin / the upper half of the Minecraft skin
const areaMinecraft = new faceArea(0, 0, 16, 16); // special, the whole Minecraft skin
const areaHead = new UvArea(constHead);
const areaHat = new UvArea(constHat);
// Lines 5-8
const areaLegRight = new UvArea(constLegRight);
const areaBody = new UvArea(constBody);
const areaArmRight = new UvArea(constArmRight);
const areaUnusedMinecraft = new faceArea(14, 4, 2, 8); // special unusedL
const areaUnusedMinetest = new faceArea(14, 4, 2, 1); // special unusedR
const areaCapeMinetest = new faceArea(14, 5, 2, 3); // special, other location than Minecraft:areaJacket.back
// Lines 9-12
const areaTrouserRight = new UvArea(constTrouserRight);
const areaJacket = new UvArea(constJacket);
const areaSleeveRight = new UvArea(constSleeveRight);
// Lines 13-16
const areaTrouserLeft = new UvArea(constTrouserLeft);
const areaLegLeft = new UvArea(constLegLeft); // areaLeftLeg
const areaArmLeft = new UvArea(constArmLeft);
const areaSleeveLeft = new UvArea(constSleeveLeft);
