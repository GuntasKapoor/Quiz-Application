const mongoose = require('mongoose');
const { questionTypes } = require('../utils/constants');

const quizSchema = mongoose.Schema(
    {
        creatorId: {type: String, required: true, index: true},
        uniqueId: {type:String, required: true, index: true},
        title: {type:String, required: true},
        questions: [{
            _id: false,
            id: String,
            title: {type: String, required: true},
            type: {type: String,
            enum: {
                values: questionTypes,
                message: '{VALUE} is not supported'
            },
            required: true
            },
            options: [{
                _id: false,
                id: {type: Number, required: true},
                display: {type: String, required : true}
            }],
            answers: [{type: Number, required: true}]
        }],
        isPublished: {type: Boolean, required: true}
    },
    { timestamps: true }
);

const collection = 'quizzes';
const Quiz = mongoose.model('Quiz', quizSchema, collection);

module.exports = Quiz;