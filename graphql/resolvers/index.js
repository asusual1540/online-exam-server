const adminResolver = require('./admin');
const teacherResolver = require('./teacher');
const studentResolver = require('./student');
const questionResolver = require('./question');
const examResolver = require('./exam');
const answerResolver = require('./answer');

const rootResolver = {
  ...adminResolver,
  ...teacherResolver,
  ...studentResolver,
  ...questionResolver,
  ...examResolver,
  ...answerResolver
};

module.exports = rootResolver;