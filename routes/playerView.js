var express = require('express');
var router = express.Router();
var mongo = require('mongodb');

/* GET home page. */
router.get('/:id', function(req, res, next) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
        const gamescollection = client.db("monopoly").collection("games");
        const playercollection = client.db("monopoly").collection("players");
        let o_id = new mongo.ObjectID(req.params.id);
        playercollection.findOne({"_id": o_id}, function(err, player) {
            if (err) throw err;
            o_id = new mongo.ObjectID(player.gameid);
            gamescollection.findOne({"_id": o_id}, function(err, game) {
                let playername = "";
                let others = [];
                Object.keys(game["players"]).forEach(key => {
                    if(game["players"][key]["id"] == req.params.id){
                        playername = key;
                    } else {
                        others.push(key);
                    }
                })
                if (err) throw err;
                client.close();
                res.render('playerView', { 
                    title: playername,
                    budget: player.budget, 
                    otherPlayers: others,
                    gameid: player.gameid,
                    selfid: req.params.id,
                    auction: game.auction
                });
            });
        });
    });
});

module.exports = router;