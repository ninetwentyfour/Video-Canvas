//draw the video to a canvas element
document.addEventListener('DOMContentLoaded', function(){
	var v = document.getElementById('v');
	var canvas = document.getElementById('c');
	var context = canvas.getContext('2d');
	var cw = canvas.clientWidth;
	var ch = canvas.clientHeight;
	canvas.width = cw;
	canvas.height = ch;
	v.addEventListener('play', function(){
		draw(this,context,cw,ch);
	},false);
},false);

function draw(v,c,w,h) {
	if(v.paused || v.ended) return false;
	c.drawImage(v,0,0,w,h);
	setTimeout(draw,20,v,c,w,h);
}