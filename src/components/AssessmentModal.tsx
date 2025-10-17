import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';

interface Question {
  id: string;
  type: string;
  question: string;
  points: number;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  duration: number;
  questions: Question[];
  passingScore: number;
}

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assessment: Partial<Assessment>) => void;
  assessment: Assessment | null;
}

export default function AssessmentModal({ isOpen, onClose, onSave, assessment }: AssessmentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    passingScore: 70,
    questions: [] as Question[],
  });

  useEffect(() => {
    if (assessment) {
      setFormData({
        title: assessment.title,
        description: assessment.description,
        duration: assessment.duration,
        passingScore: assessment.passingScore,
        questions: assessment.questions,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        duration: 60,
        passingScore: 70,
        questions: [],
      });
    }
  }, [assessment, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }
    onSave(formData);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'multiple-choice',
      question: '',
      points: 10,
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setFormData({
      ...formData,
      questions: formData.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      ),
    });
  };

  const removeQuestion = (id: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((q) => q.id !== id),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black bg-opacity-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {assessment ? 'Edit Assessment' : 'Create Assessment'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assessment Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Frontend Development Assessment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe what this assessment evaluates..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      required
                      min="5"
                      max="300"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={formData.passingScore}
                      onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Questions</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {formData.questions.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 text-sm">No questions yet. Click "Add Question" to start building your assessment.</p>
                    </div>
                  ) : (
                    formData.questions.map((question, index) => (
                      <motion.div
                        key={question.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="font-bold text-gray-900">Question {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeQuestion(question.id)}
                            className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Question Type
                            </label>
                            <select
                              value={question.type}
                              onChange={(e) => updateQuestion(question.id, { type: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                              <option value="multiple-choice">Multiple Choice</option>
                              <option value="short-answer">Short Answer</option>
                              <option value="coding">Coding Challenge</option>
                              <option value="essay">Essay</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Question Text
                            </label>
                            <textarea
                              required
                              value={question.question}
                              onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="Enter your question..."
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Points
                            </label>
                            <input
                              type="number"
                              required
                              min="1"
                              max="100"
                              value={question.points}
                              onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {formData.questions.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-medium">Total Questions:</span>
                      <span className="text-gray-900 font-bold">{formData.questions.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-700 font-medium">Total Points:</span>
                      <span className="text-gray-900 font-bold">
                        {formData.questions.reduce((sum, q) => sum + q.points, 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  {assessment ? 'Update Assessment' : 'Create Assessment'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
