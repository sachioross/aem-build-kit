var express = require('express');
var router = express.Router();
var fs = require('fs');

function configureDemoRouting(app) {

  router.get(/\/*/, function(req, res) {

    var html = fs.readFileSync(decodeURI(req.path), { "encoding" : "utf-8"});
    res.render('project/base.html', {cmp : html});
  });

  app.use("/demo", router);
};

module.exports = configureDemoRouting;
