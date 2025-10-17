import { createServer, Model, Factory, Response } from 'miragejs';

const STORAGE_KEY = 'talentflow_data';

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveToStorage(data: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

createServer({
  models: {
    job: Model,
    candidate: Model,
    assessment: Model,
  },

  factories: {
    job: Factory.extend({
      title(i) {
        const titles = [
          'Senior Frontend Engineer',
          'Product Manager',
          'UX Designer',
          'Backend Developer',
          'Data Scientist',
          'DevOps Engineer',
        ];
        return titles[i % titles.length];
      },
      department(i) {
        const depts = ['Engineering', 'Product', 'Design', 'Engineering', 'Data', 'Operations'];
        return depts[i % depts.length];
      },
      location(i) {
        const locs = ['San Francisco, CA', 'Remote', 'New York, NY', 'Austin, TX', 'Remote', 'Seattle, WA'];
        return locs[i % locs.length];
      },
      type(i) {
        const types = ['Full-time', 'Full-time', 'Contract', 'Full-time', 'Full-time', 'Full-time'];
        return types[i % types.length];
      },
      status() {
        return 'active';
      },
      description() {
        return 'We are looking for a talented professional to join our growing team. You will work on exciting projects and collaborate with a passionate team.';
      },
      requirements() {
        return '5+ years of experience\nStrong communication skills\nPassion for innovation';
      },
      salary() {
        return '$120k - $180k';
      },
      applicants(i) {
        return Math.floor(Math.random() * 50) + 10;
      },
      order(i) {
        return i;
      },
      createdAt() {
        return new Date().toISOString();
      },
    }),

    candidate: Factory.extend({
      name(i) {
        const names = [
          'Sarah Johnson',
          'Michael Chen',
          'Emily Rodriguez',
          'James Williams',
          'Priya Patel',
          'David Kim',
          'Maria Garcia',
          'Alex Thompson',
        ];
        return names[i % names.length];
      },
      email(i) {
        return `candidate${i}@example.com`;
      },
      phone() {
        return '+1 (555) 123-4567';
      },
      position(i) {
        const positions = [
          'Frontend Engineer',
          'Product Manager',
          'UX Designer',
          'Backend Developer',
          'Data Scientist',
          'DevOps Engineer',
          'Frontend Engineer',
          'Product Manager',
        ];
        return positions[i % positions.length];
      },
      stage(i) {
        const stages = ['applied', 'screening', 'interview', 'applied', 'interview', 'offer', 'screening', 'applied'];
        return stages[i % stages.length];
      },
      experience() {
        return Math.floor(Math.random() * 10) + 2;
      },
      rating() {
        return Math.floor(Math.random() * 3) + 3;
      },
      resumeUrl() {
        return '#';
      },
      notes() {
        return 'Strong technical background with excellent communication skills.';
      },
      appliedDate() {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        return date.toISOString();
      },
    }),

    assessment: Factory.extend({
      title(i) {
        const titles = [
          'Frontend Development Assessment',
          'Product Thinking Challenge',
          'Design Portfolio Review',
          'System Design Interview',
        ];
        return titles[i % titles.length];
      },
      description(i) {
        const descs = [
          'Evaluate frontend coding skills with React and TypeScript',
          'Assess product strategy and prioritization abilities',
          'Review design process and creative thinking',
          'Test system architecture and scalability knowledge',
        ];
        return descs[i % descs.length];
      },
      duration(i) {
        const durations = [60, 45, 90, 120];
        return durations[i % durations.length];
      },
      questions(i) {
        if (i % 4 === 0) {
          return [
            { id: '1', type: 'coding', question: 'Build a responsive component', points: 50 },
            { id: '2', type: 'multiple-choice', question: 'What is the Virtual DOM?', points: 20 },
            { id: '3', type: 'short-answer', question: 'Explain React hooks', points: 30 },
          ];
        }
        return [
          { id: '1', type: 'short-answer', question: 'Sample question', points: 100 },
        ];
      },
      passingScore() {
        return 70;
      },
      createdAt() {
        return new Date().toISOString();
      },
    }),
  },

  seeds(server) {
    const stored = loadFromStorage();

    if (stored) {
      stored.jobs?.forEach((job: any) => server.create('job', job));
      stored.candidates?.forEach((candidate: any) => server.create('candidate', candidate));
      stored.assessments?.forEach((assessment: any) => server.create('assessment', assessment));
    } else {
      server.createList('job', 6);
      server.createList('candidate', 12);
      server.createList('assessment', 4);
    }
  },

  routes() {
    this.namespace = 'api';
    this.timing = 300;

    this.get('/jobs', (schema) => {
      const jobs = schema.all('job').models;
      saveToStorage({
        jobs,
        candidates: schema.all('candidate').models,
        assessments: schema.all('assessment').models,
      });
      return jobs;
    });

    this.post('/jobs', (schema, request) => {
      const attrs = JSON.parse(request.requestBody);
      const job = schema.create('job', { ...attrs, order: schema.all('job').length });
      saveToStorage({
        jobs: schema.all('job').models,
        candidates: schema.all('candidate').models,
        assessments: schema.all('assessment').models,
      });
      return job;
    });

    this.patch('/jobs/:id', (schema, request) => {
      const id = request.params.id;
      const attrs = JSON.parse(request.requestBody);
      const job = schema.find('job', id);
      job?.update(attrs);
      saveToStorage({
        jobs: schema.all('job').models,
        candidates: schema.all('candidate').models,
        assessments: schema.all('assessment').models,
      });
      return job;
    });

    this.patch('/jobs/reorder', (schema, request) => {
      const { jobs } = JSON.parse(request.requestBody);
      jobs.forEach((job: any, index: number) => {
        const model = schema.find('job', job.id);
        model?.update({ order: index });
      });
      saveToStorage({
        jobs: schema.all('job').models,
        candidates: schema.all('candidate').models,
        assessments: schema.all('assessment').models,
      });
      return new Response(200, {}, { success: true });
    });

    this.delete('/jobs/:id', (schema, request) => {
      const id = request.params.id;
      schema.find('job', id)?.destroy();
      saveToStorage({
        jobs: schema.all('job').models,
        candidates: schema.all('candidate').models,
        assessments: schema.all('assessment').models,
      });
      return new Response(204);
    });

    this.get('/candidates', (schema) => {
      const candidates = schema.all('candidate').models;
      saveToStorage({
        jobs: schema.all('job').models,
        candidates,
        assessments: schema.all('assessment').models,
      });
      return candidates;
    });

    this.post('/candidates', (schema, request) => {
      const attrs = JSON.parse(request.requestBody);
      const candidate = schema.create('candidate', attrs);
      saveToStorage({
        jobs: schema.all('job').models,
        candidates: schema.all('candidate').models,
        assessments: schema.all('assessment').models,
      });
      return candidate;
    });

    this.patch('/candidates/:id', (schema, request) => {
      const id = request.params.id;
      const attrs = JSON.parse(request.requestBody);
      const candidate = schema.find('candidate', id);
      candidate?.update(attrs);
      saveToStorage({
        jobs: schema.all('job').models,
        candidates: schema.all('candidate').models,
        assessments: schema.all('assessment').models,
      });
      return candidate;
    });

    this.delete('/candidates/:id', (schema, request) => {
      const id = request.params.id;
      schema.find('candidate', id)?.destroy();
      saveToStorage({
        jobs: schema.all('job').models,
        candidates: schema.all('candidate').models,
        assessments: schema.all('assessment').models,
      });
      return new Response(204);
    });

    this.get('/assessments', (schema) => {
      const assessments = schema.all('assessment').models;
      saveToStorage({
        jobs: schema.all('job').models,
        candidates: schema.all('candidate').models,
        assessments,
      });
      return assessments;
    });

    this.post('/assessments', (schema, request) => {
      const attrs = JSON.parse(request.requestBody);
      const assessment = schema.create('assessment', attrs);
      saveToStorage({
        jobs: schema.all('job').models,
        candidates: schema.all('candidate').models,
        assessments: schema.all('assessment').models,
      });
      return assessment;
    });

    this.patch('/assessments/:id', (schema, request) => {
      const id = request.params.id;
      const attrs = JSON.parse(request.requestBody);
      const assessment = schema.find('assessment', id);
      assessment?.update(attrs);
      saveToStorage({
        jobs: schema.all('job').models,
        candidates: schema.all('candidate').models,
        assessments: schema.all('assessment').models,
      });
      return assessment;
    });

    this.delete('/assessments/:id', (schema, request) => {
      const id = request.params.id;
      schema.find('assessment', id)?.destroy();
      saveToStorage({
        jobs: schema.all('job').models,
        candidates: schema.all('candidate').models,
        assessments: schema.all('assessment').models,
      });
      return new Response(204);
    });
  },
});
