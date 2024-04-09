const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MovieSchema = new Schema({
    plot: { type: String, required: true },
    genres: { type: [String], default: [] },
    runtime: Number,
    rated: String,
    cast: { type: [String], default: [] },
    num_mflix_comments: Number,
    poster: String,
    title: String,
    fullplot: String,
    countries: { type: [String], default: [] },
    released: Date,
    directors: { type: [String], default: [] },
    writers: { type: [String], default: [] },
    awards: {
        wins: Number,
        nominations: Number,
        text: String
    },
    lastupdated: Date,
    year: Number,
    imdb: {
        rating: Number,
        votes: Number,
        id: Number
    },
    type: String,
    tomatoes: {
        viewer: {
            rating: Number,
            numReviews: Number,
            meter: Number
        },
        production: String,
        lastUpdated: Date
    }
});


module.exports = mongoose.model('Movie', MovieSchema);

