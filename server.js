//============================================================
//Dependencies
//============================================================
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var logger = require('morgan');
var PORT = process.env.PORT || 3000;

//Article and Note models
var Note = require('./models/note.js');
var Article = require('./models/article.js');

//Scraping Tools
var request = require('request');
var cheerio = require('cheerio');

//Mongoose JS ES6 Promise Method
mongoose.Promise = Promise;

//Initialize Express
var app = express();

//Morgan and Body Parser
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));

//Public Static Directory
app.use(express.static('public'));

//Database Config with Mongoose
mongoose.connect("mongodb://heroku_cvb597bp:rmtusmnj7f2amua331o536t1r1@ds159493.mlab.com:59493/heroku_cvb597bp");
var db = mongoose.connection;

//Mongoose Errors
db.on('error', function(error){
    console.log('Mongoose Error: ', error);
});

//Connection Successful Message
db.once('open', function(){
    console.log('Mongoose Connection Successful');
});

//============================================================
//Routes
//============================================================

//GET Request to Scrape Website
app.get('scrape', function(req, res){
    //First, grab body of html with request
    request("https://www.wsj.com/", function(error, response, hrml){
        //Then, load into Cheerio and save to '$' as shorthand selector
        var $ = cheerio.load(html);
        //Grab every h2 with article tag and do the following...
        $('article h2').each(function(i, element){
            //Save result to empty result object
            var result = {};
            //Add text and href of each link, save them as properites of result object
            result.title = $(this).children('a').text();
            result.link = $(this).children('a').attr('href');
            //Use Article model to create new entry
            //Passes result object to the entry (title and link included)
            var entry = new Article(result);
            //Save entry to database
            entry.save(function(err, doc){
                if (err) {
                    console.log(err);
                } else {
                    console.log(doc);
                }
            });
        });
    });
    //Tells Browser Scraping Complete
    res.send('Scrape Complete');
});

//Get articles scraped from MongoDB
app.get('/articles', function(req, res){
    //Grab all Docs in Articles Array
    Article.find({}, function(error, doc){
        if (error) {
            console.log(error);
        } else {
            res.json(doc);
        }
    });
});

//Grab Article by ObjectId
app.get('/articles/:id', function(req, res){
    Article.findOne({'_id': req.params.id })
    
    .populate('note')

    .exec(function(error, doc){
        if (error) {
            console.log(error);
        } else {
            //WHY DOES THIS WORK IN THE ACTIVITY BUT NOT HERE?
            console.log(res.json(doc));
        }
    });
});

//Create a new note or replace an existing one
app.post('/articles/:id', function(req, res){
    //Create new note, pass req.body to the entry
    var newNote = new Note(req.body);

    //And save new note to DB
    newNote.save(function(error, doc){
        if (error) {
            console.log(error);
        } else {
            //Use the article ID to find/update note
            Article.findOneAndUpdate({ '_id': req.params.id }, { "note": doc._id })
            //Execute query
            .exec(function(err, doc){
                if (err) {
                    console.log(err);
                } else {
                    //Send doc to browser
                    res.send(doc);
                }
            });
        }
    });
});


// Listen on port 3000
app.listen(PORT, function() {
  console.log("App Running on Port 3000");
});
