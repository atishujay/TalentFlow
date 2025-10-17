import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Clock, Eye, Edit2, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import AssessmentModal from '../components/AssessmentModal';

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
  createdAt: string;
}

export default function Assessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [previewAssessment, setPreviewAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = assessments.filter(
        (assessment) =>
          assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          assessment.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAssessments(filtered);
    } else {
      setFilteredAssessments(assessments);
    }
  }, [assessments, searchQuery]);

  const fetchAssessments = async () => {
    try {
      const response = await fetch('/api/assessments');
      const data = await response.json();
      setAssessments(data);
    } catch (error) {
      toast.error('Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAssessment = async (assessmentData: Partial<Assessment>) => {
    try {
      if (editingAssessment) {
        const response = await fetch(`/api/assessments/${editingAssessment.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assessmentData),
        });
        const updated = await response.json();
        setAssessments(assessments.map((a) => (a.id === updated.id ? updated : a)));
        toast.success('Assessment updated successfully');
      } else {
        const response = await fetch('/api/assessments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...assessmentData,
            createdAt: new Date().toISOString(),
          }),
        });
        const newAssessment = await response.json();
        setAssessments([...assessments, newAssessment]);
        toast.success('Assessment created successfully');
      }
      setIsModalOpen(false);
      setEditingAssessment(null);
    } catch (error) {
      toast.error('Failed to save assessment');
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!confirm('Delete this assessment?')) return;

    try {
      await fetch(`/api/assessments/${id}`, { method: 'DELETE' });
      setAssessments(assessments.filter((a) => a.id !== id));
      toast.success('Assessment deleted');
    } catch (error) {
      toast.error('Failed to delete assessment');
    }
  };

  const handleEditAssessment = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    setIsModalOpen(true);
  };

  const getTotalPoints = (questions: Question[]) => {
    return questions.reduce((sum, q) => sum + q.points, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessments</h1>
        <p className="text-gray-600">Create and manage candidate assessments</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search assessments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={() => {
            setEditingAssessment(null);
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>New Assessment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssessments.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No assessments found</p>
          </div>
        ) : (
          filteredAssessments.map((assessment) => (
            <motion.div
              key={assessment.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{assessment.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{assessment.description}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{assessment.duration} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{assessment.questions.length} questions</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Points:</span>
                  <span className="font-medium text-gray-900">
                    {getTotalPoints(assessment.questions)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Passing Score:</span>
                  <span className="font-medium text-gray-900">{assessment.passingScore}%</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setPreviewAssessment(assessment)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => handleEditAssessment(assessment)}
                  className="flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteAssessment(assessment.id)}
                  className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AssessmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAssessment(null);
        }}
        onSave={handleSaveAssessment}
        assessment={editingAssessment}
      />

      {previewAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewAssessment(null)}
            className="absolute inset-0 bg-black bg-opacity-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">{previewAssessment.title}</h2>
              <button
                onClick={() => setPreviewAssessment(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Eye className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-600 mb-4">{previewAssessment.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{previewAssessment.duration} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>{previewAssessment.questions.length} questions</span>
                  </div>
                  <span>Passing: {previewAssessment.passingScore}%</span>
                </div>
              </div>

              <div className="space-y-6">
                {previewAssessment.questions.map((question, index) => (
                  <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-bold text-gray-900">Question {index + 1}</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            {question.type}
                          </span>
                        </div>
                        <p className="text-gray-700">{question.question}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-600 ml-4">
                        {question.points} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setPreviewAssessment(null)}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
