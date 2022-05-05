const mongoose = require('mongoose');

const solvedQuizSchema = mongoose.Schema(
    {
        solverId: {type: String, required: true},
        creatorId: {type: String, required: true},
        quizId: {type: String, required: true},
        answers: [{
            questionId: {type: String, required: true},
            selectedChoices: [{type:Number}],
            score: {type: Number, required: true},
            _id: false
        }],
        totalScore: {type: Number, required: true},
    },
    { timestamps: true }
);

const collection = 'solvedQuizzes';
const SolvedQuiz = mongoose.model('SolvedQuiz', solvedQuizSchema, collection);

module.exports = SolvedQuiz;