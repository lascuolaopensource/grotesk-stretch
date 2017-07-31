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

function addGlyphs() {
	
	for (var i = 0; i < letters.length; i++) {
		var letter = letters[i];
		stretchyLetters[letter] = new Letter((100/.1),(100/.1)*i + 100,letter, result[letter]);
	}
}

function setup() {
	addGlyphs();
	createCanvas(document.body.clientWidth,document.body.clientHeight);
	fft = new p5.FFT(0.8,16);
	sound.amp(0.2)
	sound.loop();
}	

function draw() {
	background("#fff")
	fill(0)
	stroke(0)
	scale(.1)

	var spectrum = fft.waveform();
	noStroke();	


	var currentLetters = [stretchyLetters["A"], stretchyLetters["B"], stretchyLetters["C"], stretchyLetters["D"]]
	
	if(frameCount % 10 == 0){
		var av = 0;
		var cc =0;
		for (var i = 0; i <= spectrum.length; i++){

			if(i%4 == 0 && i) {
				currentLetters[cc].val = av *2;
				av = 0;
				cc++;
			}
			av+= map(spectrum[i], -1,1,0,1)/4;
		}
	} 

	for (var i = 0; i < currentLetters.length; i++) {
		currentLetters[i].draw();
		if(currentLetters[i].val >0) currentLetters[i].val -=0.01
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

	this.advance = map(val, 0, 1, +this.glyphs[1].advance, +this.glyphs[0].advance);
}

