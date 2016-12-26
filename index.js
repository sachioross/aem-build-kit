var express = require('express');
var app = express();
var program = require('commander');

program
    .version('0.0.1')
    .option('-p, --port', 'Port')
    .parse(process.argv);

var port = 5502;

if (program.port) {
    port = program.port;
}

app.get('/', function(req, res) {
   res.send('Working!');
});

app.use(express.static('static/pages'));
app.use(express.static('static'));

app.listen(port, function() {
    console.log("Server started at " + new Date() + " on port " + port);
});
