import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Mail, Phone, Star, Edit2, Trash2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  stage: string;
  experience: number;
  rating: number;
  appliedDate: string;
}

interface CandidateCardProps {
  candidate: Candidate;
  onEdit: (candidate: Candidate) => void;
  onDelete: (id: string) => void;
}

export default function CandidateCard({ candidate, onEdit, onDelete }: CandidateCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: candidate.id,
    data: { type: 'candidate', candidate },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">{candidate.name}</h4>
          <p className="text-xs text-gray-600 truncate">{candidate.position}</p>
        </div>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < candidate.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <Mail className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{candidate.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <Phone className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{candidate.phone}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <Calendar className="w-3 h-3 flex-shrink-0" />
          <span>Applied {formatDate(candidate.appliedDate)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <span className="text-xs text-gray-600 font-medium">
          {candidate.experience}+ years exp
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(candidate);
            }}
            className="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Remove this candidate?')) {
                onDelete(candidate.id);
              }
            }}
            className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
