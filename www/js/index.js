// ***********전역변수 *************
var host='http://localhost:7070/';
var wshost='ws://localhost:7070/echo/';
//var host='https://letsride.donghee.site/';
//var wshost='ws://letsride.donghee.site/echo/';


// default module
var app1={
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
var app = {
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

app.initialize();



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
			  },function(r){
				  console.log('fail! r : ',r);
			  });
			  
			  app1.get(host+'join',{
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
	$('#result-check').text(window.localStorage.getItem('id')+"nickname"+window.localStorage.getItem('nickname')+"profile_image"+window.localStorage.getItem('profile_image'));
	chat_openSocket();
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


// ****************** 채팅 모듈 ********************** 

var ws;
var messages=document.getElementById("messages");

function chat_openSocket(){
    if(ws!==undefined && ws.readyState!==WebSocket.CLOSED){
        writeResponse("WebSocket is already opened.");
        return;
    }
    //웹소켓 객체 만드는 코드
    ws=new WebSocket("ws://localhost:7070/chat/echo.do");
    
    ws.onopen=function(event){
        if(event.data===undefined) return;
        
        writeResponse(event.data);
    };
    ws.onmessage=function(event){
        writeResponse(event.data);
    };
    ws.onclose=function(event){
        writeResponse("Connection closed");
    }
}

function chat_send(){
    var text=document.getElementById("messageinput").value+","+document.getElementById("sender").value;
    ws.send(text);
    text="";
}

function chat_closeSocket(){
    ws.close();
}
function chat_writeResponse(text){
    messages.innerHTML+="<br/>"+text;
}