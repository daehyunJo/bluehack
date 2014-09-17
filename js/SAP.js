/*    
 * Copyright (c) 2014 Samsung Electronics Co., Ltd.   
 * All rights reserved.   
 *   
 * Redistribution and use in source and binary forms, with or without   
 * modification, are permitted provided that the following conditions are   
 * met:   
 *   
 *     * Redistributions of source code must retain the above copyright   
 *        notice, this list of conditions and the following disclaimer.  
 *     * Redistributions in binary form must reproduce the above  
 *       copyright notice, this list of conditions and the following disclaimer  
 *       in the documentation and/or other materials provided with the  
 *       distribution.  
 *     * Neither the name of Samsung Electronics Co., Ltd. nor the names of its  
 *       contributors may be used to endorse or promote products derived from  
 *       this software without specific prior written permission.  
 *  
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS  
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT  
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR  
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT  
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,  
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT  
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,  
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY  
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT  
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE  
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var gTransferId = 0;

//---------------------------------------------------------------
var gSocket = null;
var gPeerAgent = null;
var gChannel = 104;
var gAgent = null;
var gUnavailable = false;
var gFileTransfer = null;

var PROVIDER_APP_NAME = 'Bluehack';

var gCurrentRequest = null;

var reconnect;
var itemPairs = {};

//---------------------------------------------------------------


function toastAlert(msg) {
	Toast(msg);
}

var ftSuccessCb = {
		// 4. SAP연결 수립 시 실행
	onsuccess : function () {
		//toastAlert('Succeed to connect');		
		toastAlert("Connected!");
		
		//추가
		// 연결 수립시 Receiver 서비스 등록
		ftReceive();
		
	},
	onsendprogress : function (id, progress) {
		console.log('onprogress id : ' + id + ' progress : ' + progress);
	},
	onsendcomplete : function (id, localPath) {
		//toastAlert('send Completed!! id : ' + id + ' localPath :' + localPath);
	},
	onsenderror : function (errCode, id) {
		toastAlert('Failed to send File. id : ' + id + ' errorCode :' + errCode);
	}
};

function reconnect() {

	sapFindPeer(function(){
		console.log('[Reconnect] Succeed to find peer');
		toastAlert("Succeed to find peer");
		ftInit(ftSuccessCb, function(err) {
			toastAlert('[Reconnect] Failed to get File Transfer');
			//Ask Reconnect
		});
	}, function(err){
		toastAlert('[Reconnect] Failed to reconnect to service');
		//Ask Reconnect
	});

}

function initialize() {
	//1. 콜백을 만들어서
	var sapinitsuccesscb = {
			onsuccess : function() {
				console.log('Succeed to connect');
				
				isConn = true;

				$("#div_conn").css({"background-image":"none"});
				setText("Photo");
				
				ftInit(ftSuccessCb, function(err) {
					toastAlert('Failed to get File Transfer');
				});
			},
			ondevicestatus : function(status) {
				if (status == "DETACHED") {
					console.log('Detached remote peer device');
					// Show popup disconnected
					toastAlert("Device Detached!");
					
				} else if (status == "ATTACHED") {
					console.log('Attached remote peer device');
					reconnect();
				}
			}
	};

	
	// 2. init으로 전송
	sapInit(sapinitsuccesscb, function(err) {
		console.log("2 --- ");
		console.log(err);
		toastAlert('Searching mobile..<br>Please wait');
//		clearTimeout(reconnect);
//		reconnect = setTimeout(function(){
//			initialize();
//		},1000);
	});
}

function cancelFile() {
	ftCancel(gTransferId,function() {
		console.log('Succeed to cancel file');
	}, function(err) {
		toastAlert('Failed to cancel File');
	});	
}

function sendFile(path) {
	//path : File URI
	ftSend(path, function(id) {
		console.log('Succeed to send file');
		gTransferId = id;
	}, function(err) {
		toastAlert('Failed to send File');
	});	
}


//---------------------------------------------------------------


// String Sending
function sapRequest(reqData, successCb, errorCb) {
	if (gSocket == null || !gSocket.isConnected()) {
		throw {
		    name : 'NotConnectedError',
		    message : 'SAP is not connected'
		};
	}

	gSocket.sendData(gChannel, JSON.stringify(reqData));

	gCurrentRequest = {
	    data : reqData,
	    successCb : successCb,
	    errorCb : errorCb
	}
}

function sapFindPeer(successCb, errorCb) {
	if (gAgent != null) {
		try {
			gPeerAgent = null;
			gAgent.findPeerAgents();
			successCb();
		} catch (err) {
			console.log('findPeerAgents exception <' + err.name + '> : ' + err.message);
			errorCb({
			    name : 'NetworkError',
			    message : 'Connection failed'
			});
		}
	} else {
		errorCb({
		    name : 'NetworkError',
		    message : 'Connection failed'
		});
	}
}

function ftCancel(id, successCb, errorCb) {
	if (gAgent == null || gFileTransfer == null || gPeerAgent == null) {
		errorCb({
			name : 'NotConnectedError',
		    message : 'SAP is not connected'
		});
		return;
	}

	try {
		gFileTransfer.cancelFile(id);
		successCb();
	} catch (err) {
		console.log('cancelFile exception <' + err.name + '> : ' + err.message);
		window.setTimeout(function() {
			errorCb({
			    name : 'RequestFailedError',
			    message : 'cancel request failed'
			});
		}, 0);
	}
	
}

function ftSend(path, successCb, errorCb) {
	// sendFile -> .
	// path: file URI
	if (gAgent == null || gFileTransfer == null || gPeerAgent == null) {
		errorCb({
			name : 'NotConnectedError',
		    message : 'SAP is not connected'
		});
		return;
	}
	
	try {
		var transferId = gFileTransfer.sendFile(gPeerAgent, path);
		successCb(transferId);
	} catch (err) {
		console.log('sendFile exception <' + err.name + '> : ' + err.message);
		window.setTimeout(function() {
			errorCb({
			    name : 'RequestFailedError',
			    message : 'send request failed'
			});
		}, 0);
	}
}

function ftReceive(){
	
	var receivefilecallback = {
			
	 onreceive : function(transferId, fileName) {
		 try { 
			 
			toastAlert("Data Synchronizing..");
				
			 console.log("Incoming file  : " + transferId + " file name : " + fileName);
			 itemPairs[transferId] = fileName;
			 
			 gFileTransfer.receiveFile(transferId, "file:///opt/usr/media/Images/" + fileName);
		 } catch(e) {
			 console.log("Error Exception, error name : " + e.name + ", error message : " + e.message); 
		 }
	 },
	 onprogress : function(transferId, progress){ 
		 console.log("onprogress transferId : " + transferId + ", progress : " + progress); 
	 }, 
	 oncomplete : function(transferId, localPath){ 
		 console.log("File transfer complete. transferId : " + transferId);
		 //console.log(localPath);
		 //console.log(itemPairs[transferId]);
		 setImage(localPath);
		 //
		 // Add to Slides
		 //$(".pts_slides > span").append("<img src=" + localPath + " alt=" + itemPairs[transferId].split(".")[0] + " />");
		 //console.log("<img src=" + localPath + " alt=" + itemPairs[transferId].split(".")[0] + " />");
		 
	 }, 
	 onerror : function(errorCode, transferId){ 
		 console.log("FileReceiveError transferId : " + transferId + " code : " + errorCode); 
	 } 
	}; 
	 
	try { 
		gFileTransfer.setFileReceiveListener(receivefilecallback); 
	} catch(e) { 
		console.log("Error Exception, error name : " + e.name + ", error message : " + e.message); 
	}

}

function ftInit(successCb, errorCb) {
	
	if (gAgent == null) {
		errorCb({
		    name : 'NetworkError',
		    message : 'Connection failed'
		});
		return;
	}

	var filesendcallback = {
		onprogress : successCb.onsendprogress,
		oncomplete : successCb.onsendcomplete,
		onerror : successCb.onsenderror
	};
	
	try {
		gFileTransfer = gAgent.getSAFileTransfer();
		gFileTransfer.setFileSendListener(filesendcallback);
		successCb.onsuccess();
	} catch (err) {
		console.log('getSAFileTransfer exception <' + err.name + '> : ' + err.message);
		window.setTimeout(function() {
			errorCb({
			    name : 'NetworkError',
			    message : 'Connection failed'
			});
		}, 0);
	}
}

function sapInit(successCb, errorCb) {
	//3. SAP 초기화
	if (gUnavailable == true) {
		console.log('connection failed previously');
		window.setTimeout(function() {
			errorCb({
			    name : 'NetworkError',
			    message : 'Connection failed'
			});
		}, 0);
		return;
	}

	if (gSocket != null) {
		console.log('socket already exists');
		window.setTimeout(function() {
			successCb.onsuccess();
		}, 0);
		return;
	}

	try {
		webapis.sa.setDeviceStatusListener(function(type, status) {
			console.log('Changed device status : ' + type + ' ' + status);
			if (status == "DETACHED") {
				gSocket = null;
				gPeerAgent = null;
				successCb.ondevicestatus(status);
			} else if (status == "ATTACHED") {
				gUnavailable = false;
				successCb.ondevicestatus(status);
			}
		});
		webapis.sa.requestSAAgent(function(agents) {
			console.log('requestSAAgent succeeded');

			gAgent = agents[0];

			// 
			gAgent.setServiceConnectionListener({
			    onconnect : function(sock) {
				    console.log('onconnect');

				    gSocket = sock;
				    // Socket Listener
				    gSocket.setDataReceiveListener(function(channel, respDataJSON) {
					    console.log('[Socket Listener] message received : ' + respDataJSON);

					    var respData = JSON.parse(respDataJSON);
					    
					  //!!!!!!!!!!
					    if(respData.result == "success"){
					    	// Download Complete!

					    	console.log("RECEIVE SUCCESS");
					    	//pts_slides width adjustment
							 //$(".pts_slides > span").css({"width":$(".pts_slides > span img").length * 100 + 100});
							 
							 toastAlert("Synchronizing Complete!");
							 //gotoPage(getNowPageNum());
							 //time_start = new Date();
							 
					    }

					    
					    
					    if (gCurrentRequest == null)
						    return;

					    var currentRequest = gCurrentRequest;
					    gCurrentRequest = null;

//					    var respData = JSON.parse(respDataJSON);
					    

					    if (currentRequest.successCb) {
						    currentRequest.successCb(respData);
					    }
				    });
				    gSocket.setSocketStatusListener(function(errCode) {
					    console.log('socket disconnected : ' + errCode);

					    if (errCode == "PEER_DISCONNECTED") {
					    	errorCb({
					    		name : 'PEER_DISCONNECTED',
					    		message : 'the remote peer agent closed'
					    	});
					    }

					    if (gCurrentRequest != null) {
						    var currentRequest = gCurrentRequest;
						    gCurrentRequest = null;

						    if (currentRequest.errorCb) {
							    currentRequest.errorCb({
							        name : 'RequestFailedError',
							        message : 'request failed'
							    });
						    }
						    
						    gSocket = null;
					    }
				    });
				    successCb.onsuccess();
			    },
			    onerror : function(errCode) {
				    console.log('requestServiceConnection error <' + errCode + '>');
				    errorCb({
				        name : 'NetworkError',
				        message : 'Connection failed'
				    });
			    }
			});

			gAgent.setPeerAgentFindListener({
			    onpeeragentfound : function(peerAgent) {
				    if (gPeerAgent != null) {
					    console.log('already get peer agent');
					    return;
				    }
				    try {
				    	console.log(peerAgent.appName);
				    	// Peer의 앱 이름과 나의 앱 이름이 같을 때
					    if (peerAgent.appName == PROVIDER_APP_NAME) {
						    console.log('peerAgent found');
						    toastAlert("Please turn on the Mobile app first");
						    gAgent.requestServiceConnection(peerAgent);
						    gPeerAgent = peerAgent;
					    } else {
						    console.log('not expected app : ' + peerAgent.appName);
					    }
				    } catch (err) {
					    console.log('exception [' + err.name + '] msg[' + err.message + ']');
				    }
			    },
			    onerror : function(errCode) {
				    console.log('findPeerAgents error <' + errCode + '>');
				    errorCb({
				        name : 'NetworkError',
				        message : 'Connection failed'
				    });
			    }
			});

			try {
				gPeerAgent = null;
				gAgent.findPeerAgents();
			} catch (err) {
				console.log('findPeerAgents exception <' + err.name + '> : ' + err.message);
				errorCb({
				    name : 'NetworkError',
				    message : 'Connection failed'
				});
			}

		}, function(err) {
			console.log('requestSAAgent error <' + err.name + '> : ' + err.message);
			errorCb({
			    name : 'NetworkError',
			    message : 'Connection failed'
			});
		});
	} catch (err) {
		console.log('requestSAAgent exception <' + err.name + '> : ' + err.message);
		window.setTimeout(function() {
			errorCb({
			    name : 'NetworkError',
			    message : 'Connection failed'
			});
		}, 0);
		gUnavailable = true;
	}
}
