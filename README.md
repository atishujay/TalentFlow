# TalentFlow
This is the frontend of a mini hiring platform named Talent-Flow. This is made using react.
In this HR team can manage following tasks:
1. Jobs (create, edit, archive, reorder) 
2. Candidates (apply to jobs, progress through stages) 
3. Assessments (job-specific quizzes/forms the candidate completes)
   
SETUP - To intall node modules folder run "npm install" in the terminal and then run "npm run dev" in the terminal or you can simply click the link below.

I have deployed the project on vercel and the host link for the project is- talent-flow-ha82damqa-atishujays-projects.vercel.app


Architecture:
Directory structure:
└── atishujay-talentflow/
    ├── README.md
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx
        ├── index.css
        ├── main.tsx
        ├── components/
        │   ├── AssessmentModal.tsx
        │   ├── CandidateCard.tsx
        │   ├── CandidateModal.tsx
        │   ├── JobModal.tsx
        │   └── Navbar.tsx
        ├── pages/
        │   ├── Assessments.tsx
        │   ├── Candidates.tsx
        │   ├── Jobs.tsx
        │   └── Landing.tsx
        └── server/
            └── mirage.ts


Features

1. Jobs Management: Create, edit, archive, and reorder job listings with drag-and-drop support.
2. Candidate Pipeline: Manage 1000+ virtual candidates through stages (Applied → Offer → Hired).
3. Assessments Builder: Create, edit, and preview assessments with multiple question types.
4. Smooth Animations: Built using Framer Motion for modern transitions.
5. Mock API: MirageJS simulates backend endpoints.
6. Local Persistence: Data is stored locally to mimic server persistence.

Technical Decisions

1. Vite and TypeScript: chosen for fast builds and strong typing.
2. MirageJS: simulates backend APIs for a server-like experience.
3. IndexedDB and localStorage: store data locally to mimic persistence.
4. TailwindCSS: enables consistent and quick UI design and styling.
