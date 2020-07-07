/*
const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/fanrep2");
const db = mongoose.connection;

db.on('error', console.error.bind(console, "connection error"));
db.once('open', ()=>{
  console.log("DB connected");
});

const express = require('express');

const app = express();

app.get('/', (req, res) => {
    db.find({}, (err, artist) => {
        if(err) return res.json(err);

        res.json(artist);
    });
});

app.listen(3000, () => {
    console.log('Connect 3000');
});
*/


var MongoClient = require('mongodb').MongoClient;
//var url = 'mongodb://localhost:27017/';

MongoClient.connect('mongodb://blackruby:b1ackruby@13.209.225.92:27017/fanrep2?authSource=admin', function(err, client){
    if (err) throw err;
    var db = client.db("fanrep2");
    db.collection("user").findOne({"nickname": "녜잉이"}, function(findErr, result){
        if (findErr) throw findErr;
        console.log(result);
        client.close();
    });
});

/*
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/fanrep2'); // 기본 설정에 따라 포트가 상이 할 수 있습니다.
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log("mongo db connection OK.");
});
*/
