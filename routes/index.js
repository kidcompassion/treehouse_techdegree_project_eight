var express = require('express');
var router = express.Router();

/**
 * Get main root
 * Redirects to /books
 */
router.get('/', function(req, res, next) {
  res.redirect('/books');
});



module.exports = router;
