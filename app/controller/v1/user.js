const { user } = require('../../request-schema/v1');
const { user: userService } = require('../../../services');
const { verifyRequestSchema, createResponse } = require('../../../utils/helper');
module.exports = {

    getSolvedQuizzes: async(req, res, next) => {
        try {
            const userId = res.locals.user.userId;
            const response = await userService.getSolvedQuizzes(userId);
            res.json(createResponse(true, null, { response }));
        } catch (error) {
            next(error);
        }
    },

    getSolutionsForUserQuiz: verifyRequestSchema(async(req, res, next) => {
        try{
            const userId = res.locals.user.userId;
            const {quizId} = req.params;
            const response = await userService.getSolutionsForUserQuiz(userId, quizId);
            res.json(createResponse(true, null, { response }));
        } catch (error) {
            next(error);
        }
    }, user.getStatisticsForUserQuiz),

    getQuizzes: async(req, res, next) => {
        try{
            const userId = res.locals.user.userId;
            const response = await userService.getQuizzes(userId);
            console.log(response);
            res.json(createResponse(true, null, { response }));
        } catch (error) {
            next(error);
        }
    }
}