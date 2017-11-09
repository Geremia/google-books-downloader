var pngFileNames = []; //array of PNG files downloaded
var page; //running page number
var casper = require('casper').create({
    verbose: false,
    logLevel: "debug",
    pageSettings: {
        webSecurityEnabled: false
    },
	viewportSize: {
       width: 1024,
       height: 600
   }	
});
var x = require('casper').selectXPath;
var fs = require('fs');

//Get the Google Books ID from the command line:
casper.cli.drop("cli");
casper.cli.drop("casper-path");
if (casper.cli.args.length < 2) {
    casper.echo("Please pass the institution ID (e.g., UAZ) and ProQuest ID (e.g., 4592423) to the command line.").exit();
}
var url = 'https://ebookcentral.proquest.com/lib/' + casper.cli.args[0] + '/reader.action?docID=' + casper.cli.args[1];

casper.start(url);

casper.on('resource.received', function(resource) {
    var URL = resource.url;
    if (URL.indexOf("remoteDocServer.api") !== -1) { //parse page number
        var pgNum = URL.substring(URL.indexOf("&pageNum=") + 9, URL.indexOf("&tmpOpt"));
        page = String("000" + pgNum).slice(-4);
    } else if (URL.indexOf("docImage.action?") !== -1) { //if it's an image URL
        var file = page + ".png";
        if (pngFileNames.indexOf(file) === -1 && !fs.exists(file)) {
            try {
    		this.echo(file + ' ' + URL);
                casper.download(URL, file);
                pngFileNames.push(file); // keep track of downloaded PNGs
            } catch (e) {
                this.echo(e);
            }
        }
    } else {
	    casper.wait(1000, function() {
                this.click(x('//*[@id="tool-pager-next"]'));
	    });
    }
});

casper.run();
