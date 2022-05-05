const { User } = require('../models');
const { isDuplicateKeyError, ServerError } = require('../utils/helper');
const {SolvedQuiz, Quiz} = require('../models');
/**
 * Create user
 * for initial setup
 * @param {String} email
 * @param {String} password
 */
async function createAndSetupUser(email, password) {
    try {
        const user = new User({ email, password });
        await user.save();
    } catch (error) {
        if (isDuplicateKeyError(error.message)) {
            throw new ServerError(error, 400, 'User already exists');
        }
        throw error;
    }
}

async function getSolvedQuizzes(userId) {
    const solvedQuizzes = await SolvedQuiz.find({solverId: userId});
    if(!solvedQuizzes || !solvedQuizzes.length) {
        throw new ServerError("No solved quiz found for user", 404);
    }
    return solvedQuizzes;
}

async function getSolutionsForUserQuiz(userId) {
    const solvedQuizzes = await SolvedQuiz.find({creatorId: userId});
    if(!solvedQuizzes || !solvedQuizzes.length) {
        throw new ServerError("No solutions found for this quiz", 404);
    }
    return solvedQuizzes;
}

async function getQuizzes(userId) {
    const quizzes = await Quiz.find({creatorId: userId}).select('uniqueId');
    return quizzes;
}


module.exports = {
    createAndSetupUser,
    getSolvedQuizzes,
    getSolutionsForUserQuiz,
    getQuizzes
};