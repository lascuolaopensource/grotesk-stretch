var glyphs = [];
var altMode = false;
var val = 0;
var acc = .5;
var vel = 0;
var result = [];
var letters = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
var parser = new DOMParser();
var row =0;
var currentGlyphs = [];
var displayedGlyphs = [];
var previousCursor = 0;
var currentCursor = 0;
var currentLine = 0;


function preload() {
	result[0] = [];
	result[1] = [];
	for (var i = 0; i < letters.length; i++) {
		var letter = letters[i];
		result[0][letter] = loadStrings('set0/'+letter+'_.glif')
		result[1][letter] = loadStrings('set1/'+letter+'_.glif')
	}

}

function addGlyphs() {
	
	glyphs[0] = {};
	glyphs[1] = {};

	for (var i = 0; i < letters.length; i++) {
		var letter = letters[i];
		addGlyph(0, letter, result[0][letter]);
		addGlyph(1, letter, result[1][letter]);
	}
}
function addGlyph(set, letter, strings) {
	var xml = parser.parseFromString(strings.join(''),"text/xml");
	var glyph = JSON.parse(xml2json(xml, '\t')).glyph;
	var contours = glyph.outline.contour
	if(!contours.length) {
		contours = [contours]  
	}
	glyphs[set][letter] = [];
	glyphs[set][letter] = {};
	glyphs[set][letter].advance = glyph.advance["@width"];
	glyphs[set][letter].contours = [];

	for (var j = 0; j < contours.length; j++) {
		var ppoints = contours[j].point
		var points = ppoints.map((d)=> {return{x:+d["@x"], y:500-d["@y"] }}) 
		points.push(points[0]);
		glyphs[set][letter].contours[j] = {}
		glyphs[set][letter].contours[j].points = points			
	}
}

function keyReleased() {
	

	
	switch(keyCode) {

		// BACKSPACE
		case 8:
		if(displayedGlyphs.length) {
			storeExistingGlyphs();
			var n = displayedGlyphs.pop()
			previousCursor = n.cursor;
			currentCursor = previousCursor;
		}
		break

		// SPACE
		case 32:
		storeExistingGlyphs();
		currentCursor += 400;
		break

		// ENTER
		case 13:
		storeExistingGlyphs();
		row++;
		currentLine = row * 800;
		previousCursor = currentCursor = 0;
		break;

		
	}
}

function keyPressed() {
	var letter = key.toUpperCase();
	if(~letters.indexOf(letter)) {
		storeExistingGlyphs();
		previousCursor = currentCursor;
		currentGlyphs = [glyphs[0][letter],glyphs[1][letter]];
		val = 0;
	} 
}

function storeExistingGlyphs() {
	if(!currentGlyphs.length) return;
	var glyphToStore = {cursor:previousCursor, contours:[]}
	for (var j = 0; j < currentGlyphs[0].contours.length; j++) {
		var points = currentGlyphs[0].contours[j].points;
		glyphToStore.contours[j] = [];
		for (var i = 0; i < points.length; i++) {
			var p =  currentGlyphs[1].contours[j].points[i];
			var p1 =  currentGlyphs[0].contours[j].points[i];
			glyphToStore.contours[j].push({
				x: previousCursor + map(val, 0, 1, p.x, + p1.x), 
				y: map(val, 0, 1, p.y, p1.y) + currentLine
			});
		}
	}
	displayedGlyphs.push(glyphToStore)
	currentGlyphs = [];
}
function setup() {
	addGlyphs();
	createCanvas(document.body.clientWidth,document.body.clientHeight);
}	

function draw() {
	background("#fff")
	fill(0)
	stroke(0)
	scale(.1)
	// noFill();
	translate(100,500)

	//draw previous glyphs
	for (var j = 0; j < displayedGlyphs.length; j++) {
		beginShape()
		for (var k = 0; k < displayedGlyphs[j].contours.length; k++) {
			var points = displayedGlyphs[j].contours[k];
			for (var i = 0; i < points.length; i++) {
				var p = points[i];
				vertex(p.x,p.y)
			}
		}
		endShape();
	}


	if(currentGlyphs.length) {
		if(keyIsPressed && val < 1) {
			vel += acc;
		} else if(val >0) {
			vel -= acc  *.15
		}

		vel *= 0.09;
		val += vel;
		if(val < 0) val =0;
		drawGlyph()
		currentCursor = previousCursor + map(val, 0, 1, +currentGlyphs[1].advance, +currentGlyphs[0].advance)
		rect(currentCursor,-500, 10,height/.1)
	} else {
		rect(currentCursor,-500, 10,height/.1)
	}



}


function drawGlyph() {


	var n = val;

	beginShape()
	for (var j = 0; j < currentGlyphs[0].contours.length; j++) {
		var points = currentGlyphs[0].contours[j].points;
		for (var i = 0; i < points.length; i++) {
			var p =  currentGlyphs[1].contours[j].points[i];
			var p1 =  currentGlyphs[0].contours[j].points[i];
			vertex(previousCursor +  map(n, 0, 1, p.x, + p1.x), map(n, 0, 1, p.y, p1.y) + currentLine)
		}
	}
	endShape();

}


function mousePressed() {

	return;
	for (var j = 0; j < contours.length; j++) {
		var points = contours[j].points;
		var minD = Infinity;
		var currentPoint = null;
		for (var i = 0; i < points.length; i++) {
			var p = points[i];
			var d = dist(mouseX,mouseY, p.x,p.y)
			if(d < minD) {
				minD =d;
				currentPoint = p;
			}
		}
	}

	if(currentPoint.leftStretch || currentPoint.rightStretch) {
		currentPoint.rightStretch = currentPoint.leftStretch = false;
	} else {
		currentPoint[(altMode ? "left" : "right" )+ "Stretch"] = true;
	}

}