var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('createGame', { title: 'Oscars Monopoly' });
});

module.exports = router;