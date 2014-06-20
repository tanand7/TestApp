var CameraPreview = function(cameraImage, callbackObj){
	var platformHeight = Ti.Platform.displayCaps.platformHeight; 
	var platformWidth = Ti.Platform.displayCaps.platformWidth; 
	
	var _previewWindow = Ti.UI.createWindow({
		width	: Ti.UI.FILL,
		height	: platformHeight,
		top		: 0,
		backgroundColor : '#000',
	});
	
	var _previewView = Ti.UI.createView({
		width	: Ti.UI.FILL,
		height	: platformHeight-70,
		top		: 0
	});
	
	//Image view holds the preview
	var _previewImage = Ti.UI.createImageView({
		height	: Ti.UI.SIZE,
		width	: Ti.UI.SIZE,
		image	: cameraImage,
	});
	
	//Crop view is used to crop the image displayed
	var _cropView = Ti.UI.createView({
		borderColor	: '#ffffff',
		borderWidth : 2,
		width		: 320,
		height		: 160
	});
	
	//Bottom bar containing the camera buttons and cancel button
	var _bottomBar = Ti.UI.createView({
		width	: Ti.UI.FILL,
		height	: 70,
		bottom	: 0,
		backgroundColor : 'black'
	});
	
	//Retake button	
	var _retakeButton = Ti.UI.createButton({
		title	: 'Retake',
		color	:'#fff',
		left 	: '3%',
	});
	//Button to chose the photo
	var _chooseButton = Ti.UI.createButton({
		title	: 'Use Photo',
		color	:'#fff',
		right 	: '3%',
	});
	
	var pinching = false;
	var previousY = null;
	var olt = Titanium.UI.create2DMatrix();
	
	_previewView.add(_previewImage);
	_previewView.add(_cropView);
	_bottomBar.add(_retakeButton);
	_bottomBar.add(_chooseButton);
	_previewWindow.add(_bottomBar);
	_previewWindow.add(_previewView);
	
	_previewWindow.open();
	
	_retakeButton.addEventListener('click', _retakePhoto);
	_chooseButton.addEventListener('click', _onUsePhoto);
	_cropView.addEventListener('touchmove', _onMoveCropView);
	_cropView.addEventListener('touchstart', _setInitialPoints);
	_cropView.addEventListener('pinch', _scaleImage);
	_cropView.addEventListener('touchend', function(){
		pinching = false;
	});
	
	function _retakePhoto(){
		_previewWindow.fireEvent('showCamera');
	}
	
	function _onUsePhoto(){
		var ImageFactory = require('ti.imagefactory');
		var newBlob = ImageFactory.imageAsCropped(_previewImage.image, {width:610, height:320, x :_cropView.rect.x, y: _cropView.rect.y });
		callbackObj.success(newBlob);
		_previewWindow.close();
	}
	function _onMoveCropView(event){
		if (pinching){
        	return;
        }
		var deltaY = event.y - previousY;

	    olt = olt.translate(0, deltaY);
	    _cropView.animate({
	        transform : olt,
	        duration : 100
	    });
	}
	
	function _setInitialPoints(event){
		previousY = event.y;
	}
	
	function _scaleImage(event){
	    pinching = true;
	}
	return _previewWindow;
};

module.exports = CameraPreview;

/**********************************/
// var heightOfPreview = _previewView.rect.height;
// var heightOfCropView = _cropView.rect.height;
// var heightOfImageView = _previewImage.rect.height;
// 
// var cropViewTop = _cropView.rect.y;						//Top point of crop view
// var previewImageTop = _previewImage.rect.y;				//Top point of image view
// var cropViewBottom = cropViewTop + heightOfCropView;	//Bottom y of cropview
// var previewImageBottom = previewImageTop + heightOfImageView;	//Bottom y of cropview

// if(previousY == null){
			// previousY = event.y;
// } else {
	// if(previousY > event.y){
		// distance = previousY - event.y;
		// //Moving up
		// if(_cropView.rect.y > 0){
			// _cropView.animate({top: _cropView.top + distance , duration: 500}, function(){
				// _cropView.top += distance;
			// });
		// }
	// } else {
		// distance = event.y - previousY;
		// //Moving down
		// if(heightOfCropView + cropViewTop > heightOfPreview){
			// _cropView.top = 0;
		// } else {
			// _cropView.animate({top: _cropView.top - distance, duration: 500}, function(){
				// _cropView.top -= distance;
			// });
		// }
	// }
	// previousY = event.y;
// }

/****************/