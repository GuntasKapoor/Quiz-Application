const Joi = require('joi');

module.exports = {

    getStatisticsForUserQuiz: {
        params:Joi.object().keys({
            quizId: Joi.string().required()
        })
    }

};