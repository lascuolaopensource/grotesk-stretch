var altMode = false;
var val = 0;
var acc = .5;
var vel = 0;
var result = [];
var letters = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
var parser = new DOMParser();
var row =0;
var stretchyLetters = {};
var displayedGlyphs = [];
var previousCursor = 0;
var currentCursor = 0;
var currentLine = 0;
var sound;

function preload() {
	sound = loadSound('assets/videoplayback.mp3');
	for (var i = 0; i < letters.length; i++) {
		var letter = letters[i];
		result[letter] = [];
		result[letter][0] = loadStrings('set0/'+letter+'_.glif')
		result[letter][1] = loadStrings('set1/'+letter+'_.glif')
	}
}
var currentLetters = [];
var allLetters = [];

function addGlyphs() {

	for (var i = 0; i < letters.length; i++) {
		var letter = letters[i];
		stretchyLetters[letter] = new Letter(0,0,letter, result[letter]);
	}

}

function getGlyphs(mys, ypos){
	var arr = [];
	for (var i = 0; i < mys.length; i++) {
		var letter = mys[i].toUpperCase()
		arr.push(new Letter(0,900 * ypos, letter, result[letter]));
	}
	return arr;
}

function setup() {
	addGlyphs();
	allLetters.push(getGlyphs("la", 0))
	allLetters.push(getGlyphs("scuola", 1))
	allLetters.push(getGlyphs("open", 2))
	allLetters.push(getGlyphs("source", 3))
	// allLetters.push(getGlyphs("alessandro", 4))


	createCanvas(document.body.clientWidth,document.body.clientHeight);

	var mic = new p5.AudioIn();
	mic.start();
	fft = new p5.FFT();
	fft.setInput(mic);

}	
var r =0
function draw() {
	// translate(width/2,height/2)
	// rotate(r+=.01)

	background("#fff")
	fill(0)
	stroke(0)
	scale(.1)

	var spectrum = fft.analyze();
	noStroke();	
	drawRow(spectrum)
	// translate(-width/2,-height/2)

}

function drawRow(spectrum) {

	var totalLetters =0;
	allLetters.forEach(function(d){
		totalLetters+=d.length;
	})

	var interval = Math.floor(spectrum.length / totalLetters);
	var av = 0;
	var cc =0;
	var totalAv = 0;
	var values = [];

	
	for (var i = 0; i < spectrum.length; i++){
		av+= map(spectrum[i], 0,255,0,1);
		if(i % interval == 0 && i) {
			values.push(av/interval)
			totalAv += av/interval;
			av = 0;
			cc++;

		}
	}
	cc =0;
	for (var k = 0; k < allLetters.length; k++) {
		var currentLetters = allLetters[k]
		var advance = 0;
		for (var i = 0; i < currentLetters.length; i++) {
			if(frameCount % 10 == 0) {
				currentLetters[i].targetVal = values[cc];
			}
			currentLetters[i].x = advance;
			currentLetters[i].draw();
			currentLetters[i].val += (currentLetters[i].targetVal -currentLetters[i].val) *.2;
			advance += currentLetters[i].advance;
			cc++;
		}
	}


}

var Letter = function(x,y, letter, stringsArray) {

	this.glyphs = [];
	this.x = x;
	this.y = y;
	var self = this;

	addGlyph(stringsArray[0], 0);
	addGlyph(stringsArray[1], 1);


	function addGlyph(strings, set) {
		var xml = parser.parseFromString(strings.join(''),"text/xml");
		var glyph = JSON.parse(xml2json(xml, '\t')).glyph;
		var contours = glyph.outline.contour
		if(!contours.length) {
			contours = [contours]  
		}

		self.glyphs[set] = {};
		self.glyphs[set].advance = glyph.advance["@width"];
		self.glyphs[set].contours = [];

		for (var j = 0; j < contours.length; j++) {
			var ppoints = contours[j].point
			var points = ppoints.map((d)=> {return{x:+d["@x"], y:500-d["@y"] }}) 
			points.push(points[0]);
			self.glyphs[set].contours[j] = {}
			self.glyphs[set].contours[j].points = points			
		}
	}

	self.val = 0;
	self.targetVal = 0;

}

Letter.prototype.constructor = Letter;


Letter.prototype.draw = function() {

	var n = this.val;
	beginShape()
	for (var j = 0; j < this.glyphs[0].contours.length; j++) {
		var points = this.glyphs[0].contours[j].points;
		for (var i = 0; i < points.length; i++) {
			var p =  this.glyphs[1].contours[j].points[i];
			var p1 =  this.glyphs[0].contours[j].points[i];
			vertex(map(n, 0, 1, p.x, + p1.x)+this.x, map(n, 0, 1, p.y, p1.y)+this.y + 500)
		}
	}
	endShape();

	this.advance = map(n, 0, 1, +this.glyphs[1].advance, +this.glyphs[0].advance);
}


