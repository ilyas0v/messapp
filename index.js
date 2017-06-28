var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient;
var path = require('path');
var bodyParser = require("body-parser");
var express = require("express");
var multer = require("multer");
var autoIncrement = require("mongodb-autoincrement");
var upload = multer({dest : 'public/sent_photos/'})



	function addZero(i) {
 		if (i < 10) {
 			i = "0" + i;
 		}
 		return i;
 	}



var url = "mongodb://ilyas0v:54123ii@ds137882.mlab.com:37882/messapp";
app.set('view engine', 'ejs');   // View engine olaraq  ejs  ishledecik..

app.use(express.static(path.resolve('./public')));

app.use(bodyParser.urlencoded({extended : true}));


app.get('/', function(req, res){
	res.render('pages/login');
	//res.sendfile('login.html');
});

app.get('/upload',function(req,res){
	res.render('pages/upload');
});

app.post('/upload',upload.any(),function(req,res,next){
	res.send(req.files);
});


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
	  db.collection("mesajlar").find(query).sort({_id:1}).toArray(function(err, result) {
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
			MongoClient.connect(url, function (err, db) {
				collectionName = "mesajlar";
				autoIncrement.getNextSequence(db, collectionName, function (err, autoIndex) {
					var collection = db.collection(collectionName);
					var tarix = new Date();
					var saat = addZero(new Date(tarix).getHours())+":"+addZero(new Date(tarix).getMinutes());
					var myobj = { _id : autoIndex, gonderen: gonderen, mesaj: msg , tarix : saat};
					collection.insertOne(myobj,function(err,res){
						if(err) throw err;
						console.log("1 doc bazaya yazildi.");
						db.close();
					});
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
