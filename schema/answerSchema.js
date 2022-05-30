const mongoose = require('mongoose')
const Schema = mongoose.Schema


const answerSchema = new Schema({  
    answer: {
        type: String, 
        required: true
    },
    userEmail: {
        type: String, 
        required: true
    }, 
    level: {
        type: String,
        required: true
    },
    isCorrect: {
        type: Boolean, 
        required: true
    }
},{
    timestamps: true

})

const answerModel = mongoose.model('answer', answerSchema)
module.exports = answerModel