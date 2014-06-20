var win = Ti.UI.createWindow({
	backgroundColor : 'white',
	layout	: 'vertical'
});

var btnShowCamera = Ti.UI.createButton({
	width	: Ti.UI.SIZE,
	title	: 'Show Camera',
	top		: '10%',
	source	: 'CAMERA'
});

win.add(btnShowCamera);


var btnShowGallery = Ti.UI.createButton({
	width	: Ti.UI.SIZE,
	source	: 'GALLERY',
	top		: '10%',
	title	: 'Show Gallery'
});

var imgvwPhoto = Ti.UI.createImageView({
	width	: 320,
	top		: '10%',
	height	: 160,
	image	: 'defaultPhoto.jpeg'
});

win.add(imgvwPhoto);
win.add(btnShowGallery);

btnShowCamera.addEventListener('click', _showCamera);
btnShowGallery.addEventListener('click', _showCamera);

win.open();

function _showCamera(e){
	var Camera = require('ui/common/Camera');
	var camera = new Camera(e.source.source, {success:_onSelectImage, allowEditing: false});
}

function _onSelectImage(selectedImage){
	try{
		imgvwPhoto.image = selectedImage;
	}catch(error){
		alert(error);
	}
}