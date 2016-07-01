// This is a template for a Node.js scraper on morph.io (https://morph.io)

var cheerio = require("cheerio");
var request = require("request");
var sqlite3 = require("sqlite3").verbose();

function initDatabase(callback) {
	// Set up sqlite database.
	var db = new sqlite3.Database("data.sqlite");
	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS data (name TEXT)");
		callback(db);
	});
}

function updateRow(db, value) {
	// Insert some data.
	var statement = db.prepare("INSERT INTO data VALUES (?)");
	statement.run(value);
	statement.finalize();
}

function readRows(db) {
	// Read some data.
	db.each("SELECT rowid AS id FROM data", function(err, row) {
		console.log(row);
	});
}

function fetchPage(url, callback) {
	// Use request to read in pages.
	request(url, function (error, response, body) {
		if (error) {
			console.log("Error requesting page: " + error);
			return;
		}

		callback(body);
	});
}

function run(db) {
	// Use request to read in pages.
	var year = 1977;
	var page = ['http://archiv.bachmannpreis.orf.at/25_jahre/',year,'/autoren_',year,'.htm'];
	while (year < 2001) {
		fetchPage(page.join(), function (body) {
			// Use cheerio to find things in the page with css selectors.
			var $ = cheerio.load(body);
			var elements = $("p.Standardbold").each(function () {
				console.log("this",$(this));
				var value = $(this).text().trim();
				console.log("value",value);
				updateRow(db, value);
			});
			readRows(db);
		});
		year++;
	}
	db.close();
}

initDatabase(run);
