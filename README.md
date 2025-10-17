# TalentFlow
This is the frontend of a mini hiring platform named Talent-Flow. This is made using react.
In this HR team can manage following tasks:
1. Jobs (create, edit, archive, reorder) 
2. Candidates (apply to jobs, progress through stages) 
3. Assessments (job-specific quizzes/forms the candidate completes)
   
To intall node modules folder run "npm install" in the terminal and then run "npm run dev" in the terminal.
The local host link should look like this- http://localhost:5174/


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
