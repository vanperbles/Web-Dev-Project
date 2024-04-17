const mongoose = require('mongoose');
var validator = require('validator');


// email, name, password, confirmpassword
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please enter your name.']
    },
    email:{
        type: String,
        required: [true, 'Please enter your email.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter your email.'] 
    },
    password:{
        type: String,
        required: [true, 'Please enter your password.'],
        minlength: 8
    }
    

})

const user = mongoose.model("User", userSchema);

module.exports = user;