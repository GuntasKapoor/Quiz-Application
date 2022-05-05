const express = require('express');
const router = express.Router();

const {
    v1: { quiz }
} = require('../../controller');

router.route('/').post(quiz.saveQuiz);
router.route('/:quizId').delete(quiz.deleteQuiz);
router.route('/:quizId/publish').put(quiz.publishQuiz);
router.route('/unsolved').get(quiz.getUnsolvedQuizzesForUser);
router.route('/:quizId').get(quiz.getQuiz);
router.route('/:quizId/submit').post(quiz.submitAnswers);

module.exports = router;