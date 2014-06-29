
var windowfocus;
var nativeTitle = $('title').html();
var newTitle = '';

$(window).blur(function(){

windowfocus = false;

});

$(window).focus(function(){

windowfocus = true;

});


  var socket = io.connect(socketio_domain);
	
	socket.on('textmsg', function (data) {
	
	var d = new Date();
	var n = d.getTime();

	for(dk in data.typing)
	{		
		if(data.typing[dk]==1)
		{
			chat_initiate(dk,data.name[dk],0);
			$('#typing_txt_' + dk).show();	
		}
		else
		$('#typing_txt_' + dk).hide();			

		active_user_window_time[dk] = n;
	}
	var apptext = '';
	for(dk in data.msg)
	{
		if(newTitle=='')
		newTitle = 'New Msg from';
		
		chat_initiate(dk,data.name[dk],0);
		if(newTitle.indexOf(data.name[dk])==-1)
		newTitle += ' ' + data.name[dk] + ',';
		
		apptext = '<div class="opp"><b>' + data.name[dk] + ': </b>';
		/*
		for(j=0;j<data.msg[dk].length;j++)
		{
			$('#entered_chat_' + dk).append(data.msg[dk][j] + '<br>');
		}*/
		
		data.msg[dk].forEach(function(val,index){
		
		var time = new Date(val.time);
		
		apptext += val.msg + '<span>' + time.getHours() + ':' + time.getMinutes() + '</span>';
		
		});
		
		apptext += '</div>';
		
		$('#entered_chat_' + dk).append(apptext);
		
		
		$('#typing_txt_' + dk).hide();
		var objDiv = document.getElementById('entered_chat_' + dk);
		objDiv.scrollTop = objDiv.scrollHeight;
		active_user_window_time[dk] = n;
		tootgleTitle();
	}


   
  });
  var newTitleFocus = false;
 function tootgleTitle()
 {
	if(windowfocus==false && newTitleFocus==false)
	{		
		$('title').html(newTitle);
		setTimeout(function(){
		newTitleFocus = true;
		tootgleTitle();
		},1000);
	}
	else if(windowfocus==false && newTitleFocus==true)
	{
		$('title').html(nativeTitle);
		setTimeout(function(){
		newTitleFocus = false;
		tootgleTitle();
		},1000);
	}
	else if(windowfocus==true)
	{
		newTitle = '';
		$('title').html(nativeTitle);
	}
 }

function enterGroup()
{
	var name = document.getElementById('nm').value;
	var group = document.getElementById('group').value;
	if(group!='' && name!='')
	socket.emit('group', {acc:"set",group:group,from:name});
}

function updateGroup()
{
	enterGroup();
	var name = document.getElementById('nm').value;
	var group = document.getElementById('group').value;
	socket.emit('group', {acc:"get",group:group,from:name});
}

setInterval('updateGroup()',1000);


socket.on('group', function (data) {

	var userl = '';
	var name = document.getElementById('nm').value;
	for(k in data)
	{
		k = data[k];
		if(k!=name)
		userl += '<div onclick="chat_initiate(\'' + k + '\',\'' + k + '\',1);" class="chatUsers">' + k + '</div>';		
	}
	
	$('#userList').html(userl);

});
  

function receive()
{
	name = document.getElementById('nm').value;
	socket.emit('textmsg', {acc:'receive',from:name});
	typeWatch();
}

setInterval('receive()',700);


function typeWatch()
{
	var d = new Date();
	var n = d.getTime(); 
	


	for(k in active_chat_users)
	{
		user = active_chat_users[k];
			
		if(n-active_user_type_time[user]>1000 && $('#chat_input_box_' + user).val()!='' && active_user_type_time[user]!=0)
		{
			nme = document.getElementById('nm').value;
			socket.emit('textmsg', {name:nme, acc:'typing',to:user,from:nme,msg:'0'});
			active_user_type_time[user] = 0;
		}
		
	}

}


//if($.jStorage.get('active_user_type_time')==undefined)
//{
	active_user_type_time = Array();
	active_chat_windows = 0;
	active_chat_users = Array();
	chat_window_user_location = 0;
	active_user_window_time = Array();
//}

