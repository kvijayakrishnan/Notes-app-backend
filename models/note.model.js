const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title:{
        type:String,
        require:true,
    },
    content:{
        type:String,
        require:true,
    },
    tags:{
        type:[String],
        default:[],
    },
    isPinned:{
        type:Boolean,
        default:false,
    },
    userId:{
        type:mongoose.SchemaTypes.ObjectId,
        require:true,
        ref:'User'
    },
    createdOn:{
        type:Date, 
        default: new Date().getTime()
    },
})

module.exports = mongoose.model('Note', noteSchema)


