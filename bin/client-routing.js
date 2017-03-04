var express = require('express');
var router = express.Router();
const fs = require('fs');
const path = require('path');

var marked = undefined;

function mdToHtml(data) {
    if (data === undefined || data === null) {
        return undefined;
    }
    if (typeof data === "object") {
        return marked(data.toString());
    } else {
        return marked(data);
    }
}

function configureRouting(app, siblings, allPages) {

    siblings.forEach(function(page) {
        if (page.isDir) {
            app.get(page.path, function(req, res) {

                var infoPath = path.join(__dirname,"/../", page.filePath, "content.md");
                var info = fs.readFileSync(infoPath, { "encoding" : "utf-8"});
                var lastModified = new Date(fs.statSync(infoPath).mtime);
                var componentPath = path.join(__dirname,"/../",page.filePath, "component.html");
                var markup = undefined;

                if (fs.existsSync(componentPath)) {
                    markup = fs.readFileSync(componentPath, {"encoding" : "utf-8"});
                    var cmpLastModded = new Date(fs.statSync(componentPath).mtime);
                    if (lastModified.getTime() < cmpLastModded.getTime()) {
                      lastModified = cmpLastModded;
                    }
                }

                var content = {
                    pageTitle : page.title,
                    info : mdToHtml(info),
                    mdMarkup : mdToHtml("``` html\n" + (markup !== undefined ? markup : "") + "```\n"),
                    markup : markup,
                    navigation : allPages,
                    componentPath : componentPath,
                    lastModified : lastModified.toLocaleString('en-US'),
                    status : page.status
                };

                res.render((markup !== undefined ? "component.html" : "content.html"), content);
            });
            configureRouting(app, page.files, allPages);
        }
    });
};

function configureDemoRouting(app) {

  router.get(/\/*/, function(req, res) {

    var html = fs.readFileSync(decodeURI(req.path), { "encoding" : "utf-8"});
    res.render('project/base.html', {cmp : html});
  });

  app.use("/demo", router);
};

function init(app, _pages, _marked) {
  marked = _marked;
  configureRouting(app, _pages, _pages);
  configureDemoRouting(app);
};

module.exports = init;
