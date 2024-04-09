// Importing the needed files 
var express = require('express')
var mongoose = require('mongoose')
var app = express()
const path = require('path')
const exphbs = require('express-handlebars');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file

// pass the request we will be loading 
var bodyParser = require('body-parser');
// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// connecting my hostname and port

const hostname = process.env.HOST;
const port = process.env.PORT;

// Register a custom Handlebars helper
const hbs = exphbs.create({
    extname: '.hbs',
  });
  
  // Register the Handlebars engine with Express
  app.engine('hbs', hbs.engine);

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'handlebars');

  
  // Set the default view engine to Handlebars
  app.set('view engine', 'hbs');

// Middleware
// Initialize built-in middleware for urlencoding and json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));



// connecting to flie
var database = require('./config/conn')
var Movie = require('./models/movie')

// connection to the database 

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
};



mongoose.connect(process.env.db);
let myDB = mongoose.connection

myDB.once("open", function(){
    console.log("Connected to Atlas Cloud DataBase");
});

myDB.on("error", function(){
    console.log("Error connecting to database");
})

app.get("/", async (req, res) => {
    const perPage = 5; // Number of items per page
    let page = parseInt(req.query.page) || 1; // Current page, default to 1
    let title = req.query.title; // Optional title parameter for filtering

    try {
        let query = {};

        // If title is provided, add it to the query
        if (title) {
            query.title = title;
        }

        // Count total number of documents matching the query
        const totalMovies = await Movie.countDocuments(query);

        // Calculate total number of pages
        const totalPages = Math.ceil(totalMovies / perPage);

        // Ensure page number is within valid range
        page = Math.min(Math.max(1, page), totalPages);

        // Calculate skip value
        const skip = (page - 1) * perPage;

        // Find movies based on the query, sorted by Movie_id, and limited to perPage
        const movieList = await Movie.find(query)
            .sort({ Movie_id: 1 }) // Sorting by Movie_id in ascending order
            .skip(skip)
            .limit(perPage)
            .lean() // Convert Mongoose documents to plain JavaScript objects
            .exec();

        // Calculate nextPage and prevPage
        const nextPage = page < totalPages ? page + 1 : null;
        const prevPage = page > 1 ? page - 1 : null;

        res.render('partials/index', {
            title: "Web API",
            data: movieList,
            page: page,
            totalPages: totalPages,
            nextPage: nextPage,
            prevPage: prevPage
        });
    } catch (err) {
        res.render('partials/error', { title: 'Error', message: err });
    }
});



// Define route to fetch movies data
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.find({}).lean().exec();

        // Check if movies were found
        if (!movies || movies.length === 0) {
            return res.status(404).json({ message: 'No movies found' });
        }
      res.json(movies);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

//   app.post('/api/movies/data', async (req, res) =>{
//     try{
//         console.log(req.body);

//         const church = await Movie.create({
//             name: req.body.name
//         })

//         const churchs = await Movie.find();

//         res.json(churchs)

//     }catch(err){
//         res.status(500).send(err.message);

//     }
//   });



  // Define a wildcard route to handle any other paths
app.get('*', function(req, res) {
// Render the 'partials/error.hbs' template with the provided data for any other routes
res.send('Error');

});
  
// Start the Express application and listen on the specified port
app.listen(port, () => {
console.log(`Example app listening at http://${hostname}:${port}`);
});