const { quiz } = require('../../request-schema/v1');
const { quiz: quizService } = require('../../../services');
const { verifyRequestSchema, createResponse } = require('../../../utils/helper');
module.exports = {

    getQuiz: verifyRequestSchema(async (req, res, next) =>  {
        try {
            const userId = res.locals.user.userId;
            const {quizId} = req.params;
            const response = await quizService.getQuiz(quizId, userId);
            res.json(createResponse(true, null, { response }));
        } catch (error) {
            next(error);
        }
    }, quiz.getQuiz),


    saveQuiz: verifyRequestSchema(async (req, res, next) => {
        try {
            const userId = res.locals.user.userId;
            const response = await quizService.saveQuiz(req.body, userId);
            res.json(createResponse(true, null, { response }));
        } catch (error) {
            next(error);
        }
    }, quiz.saveQuiz),

    publishQuiz: verifyRequestSchema(async(req, res, next) => {
        try {
            const {quizId} = req.params;
            const userId = res.locals.user.userId;
            const response = await quizService.publishQuiz(quizId, userId);
            res.json(createResponse(true, null, { response }));
        } catch (error) {
            next(error);
        }
    }, quiz.publishQuiz),

    deleteQuiz: verifyRequestSchema(async(req, res, next) => {
        try {
            const {quizId} = req.params;
            const userId = res.locals.user.userId;
            const response = await quizService.deleteQuiz(quizId, userId);
            res.json(createResponse(true, null, { response }));
        } catch (error) {
            next(error);
        }
    }, quiz.deleteQuiz),

    submitAnswers: verifyRequestSchema(async(req, res, next) => {
        try {
            const userId = res.locals.user.userId;
            const {answers} = req.body;
            const {quizId} = req.params;
            const response = await quizService.submitAnswers(quizId, userId, answers);
            res.json(createResponse(true, null, { response }));
        } catch (error) {
            next(error);
        }
    }, quiz.submitAnswers),

    getUnsolvedQuizzesForUser: async(req, res, next) => {
        try{
            const userId = res.locals.user.userId;
            const response = await quizService.getUnsolvedQuizzesForUser(userId);
            res.json(createResponse(true, null, { response }));
        } catch (error) {
            next(error);
        }
    }

}