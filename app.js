// Importing the needed files 
var express = require('express')
var mongoose = require('mongoose')
var app = express()
const path = require('path')
const exphbs = require('express-handlebars');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file
var methodOverride = require('method-override')
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken')

// pass the request we will be loading 
var bodyParser = require('body-parser');
// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride('_method'));

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
var Movie = require('./models/movie');
var User = require('./models/user');
const { title } = require('process');
const authenticateToken = require('./middleware/authMiddleware')

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


// Routes
// POST /api/Movies
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


app.get('/api/movies/signup', async(req, res) =>{
    res.render('partials/signup')
});
  
app.get('/api/movies/login', async(req, res) =>{
    res.render('partials/login')
});
  

// GET /api/Movies/:Id
app.get('/api/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id).lean().exec();
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.render('partials/detail', {title:"Detail view ", data:movie});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API Create 
app.post('/api/movies/data', async (req, res) =>{
    try{
        console.log(req.body);

        const movie = await Movie.create({
            plot: req.body.plot,
            title: req.body.title,
            runtime: req.body.runtime
        })

        const movies = await Movie.findById(movie._id).lean().exec();

        res.json(movies)

    }catch(err){
        res.status(500).send(err.message);

    }
});


// GEt /api/Movies/:Id
app.get('/api/movies/edit/:id', authenticateToken, async (req, res) => {
    try {
        const updatedMovie = await Movie.findOne({_id:req.params.id}, req.body, { new: true }).lean().exec();
        if (!updatedMovie) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.render('partials/edit', {title:"Edit View", data:updatedMovie});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT //api/movies/edit/:id
app.put('/api/movies/edit/:id', async (req, res) => {
    try {
        
        await Movie.findByIdAndUpdate(req.params.id,{
            plot: req.body.plot,
            title: req.body.title,
            runtime: req.body.runtime

        });

        res.redirect(`/api/movies/edit/${req.params.id}`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/Movies/:Id
app.delete('/api/movies/delete/:id', async (req, res) => {
    try {
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
        if (!deletedMovie) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.redirect('/');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SignUp
app.post('/api/movies/signup', async (req, res) => {
    try {
      const { name, email, password, confirmPassword } = req.body;
  
      // Check if passwords match
      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);      
  
      // Create new user
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();
  
      res.redirect('/api/movies/login');
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  


  app.post('/api/movies/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Generate JWT
      const token = jwt.sign({ userId: user._id }, process.env.SECRETKEY, { expiresIn: '1h' });
      
  
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  });



  



  // Define a wildcard route to handle any other paths
app.get('*', function(req, res) {
// Render the 'partials/error.hbs' template with the provided data for any other routes
res.send('Error');

});
  
// Start the Express application and listen on the specified port
app.listen(port, () => {
console.log(`Example app listening at http://${hostname}:${port}`);
});