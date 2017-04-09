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
require('./client-routing.js')(app, require('./project-builder.js').traverseFiles('project/sections', 0), marked);

app.get('/', function(req, res) {
   console.log("sending to overview");
   res.redirect(301, '/project/sections/Overview');
});

// TODO: change this to only statically include assets, otherwise handle routing above.
app.use('/assets', express.static('buildkit'));
app.use('/etc/designs/client', express.static('project/assets'));

/* ADD FILTERS */
require('./custom-filters.js')(env);

/** ------------------------
   PROGRAM EXECUTION
 ------------------------ */
app.listen(port, function() {
    console.log("Server started at " + new Date() + " on port " + port);
});
