// ***********전역변수 *************
//var host='http://localhost:7070/';
//var wsshost='ws://localhost:7070/echo/';
var host='http://localhost:7070/';
var wshost='ws://localhost:7070/echo.do';
//var host='https://letsride.donghee.site/';
//var wshost='wss://letsride.donghee.site/echo/';
var defaultImage='/res/img/defaultImage.jpg';

function Enter_Check(form){
    // 엔터키의 코드는 13입니다.
	if(event.keyCode == 13){
		if(form.chatInputText.value!="")
			chat_send(form);  // 실행할 이벤트
	}
} 

// default module
var app={
			go : function(page, param, cb){
				let p = (typeof param !== 'object') ? {} : param;
				//window.location.hash ="#"+page;
				p.page = page;
				$.post("${contextPath}/page.do", p,  function(res,status,xhr){
					
					$("#pageWrap").html(res);
					if(typeof cb === 'function') cb(res);
				});
			},
			get : function(uri, param, cb){
				$.post(uri + ".json", this.setDefaultParam(param), function(res){
					if(typeof cb === "function") cb(res);
				}); 
			},
			loadInDiv : function(where,page, param, cb){
				var p = (typeof param !== 'object') ? {} : param;
				//window.location.hash ="#"+page;
				
				p.page = page;
				$.post("/page.do", p,  function(res){
					$(where).html(res);
					if(typeof cb === 'function') cb(res);
				});
			},
			
			setDefaultParam : function(param){
				var p = (typeof param !== 'object') ? {} : param;
				return p;
			}
		};

// ********cordova module ***********
var app1 = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
    	if(window.localStorage.getItem("l_token")&&window.localStorage.getItem("access_token")){
    		app.get(host+'init',{l_token:window.localStorage.getItem("l_token"),
    			access_token:window.localStorage.getItem("access_token"),
    			id:window.localStorage.getItem("id")},function(res){
    				if(res.rc==1){
    					$.mobile.changePage("#home",{});
    				}else if(res.rc==2){
    					window.localStorage.setItem("l_token", res.result);
    					$.mobile.changePage("#home",{});
    				}else{
    					$.mobile.changePage("#login",{});
    				}
    			});
    	}else{
    		$.mobile.changePage("#login",{});
    	}
    }

    // Update DOM on a Received Event
    /*receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }*/
};

app1.initialize();



//****************** 로그인 모듈 **********************

$('#kakaoLogin').tap(function(){
	console.log('로그인 탭 이벤트 발생');
	var id,neckname,profile_image,access_token,gender;
	KakaoTalk.login(
		    function (result) {
		      console.log('Successful login!');
		      console.log(result);
		      id=result.id;
			  nickname=result.nickname;
			  profile_image=result.profile_image;
			  KakaoTalk.getAccessToken(function(r){
				  console.log('success! r : ',r);
				  access_token=r;
				  gender='f';
				  app.get(host+'join',{
				    	id:id,
				    	nickname:nickname,
				    	profile_image:profile_image,
				    	access_token:access_token,
				    	gender:gender
				    	},function(res){
						if(res.rc>0){
							console.log("join success - res : "+res);
							window.localStorage.setItem("id",id );
							window.localStorage.setItem("nickname",nickname );
							window.localStorage.setItem("profile_image", profile_image);
							window.localStorage.setItem("access_token", access_token);
							window.localStorage.setItem("gender", gender);
							window.localStorage.setItem("l_token", res.result);
							location.href="#home";
						}else{
							console.log("join fail : "+res.resMessage);
							alert("join fail : "+res.resMessage);
							location.href="#login";
						}
					});
			  },function(r){
				  console.log('fail! r : ',r);
			  });
			  
			  
		      /*window.localStorage.setItem("id", result.id);
		      window.localStorage.setItem("nickname", result.nickname);
		      window.localStorage.setItem("profile_image", result.profile_image);
		      //$('#divResult').text(document.cookie);
		      $('#divResult').text(window.localStorage.getItem('id')+"nickname"+window.localStorage.getItem('nickname')+"profile_image"+window.localStorage.getItem('profile_image'));
		      location.href="#home";*/
		    },
		    function (message) {
		      console.log('Error logging in message:'+message);
		      ;
		      alert("join fail : "+message);
		      location.href="#login";
		      /*setCookie('id','default@naver.com',365);
		      setCookie('nickname','김남자',365);
		      setCookie('profile_image',null,365);*/
		      /*window.localStorage.setItem("id", "123456");
		      window.localStorage.setItem("nickname", "김남자");
		      window.localStorage.setItem("profile_image", "http~~");
		      //$('#divResult').text(document.cookie);
		      $('#divResult').text(window.localStorage.getItem('id')+"nickname"+window.localStorage.getItem('nickname')+"profile_image"+window.localStorage.getItem('profile_image'));
		      location.href="#home";*/
		   });
	
	console.log('탭이벤트 종료');
});
$('#home').on('pagebeforeshow',function(event){
	console.log('pagebeforeshow 발생 in #home');
	
	if(ws==null)chat_openSocket();
});

