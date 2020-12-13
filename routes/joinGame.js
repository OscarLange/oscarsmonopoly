var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
        const collection = client.db("monopoly").collection("games");
        collection.find({}).toArray(function(err, results) {
            if (err) throw err;
            const playerCount = [];
            results.forEach(result => {
                let bank = 0;
                let player = 0;
                const playercount = Object.keys(result["players"]).length - 1;
                Object.keys(result["players"]).forEach(key => {
                    if(result["players"][key]["id"].length >= 1){
                        if(key === "bank"){
                            bank++;
                        } else {
                            player++;
                        }
                    }
                });
                playerCount.push({"id" : result._id, "name": result.name, "bank": bank, "player": player, "playercount": playercount});
            });
            res.render('joinGame', { title: "Join Game", games: playerCount});
            client.close();
          });
    });
});

module.exports = router;
