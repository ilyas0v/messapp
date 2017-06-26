var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient;

var bodyParser = require("body-parser");


var url = "mongodb://ilyas0v:54123ii@ds137882.mlab.com:37882/messapp";



app.set('view engine', 'ejs');   // View engine olaraq  ejs  ishledecik..

app.get('/', function(req, res){
	res.render('pages/login');
	//res.sendfile('login.html');
});




app.use(bodyParser.urlencoded({extended : true}));

app.post("/", function(request, response) {
  var un = request.body.username;
  var pass = request.body.pass;
  
  var istifadeci_say = 0;
  
  MongoClient.connect(url, function(err, db) {
	  if (err) {console.log("cant connect to database"); return;}
	  var query = {ad:un,pass:pass};
	  db.collection("istifadeciler").find(query).toArray(function(err, result) {
		if (err) throw err;
		console.log(result);
		if(result.length!=0){response.render('pages/index',{un}); }
		else{response.end('Girish melumatlari yanlishdir..');}
		db.close();
	  });
	});
  
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
	socket.on('chat message', function([msg,gonderen]){
		if(msg!='' && msg!=' '){
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			var myobj = { gonderen: gonderen, mesaj: msg , tarix : new Date()};
			db.collection("mesajlar").insertOne(myobj, function(err, res) {
				if (err) throw err;
				console.log("1 record inserted");
				db.close();
			});
		});
		
		}
		
		io.emit('chat message', [msg,gonderen]);
	});
});

var port = process.env.PORT || 3000;

http.listen(port, function(){
	console.log('listening...');
});
