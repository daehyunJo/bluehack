window.onload = function () {
	document.addEventListener('tizenhwkey', function(e) {
    	
        if(e.keyName == "back"){
        	if(confirm("Exit now?")){
        		tizen.application.getCurrentApplication().exit();
        	}
        }
    });	
};

var startConn = new Date();

var isConn = false;

function ConnectManager(){
	
	var endConn = new Date();
	
	if(endConn - startConn > 1500){
		Toast("Connecting..<br>Please wait");
		initialize();
	} else {
		Toast("Retry after 2secs..");
	}
		startConn = endConn;
}

function Toast(msg) {
	
	if($('#popupToast').text() == msg){
		return;
	}
	
	console.log("[TOAST] " + msg);
	$('#popupToast').html(msg).fadeIn("fast");
	setTimeout(function(){
		$('#popupToast').fadeOut("fast",function(){
			$('#popupToast').text("");
		});
	},2000);
}

function setText(msg){
	$("#div_conn").css({"background-image":"none"});
	$("#div_conn").html("<p>" + msg + "</p>");
}

function setImage(url){
	$("#div_conn").css({"background-image":"url('" + url + "')"});
	$("#div_conn").empty();
}

function sendMotion(msg){
	if(isConn){
		setText(msg);
		sapRequest({ motion: msg }, null, null);
		navigator.vibrate([200, 100, 200, 100]);
	}
	
}