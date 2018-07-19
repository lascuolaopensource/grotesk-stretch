/* jshint esversion:6, unused:true */
var glyphs = [{},{}];
var result = [{},{}];
var val = 0;
var letters = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
var parser = new DOMParser();

let current = 1;
let v = 0.001;


function preload() {

	letters.forEach(letter=>{
		result[1][letter] =  loadStrings('set0/'+letter+'_.glif');
		result[0][letter] =  loadStrings('set1/'+letter+'_.glif');
	});

}

function addGlyphs() {
	letters.forEach(letter=>{
		addGlyph(0, letter, result[0][letter]);
		addGlyph(1, letter, result[1][letter]);
	});
}

function addGlyph(set, letter, strings) {
	var xml = parser.parseFromString(strings.join(''),"text/xml");
	var glyph = JSON.parse(xml2json(xml, '\t')).glyph;
	var contours = glyph.outline.contour;
	let g = new Glyph();
	g.advance = +glyph.advance["@width"];
	g.setContours(contours.length > 1 ? contours : [contours]);
	glyphs[set][letter] = g;
}


function setup() {
	createCanvas(document.body.clientWidth,document.body.clientHeight);
	addGlyphs();
}	


function draw() {
	background("#fff");
	noStroke();
	fill(0,0,0);
	scale(.2);
	translate(100,0);
	maxX = 0;
	drawGlyph("M", true);
	translate(maxX,0);
	drawGlyph("A", false, .5);
	translate(glyphs[1]["A"].advance*.7,0);
	drawGlyph("X", false, .5);
	translate(glyphs[0]["Z"].advance,0);

	if(!isDragging) {
		v += -current * .09;
		current += v;
		current*=.9;
		val = current;
	}
}
let startedAt 
function mouseDragged() {
	isDragging = true
	val = (mouseX - startedAt)/width*2;
}

function mousePressed( ){
	startedAt = mouseX;
}
let isDragging = false

function mouseReleased() {
	isDragging = false
	current = val;
	val =0;
	v = 0.001;
}
let maxX = 0;
function drawGlyph(letter, track, fval) {
	beginShape();
	glyphs[0][letter].contours.forEach((contour,j)=>{
		let c = 0;
		let isCurving = false;
		let curves = [];
		let rval = val;//Math.max(0, val)
		contour.points.forEach((p,i)=>{
			if(track) {
				let p1 = glyphs[1][letter].contours[j].points[i];
				let x = map(rval, 0, 1, p.x, + p1.x);
				let y = -map(rval, 0, 1, p.y, p1.y) + 1000;
				if(maxX < x) maxX = x;
				vertex(x,y);
			} else if(fval) {
				let p1 = glyphs[1][letter].contours[j].points[i];
				let x = map(fval, 0, 1, p.x, + p1.x);
				let y = -map(fval, 0, 1, p.y, p1.y) + 1000;
				vertex(x,y);
			} else {
				vertex(p.x,-p.y+ 1000);
			}
		});
	});
	endShape();

}

class Glyph {

	constructor() {
		this.variants = [];
	}

	setContours(contours) {
		this.contours = contours.map(contour=>{
			let points = contour.point.map(point=>{

				return {
					x: +point["@x"],
					y: +point["@y"],
					type: point["@type"]
				}
			});
			points.push(points[0])
			return {points};
		});
	}
}

