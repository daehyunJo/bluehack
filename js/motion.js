
var yplus = 0;
var ymin = 0;
var zplus = 0;
var zmin = 0;
var motionFlag = 0;
var target = 0;

window.addEventListener("devicemotion", function (e) {
	var x = e.acceleration.x;
	var y = e.acceleration.y;
	var z = e.acceleration.z;
	
	//console.log("X : " + e.accelerationIncludingGravity.x + ", Y : " + e.accelerationIncludingGravity.y + ", Z : " + e.accelerationIncludingGravity.z);
	
	if(motionFlag == 0) {
		if(y > 8) {				// left motion
			yplus = 20;
			motionFlag = 1;
			target = y;
			sendMotion("left");
		}
		else if(z > 9) {		// up motion
			zplus = 20;
			motionFlag = 1;
			target = z;
			sendMotion("up");
		}
		else if(z < -9) {		// down motion
			zmin = 20;
			motionFlag = 1;
			target = z;
			sendMotion("down");
		}
		else if(y < -10) {		// right motion
			ymin = 20;
			motionFlag = 1;
			target = y;
			sendMotion("right");
		}
	}
	
	if((yplus>0) && motionFlag)
	{
		yplus--;
		//document.getElementById("sensor").innerHTML = "Left<br>" + target;
		//console.log("Left ( y plus )");
		if(yplus == 0) motionFlag = 0;
	}
	else if((ymin>0) && motionFlag)
	{
		ymin--;
		//document.getElementById("sensor").innerHTML = "Right<br>" + target;
		//console.log("Right ( y minus )");
		if(ymin == 0) motionFlag = 0;
	}
	else if((zplus>0) && motionFlag)
	{
		zplus--;
		//document.getElementById("sensor").innerHTML = "Up<br>" + target;
		//console.log("Up ( z plus )");
		if(zplus == 0) motionFlag = 0;
	}
	else if((zmin>0) && motionFlag)
	{
		zmin--;
		//document.getElementById("sensor").innerHTML = "Down<br>" + target;
		//console.log("Down ( z minus )");
		if(zmin == 0) motionFlag = 0;
	}
}, true);