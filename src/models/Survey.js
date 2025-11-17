const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['text','single','multi'], required: true },
  options: [{ type: String }]
});

const SurveySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  questions: [QuestionSchema],
  meta: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('Survey', SurveySchema);
