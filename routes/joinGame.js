var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
        const collection = client.db("monopoly").collection("games");
        collection.find({}).toArray(function(err, result) {
            if (err) throw err;
            res.render('joinGame', { title: "Join Game", games: result});
            client.close();
          });
    });
});

module.exports = router;
