# save image to desktop
oCanvas = $("#c")

showDownloadText = () ->
	$("#buttoncontainer").css "display", "none"
	$("#textdownload").css "display", "block"

hideDownloadText = () ->
	$("#buttoncontainer").css "display", "block"
	$("#textdownload").css "display", "none"

convertCanvas = (strType) ->
	if strType is "PNG"
		oImg = Canvas2Image.saveAsPNG oCanvas, true
	if strType is "BMP"
		oImg = Canvas2Image.saveAsBMP oCanvas, true
	if strType is "JPEG"
		oImg = Canvas2Image.saveAsJPEG oCanvas, true
	if !oImg
		alert "Sorry, this browser is not capable of saving " + strType + " files!"
		return false
	oImg.id = "canvasimage"
	oImg.style.border = oCanvas.style.border
	oCanvas.parentNode.replaceChild oImg, oCanvas
	showDownloadText()

saveCanvas = (pCanvas, strType) ->
	bRes = false
	if strType is "PNG"
		bRes = Canvas2Image.saveAsPNG oCanvas
	if strType is "BMP"
		bRes = Canvas2Image.saveAsBMP oCanvas
	if strType is "JPEG"
		bRes = Canvas2Image.saveAsJPEG oCanvas
	if !bRes
		alert "Sorry, this browser is not capable of saving " + strType + " files!"
		return false

$('#savepngbtn').click ->
	saveCanvas oCanvas, "PNG"
$('#savebmpbtn').click ->
	saveCanvas oCanvas, "BMP"
$('#savejpegbtn').click ->
	saveCanvas oCanvas, "JPEG"
$('#convertpngbtn').click ->
	convertCanvas "PNG"
$('#convertbmpbtn').click ->
	convertCanvas "BMP"
$('#convertjpegbtn').click ->
	convertCanvas "JPEG"
$('#resetbtn').click ->
	oImg = $("#canvasimage");
	oImg.parentNode.replaceChild oCanvas, oImg
	hideDownloadText()