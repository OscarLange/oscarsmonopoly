var createError = require('http-errors');
var express = require('express');
var mongo = require('mongodb');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');

var indexRouter = require('./routes/index');
var createGameRouter = require('./routes/createGame');
var joinGameRouter = require('./routes/joinGame');
var playerViewRouter = require('./routes/playerView');
var bankViewRouter = require('./routes/bankView');

var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/createGame', createGameRouter);
app.use('/joinGame', joinGameRouter);
app.use('/playerView', playerViewRouter);
app.use('/bankView', bankViewRouter);

app.post("/postGame", function(req, res){
  const MongoClient = require('mongodb').MongoClient;
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true });
  client.connect(err => {
    const collection = client.db("monopoly").collection("games");
    collection.insertOne(req.body, function(err, result) {
      if (err) throw err;
      client.close();
    });
  });
  res.sendStatus(200);
});

app.post("/postPlayer", function(req, res){
  const MongoClient = require('mongodb').MongoClient;
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true });
  let playerid = "";
  client.connect(err => {
    const gamescollection = client.db("monopoly").collection("games");
    const playercollection = client.db("monopoly").collection("players");
    const o_id = new mongo.ObjectID(req.body.id);
    gamescollection.findOne({"_id": o_id}, function(err, game) {
        const player = {
          "budget" : game.budget,
          "gameid" : req.body.id
        }
        playercollection.insertOne(player, function(err, result) {
          if (err) throw err;
          let keyreplaced = false;
          Object.keys(game["players"]).forEach(key => {
            if(key !== "bank" && !keyreplaced && game["players"][key]["id"].length < 1){
              const ObjectId = require('mongodb').ObjectID;
              playerid = ObjectId(result["insertedId"]).toString();
              game["players"][key]["id"] = playerid;
              keyreplaced = true;
            }
          });
          gamescollection.replaceOne({"_id": o_id}, game, function(err, result2) {
            if (err) throw err;
            console.log("1 document updated");
            client.close();
            res.status(200).send(playerid);
          });
        });
    });
  });
});

app.post("/postBank", function(req, res){
  const MongoClient = require('mongodb').MongoClient;
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true });
  let playerid = "";
  client.connect(err => {
    const gamescollection = client.db("monopoly").collection("games");
    const playercollection = client.db("monopoly").collection("players");
    const o_id = new mongo.ObjectID(req.body.id);
    gamescollection.findOne({"_id": o_id}, function(err, game) {
        const player = {
          "budget" : 0,
          "gameid" : req.body.id
        }
        playercollection.insertOne(player, function(err, result) {
          if (err) throw err;
          const ObjectId = require('mongodb').ObjectID;
          playerid = ObjectId(result["insertedId"]).toString();
          game["players"]["bank"]["id"] = playerid;
          
          gamescollection.replaceOne({"_id": o_id}, game, function(err, result2) {
            if (err) throw err;
            console.log("1 document updated");
            client.close();
            res.status(200).send(playerid);
          });
        });
    });
  });
});

app.post("/sendMoney", function(req, res){
  const MongoClient = require('mongodb').MongoClient;
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true });
  client.connect(err => {
    const gamescollection = client.db("monopoly").collection("games");
    const playercollection = client.db("monopoly").collection("players");
    let o_id = new mongo.ObjectID(req.body.gameid);
    gamescollection.findOne({"_id": o_id}, function(err, game) {
      const playerid = game["players"][req.body.playerName]["id"];
      o_id = new mongo.ObjectID(playerid);
      playercollection.updateOne({"_id": o_id}, { $inc: { "budget": Number(req.body.money) }});
      res.sendStatus(200);
    });
  });
});

app.post("/transferMoney", function(req, res){
  const MongoClient = require('mongodb').MongoClient;
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true });
  client.connect(err => {
    const gamescollection = client.db("monopoly").collection("games");
    const playercollection = client.db("monopoly").collection("players");
    let o_id = new mongo.ObjectID(req.body.gameid);
    gamescollection.findOne({"_id": o_id}, function(err, game) {
      const playerid = game["players"][req.body.playerName]["id"];
      o_id = new mongo.ObjectID(req.body.selfid);
      playercollection.updateOne({"_id": o_id}, { $inc: { "budget": (Number(req.body.money) * (-1)) }});
      o_id = new mongo.ObjectID(playerid);
      playercollection.updateOne({"_id": o_id}, { $inc: { "budget": Number(req.body.money) }});
      res.sendStatus(200);
    });
  });
});

app.post("/postAuction", function(req, res){
  const MongoClient = require('mongodb').MongoClient;
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true });
  client.connect(err => {
    const gamescollection = client.db("monopoly").collection("games");
    let o_id = new mongo.ObjectID(req.body.gameid);
    gamescollection.findOne({"_id": o_id}, function(err, game) {
      const id = game["players"][req.body.playerName]["id"];
      gamescollection.updateOne({"_id": o_id}, { $set: { "auction": Number(req.body.money), "auctionStarter": id }});
    });
    res.sendStatus(200);
  });
});

app.post("/closeAuction", function(req, res){
  const MongoClient = require('mongodb').MongoClient;
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true });
  client.connect(err => {
    const gamescollection = client.db("monopoly").collection("games");
    const playercollection = client.db("monopoly").collection("players");
    let o_id = new mongo.ObjectID(req.body.gameid);
    gamescollection.findOne({"_id": o_id}, function(err, game) {
      let winner = "";
      let best = Number(game["auction"]);
      game["auction"] = 0;
      Object.keys(game["players"]).forEach(playerName => {
        if(playerName !== "bank"){
          if(game["players"][playerName]["id"] === game["auctionStarter"]){
            if(Number(game["players"][playerName]["bet"]) > (best - (best*0,1))){
              best = Number(game["players"][playerName]["bet"]);
              winner = game["players"][playerName]["id"];
            }
          } else {
            if(Number(game["players"][playerName]["bet"]) > best){
              best = Number(game["players"][playerName]["bet"]);
              winner = game["players"][playerName]["id"];
            }
          }
          game["players"][playerName]["bet"] = 0;
        }
      })
      if(winner === game["auctionStarter"]){
        best -= (best*0,1);
      }
      best = best * (-1);
      o_id = new mongo.ObjectID(winner);
      playercollection.updateOne({"_id": o_id}, { $inc: { "budget": best }});
      res.status(200).send(winner);
    });
  });
});

app.post("/betMoney", function(req, res){
  const MongoClient = require('mongodb').MongoClient;
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true });
  client.connect(err => {
    const gamescollection = client.db("monopoly").collection("games");
    let o_id = new mongo.ObjectID(req.body.gameid);
    gamescollection.findOne({"_id": o_id}, function(err, game) {
      Object.keys(game["players"]).forEach(key => {
        if(game["players"][key]["id"] == req.body.selfid){
          game["players"][key]["bet"] = req.body.money;
        }
      });
      gamescollection.replaceOne({"_id": o_id}, game, function(err, result2) {
        if (err) throw err;
        console.log("1 document updated");
        client.close();
        res.status(200);
      });
    });
    res.sendStatus(200);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
