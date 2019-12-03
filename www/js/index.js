// ***********전역변수 ************* 
//var host='http://localhost:7070/';
//var wsshost='ws://localhost:7070/echo/';
//var host='http://localhost:7070/';
//var wshost='ws://localhost:7070/echo.do';
var host='https://letsride.donghee.site/';
var wshost='wss://letsride.donghee.site/echo.do';
var defaultImage='./img/defaultImage.jpg';
var sessionId;
function Enter_Check(form){
    // 엔터키의 코드는 13입니다.
	if(event.keyCode == 13){
		if(form.chatInputText.value!="")
			chat_send(form);  // 실행할 이벤트
		form.chatInputText.value='';
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
    	$.mobile.loading('show');
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
    					$.mobile.changePage("#login",{transition : 'none'});
    				}
    				$.mobile.loading("hide");
    			});
    	}else{
    		$.mobile.changePage("#login",{transition : 'none'});
    		$.mobile.loading("hide");
    	}
    	$("#leave-schedule-hour").on("change", function() {
    	    var val = $(this).val();
    	    $('#leave-schedule-hour').html(val);
    	  });
    	$("#leave-schedule-minute").on("change", function() {
    	    var val = $(this).val();
    	    $('#leave-schedule-minute').html(val);
    	  });
    		
    	
    	/*$('#map').css('width',$(document).outerWidth()).css('height',$(document).outerHeight());
    	var container = document.getElementById('map');
    	var options = {
    		center: new kakao.maps.LatLng(37.385483, 126.935436),
    		level: 3,
    		draggable:true,
    		scrollwheel:true,
    		tileAnimation:false
    		
    	};
    	var map = new kakao.maps.Map(container, options);*/
    	
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

$('#kakaoLogin').on('click',function(){
	console.log('로그인 탭 이벤트 발생');
	var id,neckname,profile_image,access_token,gender;
	
	KakaoTalk.login(
		    function (result) {
		    	$.mobile.loading("show");
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
							//alert("join fail : "+res.resMessage);
							navigator.notification.alert(
									res.resMessage,			// message
								    function(){},           // callback
								    'join fail',            // title
								    '확인'                  // buttonName
								);
							location.href="#login";
						}
						$.mobile.loading("hide");
					});
			  },function(r){
				  navigator.notification.alert(
							'fail : '+r,  // message
						    function(){},         // callback
						    'fail',            // title
						    '확인'                  // buttonName
						);
			  });
			
		    },
		    function (message) {
		      console.log('Error logging in message:'+message);
		      ;
		      //alert("join fail : "+message);
		      navigator.notification.alert(
						message,  // message
					    function(){},         // callback
					    'join fail',            // title
					    '확인'                  // buttonName
					);
		      location.href="#login";
		    
		   });
	
	console.log('탭이벤트 종료');
});
$('#home').on('pagebeforeshow',function(event){
	console.log('pagebeforeshow 발생 in #home');

	/* setTimeout(function() {
		$("#today-form").popup("open"); 
	}, 1000) */
	setTimeout(function(){
		var head_height=$('[data-role=header]').outerHeight();
		var footer_height=$('[data-role=footer]').outerHeight();
		
		var content_height= $(document).height() - head_height - footer_height ;
		console.log("head_height:"+head_height+"|footer_height:"+footer_height+"|content_height:"+content_height);
		$('[data-role=content]').css('max-height', content_height+'px').css('height', content_height+'px');
		
		},500);
	if(ws==null)chat_openSocket();
});
$('.byForever').on('click',function(){
	navigator.notification.confirm(
			'정말로 탈퇴하시겠어요? 얼마든지 재가입은 가능합니다.', // message
	         function(index){
				if(index==1) {
					ws.close();
					
					KakaoTalk.getAccessToken(function(at){
						var params={
							l_token:window.localStorage.getItem('l_token'),
							access_token:at,
							id:window.localStorage.getItem('id')
						}
						$.post(host+'byForever.json',params,function(res){
							if(res.rc>0){
								window.localStorage.clear();
								navigator.notification.alert(
										'성공적으로 탈퇴처리 되었습니다.',  // message
									    function(){
											$.mobile.changePage('#login',{
												/*transition : 'pop'*/
											});
										},         // callback
									    '잘가요..',            // title
									    '확인'                  // buttonName
									);
								
							}else{
								navigator.notification.alert(
										'fail:'+res.resMessage,  // message
									    function(){},         // callback
									    'fail',            // title
									    '확인'                  // buttonName
									);
							}
						});
						
					},function(r){
						console.log("fail");
						console.log(r);
						navigator.notification.alert(
								'fail:'+r,  // message
							    function(){},         // callback
							    'fail',            // title
							    '확인'                  // buttonName
							);
					});
										
				}
			},            // callback to invoke with index of button pressed
	        '경고',           // title
	        ['네','아니오']         // buttonLabels
	    );
});
$('.kakaoLogout').on('click',function(){
	$('.room-chat-area').html('');
	$('.chat-area').html('');
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
        //chat_writeResponse("WebSocket is already opened.");
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
    	//chat_writeResponse("Connection closed");
    }
}

