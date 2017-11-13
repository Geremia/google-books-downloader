var pngFileNames = []; //array of PNG files downloaded
var pgNum = 0; //running page number
var casper = require('casper').create({
    verbose: false,
    logLevel: "debug",
    pageSettings: {
        webSecurityEnabled: false,
    },
    viewportSize: {
        width: 800,
        height: 600
    }
});
var x = require('casper').selectXPath;
var fs = require('fs');

//Get the Proquest book ID from the command line:
casper.cli.drop("cli");
casper.cli.drop("casper-path");
if (casper.cli.args.length < 3) {
    casper.echo("Usage: casperjss gbd.js <institution ID (e.g., UAZ)> <ProQuest ID (e.g., 4592423)> <# pages> [start page].").exit();
}
var url = 'https://ebookcentral.proquest.com/lib/' + casper.cli.args[0] + '/reader.action?docID=' + casper.cli.args[1];
var numPages = casper.cli.args[2];

casper.start(url);

casper.then(function() { //zoom in so images are high res
    this.click(x('//*[@id="tool-viewlarger"]'));
    this.click(x('//*[@id="tool-viewlarger"]'));
});

casper.then(function() {
    if (casper.cli.args.length === 4) {
        casper.wait(2000, function() {
            var startPage = casper.cli.args[3];
            this.echo('Jumping to page ~' + startPage + ' @ scroll position ' +
                this.evaluate(function(startPage, numPages) {
                    var mainViewer = document.querySelector('#mainViewer');
                    return mainViewer.scrollTop = 417542 * startPage / numPages;
                }, startPage, numPages));
        });
    }
});

casper.then(function() {
    casper.repeat(numPages, function() {
        casper.wait(1000, function() {
            this.click(x('//*[@id="tool-pager-next"]'));
        });
    });
});

casper.on('resource.received', function(resource) {
    var URL = resource.url;
    if (URL.indexOf("docImage.action?") !== -1) { //if it's an image URL
    	page = String("000" + pgNum++).slice(-4);
        var file = page + ".png";
        if (pngFileNames.indexOf(file) === -1 && !fs.exists(file)) {
            try {
                this.echo(file);
                casper.download(URL, file);
                pngFileNames.push(file); // keep track of downloaded PNGs
            } catch (e) {
                this.echo(e);
            }
        }
    }
});

casper.run();
