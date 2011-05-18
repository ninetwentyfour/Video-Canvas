writeText = () ->
	# steal the mousedown event for the canvas for one time
	$("#c").one 'mousedown', (e) ->
		mouseX = e.pageX - this.offsetLeft + $("#c").position().left
		mouseY = e.pageY - this.offsetTop
		# append a text area box to the canvas where the user clicked to enter in a comment
		textArea = "<div id='textAreaPopUp' style='position:absolute;top:"+mouseY+"px;left:"+mouseX+"px;z-index:30;'><textarea id='textareaTest' style='width:100px;height:50px;'></textarea>"
		saveButton = "<input type='button' value='save' id='saveText' onclick='saveTextFromArea("+mouseY+","+mouseX+");'></div>"
		appendString = textArea + saveButton
		$("#main").append appendString

saveTextFromArea = (y,x) ->
	# get the value of the textarea then destroy it and the save button
	text = $('textarea#textareaTest').val()
	$('textarea#textareaTest').remove()
	$('#saveText').remove()
	# get the canvas and add the text functions
	canvas = $('#c')
	ctx = canvas.getContext '2d'
	# break the text into arrays based on a text width of 100px
	phraseArray = getLines ctx,text,100
	# this adds the text functions to the ctx
	CanvasTextFunctions.enable ctx
	counter = 0
	# set the font styles
	font = "sans"
	fontsize = 16
	ctx.strokeStyle = "rgba(237,229,0,1)"
	ctx.shadowOffsetX = 2
	ctx.shadowOffsetY = 2
	ctx.shadowBlur = 1
	ctx.shadowColor = "rgba(0,0,0,1)"
	# draw each phrase to the screen, making the top position 20px more each time so it appears there are line breaks
	$.each phraseArray, () ->
		# set the placement in the canvas
		lineheight = fontsize * 1.5
		newline = ++counter
		newline = newline * lineheight
		topPlacement = y - $("#c").position().top + newline
		leftPlacement = x - $("#c").position().left
		text = this
		# draw the text
		ctx.drawText font, fontsize, leftPlacement, topPlacement, text
		ctx.save()
		ctx.restore()
	# reset the drop shadow so marker lines dont have them
	ctx.shadowOffsetX = 0
	ctx.shadowOffsetY = 0
	ctx.shadowBlur = 0
	ctx.shadowColor = "rgba(0,0,0,0)"

getLines = (ctx,phrase,maxPxLength) ->
	# break the text area text into lines based on "box" width
	wa = phrase.split(" ")
	phraseArray = []
	lastPhrase = ""
	l = maxPxLength
	measure=0
	ctx.font = "16px sans-serif"
	for i in wa.length
		w = wa[i]
		measure=ctx.measureText(lastPhrase+w).width
		if measure < l
			lastPhrase += (" "+w)
		else
			phraseArray.push lastPhrase
			lastPhrase = w
		if i is wa.length-1
			phraseArray.push lastPhrase
			break
	phraseArray