$('#kakaoLogout').tap(function(){
	/*deleteCookie('id');
	deleteCookie('nickname');
	deleteCookie('profile_image');*/
	window.localStorage.clear();
	KakaoTalk.logout(function(r){
		console.log("success");
		console.log(r);
	},function(r){
		console.log("fail");
		console.log(r);
	});
	$.mobile.changePage('#login',{
		/*transition : 'pop'*/
	});
});


//****************** 채팅 모듈 ********************** 
var ws;
var messages=document.getElementById("chat-area-all");

function chat_openSocket(){
	console.log('chat_openSocket()');
    if(ws!==undefined && ws.readyState!==WebSocket.CLOSED){
        chat_writeResponse("WebSocket is already opened.");
        return;
    }
    
    //웹소켓 객체 만드는 코드
    //ws=new WebSocket(wshost+JSON.stringify(params));
    ws=new WebSocket(wshost+"?"+window.localStorage.getItem("l_token"));
    
    ws.onopen=function(event){
        if(event.data===undefined) return;
        console.log('onopen(event) : ',event);
        chat_writeResponse(event.data);
    };
    ws.onmessage=function(event){
    	console.log('onmessage(event) : ',event);
    	chat_writeResponse(JSON.parse(event.data));
    };
    ws.onclose=function(event){
    	chat_writeResponse("Connection closed");
    }
}

function chat_send(form){
    //var text=document.getElementById("all-chat-input-text").value+","+window.localStorage.getItem("nickname");
    if(form.chatInputText.value==""){
    	return;
    }
    var message={
    		message:form.chatInputText.value,
    		scope:form.chatRoomScope.value,
    		nickname:window.localStorage.getItem("nickname"),
    		imagepath:window.localStorage.getItem("profile-image")
    }
    ws.send(JSON.stringify(message));
    text="";
    var messageHtml='<div class="my-message">'
    	+'<div class="my-text">'
			+'<div>'+message.message+'</div>'
    	+'</div>'
    +'</div>'
    form.chatInputText.value="";
    document.getElementById("chat-area-"+message.scope).innerHTML+=messageHtml;
    $('#chat-area-all').scrollTop(99999999);
}

function chat_closeSocket(){
    ws.close();
}
function chat_writeResponse(data){
    console.log("data : ",data);
	var scope=data.scope;
    var message=data.message;
    var sender=data.nickname;
    var imagepath=data.imagepath==null?defaultImage:data.imagepath;
    
    
    console.log('scope'+scope+' | message'+message+' | sender'+sender+' | imagepath'+imagepath);
    var messageHtml='<div class="someones-message">'
    	+'<div class="someones-image"><img src="'+imagepath+'"></div>'
    	+'<div class="someones-text">'
			+'<div class="sender">'+sender+'</div>'
			+'<div class="text">'+message+'</div>'
    	+'</div>'
    +'</div>'
    
    document.getElementById("chat-area-"+scope).innerHTML+=messageHtml;
    
}