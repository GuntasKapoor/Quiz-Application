const Joi = require('joi');

module.exports = {
    getQuiz: {
        params:Joi.object().keys({
            quizId: Joi.string().required()
        })
    },

    saveQuiz: {
        body: Joi.object().keys({
        id: Joi.string(),
        title: Joi.string().required(),
        questions: Joi.array().items(
            Joi.object().keys({
            title: Joi.string().required(),
            type: Joi.string().valid("multipleChoice", "singleChoice").required(),
            options: Joi.array().items(Joi.object().keys({
                id: Joi.number().required(),
                display: Joi.string().required()
            })).required(),
            answers: Joi.array().min(1).max(5)
        }).required()
        ).min(1).max(10)
    })
    },

    publishQuiz: {
        params:Joi.object().keys({
            quizId: Joi.string().required()
        })
    },

    deleteQuiz: {
        params:Joi.object().keys({
            quizId: Joi.string().required()
        })
    },

    submitAnswers: {
        params:Joi.object().keys({
            quizId: Joi.string().required()
        }),
        body: Joi.object().keys({
            answers: Joi.array().items(Joi.object().keys({
                questionId: Joi.string().required(),
                selectedChoices: Joi.array().items(
                    Joi.number()
                ).required()
            }))
        })
    },

};