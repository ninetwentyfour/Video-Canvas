function writeText(){
	//steal the mousedown event for the canvas for one time
	$("#c").one('mousedown', function(e) {
		var mouseX = e.pageX - this.offsetLeft + $("#c").position().left;
		var mouseY = e.pageY - this.offsetTop;
		//append a text area box to the canvas where the user clicked to enter in a comment
		var textArea = "<div id='textAreaPopUp' style='position:absolute;top:"+mouseY+"px;left:"+mouseX+"px;z-index:30;'><textarea id='textareaTest' style='width:100px;height:50px;'></textarea>";
		var saveButton = "<input type='button' value='save' id='saveText' onclick='saveTextFromArea("+mouseY+","+mouseX+");'></div>";
		var appendString = textArea + saveButton;
		$("#main").append(appendString);
	});
}

function saveTextFromArea(y,x){
	//get the value of the textarea then destroy it and the save button
	var text = $('textarea#textareaTest').val();
	$('textarea#textareaTest').remove();
	$('#saveText').remove();
	//get the canvas and add the text functions
	var canvas = document.getElementById('c');
	var ctx = canvas.getContext('2d');
	//break the text into arrays based on a text width of 100px
	var phraseArray = getLines(ctx,text,100);
	// this adds the text functions to the ctx
	CanvasTextFunctions.enable(ctx);
	var counter = 0;
	//set the font styles
	var font = "sans";
	var fontsize = 16;
	ctx.strokeStyle = "rgba(237,229,0,1)";
	ctx.shadowOffsetX = 2;
	ctx.shadowOffsetY = 2;
	ctx.shadowBlur = 1;
	ctx.shadowColor = "rgba(0,0,0,1)";
	//draw each phrase to the screen, making the top position 20px more each time so it appears there are line breaks
	$.each(phraseArray, function() {
		//set the placement in the canvas
		var lineheight = fontsize * 1.5;
		var newline = ++counter;
		newline = newline * lineheight;
		var topPlacement = y - $("#c").position().top + newline;
		var leftPlacement = x - $("#c").position().left;
		text = this;
		//draw the text
		ctx.drawText(font, fontsize, leftPlacement, topPlacement, text);
		ctx.save();
		ctx.restore();
	});
	//reset the drop shadow so marker lines dont have them
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
	ctx.shadowBlur = 0;
	ctx.shadowColor = "rgba(0,0,0,0)";
}

function getLines(ctx,phrase,maxPxLength) {
	//break the text area text into lines based on "box" width
	var wa=phrase.split(" "),
	phraseArray=[],
	lastPhrase="",
	l=maxPxLength,
	measure=0;
	ctx.font = "16px sans-serif";
	for (var i=0;i<wa.length;i++) {
		var w=wa[i];
		measure=ctx.measureText(lastPhrase+w).width;
		if (measure<l) {
			lastPhrase+=(" "+w);
		}else {
			phraseArray.push(lastPhrase);
			lastPhrase=w;
		}
		if (i===wa.length-1) {
			phraseArray.push(lastPhrase);
			break;
		}
	}
	return phraseArray;
}