import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, GripVertical, Edit2, Archive, MapPin, DollarSign, Users } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import JobModal from '../components/JobModal';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: string;
  description: string;
  requirements: string;
  salary: string;
  applicants: number;
  order: number;
}

function SortableJobCard({ job, onEdit, onArchive }: { job: Job; onEdit: (job: Job) => void; onArchive: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all ${
        job.status === 'archived' ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h3>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className="font-medium">{job.department}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                <span>{job.type}</span>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                job.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {job.status}
            </span>
          </div>

          <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>{job.salary}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{job.applicants} applicants</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(job)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onArchive(job.id)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              <Archive className="w-4 h-4" />
              <span>{job.status === 'archived' ? 'Unarchive' : 'Archive'}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    let filtered = jobs;

    if (filterStatus !== 'all') {
      filtered = filtered.filter((job) => job.status === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, searchQuery, filterStatus]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      const sortedJobs = data.sort((a: Job, b: Job) => a.order - b.order);
      setJobs(sortedJobs);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = jobs.findIndex((job) => job.id === active.id);
      const newIndex = jobs.findIndex((job) => job.id === over.id);

      const newJobs = arrayMove(jobs, oldIndex, newIndex);
      setJobs(newJobs);

      try {
        await fetch('/api/jobs/reorder', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobs: newJobs }),
        });
        toast.success('Jobs reordered');
      } catch (error) {
        toast.error('Failed to reorder jobs');
        fetchJobs();
      }
    }
  };

  const handleSaveJob = async (jobData: Partial<Job>) => {
    try {
      if (editingJob) {
        const response = await fetch(`/api/jobs/${editingJob.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobData),
        });
        const updatedJob = await response.json();
        setJobs(jobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)));
        toast.success('Job updated successfully');
      } else {
        const response = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...jobData, status: 'active', applicants: 0 }),
        });
        const newJob = await response.json();
        setJobs([...jobs, newJob]);
        toast.success('Job created successfully');
      }
      setIsModalOpen(false);
      setEditingJob(null);
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  const handleArchiveJob = async (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;

    const newStatus = job.status === 'archived' ? 'active' : 'archived';

    try {
      await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setJobs(jobs.map((j) => (j.id === id ? { ...j, status: newStatus } : j)));
      toast.success(`Job ${newStatus === 'archived' ? 'archived' : 'unarchived'}`);
    } catch (error) {
      toast.error('Failed to update job');
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleCreateJob = () => {
    setEditingJob(null);
    setIsModalOpen(true);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Postings</h1>
        <p className="text-gray-600">Manage and organize your open positions</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'active', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={handleCreateJob}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>New Job</span>
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={jobs.map((job) => job.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No jobs found</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <SortableJobCard
                  key={job.id}
                  job={job}
                  onEdit={handleEditJob}
                  onArchive={handleArchiveJob}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      <JobModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJob(null);
        }}
        onSave={handleSaveJob}
        job={editingJob}
      />
    </motion.div>
  );
}
