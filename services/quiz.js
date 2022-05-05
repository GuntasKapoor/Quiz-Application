const mongoose = require('mongoose');
const {Quiz, SolvedQuiz} = require('../models');
const { ServerError } = require('../utils/helper');
const {
    v4: uuidv4,
} = require('uuid');

async function getQuiz(quizId, userId = null) {
    let quiz = await Quiz.findOne({uniqueId: quizId ,isPublished: true});
    if(!quiz) {
        throw new ServerError('Quiz not found', 404);
    }
    quiz = quiz.toObject();
    // Send answers in case creator requesting for quiz
    if(!userId || quiz.creatorId !== userId) {
        quiz.questions = await quiz.questions.map(({ answers, ...rest }) => rest);
    }
    return quiz;
}


async function saveQuiz(request, creatorId) {
    let {id, title, questions} = request;

    questions.forEach(question => {
        if(question.type === "singleChoice" && question.answers.length > 1) {
            throw new ServerError('Single choice questions cannot have more than one answer', 400);
        }
    });

    if(id) {
        const quiz = await Quiz.findOne({
            uniqueId: id
        });

        if(quiz) {
            if (quiz.isPublished) {
                throw new ServerError('Quiz cannot be edited once published', 400);
            }

            if (quiz.creatorId !== creatorId) {
                throw new ServerError('User unauthorized', 403);
            }

            await Quiz.updateOne({_id: id}, {questions: questions})
            return {message: "Quiz updated!!"};
        }
    }
    // generate unique question IDs
    questions = questions.map(question => {
        return {id: uuidv4(), ...question}
    });
    const uuid = uuidv4();
    const newQuiz = new Quiz({
        title: title,
        creatorId: creatorId,
        uniqueId: uuid,
        questions: questions,
        isPublished: false
    });

    await newQuiz.save();
    return {message: "Quiz created!!", quizId: uuid};
}

async function publishQuiz(quizId, userId) {
    if(!userId) {
        throw new ServerError('UserId not provided', 400);
    }
    let quiz = await Quiz.findOne({uniqueId: quizId, creatorId: userId});
    if(!quiz) {
        throw new ServerError('Quiz not found', 404);
    }
    if(quiz.isPublished) {
        throw new ServerError('Already Published', 400);
    }
    quiz.isPublished = true;
    await quiz.save();
    return {message: "Successfully published"};
}

async function deleteQuiz(quizId, userId) {
    if(!userId) {
        throw new ServerError('UserId not provided', 400);
    }
    let response = await Quiz.deleteOne({uniqueId: quizId, creatorId: userId});
    if(!response.deletedCount) {
        throw new ServerError('Quiz not found', 404);
    }
    return {message: "Successfully Deleted"};
}

async function submitAnswers(quizId, solverId, answers) {
    const isQuizAlreadySubmittedByUser = await SolvedQuiz.findOne({uniqueId: quizId, solverId: solverId});
    if(isQuizAlreadySubmittedByUser) {
        throw new ServerError("Quiz already submitted", 404);
    }
    const quiz = await Quiz.findOne({uniqueId: quizId, isPublished: true});
    if(!quiz) {
        throw new ServerError("Quiz not found", 404);
    }
    let quizObject = quiz.toObject();
    validateSubmitAnswersData(quizObject, answers);

    let questionMap = {};
    quizObject.questions.forEach(question => {
        questionMap[question.id] = question;
    });

    // Calculate score per question and total score
    let totalScore = 0.0;
    answers.forEach(answer => {
       const selectedChoices = answer.selectedChoices;
       const questionType = questionMap[answer.questionId].type;
       const correctChoices = questionMap[answer.questionId].answers;
       const correctChoiceWeight = 1.0 / correctChoices.length;
       const totalChoices = questionMap[answer.questionId].options.length;
       const incorrectChoiceWeight = questionType === "singleChoice" ? 1.0 : 1.0/(totalChoices - correctChoices.length);
       let scoreForQuestion = 0.0;
       selectedChoices.forEach(selectedChoice => {
           if(correctChoices.includes(selectedChoice)) {
               scoreForQuestion += correctChoiceWeight;
           } else {
               scoreForQuestion -= incorrectChoiceWeight;
           }
       })
        answer.score = scoreForQuestion;
        totalScore += scoreForQuestion;
    });

    const answerSubmission = new SolvedQuiz({
        solverId: solverId,
        creatorId: quiz.creatorId,
        quizId: quizId,
        answers: answers,
        totalScore: totalScore
    });

    await answerSubmission.save();
    return {message: "Successfully Submitted"};
}

function validateSubmitAnswersData(quizObject, answers) {
    if(quizObject.questions.length !== answers.length) {
        throw new ServerError("Attempt all questions", 400);
    }

    let answersMap = {};
    // validate response questions
    const questionIds = quizObject.questions.map(question => question.id);
    const submittedQuestionIds = answers.map(answer => {
        answersMap[answer.questionId] = answer;
        return answer.questionId
    });

    if(questionIds.sort().join(',') !== submittedQuestionIds.sort().join(',')){
        throw new ServerError("questions attempted not same as in quiz", 400);
    }

    // validate if any answer of question exceeds number of options
    quizObject.questions.forEach(question => {
        // validation for single choice questions
       if(question.type === "singleChoice" && answersMap[question.id].selectedChoices.length > 1) {
           throw new ServerError("Single choice question " + question.title , 400);
       }

       if(answersMap[question.id].selectedChoices.length > question.options.length) {
           throw new ServerError("Invalid answers", 400);
       }
        //validates if the choices given are in the options or not
        const optionIds = question.options.map(option => {
            return option.id;
        });
        answersMap[question.id].selectedChoices.forEach(choice => {
           if(!optionIds.includes(choice)) {
               throw new ServerError("Invalid answer for question " + question.title, 400);
           }
       });
    });
    return {isValid: true};
}

async function getUnsolvedQuizzesForUser(userId) {
    const alreadySolvedQuizIds = await SolvedQuiz.find({solverId: Object(userId)}).select('quizId');
    console.log(typeof alreadySolvedQuizIds);
    const response = await Quiz.find({uniqueId: {$nin: [...alreadySolvedQuizIds]}, creatorId: {$ne: userId}}).select({uniqueId: 1, title: 1});
    let unsolvedQuizzes = response.map(element => {
        return {quizId: element.uniqueId, title: element.title};
    });
    return unsolvedQuizzes;
}

module.exports = {
    getQuiz,
    saveQuiz,
    publishQuiz,
    deleteQuiz,
    submitAnswers,
    getUnsolvedQuizzesForUser
};