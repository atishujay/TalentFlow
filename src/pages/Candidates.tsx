import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Mail, Phone, Star, FileText } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import toast from 'react-hot-toast';
import CandidateModal from '../components/CandidateModal';
import CandidateCard from '../components/CandidateCard';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  stage: string;
  experience: number;
  rating: number;
  resumeUrl: string;
  notes: string;
  appliedDate: string;
}

const stages = [
  { id: 'applied', label: 'Applied', color: 'bg-gray-100 border-gray-300' },
  { id: 'screening', label: 'Screening', color: 'bg-blue-100 border-blue-300' },
  { id: 'interview', label: 'Interview', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'offer', label: 'Offer', color: 'bg-green-100 border-green-300' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-100 border-red-300' },
];

export default function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = candidates.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
          candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCandidates(filtered);
    } else {
      setFilteredCandidates(candidates);
    }
  }, [candidates, searchQuery]);

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/candidates');
      const data = await response.json();
      setCandidates(data);
    } catch (error) {
      toast.error('Failed to load candidates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const candidateId = active.id as string;
    const newStage = over.id as string;

    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate || candidate.stage === newStage) return;

    try {
      await fetch(`/api/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });

      setCandidates(
        candidates.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
      );
      toast.success('Candidate moved successfully');
    } catch (error) {
      toast.error('Failed to move candidate');
    }
  };

  const handleSaveCandidate = async (candidateData: Partial<Candidate>) => {
    try {
      if (editingCandidate) {
        const response = await fetch(`/api/candidates/${editingCandidate.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(candidateData),
        });
        const updated = await response.json();
        setCandidates(candidates.map((c) => (c.id === updated.id ? updated : c)));
        toast.success('Candidate updated successfully');
      } else {
        const response = await fetch('/api/candidates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...candidateData,
            stage: 'applied',
            appliedDate: new Date().toISOString(),
          }),
        });
        const newCandidate = await response.json();
        setCandidates([...candidates, newCandidate]);
        toast.success('Candidate added successfully');
      }
      setIsModalOpen(false);
      setEditingCandidate(null);
    } catch (error) {
      toast.error('Failed to save candidate');
    }
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleDeleteCandidate = async (id: string) => {
    try {
      await fetch(`/api/candidates/${id}`, { method: 'DELETE' });
      setCandidates(candidates.filter((c) => c.id !== id));
      toast.success('Candidate removed');
    } catch (error) {
      toast.error('Failed to remove candidate');
    }
  };

  const getCandidatesByStage = (stageId: string) => {
    return filteredCandidates.filter((c) => c.stage === stageId);
  };

  const activeCandidate = candidates.find((c) => c.id === activeId);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Pipeline</h1>
        <p className="text-gray-600">Track candidates through your hiring stages</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={() => {
            setEditingCandidate(null);
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Candidate</span>
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pb-8">
          {stages.map((stage) => {
            const stageCandidates = getCandidatesByStage(stage.id);

            return (
              <div key={stage.id} className="flex flex-col min-h-[500px]">
                <div className={`${stage.color} border-2 rounded-lg p-3 mb-3`}>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{stage.label}</h3>
                  <p className="text-xs text-gray-600">{stageCandidates.length} candidates</p>
                </div>

                <div
                  data-stage={stage.id}
                  className="flex-1 bg-gray-50 rounded-lg p-2 space-y-3 min-h-[400px] border-2 border-dashed border-gray-300"
                >
                  {stageCandidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onEdit={handleEditCandidate}
                      onDelete={handleDeleteCandidate}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeCandidate ? (
            <div className="opacity-80">
              <CandidateCard
                candidate={activeCandidate}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CandidateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCandidate(null);
        }}
        onSave={handleSaveCandidate}
        candidate={editingCandidate}
      />
    </motion.div>
  );
}
