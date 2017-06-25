var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient;



var url = "mongodb://ilyas0v:54123ii@ds137882.mlab.com:37882/messapp";



app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.get('/m',function(req,res){
	
	var mesajlar="a";
	var url = "mongodb://ilyas0v:54123ii@ds137882.mlab.com:37882/messapp";
	MongoClient.connect(url, function(err, db) {
	  if (err) {console.log("cant connect to database"); return;}
	  var query = {};
	  db.collection("mesajlar").find(query).toArray(function(err, result) {
		if (err) throw err;
		console.log(result);
		mesajlar = result;
		res.send(mesajlar);
		db.close();
	  });
	});
	
	
});




io.on('connection', function(socket){
	socket.on('chat message', function(msg){
		if(msg!='' && msg!=' '){
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			var myobj = { gonderen: msg[msg.length-1], mesaj: msg , tarix : new Date()};
			db.collection("mesajlar").insertOne(myobj, function(err, res) {
				if (err) throw err;
				console.log("1 record inserted");
				db.close();
			});
		});
		
		}
		
		io.emit('chat message', msg);
	});
});

var port = process.env.PORT || 3000;

http.listen(port, function(){
	console.log('listening...');
});
