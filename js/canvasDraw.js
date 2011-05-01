//Draw in canvas script
//Declare four color variables: colorPurple, colorGreen, colorYellow, colorBrown with corresponding hex color values, 
//a variable to store the current color: curColor, and an array to match the chosen color when the user clicked the canvas clickColor.
//Create a cursor size as well.
var colorPurple = "#cb3594";
var colorGreen = "#659b41";
var colorYellow = "#ffcf33";
var colorBrown = "#986928";
var colorWhite = "#ffffff";

var curColor = colorPurple;
var clickColor = new Array();

var clickSize = new Array();
var curSize = "normal";
var canvasWidth = 640;
var canvasHeight = 360;
canvas = document.getElementById('c');
context = document.getElementById('c').getContext("2d");



//Mouse Down Event: When the user clicks on canvas we record the position in an array via the addClick function. 
//We set the boolean paint to true. Finally we update the canvas with the function redraw.
$('#c').mousedown(function(e){
	var mouseX = e.pageX - this.offsetLeft;
	var mouseY = e.pageY - this.offsetTop;

	paint = true;
	addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
	redraw();
});

//clear canvas on "Clear" button press
$('#clearCanvas').mousedown(function(e){
	clickX = new Array();
	clickY = new Array();
	clickDrag = new Array();
	clickColor = new Array();
	clearCanvas();
});

//button mousedown events to select color and cursor size
$('#choosePurpleColors').mousedown(function(e){
	curColor = colorPurple;
});
$('#chooseGreenColors').mousedown(function(e){
	curColor = colorGreen;
});
$('#chooseYellowColors').mousedown(function(e){
	curColor = colorYellow;
});
$('#chooseBrownColors').mousedown(function(e){
	curColor = colorBrown;
});
$('#chooseWhiteColors').mousedown(function(e){
	curColor = colorWhite;
});
$('#chooseSmallSizes').mousedown(function(e){
	curSize = "small";
});
$('#chooseNormalSizes').mousedown(function(e){
	curSize = "normal";
});
$('#chooseLargeSizes').mousedown(function(e){
	curSize = "large";
});
$('#chooseHugeSizes').mousedown(function(e){
	curSize = "huge";
});

//Mouse Move Event: Just like moving the tip of a marker on a sheet of paper, we want to draw on the canvas when our user is pressing down. 
//The boolean paint will let us know if the virtual marker is pressing down on the paper or not. 
//If paint is true, then we record the value. Then redraw.
$('#c').mousemove(function(e){
	if(paint){
		addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
		redraw();
	}
});

//Mouse Up Event: Marker is off the paper; paint boolean will remember!
$('#c').mouseup(function(e){
	paint = false;
});

//Mouse Leave Event: If the marker goes off the paper, then forget you!
$('#c').mouseleave(function(e){
	paint = false;
});

//Here is the addClick function that will save the click position:
var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

function addClick(x, y, dragging){
	clickX.push(x);
	clickY.push(y);
	clickDrag.push(dragging);
	clickColor.push(curColor);
	clickSize.push(curSize);
}

//The redraw function is where the magic happens. Each time the function is called the canvas is cleared and everything is redrawn. 
//We could be more efficient and redraw only certain aspects that have been changed, but let's keep it simple.
//We set a few stroke properties for the color, shape, and width. Then for every time we recorded as a marker on paper we are going to draw a line.
function redraw(){
	//canvas.width = canvas.width; // Clears the canvas
	context.lineJoin = "round";
	var radius = 5;
	for(var i=0; i < clickX.length; i++){
		if(clickSize[i] == "small"){
			radius = 2;
		}else if(clickSize[i] == "normal"){
			radius = 5;
		}else if(clickSize[i] == "large"){
			radius = 10;
		}else if(clickSize[i] == "huge"){
			radius = 20;
		}
		context.beginPath();
		if(clickDrag[i] && i){
			context.moveTo(clickX[i-1], clickY[i-1]);
		}else{
			context.moveTo(clickX[i]-1, clickY[i]);
		}
		context.lineTo(clickX[i], clickY[i]);
		context.closePath();
		context.strokeStyle = clickColor[i];
		context.lineWidth = radius;
		context.stroke();
	}
}

//clear canvas
function clearCanvas(){
	context.fillStyle = '#ffffff'; // Work around for Chrome
	context.fillRect(0, 0, canvasWidth, canvasHeight); // Fill in the canvas with white
	canvas.width = canvas.width; // clears the canvas
	//now quickly restart and stop video so frame doesnt go black
	// $('#v').gVideo().play();
	// $('#v').gVideo().pause();
}