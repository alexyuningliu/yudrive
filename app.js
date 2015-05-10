window.addEventListener('DOMContentLoaded', function() {
	var isStreaming = false,
		v = document.getElementById('v'),
		c = document.getElementById('c'),
		con = c.getContext('2d');
		w = 600, 
		h = 420,

	// Set up hidden context for un-mirrored right-and-left side videos to feed in
		cRightHidden = document.getElementById('cRightHidden'),
		conRightHidden = cRightHidden.getContext('2d'),
		cLeftHidden = document.getElementById('cLeftHidden'),
		conLeftHidden = cLeftHidden.getContext('2d'),

	// Set up context for mirrored right and left side videos, accordingly
		cRight = document.getElementById('cRight'),
		conRight = cRight.getContext('2d'),
		cLeft = document.getElementById('cLeft'),
		conLeft = cLeft.getContext('2d')
	// Cross browser
	navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
	if (navigator.getUserMedia) {
		// Request access to video only
		navigator.getUserMedia(
			{
				video:true,
				audio:false
			},		
			function(stream) {
				// Cross browser checks
				var url = window.URL || window.webkitURL;
    			v.src = url ? url.createObjectURL(stream) : stream;
    			// Set the video to play
    			v.play();
			},
			function(error) {
				alert('Something went wrong. (error code ' + error.code + ')');
				return;
			}
		);
	}
	else {
		alert('Sorry, the browser you are using doesn\'t support getUserMedia');
		return;
	}

	// Wait until the video stream can play
	v.addEventListener('canplay', function(e) {
	    if (!isStreaming) {
	    	// videoWidth isn't always set correctly in all browsers
	    	if (v.videoWidth > 0) h = v.videoHeight / (v.videoWidth / w);
			c.setAttribute('width', w);
			c.setAttribute('height', h);
			// Reverse the canvas image
			con.translate(w, 0);
			con.scale(-1, 1);

			// Repeat for unmirrored, hidden cLeft and cRight
			cRightHidden.setAttribute('width', w/2);
			cRightHidden.setAttribute('height', h);
			cLeftHidden.setAttribute('width', w/2);
			cLeftHidden.setAttribute('height', h);

			// Repeat for mirrored cRight and cLeft
			cRight.setAttribute('width', w/2);
			cRight.setAttribute('height', h);
			conRight.translate(w/2, 0);
			conRight.scale(-1, 1);
			cLeft.setAttribute('width', w/2);
			cLeft.setAttribute('height', h);
			conLeft.translate(w/2, 0);
			conLeft.scale(-1, 1);


	      	isStreaming = true;

	    }
	}, false);

	// Wait for the video to start to play
	v.addEventListener('play', function() {

		var detectorRight;
		var detectorLeft;

		if (!detectorRight) {
			var width = 80;
			var height = 80;
			detectorRight = new objectdetect.detector(width, height, 1.1, objectdetect.handfist);
		}

		if (!detectorLeft) {
			var width = 80;
			var height = 80;
			detectorLeft = new objectdetect.detector(width, height, 1.1, objectdetect.handfist);
		}
		
		// Every 33 milliseconds copy the video image to the canvas
		setInterval(function() {
			if (v.paused || v.ended) return;
			console.log("New frame!");

			con.fillRect(0, 0, w, h);
			con.drawImage(v, 0, 0, w, h);

			// Draw mirrored cRight and cLeft
			conRight.fillRect(0, 0, w/2, h);
			conRight.drawImage(v, 0, 0, w/2, h, 0, 0, w/2, h);
			conLeft.fillRect(0, 0, w/2, h);
			conLeft.drawImage(v, 0+w/2, 0, w/2, h, 0, 0, w/2, h);

			// Draw unmirrored cRightHidden and cLeftHidden
			conRightHidden.fillRect(0, 0, w/2, h);
			conRightHidden.drawImage(v, 0, 0, w/2, h, 0, 0, w/2, h);
			conLeftHidden.fillRect(0, 0, w/2, h);
			conLeftHidden.drawImage(v, 0+w/2, 0, w/2, h, 0, 0, w/2, h);

			// Detect right hand

			var coordsRight = detectorRight.detect(cRightHidden, 1);
			if (coordsRight[0]) {
				var coordRight = coordsRight[0];
				
				/* Rescale coordinates from detector to video coordinate space: */
				coordRight[0] *= cRightHidden.width / detectorRight.canvas.width;
				coordRight[1] *= cRightHidden.height / detectorRight.canvas.height;
				coordRight[2] *= cRightHidden.width / detectorRight.canvas.width;
				coordRight[3] *= cRightHidden.height / detectorRight.canvas.height;
			
				console.log("RIGHT hand coordinates are ", Math.floor(coordRight[0]), ", ", Math.floor(coordRight[1]));

				/* Find coordinates with maximum confidence: */
				var coordRight = coordsRight[0];
				for (var i = coordsRight.length - 1; i >= 0; --i)
					if (coordsRight[i][4] > coordRight[4]) coordRight = coordsRight[i];

				conRight.beginPath();
				conRight.lineWidth = '2';
				conRight.fillStyle = 'rgba(0, 255, 255, 0.5)';
				conRight.fillRect(
					coordRight[0] / cRightHidden.width * cRight.clientWidth,
					coordRight[1] / cRightHidden.height * cRight.clientHeight,
					coordRight[2] / cRightHidden.width * cRight.clientWidth,
					coordRight[3] / cRightHidden.height * cRight.clientHeight);
				conRight.stroke();
					
			}

			//Detect left hand

			var coordsLeft = detectorLeft.detect(cLeftHidden, 1);
			if (coordsLeft[0]) {
				var coordLeft = coordsLeft[0];
				
				/* Rescale coordinates from detector to video coordinate space: */
				coordLeft[0] *= cLeftHidden.width / detectorLeft.canvas.width;
				coordLeft[1] *= cLeftHidden.height / detectorLeft.canvas.height;
				coordLeft[2] *= cLeftHidden.width / detectorLeft.canvas.width;
				coordLeft[3] *= cLeftHidden.height / detectorLeft.canvas.height;
			
				console.log("LEFT hand coordinates are ", Math.floor(coordLeft[0]), ", ", Math.floor(coordLeft[1]));

				/* Find coordinates with maximum confidence: */
				var coordLeft = coordsLeft[0];
				for (var i = coordsLeft.length - 1; i >= 0; --i)
					if (coordsLeft[i][4] > coordLeft[4]) coordLeft = coordsLeft[i];

				conLeft.beginPath();
				conLeft.lineWidth = '2';
				conLeft.fillStyle = 'rgba(0, 255, 255, 0.5)';
				conLeft.fillRect(
					coordLeft[0] / cLeftHidden.width * cLeft.clientWidth,
					coordLeft[1] / cLeftHidden.height * cLeft.clientHeight,
					coordLeft[2] / cLeftHidden.width * cLeft.clientWidth,
					coordLeft[3] / cLeftHidden.height * cLeft.clientHeight);
				conLeft.stroke();
					
			}

		}, 500);

	}, false);


});