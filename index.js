var express = require('express');
var app = express();
var program = require('commander');
var nunjucks = require('nunjucks');
var fs = require('fs');
var marked = require('marked');
var nsh = require('node-syntaxhighlighter');
var htmlLanguage=  nsh.getLanguage('html');
var jsLanguage = nsh.getLanguage('javascript');

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
        if (code.indexOf("</") > -1) {
            return nsh.highlight(code, htmlLanguage);
        } else {
            return nsh.highlight(code, jsLanguage);
        }
    }
});

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
        cmp : mdToHtml("``` html\n" + cmp + "```\n"),
        navigation : createNavigation()
    };
    res.render('component.html', component);

});


// TODO: change this to only statically include assets, otherwise handle routing above.
app.use('/assets', express.static('static'));

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

function createNavigation() {

    // TODO: Iterate over each folder / file and example structure
    // TODO: Level 0: Main Topic (e.g. "Overview", "Style Guide", "SEO", "Components")
    // TODO: Level 1: Specific Item (e.g. "Title Component", "Fonts", "URL Schema")

    // TODO: SIMPLY ITERATE OVER FILES / FOLDERS AND URL ENCODE

    // TODO: Implement a sorting option

    var nav = traverseFiles('project/sections', 0);

    for (var i in nav) {
        console.log(nav[i]);
    }

    return nav;
}

function traverseFiles(path, depth) {

    var items = new Array();

    var files = fs.readdirSync(path);

    for (var i in files) {

        var currentFile = path + '/' + files[i];
        var stats = fs.statSync(currentFile);

        var file = {
            title: files[i],
            path : currentFile,
            depth: depth,
            isDir : false,
            files : []
        };


        if (stats.isDirectory()) {
            file.isDir = true;
            file.files = traverseFiles(currentFile, depth + 1);
        }

        items.push(file);
    }

    return items;
}
