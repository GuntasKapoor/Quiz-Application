const express = require('express');
const router = express.Router();

const {
    v1: { user }
} = require('../../controller');

router.route('/solved').get(user.getSolvedQuizzes);
router.route('/quiz').get(user.getQuizzes);
router.route('/quiz/:quizId').get(user.getSolutionsForUserQuiz);

module.exports = router;