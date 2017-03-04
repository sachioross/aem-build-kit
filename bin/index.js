var express = require('express');
var app = express();
var program = require('commander');
var nunjucks = require('nunjucks');
var marked = require('marked');
var nsh = require('node-syntaxhighlighter');
const htmlLanguage=  nsh.getLanguage('html');
const fs = require('fs');
const jsLanguage = nsh.getLanguage('javascript');
const path = require('path');
const DEFAULT_RANK = 100;
const DEFAULT_STATUS = "IN PROGRESS";


/** ------------------------
   EXECUTION CONFIGURATION
 ------------------------ */
program
    .version('0.0.1')
    .option('-p, --port', 'Port')
    .parse(process.argv);

var port = 5502;

if (program.port) {
    port = program.port;
}

/** ------------------------
   VIEW CONFIGURATION
 ------------------------ */
var env = nunjucks.configure('views', {
    autoescape: false,
    express: app
});

marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    highlight: function (code) {
        if (code.indexOf("</") > -1) {
            return nsh.highlight(code, htmlLanguage);
        } else {
            return nsh.highlight(code, jsLanguage);
        }
    }
});

/** ------------------------
   ROUTING
 ------------------------ */
var navigation = createNavigation();

configureRouting(app, navigation);

app.get('/', function(req, res) {
   console.log("sending to overview");
   res.redirect(301, '/project/sections/Overview');
});

// TODO: change this to only statically include assets, otherwise handle routing above.
require('./demo-routing.js')(app);
app.use('/assets', express.static('buildkit'));

/** ------------------------
   PROGRAM EXECUTION
 ------------------------ */
app.listen(port, function() {
    console.log("Server started at " + new Date() + " on port " + port);
});

/** ------------------------
  UTILITY FUNCTIONS
 ------------------------ */

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

function createNavigation() {

    return traverseFiles('project/sections', 0);
}

function traverseFiles(loc, depth) {

    var items = [];

    var files = fs.readdirSync(loc);

    for (var i in files) {

        var currentFile = loc + '/' + files[i];
        var stats = fs.statSync(currentFile);

        var file = {
            title: files[i],
            path : path.join("/", encodeURI(currentFile)),
            filePath : currentFile,
            depth: depth,
            isDir : false,
            files : [],
            rank : DEFAULT_RANK,
            status : "IN PROGRESS"
        };


        if (stats.isDirectory()) {
            var children = traverseFiles(currentFile, depth + 1);
            var meta = getMeta(currentFile, children);

            file.isDir = true;
            file.files = children;
            file.rank = meta.rank ? meta.rank : DEFAULT_RANK;
            file.status = meta.status ? meta.status : "IN PROGRESS";
        }

        items.push(file);
    }

    return items;
}

function getMeta(loc, files) {

    var meta = {};

    for (var i in files) {
        if (files.hasOwnProperty(i) && files[i].title === "meta.json") {
          meta = JSON.parse(fs.readFileSync(loc + "/" + files[i].title, { "encoding" : "utf-8"}));
        }
    }

    return meta;
}

function configureRouting(app, nav) {

    nav.forEach(function(page) {
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
                    navigation : navigation,
                    componentPath : componentPath,
                    lastModified : lastModified.toLocaleString('en-US'),
                    status : page.status
                };

                res.render((markup !== undefined ? "component.html" : "content.html"), content);
            });
            configureRouting(app, page.files);
        }
    });
}

require('./custom-filters.js')(env);
