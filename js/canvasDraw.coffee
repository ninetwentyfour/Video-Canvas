# Draw in canvas script
# Declare four color variables: colorPurple, colorGreen, colorYellow, colorBrown with corresponding hex color values, 
# a variable to store the current color: curColor, and an array to match the chosen color when the user clicked the canvas clickColor.
# Create a cursor size as well.
colorPurple = "#cb3594"
colorGreen = "#659b41"
colorYellow = "#ffcf33"
colorBrown = "#986928"
colorWhite = "#ffffff"

curColor = colorPurple
clickColor = new Array()

clickSize = new Array()
curSize = "normal"
canvasWidth = 640
canvasHeight = 360
canvas = $('#c')
context = $('#c').getContext "2d"

# Mouse Down Event: When the user clicks on canvas we record the position in an array via the addClick function. 
# We set the boolean paint to true. Finally we update the canvas with the function redraw.
$('#c').mousedown (e) ->
	mouseX = e.pageX - this.offsetLeft
	mouseY = e.pageY - this.offsetTop
	paint = true
	addClick e.pageX - this.offsetLeft, e.pageY - this.offsetTop
	redraw()

# clear canvas on "Clear" button press
$('#clearCanvas').mousedown (e) ->
	clickX = new Array()
	clickY = new Array()
	clickDrag = new Array()
	clickColor = new Array()
	clearCanvas()

# button mousedown events to select color and cursor size
$('#choosePurpleColors').mousedown (e) ->
	curColor = colorPurple
$('#chooseGreenColors').mousedown (e) ->
	curColor = colorGreen
$('#chooseYellowColors').mousedown (e) ->
	curColor = colorYellow
$('#chooseBrownColors').mousedown (e) ->
	curColor = colorBrown
$('#chooseWhiteColors').mousedown (e) ->
	curColor = colorWhite
$('#chooseSmallSizes').mousedown (e) ->
	curSize = "small"
$('#chooseNormalSizes').mousedown (e) ->
	curSize = "normal"
$('#chooseLargeSizes').mousedown (e) ->
	curSize = "large"
$('#chooseHugeSizes').mousedown (e) ->
	curSize = "huge"

# Mouse Move Event: Just like moving the tip of a marker on a sheet of paper, we want to draw on the canvas when our user is pressing down. 
# The boolean paint will let us know if the virtual marker is pressing down on the paper or not. 
# If paint is true, then we record the value. Then redraw.
$('#c').mousemove (e) ->
	if paint
		addClick e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true
		redraw()

# Mouse Up Event: Marker is off the paper; paint boolean will remember!
$('#c').mouseup (e) ->
	paint = false

# Mouse Leave Event: If the marker goes off the paper, then forget you!
$('#c').mouseleave (e) ->
	paint = false

# Here is the addClick function that will save the click position:
clickX = new Array()
clickY = new Array()
clickDrag = new Array()
paint

addClick = (x, y, dragging) ->
	clickX.push x
	clickY.push y
	clickDrag.push dragging
	clickColor.push curColor
	clickSize.push curSize

# The redraw function is where the magic happens. Each time the function is called the canvas is cleared and everything is redrawn. 
# We could be more efficient and redraw only certain aspects that have been changed, but let's keep it simple.
# We set a few stroke properties for the color, shape, and width. Then for every time we recorded as a marker on paper we are going to draw a line.
redraw = () ->
	# canvas.width = canvas.width; // Clears the canvas
	context.lineJoin = "round"
	radius = 5
	for i in clickX.length
		if clickSize[i] is "small"
			radius = 2
		else if clickSize[i] is "normal"
			radius = 5
		else if clickSize[i] is "large"
			radius = 10
		else if clickSize[i] is "huge"
			radius = 20
		context.beginPath()
		if clickDrag[i] and i
			context.moveTo clickX[i-1], clickY[i-1]
		else
			context.moveTo clickX[i]-1, clickY[i]
		context.lineTo clickX[i], clickY[i]
		context.closePath()
		context.strokeStyle = clickColor[i]
		context.lineWidth = radius
		context.stroke()
		
# clear canvas
clearCanvas = () ->
	context.fillStyle = '#ffffff' # Work around for Chrome
	context.fillRect 0, 0, canvasWidth, canvasHeight # Fill in the canvas with white
	canvas.width = canvas.width # clears the canvas