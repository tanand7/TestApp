var osname = Ti.Platform.osname;
function Camera(photoSource,callbackObj){
	//PhotoManager class constants
	this.Constants = {
		PHOTOMANGER_GALLEY  : 'GALLERY', 
		PHOTOMANGER_CAMERA  : 'CAMERA'
	};
	//Gets and sets photo source type
	this.PhotoSource = photoSource; 
	this.CallBackObj = callbackObj;
	/*Based on photo source type open galley or start device camera.*/
	switch(this.PhotoSource){
		case this.Constants.PHOTOMANGER_GALLEY 	: 	_openGallery();
													break;
		case this.Constants.PHOTOMANGER_CAMERA	: 	_startDeviceCamera();
													break;
	}

	/**
	 * Private functions
	 */
	function _photoSelectedFromGallery(response){
		var image = response.media;
		var CameraPreview = require('ui/common/CameraPreview');
		var cameraPreview = new CameraPreview(image, callbackObj);
		cameraPreview.addEventListener('showCamera', function(){
			_openGallery();
			cameraPreview.close();
		});
	}
	function _deviceGalleryError(error){
		_openGallery();
	} 
	
	function _openGallery(){
		Ti.Media.openPhotoGallery({
			mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO],
			success    : _photoSelectedFromGallery,
			error      : _deviceGalleryError,
			allowEditing:(callbackObj.allowEditing)?true:false
		});	
	}
	
	function _startDeviceCamera() {
		var cameraOptions = _getCameraOptions();
		Titanium.Media.showCamera(cameraOptions.cameraControls);
	}
	
	function _getCameraOptions(){
		var container ={};
		
		//Top bar containing the camera 
		container.topBar = Ti.UI.createView({
			width	: Ti.UI.FILL,
			height	: 50,
			top		: 0,
			backgroundColor : 'black'
		});

		//Bottom bar containing the camera buttons and cancel button
		container.bottomBar = Ti.UI.createView({
			width	: Ti.UI.FILL,
			height	: 70,
			bottom	: 0,
			backgroundColor : 'black'
		});
		
		//Button to capture the image
		container.cameraButton = Titanium.UI.createButton({
			width	: 68,
			height	: 68,
			backgroundImage : 'takePicture.jpg'			
		});
		
		//Button to close the camera
		container.cancelButton = Titanium.UI.createButton({
			color:'#fff',
			left : '3%',
			title:'Cancel'
		});
		//Button to change the camera
		container.changeCameraButton = Titanium.UI.createButton({
			width	: 30,
			height	: 22,
			right 	: '3%',
			currentCamera 	: 'REAR',
			backgroundImage : 'changeCamera.png'
		});
		
		container.overlay = Titanium.UI.createView();
		container.bottomBar.add(container.cameraButton);
		container.bottomBar.add(container.cancelButton);
		container.topBar.add(container.changeCameraButton);
		container.overlay.add(container.bottomBar);
		container.overlay.add(container.topBar);
		
		container.cameraButton.addEventListener('click',function(){
			Ti.Media.takePicture();
		});
		
		container.cancelButton.addEventListener('click',function(){
			Ti.Media.hideCamera();
		});
		
		//Changing the camera
		container.changeCameraButton.addEventListener('click', _changeCamera);
		
		container.cameraControls = {
			success : _pictureTaken,
			cancel  : _cameraCancelled,
			error   : _pictureError,
			allowEditing:callbackObj.allowEditing,
			mediaTypes:Ti.Media.MEDIA_TYPE_PHOTO
		};
		
		if(!callbackObj.allowEditing){
			var cameraTransform = Ti.UI.create2DMatrix();
			cameraTransform = cameraTransform.scale(1.33);
			
			container.cameraControls.transform = cameraTransform;
			container.cameraControls.overlay = container.overlay;
			container.cameraControls.showControls = false;
			container.cameraControls.autohide = false;
		}
		
		return container;
	}
	
	function _pictureTaken(event){
		// place our picture into our window
		if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
			var image = event.media;
			Ti.Media.hideCamera();
			var CameraPreview = require('ui/common/CameraPreview');
			var cameraPreview = new CameraPreview(image, callbackObj);
			cameraPreview.addEventListener('showCamera', function(){
				_startDeviceCamera();
				cameraPreview.close();
			});
			
		} else {
			alert(JSON.stringify(event));
		}
		// programatically hides the camera
	}
	
	function _pictureError(error){
		if (error.code == Titanium.Media.NO_CAMERA){
			_openGallery();
		} else {
			var a = Titanium.UI.createAlertDialog({title:'Camera'});
			a.setMessage('Unexpected error: ' + error.code);
			a.show();
		}
	}
	
	function _cameraCancelled(){
		//DO NOTHING
	}
	
	function _changeCamera(event){
		var availableCameras = Ti.Media.availableCameras;
		var currentCamera = event.source.currentCamera;
		if(availableCameras.length > 1){
			var changeCameraTo = null;
			switch(currentCamera){
				case 'REAR'		: 	changeCameraTo = Titanium.Media.CAMERA_FRONT;
									event.source.currentCamera = 'FRONT';
									break;
				case 'FRONT'	: 	changeCameraTo = Titanium.Media.CAMERA_REAR;
									event.source.currentCamera = 'REAR';
									break;
			}
			Ti.Media.switchCamera(changeCameraTo);
		}
	}
}

module.exports = Camera;