var CameraPreview = function(cameraImage, callbackObj){
	var platformHeight = Ti.Platform.displayCaps.platformHeight; 
	var platformWidth = Ti.Platform.displayCaps.platformWidth; 
	var resetCompleted = false;
	
	var CROP_VIEW_HEIGHT = 160; 
	var CROP_VIEW_WIDTH = 320; 
	var BOTTOM_VIEW_HEIGHT = 60; 
	
	var _previewWindow = Ti.UI.createWindow({
		width	: Ti.UI.FILL,
		height	: platformHeight,
		top		: 0,
		backgroundColor : '#000',
	});
	
	var _previewView = Ti.UI.createScrollView({
        showVerticalScrollIndicator:false,
        showHorizontalScrollIndicator:false,
        width:'100%',
        height:'100%',
		contentWidth:'auto',
        contentHeight:'auto',
        backgroundColor:'#000000',
        minZoomScale:1,  
        maxZoomScale:5,	//Update the image scaling from 5 to 1 
        zoomScale:1,
        oldZoom:1
	});

	_previewWindow.add(_previewView);
	
	//Image view holds the preview
	var _previewImage = Ti.UI.createImageView({
		width	: platformWidth,
		image	: cameraImage,
	});
	
	_previewView.add(_previewImage);
	
	var _cropScreenContainer = Ti.UI.createView({
		height	: platformHeight,
		touchEnabled : false,
		width	: platformWidth,
		layout	: 'vertical',
		zIndex	: 1000
	});
	
	var _viewPositions = _getPositions();
	var _topView = Ti.UI.createView({
		backgroundColor	: '#000000',
		height	: _viewPositions.topHeight,
		top		: 0,
		opacity : 0.6,
		touchEnabled : false,
	});
	
	_cropScreenContainer.add(_topView);
	
	//Crop view is used to crop the image displayed
	var _cropView = Ti.UI.createView({
		borderColor	: '#ffffff',
		borderWidth : 1,
		width		: CROP_VIEW_WIDTH,
		height		: CROP_VIEW_HEIGHT,
		touchEnabled : false,
		top			: 0
	});
	_cropScreenContainer.add(_cropView);
	
	var _bottomView = Ti.UI.createView({
		backgroundColor	: '#000000',
		height	: _viewPositions.bottomHeight,
		touchEnabled : false,
		top		: 0,
		opacity : 0.6
	});
	_cropScreenContainer.add(_bottomView);
	
	//Bottom bar containing the camera buttons and cancel button
	var _bottomBar = Ti.UI.createView({
		width	: Ti.UI.FILL,
		height	: BOTTOM_VIEW_HEIGHT,
		bottom	: 0,
		zIndex	: 1001,
		backgroundColor : 'black'
	});
	
	//Retake button	
	var _retakeButton = Ti.UI.createLabel({
		text	: 'Cancel',
		color	:'#fff',
		left 	: '3%',
		zIndex	: 1001,
	});
	//Button to chose the photo
	var _chooseButton = Ti.UI.createLabel({
		text	: 'Choose',
		color	:'#fff',
		right 	: '3%',
		zIndex	: 1001,
	});
	
	_bottomBar.add(_retakeButton);
	_bottomBar.add(_chooseButton);
	_previewWindow.add(_bottomBar);
	_previewWindow.add(_previewView);
	_previewWindow.add(_cropScreenContainer);
		
	 _retakeButton.addEventListener('click', _retakePhoto);
	 _chooseButton.addEventListener('click', _onUsePhoto);
	 _previewWindow.addEventListener('open', _setImageProperties);
	_previewView.addEventListener('pinch', _zoomImage);
    _previewView.addEventListener('touchend', _resetZoomScale);
	 
	_previewWindow.open();
	
	/**
	 * Used to set the zoom scales when opening the window
	 * Sets the minimum zoom scale with respect to the image height
	 */
	function _setImageProperties(e){
		var imageHeight = _previewImage.rect.height;
	 	var _topPoint = (imageHeight-CROP_VIEW_HEIGHT)/2;
	 	_previewView.contentHeight = imageHeight + (_cropView.rect.y * 2);
	 	_previewView.scrollTo(0,_topPoint);
		Ti.Media.hideCamera();
	}
	
	function _resetContentHeight(e){
		if(!resetCompleted){
			_previewView.top = undefined;
			_previewView.contentHeight = _previewImage.rect.height + (_cropView.rect.y * 2);
			resetCompleted = true;
		}
	}
	
	/**
	 * Used to re open the gallery
	 */
	function _retakePhoto(){
		_previewWindow.fireEvent('showCamera');
	}
	
	/**
	 * used to zoom the scroll view
 	 * @param {Object} e
	 */
	function _zoomImage(e){
	    if (e.scale>1){
	        if (e.scale>_previewView.zoomScale){
	                _previewView.zoomScale=e.scale;
	        } else {
	                _previewView.zoomScale=_previewView.oldZoom + (e.scale-1);
	        }
	    } else if (e.scale<_previewView.zoomScale){
	    	_previewView.zoomScale=_previewView.zoomScale - (1-e.scale);
	    }
    }
    
    /**
     * Used to reset the zoom scale
     */
    function _resetZoomScale(e){
        _previewView.oldZoom=_previewView.zoomScale;
    }
    
    /**
     * Used to crop the image in the required resolution and retruns to the success callback
     */
	function _onUsePhoto(){
		var ImageFactory = require('ti.imagefactory');
		var _selectedImage = _previewView.toImage(null, true);
		var newBlob = ImageFactory.imageAsCropped(_selectedImage, {width:(_cropView.rect.width*2), height:(_cropView.rect.height*2), x :0, y: (_cropView.rect.y*2) });
		callbackObj.success(newBlob);
		_previewWindow.close();
	}
	
	/**
	 * Returns the top of shadow view used above and below the crop view
	 */
	function _getPositions(){
		var totalHeight = platformHeight;
		var centerPoint = platformHeight/2;
		var cropTop = centerPoint - (CROP_VIEW_HEIGHT/2);
		var cropBottom = centerPoint + (CROP_VIEW_HEIGHT/2);
		var topHeight = (platformHeight-CROP_VIEW_HEIGHT)/2;
		return {topHeight: topHeight, bottomHeight : topHeight};
	}
	
	return _previewWindow;
};

module.exports = CameraPreview;