function chat_send(form){
    //var text=document.getElementById("all-chat-input-text").value+","+window.localStorage.getItem("nickname");
    console.log("chatInputText.value : ("+form.chatInputText.value.trim()+")");
    if(form.chatInputText.value.trim()=="" || form.chatInputText.value.trim()=="\n"
    	|| form.chatInputText.value.trim()=="\r\n"){
    	console.log("글이 없음");
    	form.chatInputText.value='';
    	return false;
    }
    var message={
    		message:form.chatInputText.value,
    		scope:form.chatRoomScope.value,
    		nickname:window.localStorage.getItem("nickname"),
    		imagepath:window.localStorage.getItem("profile_image")
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
    $('#chat-area-'+message.scope).scrollTop(99999999);
}

function chat_closeSocket(){
    ws.close();
}
function chat_writeResponse(data){
    console.log("data : ",data);
    if(data.sessionId) {
    	sessionId=data.sessionId;
    	return false;
    }
    if(data.deletedRoom){
    	/*alert(data.deletedRoom+"방이 방장에 의해 제거되었습니다.");
    	attendedRoom=undefined;
    	$.mobile.changePage("#room", {allowSamePageTransition: true,
	        transition: 'none'});*/
    	navigator.notification.alert(
    			data.deletedRoom+"방이 방장에 의해 제거되었습니다.",  // message
    		    function(){
    				attendedRoom=undefined;
    		    	$.mobile.changePage("#room", {allowSamePageTransition: true,
    			        transition: 'none'});
    			},         // callback
    		    '알림',            // title
    		    '확인'                  // buttonName
    		);
    	return false;
    }
	if(data.news=="news"){
		$('#chat-area-num-'+data.scope).html(data.num);
		var messageHtml='<div class="news-massage">'
					+'<div class="news-text">'+data.message+'</div>'
					+'</div>';
		console.log("innew!!!!!!"+data.scope);
		document.getElementById("chat-area-"+data.scope).innerHTML+=messageHtml;
	}else{
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
	    +'</div>';
	    console.log("innew!!!!!!2"+scope);
	    document.getElementById("chat-area-"+scope).innerHTML+=messageHtml;
	    if(scope!="all"){
	    	//알림 ㄱㄱ
	    	//navigator.vibrate(500);
	    	console.log('알림 ㄱㄱ');
	    	//navigator.notification.vibrate(100);
	    	var title;
	    	if(myRoom&&""+myRoom.rno==scope){
	    		title=myRoom.title;
	    	}else{
	    		title=attendedRoom.title;
	    	}
	    	cordova.plugins.notification.local.schedule({
	    	    title: title,
	    	    text: sender+' : '+message,
	    	    foreground: false
	    	});
	    }
	}
	$('#chat-area-'+data.scope).scrollTop(99999999);
}


//************** 버스정보 ***************

$('#busstop').on('pagebeforeshow',function(event){
	console.log('pagebeforeshow 발생 in #busstop');
	
	drowBus();
});
function drowBus(){
	$.mobile.loading('show');
	getBus(function(busList){
		console.log('busList:',busList);
		$('#bus10_1-first-time').html(busList[0].predictTime1);
		$('#bus10_1-first-loc').html(busList[0].locationNo1);
		$('#bus10_1-second-time').html(busList[0].predictTime2);
		$('#bus10_1-second-loc').html(busList[0].locationNo2);
		$('#bus10_2-first-time').html(busList[1].predictTime1);
		$('#bus10_2-first-loc').html(busList[1].locationNo1);
		$('#bus10_2-second-time').html(busList[1].predictTime2);
		$('#bus10_2-second-loc').html(busList[1].locationNo2);
		
		if(busList[0].predictTime1 ==""){
			$('#bus10_1-first').html('도착예정정보 없음');			
		}
		if(busList[0].predictTime2 ==""){
			$('#bus10_1-second').html('도착예정정보 없음');			
		}
		if(busList[1].predictTime1 ==""){
			$('#bus10_2-first').html('도착예정정보 없음');			
		}
		if(busList[1].predictTime2 ==""){
			$('#bus10_2-second').html('도착예정정보 없음');			
		}
		$.mobile.loading( 'hide');
	});
	
	
}
function getBus(cb){ //bus[0]=10-1, bus[1]=10-2
	var url='http://www.gbis.go.kr/gbis2014/schBusAPI.action?cmd=searchBusStationJson&stationId=208000128';
	
	var bus=new Array(2);
	$.get(url,function(res){
		console.log('res:',res);
		var resList=res.result.busArrivalInfo;
		
		for(var i=0;i<resList.length;i++){
			if(resList[i].routeName=='10-1'){
				console.log("10-1: ",resList[i]);
				bus[0]=resList[i];
			}
			if(resList[i].routeName=='10-2'){
				console.log("10-2: ",resList[i]);
				bus[1]=resList[i];
			}
		}
		cb(bus);
	});
	
}
function getBusId(name){
	var url = 'http://openapi.gbis.go.kr/ws/rest/busrouteservice'; /*URL*/
	var queryParams = '?' + encodeURIComponent('ServiceKey') + '='+encodeURIComponent(busDataKey); /*Service Key*/
	queryParams += '&' + encodeURIComponent('keyword') + '=' + encodeURIComponent(name); /*노선 ID*/
	$.get(url+queryParams, function(data, textStatus, req) {
		console.log('data:',data);
		console.log('textStatus:',textStatus);
		console.log('req:',req);
	});
}

//********** 방관련**************************************************************************************

var myRoom;
var attendedRoom;
/*function changeHore(val){
	$('#leave-schedule-hour').html(val);
}
function changeMinute(val){
	$('#leave-schedule-minute').html(val);
}*/
function rommmakeClick(){
	if(myRoom!=undefined){
		console.log("삭제후만들기");
		navigator.notification.confirm(
				myRoom.title+'방이 생성되어있습니다. 새로운 방을 만드시겠어요?', // message
		         function(index){
					if(index==1) {
						$.mobile.loading('show');
						document.getElementById("chat-area-"+myRoom.rno).innerHTML="";
						var params={
							l_token:window.localStorage.getItem("l_token"),
							sessionId:sessionId,
							rno:myRoom.rno
						}
						$.post(host+'deleteMyRoom.json',params,function(res){
							console.log('deleteMyRoom.json res:',res);
							if(res.rc>0){
								myRoom=undefined;
								$("#roommake").popup("open");
							}
							$.mobile.loading('hide');
						});
					}
				},            // callback to invoke with index of button pressed
		        '경고',           // title
		        ['네','아니오']         // buttonLabels
		    );
	}else{
		$("#roommake").popup("open");
	}
}
function drowRoom(){
	$.mobile.loading('show');
	//$('.make_room_button').attr('href','#roommake');
	
	$.post(host+"getRoomList.json",{l_token:window.localStorage.getItem("l_token")},function(res){
		$('.my-room-area').html('');
		$('.attended-room-area').html('');
		$('.all-room-area').html('');
		console.log("res:",res);
		if(res.rc<0) {
			//alert("토큰이 유효하지 않습니다.");
			navigator.notification.alert(
				    res.resMessage,  // message
				    function(){},         // callback
				    '오류',            // title
				    '확인'                  // buttonName
				);
			return false;
		}
		var my=res.result.my;
		var attended=res.result.attended;
		var all=res.result.all;
		
		var myHtml,attendedHtml,allHtml;
		if(my==null){
			myHtml=$('<div>내가 만든 방이 없습니다.</div>').addClass('ui-body ui-body-a');
		}else{
			var myGender=convGender(my.gender);
			var myNum=$('<span>('+(Number(my.num)+1)+'/4)</span>').addClass('roomnum');
			if(my.num==3){
				myNum.css('color','red');
			}
			var myHtmlItem=$('<div></div>').addClass('go-room').data('rno',my.rno)
						.css('float','left').css('width','90%')
						.append($('<div></div>').addClass('roomtitle')
								.html(my.title).append(myNum))
						.append($('<div></div>').addClass('roominfo')
								.html(myGender+' | '+my.destination+' | '+my.schedule));
			var myHtmlIcon=$('<a></a>')
			.addClass('ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all delete-my-room')
			.css('float','right').css('max-width','10%');
			myHtml=$('<div></div>').addClass('ui-body ui-body-a').append(myHtmlItem).append(myHtmlIcon);
		}
		
		if(attended==null){
			attendedHtml=$('<div>내가 만든 방이 없습니다.</div>').addClass('ui-body ui-body-a');
		}else{
			var attendedGender=convGender(attended.gender);
			var attendedNum=$(' <span>('+(Number(attended.num)+1)+'/4)</span>').addClass('roomnum');
			if(attended.num==3){
				attendedNum.css('color','red');
			}
			var attendedHtmlItem=$('<div></div>').addClass('go-room').data('rno',attended.rno)
						.css('float','left').css('width','90%')
						.append($('<div></div>').addClass('roomtitle')
								.html(attended.title).append(attendedNum))
						.append($('<div></div>').addClass('roominfo')
								.html(attendedGender+' | '+attended.destination+' | '+attended.schedule));
			var attendedHtmlIcon=$('<a></a>')
			.addClass('ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all go-out-room')
			.css('float','right').css('max-width','10%');
			attendedHtml=$('<div></div>').addClass('ui-body ui-body-a').append(attendedHtmlItem).append(attendedHtmlIcon);
		}
		
		if(all==null){
			allHtml=$('<div>아직 만들어진 방이 없네요. 먼저 만들어 보세요.</div>');
			$('.all-room-area').html(allHtml);
		}else{
			for(var i=0;i<all.length;i++){
				console.log("all i:"+i);
				var allGender=convGender(all[i].gender);
				var allNum=$(' <span>('+(Number(all[i].num)+1)+'/4)</span>').addClass('roomnum');
				if(all[i].num==3){
					allNum.css('color','red');
				}
				allHtml=$('<div></div>').addClass('ui-body ui-body-a go-room').data('rno',all[i].rno)
				.append($('<div></div>').addClass('roomtitle')
						.html(all[i].title).append(allNum))
				.append($('<div></div>').addClass('roominfo')
						.html(allGender+' | '+all[i].destination+' | '+all[i].schedule));
				$('.all-room-area').append(allHtml);
			}
		}
		$('.my-room-area').append(myHtml);
		$('.attended-room-area').append(attendedHtml);
		initRoomEvent();
	});
}
function initRoomEvent(){
	isRoomInit=true;
	$('.go-room').on('click',function(){
		var tempRno=$(this).data('rno');
		if(attendedRoom==undefined){ //go attendedroom
			if(myRoom&&tempRno==myRoom.rno){
				$.mobile.changePage('#my-chat-room',{});
			}else{  //방접속
				inroom(tempRno);
			}
		}else{
			if(tempRno==attendedRoom.rno){ //go attendedroom
				$.mobile.changePage('#attended-chat-room',{});
			}else if(myRoom&&tempRno==myRoom.rno){
				$.mobile.changePage('#my-chat-room',{});
			}else{// 방바꿀래?
				/*if(confirm(attendedRoom.title+'방에 접속중입니다. 기존 방을 나가고 새로운 방에 입장하시겠어요?')){
					inroom(tempRno);
				}*/
				navigator.notification.confirm(
						attendedRoom.title+'방에 접속중입니다. 기존 방을 나가고 새로운 방에 입장하시겠어요?', // message
				         function(index){
							if(index==1) inroom(tempRno);
						},            // callback to invoke with index of button pressed
				        '경고',           // title
				        ['네','아니오']         // buttonLabels
				    );
			}
		}
	});
	$('.go-out-room').on('click',function(){
		//if(!confirm(attendedRoom.title+"에서 나가시겠어요?"))return false;
		navigator.notification.confirm(
			attendedRoom.title+"방에서 나가시겠어요?", // message
	         function(index){
				if(index==1) {
					$.mobile.loading('show');
					document.getElementById("chat-area-"+attendedRoom.rno).innerHTML="";
					var params={
						l_token:window.localStorage.getItem("l_token"),
						sessionId:sessionId,
						rno:attendedRoom.rno
					}
					$.post(host+'goOutRoom.json',params,function(res){
						if(res.rc>0){
							$.mobile.changePage('#room', {
						        allowSamePageTransition: true,
						        transition: 'none'
						    });
						}else{
							//alert(res.resMessage);
							navigator.notification.alert(
									res.resMessage,  // message
								    function(){},         // callback
								    '오류',            // title
								    '확인'                  // buttonName
								);
							$.mobile.changePage('#room', {
						        allowSamePageTransition: true,
						        transition: 'none'
						    });
						}
						$.mobile.loading('hide');
					});
					attendedRoom=undefined;
				}
			},            // callback to invoke with index of button pressed
	        '경고',           // title
	        ['네','아니오']         // buttonLabels
	    );
		
	});
	$('.delete-my-room').on('click',function(){
		//if(!confirm(myRoom.title+"을 삭제하시겠어요?"))return false;
		navigator.notification.confirm(
			myRoom.title+" 방을 삭제하시겠어요?", // message
	         function(index){
				if(index==1) {
					$.mobile.loading('show');
					document.getElementById("chat-area-"+myRoom.rno).innerHTML="";
					var params={
						l_token:window.localStorage.getItem("l_token"),
						sessionId:sessionId,
						rno:myRoom.rno
					}
					$.post(host+'deleteMyRoom.json',params,function(res){
						console.log('deleteMyRoom.json res:',res);
						if(res.rc>0){
							
							$.mobile.changePage('#room', {
						        allowSamePageTransition: true,
						        transition: 'none'
						    });
						}else{
							//alert(res.resMessage);
							navigator.notification.alert(
									res.resMessage,  // message
								    function(){},         // callback
								    '오류',            // title
								    '확인'                  // buttonName
								);
							$.mobile.changePage('#room', {
						        allowSamePageTransition: true,
						        transition: 'none'
						    });
						}
						$.mobile.loading('hide');
					});
					myRoom=undefined;
				}
			},            // callback to invoke with index of button pressed
	        '경고',           // title
	        ['네','아니오']         // buttonLabels
	    );
		
	});
	$.mobile.loading('hide');
}
$('#room').on('pagebeforeshow',function(event){
	console.log('pagebeforeshow 발생 in #room');
	drowRoom();
});
$("#myRoomMenuPanel").on("panelbeforeopen",function(){
	var panel=$(this);
	panel.html('');
	panel.append($('<h3>방 제목 : '+myRoom.title+'</h3>'));
	panel.append($('<div></div>').addClass('user-info')
			.append($('<div class="someones-image"></div>').html('<img src="'+window.localStorage.getItem("profile_image")+'">'))
			.append($('<div class="someones-text"></div>').html(window.localStorage.getItem('nickname'))));
	var params={
		l_token:window.localStorage.getItem("l_token"),
		rno:myRoom.rno
	}
	$.post(host+'getUserInfoThisRoom.json',params,function(res){
		console.log('res',res);
		if(res.rc>0){
			
			for(var i=0;i<res.result.length;i++){
				var div=$('<div></div>').addClass('user-info');
				div.append($('<div class="someones-image"></div>').html('<img src="'+res.result[i].imagepath+'">'));
				div.append($('<div class="someones-text"></div>').html(res.result[i].nickname));
				panel.append(div);
			}
			
		}else{
			//alert(res.resMessage);
			navigator.notification.alert(
				res.resMessage,  // message
			    function(){},         // callback
			    '오류',            // title
			    '확인'                  // buttonName
			);
		}
	});
});
$("#attendedRoomMenuPanel").on("panelbeforeopen",function(){
	var panel=$(this);
	panel.html('');
	panel.append($('<h3>방 제목 : '+attendedRoom.title+'</h3>'));
	panel.append($('<div></div>').addClass('user-info')
			.append($('<div class="someones-image"></div>').html('<img src="'+window.localStorage.getItem("profile_image")+'">'))
			.append($('<div class="someones-text"></div>').html(window.localStorage.getItem('nickname'))));
	var params={
		l_token:window.localStorage.getItem("l_token"),
		rno:attendedRoom.rno
	}
	$.post(host+'getUserInfoThisRoom.json',params,function(res){
		console.log('res',res);
		if(res.rc>0){
			
			for(var i=0;i<res.result.length;i++){
				var div=$('<div></div>').addClass('user-info');
				div.append($('<div class="someones-image"></div>').html('<img src="'+res.result[i].imagepath+'">'));
				div.append($('<div class="someones-text"></div>').html(res.result[i].nickname));
				panel.append(div);
			}
			
		}else{
			//alert(res.resMessage);
			navigator.notification.alert(
				res.resMessage,  // message
			    function(){},         // callback
			    '오류',            // title
			    '확인'                  // buttonName
			);
		}
	});
});
function inroom(rno){
	var params={
		l_token:window.localStorage.getItem("l_token"),
		sessionId:sessionId,
		rno:rno
	}
	$.post(host+'goInRoom.json',params,function(res){
		if(res.rc<0){
			//alert(res.resMessage);
			navigator.notification.alert(
					res.resMessage,  // message
				    function(){},         // callback
				    '오류',            // title
				    '확인'                  // buttonName
				);
		}else{
			attendedRoom=res.result;
			$('#attended-chat-room-header').html(attendedRoom.title);
			$('.attended-chat-area').attr('id','chat-area-'+attendedRoom.rno);
			$('.attendedChatRoomScope').val(attendedRoom.rno);
			//$('.chat-room-num').attr('id','chat-area-num-'+attendedRoom.rno);
			$.mobile.changePage('#attended-chat-room',{});
			document.getElementById("chat-area-"+attendedRoom.rno).innerHTML="";
/*			var str='{"message":"'+attendedRoom.title+'방에 입장했습니다.",'
				+'"scope":"'+attendedRoom.rno+'","news":"news","num":"1"}';*/
			var str={
					message:attendedRoom.title+'방에 입장했습니다.',
					scope:attendedRoom.rno,
					news:'news'
			}
			chat_writeResponse(str);
		}
	});
	
}

function convGender(gender){
	if(gender=='f'){
		return '여자만';
	}else if(gender=='m'){
		return '남자만';
	}else{
		return '성별 무관';
	}
}
function makeRoom(){
	$.mobile.loading('show');
	var form=document.getElementById('roommake-form');
	/*console.log('form:',form);
	var a="====================\n";
	a+="maker : "+window.localStorage.getItem("l_token")+"\n";
	a+="제목 : "+form.rn.value+"\n";
	a+="성별 : "+form.gender.value+"\n";
	a+="도착지 : "+form.destination.value+"\n";
	a+="예상출발 : "+$('#leave-schedule-text').html()+"\n";
	
	console.log(a);*/
	
	var params={
		l_token:window.localStorage.getItem("l_token"),
		title:form.rn.value,
		gender:form.gender.value,
		destination:form.destination.value,
		schedule:$('#leave-schedule-text').html(),
		sessionId:sessionId,
	}
	
	$.post(host+'makeMyRoom.json',params,function(res){
		console.log(res);
		if(res.rc<0){
			//alert(res.resMessage);
			navigator.notification.alert(
					res.resMessage,  // message
				    function(){},         // callback
				    '오류',            // title
				    '확인'                  // buttonName
				);
			return false;
		}else{
			myRoom=res.result;
			$('#my-chat-room-header').html(params.title);
			$('.my-chat-area').attr('id','chat-area-'+myRoom.rno);
			$('.myChatRoomScope').val(myRoom.rno);
			//$('.chat-room-num').attr('id','chat-area-num-'+myRoom.rno);
			$.mobile.changePage("#my-chat-room", {});
			console.log('makeRoom',myRoom);
			console.log('makeRoom.rno',myRoom.rno);
			//document.getElementById("chat-area-"+myRoom.rno).innerHTML="";
			var str='{"message":"'+myRoom.title+'방이 생성되었습니다.",'
				+'"scope":"'+myRoom.rno+'","news":"news","num":"1"}';
			var str={
					message:myRoom.title+'방이 생성되었습니다.',
					scope:myRoom.rno,
					news:'news'
			}
			chat_writeResponse(str);
			form.rn.value='';
			$('#leave-schedule-text').html('약 9시 0분 출발예정');
		}
		$.mobile.loading('hide');
	});
}
