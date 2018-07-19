var isWaveform = false;
var myScale = .1;
var myText = ["one", "two", "three"];
var result = [];
var letters = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
var parser = new DOMParser();
var row =0;
var stretchyLetters = {};
var sound;
var currentLetters = [];
var allLetters = [];

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
		stretchyLetters[letter] = new Letter(0,0, letter, result[letter]);
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

	for (var i = 0; i < myText.length; i++) {
		allLetters.push(getGlyphs(myText[i], i))
	}

	createCanvas(document.body.clientWidth,document.body.clientHeight);

	var mic = new p5.AudioIn();
	mic.start();
	fft = new p5.FFT();
	fft.setInput(mic);

}	
var r =0
function draw() {
	background("#fff")
	fill(0)
	stroke(0)
	scale(myScale)

	noStroke();	
	drawRows()

}


function drawRows() {

	var totalLetters =0;
	allLetters.forEach(function(d){
		totalLetters+=d.length;
	})

	var spectrum = isWaveform ? fft.waveform() : fft.analyze();
	var interval = Math.floor(spectrum.length / totalLetters);
	var av = 0;
	var cc =0; // counter letter
	var cr =0; // counter rows
	var clr =0; // counter letter for row
	var totalAv = 0;
	var values = [];

	var barwidth = (width/myScale)/spectrum.length;


	if(isKeyPressed) text(myText[cr].toUpperCase(), 30, height/myScale - 80/myScale);

	for (var i = 0; i < spectrum.length; i++){
		av+= isWaveform ? map(spectrum[i], -1,1,0,1) : map(spectrum[i], 0,255,0,1);
		if(i % interval == 0 && i) {
			values.push(av/interval)
			totalAv += av/interval;
			av = 0;
			cc++;
			clr++;
			if(clr == allLetters[cr].length) {

				if(isKeyPressed) {
					var ypos = height/myScale - 80/myScale;
					fill(cr % 2 ? 50 : 100)
					rect(i*barwidth, ypos - 50/myScale, 2, 50/myScale)
					textSize(10/myScale)
					if(cr < myText.length-1) text(myText[cr+1].toUpperCase(),i*barwidth + 30,ypos);
				}

				cr++
				clr =0;
			}
		}
		if(isKeyPressed) rect(i*barwidth, height/myScale-spectrum[i] - 100/myScale, barwidth, spectrum[i]);
	}


	fill(0);
	cc =0;

	for (var k = 0; k < allLetters.length; k++) {
		var currentLetters = allLetters[k]
		var maxLength = currentLetters.length * 1294; // arbitrary value
		var 
		var advance = 0;
		var totalAdvance = 0

		for (var i = 0; i < currentLetters.length; i++) {
			currentLetters[i].targetVal = values[cc];			
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


