window.addEventListener('DOMContentLoaded', function() {
	var isStreaming = false,
		v = document.getElementById('v'),
		c = document.getElementById('c'),
		con = c.getContext('2d');
		w = 600, 
		h = 420,

	// Set up context for right and left sides, accordingly
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

			//Repeat for cRight
			cRight.setAttribute('width', w/2);
			cRight.setAttribute('height', h);
			conRight.translate(w/2, 0);
			conRight.scale(-1, 1);

			//Repeat for cLeft
			cLeft.setAttribute('width', w/2);
			cLeft.setAttribute('height', h);
			conLeft.translate(w/2, 0);
			conLeft.scale(-1, 1);

	      	isStreaming = true;

	    }
	}, false);

	// Wait for the video to start to play
	v.addEventListener('play', function() {

		var detector;

		if (!detector) {
			var width = 80;
			var height = 80;
			detector = new objectdetect.detector(width, height, 1.1, objectdetect.handfist);
		}
		
		// Every 33 milliseconds copy the video image to the canvas
		setInterval(function() {
			if (v.paused || v.ended) return;
			con.fillRect(0, 0, w, h);
			con.drawImage(v, 0, 0, w, h);

			// Draw cRight
			conRight.fillRect(0, 0, w/2, h);
			conRight.drawImage(v, 0, 0, w/2, h, 0, 0, w/2, h);

			// Draw cLeft
			conLeft.fillRect(0, 0, w/2, h);
			conLeft.drawImage(v, 0+w/2, 0, w/2, h, 0, 0, w/2, h);

			console.log("New frame!");

			var coords = detector.detect(cRight, 1);
			if (coords[0]) {
				var coord = coords[0];
				
				/* Rescale coordinates from detector to video coordinate space: */
				coord[0] *= cRight.width / detector.canvas.width;
				coord[1] *= cRight.height / detector.canvas.height;
				coord[2] *= cRight.width / detector.canvas.width;
				coord[3] *= cRight.height / detector.canvas.height;
			
				console.log("RIGHT HAND coordinates are ", Math.floor(coord[0]), ", ", Math.floor(coord[1]));

				/* Find coordinates with maximum confidence: */
				var coord = coords[0];
				for (var i = coords.length - 1; i >= 0; --i)
					if (coords[i][4] > coord[4]) coord = coords[i];

				conRight.beginPath();
				conRight.lineWidth = '2';
				conRight.fillStyle = 'rgba(0, 255, 255, 0.5)';
				conRight.fillRect(
					coord[0] / cRight.width * cRight.clientWidth,
					coord[1] / cRight.height * cRight.clientHeight,
					coord[2] / cRight.width * cRight.clientWidth,
					coord[3] / cRight.height * cRight.clientHeight);
				conRight.stroke();
					
			}

		}, 500);

	}, false);


});