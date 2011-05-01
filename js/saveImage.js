//save image to desktop
var oCanvas = document.getElementById("c");  

function showDownloadText() {
document.getElementById("buttoncontainer").style.display = "none";
document.getElementById("textdownload").style.display = "block";
}
function hideDownloadText() {
document.getElementById("buttoncontainer").style.display = "block";
document.getElementById("textdownload").style.display = "none";
}

function convertCanvas(strType) {
	if (strType == "PNG"){
		var oImg = Canvas2Image.saveAsPNG(oCanvas, true);
	}
	if (strType == "BMP"){
		var oImg = Canvas2Image.saveAsBMP(oCanvas, true);
	}
	if (strType == "JPEG"){
		var oImg = Canvas2Image.saveAsJPEG(oCanvas, true);
	}
	if (!oImg) {
		alert("Sorry, this browser is not capable of saving " + strType + " files!");
		return false;
	}
	oImg.id = "canvasimage";
	oImg.style.border = oCanvas.style.border;
	oCanvas.parentNode.replaceChild(oImg, oCanvas);
	showDownloadText();
}
function saveCanvas(pCanvas, strType) {
	var bRes = false;
	if (strType == "PNG"){
		bRes = Canvas2Image.saveAsPNG(oCanvas);
	}
	if (strType == "BMP"){
		bRes = Canvas2Image.saveAsBMP(oCanvas);
	}
	if (strType == "JPEG"){
		bRes = Canvas2Image.saveAsJPEG(oCanvas);
	}
	if (!bRes) {
		alert("Sorry, this browser is not capable of saving " + strType + " files!");
		return false;
	}
}
document.getElementById("savepngbtn").onclick = function() {
	saveCanvas(oCanvas, "PNG");
}
document.getElementById("savebmpbtn").onclick = function() {
	saveCanvas(oCanvas, "BMP");
}
document.getElementById("savejpegbtn").onclick = function() {
	saveCanvas(oCanvas, "JPEG");
}
document.getElementById("convertpngbtn").onclick = function() {
	convertCanvas("PNG");
}
document.getElementById("convertbmpbtn").onclick = function() {
	convertCanvas("BMP");
}
document.getElementById("convertjpegbtn").onclick = function() {
	convertCanvas("JPEG");
}
document.getElementById("resetbtn").onclick = function() {
	var oImg = document.getElementById("canvasimage");
	oImg.parentNode.replaceChild(oCanvas, oImg);
	hideDownloadText();
}