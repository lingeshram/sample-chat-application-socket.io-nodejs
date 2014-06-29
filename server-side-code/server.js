var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(443);

var clients = {};
var groups = {};
var clearTimeDiff = 10000;

setInterval(function(){

displayClientStatus();

},3600000);



setInterval(function(){

updateOnline();

},1000);



io.sockets.on('connection', function (socket) {

	socket.on('group',function(data){
	
		var dfrom = data.from;
		var dgroup = data.group;
		var acc = data.acc;
		if(acc=='set')
		{
			if(groups[dgroup]==undefined)
			{
				groups[dgroup] = {};
			}
			groups[dgroup][socket.id] = dfrom;
		}
		else if(acc=='get')
		{
			socket.emit('group', groups[dgroup]);
		}		
	
	});
	

  socket.on('textmsg', function (data) {
  
	dfrom = data.from;
	dto = data.to;
	
	var ctime = new Date();
	
	if(clients[dfrom]==undefined)
	{
		clients[dfrom]= {msg:{},typing:{},name:{},time:0,id:""};
	}

	clients[dfrom].time = ctime;
	clients[dfrom].id = socket.id;

	if(data.acc=='receive')
	{

		if(clients[dfrom])
		{
			
			socket.emit('textmsg', clients[dfrom]);
			delete clients[dfrom];
		}
	}
	 else if(data.acc=='send' || data.acc=='typing')
	{
	
		if(clients[dto]==undefined)
		{
			clients[dto]= {msg:{},typing:{},name:{}};		
		}
		
		if(data.acc=='send')
		{
			if(clients[dto].msg[dfrom]==undefined)
			{
				clients[dto].msg[dfrom] = [];
			}
			var ctime = new Date();
			clients[dto].msg[dfrom].push({"time":ctime,"msg":data.msg});
		}
		else if(data.acc=='typing')
		{
			if(clients[dto].typing[dfrom]==undefined)
			{
				clients[dto].typing[dfrom] = data.msg;
			}
		}

		clients[dto].name[dfrom] = data.name;
		
	}


	   
	
  });



	

});



function getCount(obj)
{
	var p = 0;
	for(k in obj)
	{
		p++;
	}

	return p;
}

function displayClientStatus()
{
	nd = new Date();
	//console.log(io.sockets);
	//console.log(io.sockets.server.eio);
	
	console.log( nd.toLocaleTimeString() + ' ' + nd.toDateString() + '	Client variable array count------>' + getCount(clients) + ' Total number of client---------> ' + io.sockets.server.eio.clientsCount + ' Number of grou----->' + getCount(groups));
}

function updateOnline()
{
	var sclient = io.sockets.server.eio.clients;
	var clcintArry = [];
	for(id in sclient)
	{
		clcintArry.push(id);
	}
	
	var gl = {};
	var id = '';
	for(k in groups)
	{
		gl = groups[k];
		gc = 0;
		for(id in gl)
		{
			if(!in_array(id,clcintArry))
			{
				delete groups[k][id];
			}
			else
			{
				gc++;
			}
			
		}
		
		if(gc==0)
		delete groups[k];
	}
	
}


function in_array (needle, haystack, argStrict) {

    // *     example 2: in_array('outlets', {0: 'bharat', outlets: 'van', 1: 'Fieldstudy'});
    // *     returns 2: false

    var key = '',
        strict = !! argStrict;

    if (strict) {
        for (key in haystack) {
            if (haystack[key] === needle) {
                return true;
            }
        }
    } else {
        for (key in haystack) {
            if (haystack[key] == needle) {
                return true;
            }
        }
    }

    return false;
}