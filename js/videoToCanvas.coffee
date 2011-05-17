# draw the video to a canvas element
document.addEventListener 'DOMContentLoaded', ->
	v = $('#v')
	canvas = $('#c')
	context = canvas.getContext('2d')
	cw = canvas.clientWidth
	ch = canvas.clientHeight
	canvas.width = cw
	canvas.height = ch
	v.addEventListener 'play',  -> 
		draw this,context,cw,ch

draw = (v,c,w,h) ->
	if v.paused or v.ended
		return false
	c.drawImage v,0,0,w,h
	setTimeout draw,20,v,c,w,h