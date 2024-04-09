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