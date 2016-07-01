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
	db.each("SELECT rowid AS id, value, year FROM data", function(err, row) {
		if (row) console.log("row",row.id,row.year,row.value);
	});
}

function fetchPage(url, year, callback) {
	// Use request to read in pages.
	request(url, function (error, response, body) {
		if (error) {
			console.log("Error requesting page: " + error);
			return;
		}

		callback(body, year);
	});
}

function run(db) {
	// Use request to read in pages.
	var year = 1977;
	var page, url;
	while (year < 2001) {
		page = ['http://archiv.bachmannpreis.orf.at/25_jahre/',year,'/autoren_',year,'.htm'];
		url = page.join("");
		console.log(url);
		fetchPage(url, year, function (body, year) {
			// Use cheerio to find things in the page with css selectors.
			var $ = cheerio.load(body);
			var elements = $("p.Standardbold").each(function () {
				var value = $(this).text().trim();
				console.log(year,value);
				updateRow(db, year);
				updateRow(db, value);
			});
			readRows(db);
			db.close();
		});
		year++;
	}
}

initDatabase(run);
