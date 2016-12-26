var express = require('express');
var app = express();
var program = require('commander');
var nunjucks = require('nunjucks');
var fs = require('fs');
var marked = require('marked');
var nsh = require('node-syntaxhighlighter');
var language =  nsh.getLanguage('html');

/**
 * EXECUTION CONFIGURATION
 */
program
    .version('0.0.1')
    .option('-p, --port', 'Port')
    .parse(process.argv);

var port = 5502;

if (program.port) {
    port = program.port;
}

/**
 * VIEW CONFIGURATION
 */
nunjucks.configure('views', {
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
        return nsh.highlight(code, language);
    }
});

// markdown.register(env, marked);

/**
 * ROUTING
 */
app.get('/', function(req, res) {
   res.render('base.html', { pageTitle: 'AEM Project Playbook'});
});

app.get('/component-a', function(req, res) {

    var info = fs.readFileSync(__dirname + "/project/sections/components/component-a/info.md");
    var cmp = fs.readFileSync(__dirname + "/project/sections/components/component-a/component.html");

    var component = {
        pageTitle: "Component A",
        info: mdToHtml(info),
        cmp : mdToHtml("``` html\n" + cmp + "```\n")
    };
    res.render('component.html', component);

});


// TODO: change this to only statically include assets, otherwise handle routing above.
app.use(express.static('static/pages'));
app.use(express.static('static'));

/**
 * PROGRAM EXECUTION
 */
app.listen(port, function() {
    console.log("Server started at " + new Date() + " on port " + port);
});

/**
 * UTILITY FUNCTIONS
 */

function mdToHtml(data) {
    if (typeof data === "object") {
        return marked(data.toString());
    } else {
        return marked(data);
    }
}