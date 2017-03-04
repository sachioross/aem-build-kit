const fs = require('fs');
const path = require('path');
const DEFAULT_RANK = 100;
const DEFAULT_STATUS = "IN PROGRESS";

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

module.exports = {
  traverseFiles : traverseFiles
}
