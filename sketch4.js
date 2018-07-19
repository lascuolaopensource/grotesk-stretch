/* jshint esversion:6, unused:true */

let fonts = [];
let glyphs = [];
let val = 0;
let ctx;
let canvas;
let modifiedGlyph;
let selectedGlyph = -1;

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
	draw();
	"SCUOLA".split("").forEach((d,i)=>{
		createGlyph(d,  200, i*200 + 100);
	})
	"OPEN".split("").forEach((d,i)=>{
		createGlyph(d,  700, i*200 + 100);
	})

	"SOURCE".split("").forEach((d,i)=>{
		createGlyph(d,  1300, i*200 + 100);
	})

	
}

function createGlyph(name, x, y) {
	let gA = Object.entries(fonts[0].glyphs.glyphs).find(d=>d[1].name == name)[1]
	let gB = Object.entries(fonts[1].glyphs.glyphs).find(d=>d[1].name == name)[1]

	if(!gA) {
		alert(`no glyph with name ${name}`);
		return;
	}
	glyphs.push(new Glyph(gA, gB, x, y))
}

function mouseDown(e) {
	let minDistance = Infinity;
	let gindex = -1;
	glyphs.forEach((g,i)=>{
		let gcx = g.x + g.width/2
		let gcy = g.y + g.height/2
		let dx = e.clientX*2 - gcx
		let dy = e.clientY*2 - gcy;
		let dsq = Math.sqrt(dx*dx + dy*dy);
		console.log( e.screenY , gcy, g.height)
		if(dsq < minDistance) {
			minDistance = dsq;
			gindex= i;
		}
	})

	selectedGlyph = gindex;
	glyphs[selectedGlyph].prevVal = (e.screenX / document.body.clientWidth)*2;
}

function mouseUp(e) {
	selectedGlyph = -1;
}

function mouseMoved(e) {
	if(selectedGlyph != -1) {
		glyphs[selectedGlyph].val = (e.screenX / document.body.clientWidth)*4- glyphs[selectedGlyph].prevVal;
	}
}



let time =0
function draw() {
	// ctx.clearRect(0, 0, canvas.width, canvas.height);
	glyphs.forEach((d,i)=>{
		d.selected = selectedGlyph == i;
		
		ctx.fillStyle = ("rgba(0,0,0,.008)")
		d.val = Math.sin(time+ i*.03 + Math.cos(time + i*.2)) *2 + 2
		d.draw(ctx)

	})
	window.requestAnimationFrame(draw)
	time+=0.1;
}

function map(n, start1, stop1, start2, stop2) {
	return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
}


class Glyph {
	constructor(glyphA, glyphB, x,y) {
		this.pathA = glyphA.getPath(0,0)
		this.pathB = glyphB.getPath(0,0)
		this.scale = 2;
		let bb =this.pathB.getBoundingBox();
		this.height =(bb.y2-bb.y1) * this.scale;
		this.width = (bb.x2 - bb.x1) * this.scale;
		this.x = x;
		this.y = y;
		this.val =0 ;
		
	}

	draw(ctx) {
		let commands = this.pathA.commands;
		let commandsB = this.pathB.commands;
		let x = this.x;
		let y = this.y;
		let xScale = this.scale;
		let yScale = -this.scale;
		let val = this.val;

		// ctx.rect(x,y,this.width,this.height);
		// ctx.stroke();

		y+=this.height;

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
			
			// (this.selected) ? ctx.fill() :ctx.stroke()
			
		}

		// ctx.stroke()
		// ctx.fillStyle = ("rgba(0,0,0,.008)")
		ctx.fill()


	}
}