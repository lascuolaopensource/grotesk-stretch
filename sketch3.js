/* jshint esversion:6, unused:true */

let fonts = [];
let glyphs = [];
let val = 0;
let ctx;
let canvas;
let modifiedGlyph;
let selectedGlyph = -1;
let params = {bgcolor: "#000", textcolor:"#fff" };
let gui = new dat.GUI();

gui.addColor(params,'bgcolor')
gui.addColor(params,'textcolor')

loadFont("ttf/large.otf", (f)=>{
	fonts.push(f);
	loadFont("ttf/small.otf", (ff)=>{
		fonts.push(ff);
		setup();
	});
});






function loadFont(url, callback) {
	opentype.load(url, function(err, font) {
		if (err) {
			alert('Could not load font: ' + err);
		} else {
			callback(font)
		}
	});
}




function setup() {

	canvas = document.querySelector("canvas");
	canvas.width = document.body.clientWidth *2;
	canvas.height = document.body.clientHeight *2;
	canvas.style.width = (canvas.width / 2)+"px";
	canvas.style.height = (canvas.height / 2)+"px";
	ctx = canvas.getContext("2d");
	window.onmousemove = mouseMoved.bind(this); 
	window.onmousedown = mouseDown.bind(this); 
	window.onmouseup = mouseUp.bind(this); 
	window.onkeyup = keyPressed.bind(this); 
	draw();
	
}

function keyPressed(a) {
	if(a.key == "Backspace") {
		if(glyphs.length >0) glyphs.pop();
	} else if(a.key == "Shift") {
	} else {
		createGlyph(a.key);
	}
}

function createGlyph(name) {
	let gA = Object.entries(fonts[0].glyphs.glyphs).find(d=>d[1].name == name)[1]
	let gB = Object.entries(fonts[1].glyphs.glyphs).find(d=>d[1].name == name)[1]


	if(!gA) {
		return;
	}
	glyphs.push(new Glyph(gA, gB));
	positionGlyphs();
}

let previousMouseX = 0;
let shiftPressed = false;

function mouseDown(e) {
	shiftPressed = e.shiftKey;
	previousMouseX = e.clientX * 2;

	if(!glyphs.length) return;
	
	// find the clicked glyph
	let gindex = -1;
	glyphs.forEach((g,i)=>{
		if(e.clientX*2 < g.currentWidth + g.x + g.offsetx && e.clientX*2 > g.x + g.offsetx) {
			gindex = i;
		}
	})

	if(gindex != -1) {
		selectedGlyph = gindex;
		glyphs[selectedGlyph].prevVal = (e.screenX / document.body.clientWidth)*2;
	}
}

function mouseUp(e) {
	selectedGlyph = -1;
}

function mouseMoved(e) {
	if(selectedGlyph != -1) {
		let distanceTravelled = e.clientX*2 - previousMouseX;
		if(shiftPressed) {
			glyphs[selectedGlyph].val = distanceTravelled/100;
		} else {
			glyphs[selectedGlyph].offsetx = distanceTravelled;
		}
	}
}




function draw() {
	ctx.fillStyle = params.bgcolor;
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fill();

	glyphs.forEach((d,i)=>{
		d.selected = selectedGlyph == i;
		d.draw(ctx)
	});

	positionGlyphs();

	window.requestAnimationFrame(draw)

}

function positionGlyphs() {
	let n = 0;
	glyphs.forEach((d,i)=>{
		if(i>0) d.x = n;
		n += d.currentWidth + 20 + d.offsetx;
	});
}

function map(n, start1, stop1, start2, stop2) {
	return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
}


class Glyph {
	constructor(glyphA, glyphB) {
		this.pathA = glyphA.getPath(0,0);
		this.pathB = glyphB.getPath(0,0);
		this.advanceA = glyphA.advanceWidth;
		this.advanceB = glyphB.advanceWidth;
		this.scale = 3;
		let bbA =this.pathA.getBoundingBox();
		let bbB =this.pathB.getBoundingBox();
		this.height =(bbB.y2-bbB.y1) * this.scale;
		this.width = (bbB.x2 - bbB.x1) * this.scale;
		this.maxWidth = (bbA.x2 - bbA.x1) * this.scale;
		this.x = 0;
		this.y = 400;
		this.val =0 ;
		this.offsetx = 0;

	}

	draw(ctx) {
		let commands = this.pathA.commands;
		let commandsB = this.pathB.commands;

		let x = this.x + this.offsetx;
		let y = this.y;
		let xScale = this.scale;
		let yScale = -this.scale;
		let val = this.val;
		this.currentWidth = map(val, 0,1, this.width, this.maxWidth);
		
		if(commands.length != commandsB.length) return
			ctx.beginPath();
		for (let i = 0; i < commands.length; i += 1) {
			const cmd2 = commands[i];
			const cmd = commandsB[i];

			if(cmd.type !== 'Z') {
				let cmdX = map(val, 0, 1, cmd.x, cmd2.x);
				let cmdX1 = map(val, 0, 1, cmd.x1, cmd2.x1);
				let cmdX2 = map(val, 0, 1, cmd.x2, cmd2.x2);
				let cmdY =  map(val, 0, 1, cmd.y, cmd2.y);
				let cmdY1 = map(val, 0, 1, cmd.y1, cmd2.y1);
				let cmdY2 = map(val, 0, 1, cmd.y2, cmd2.y2);

				if (cmd.type === 'M') {
					ctx.moveTo(x + (cmdX * xScale), y + (-cmdY * yScale));
				} else if (cmd.type === 'L') {
					ctx.lineTo(x + (cmdX * xScale), y + (-cmdY * yScale));
				} else if (cmd.type === 'Q') {
					ctx.quadraticCurveTo(x + (cmdX1 * xScale), y + (-cmdY1 * yScale),
						x + (cmdX * xScale), y + (-cmdY * yScale));
				} else if (cmd.type === 'C') {
					ctx.bezierCurveTo(x + (cmdX1 * xScale), y + (-cmdY1 * yScale),
						x + (cmdX2 * xScale), y + (-cmdY2 * yScale),
						x + (cmdX * xScale), y + (-cmdY * yScale));
				}
			} else  {
				ctx.closePath();
			}


		}
		ctx.fillStyle = this.selected ? "#ff3300" : params.textcolor
		ctx.fill()


	}
}