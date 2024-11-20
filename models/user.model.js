const mongoose =require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        require:true,
        unique:true,
    },
    email:{
        type:String,
        require:true,
        unique:true,
    },
    password:{
        type:String,
        require:true,
    },
    createdOn:{
        type:Date, 
        default:new Date().getTime()

    }
})

const User = mongoose.model('User', userSchema)
module.exports =User;