function chat_initiate(user,name,focusAcc)
{
	
	

	exits_ok = false;
	for(k in active_chat_users)
	{
		if(active_chat_users[k]==user)
		{
			exits_ok = true;
		}

	}

	if(exits_ok==true)
	{
		// $('#chat_input_box_' + user).focus();
		return;
	}


	var userPanelWidth = $('.onlineUsersPanel').width();

	var d = new Date();
	var n = d.getTime();

	exid_wdt = (active_chat_windows*userPanelWidth) + (active_chat_windows*7) + (userPanelWidth * 2);
	
	if(exid_wdt>=$(document).width())
	{
		temp_c = n;
		hide_user = '';

		for(ke in active_user_window_time)
		{
			if(active_user_window_time[ke]<temp_c)
			{
				temp_c = active_user_window_time[ke];
				hide_user = ke;
			}
		}
		teminateChatBox(hide_user);
		chat_initiate(user,name,0);
		return;
	}






	active_chat_windows++;
	chat_window_user_location++;

	$('#chat_panel_footer').prepend('<div class="chatBox" id="chat_box_user_' + user + '"><div class="chatheader" onclick="toogleChatBox(\'' + user + '\')"><span class="chatUserName">' + name + '</span><span onclick="teminateChatBox(\'' + user + '\')" class="closeChatBox" ></span><div style="clear:both;"></div></div><div id="chat_box_content_' + user + '" class="chatBoxContent"><div class="enteredTextContent" id="entered_chat_' + user + '"></div><div class="typing_txt" id="typing_txt_' + user + '"><i><b>' + name + '</b> is typing....</i></div><textarea id="chat_input_box_' + user + '"></textarea></div></div>');


	$('#chat_box_user_' + user).css('right',(active_chat_windows*userPanelWidth) + 'px');
	$('#chat_box_user_' + user).css('margin-right',(active_chat_windows*7) + 'px');

	active_chat_users[chat_window_user_location] = user;

	active_user_window_time[user] = n;
	var keypressVal = false;

	 $('#chat_input_box_' + user).keypress(function(e){

		nme = document.getElementById('nm').value;
		var code = (e.keyCode ? e.keyCode : e.which);
		keypressVal = true;

		var d = new Date();
		var n = d.getTime();

		active_user_window_time[user] = n;

		if(code==13)
		{
			msg = $('#chat_input_box_' + user).val();
			
			if(msg.trim()!='')
			{
				
				var time = new Date();
				
				$('#entered_chat_' + user).append('<div class="self"><b>Me: </b>' + msg + '<span>' + time.getHours() + ':' + time.getMinutes() + '</span></div>');
		
				var objDiv = document.getElementById("entered_chat_" + user);
				objDiv.scrollTop = objDiv.scrollHeight;

				socket.emit('textmsg', {name:nme, acc:'send',to:user,from:nme,msg:msg });
			}
			
			setTimeout(function(){$('#chat_input_box_' + user).val('')});
		}
		else
		{			
			active_user_type_time[user] = n;
			socket.emit('textmsg', {name:nme, acc:'typing',to:user,from:nme,msg:'1'});
			setTimeout(function(){
			
				resetTyping();
			
			},5000);
		}
		
	 
	 });
	       
		   function resetTyping()
		   {
				if(keypressVal==false)
				{
					socket.emit('textmsg', {name:nme, acc:'typing',to:user,from:nme,msg:'0'});
				}
				else
				{
					keypressVal = false;
				}
		   }
	 
	 if(focusAcc==1)
	 $('#chat_input_box_' + user).focus();

}



function toogleChatBox(user)
{
	if($('#chat_box_content_' + user).css('display')=='none')
	{
		$('#chat_box_content_' + user).show();
	}
	else
	{
		$('#chat_box_content_' + user).hide();
	}
}

function teminateChatBox(user)
{
	$('#chat_box_user_' + user).remove();
	relocate = false;
	for(k in active_chat_users)
	{
		if(active_chat_users[k]==user)
		{
			relocate = true;
			delete active_chat_users[k];
		}

		if(relocate==true)
		$('#chat_box_user_' + active_chat_users[k]).css('right','-=207px');
		
	}

	delete active_user_window_time[user];

	
	active_chat_windows--;
}

