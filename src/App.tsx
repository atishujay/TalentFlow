import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Jobs from './pages/Jobs';
import Candidates from './pages/Candidates';
import Assessments from './pages/Assessments';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/assessments" element={<Assessments />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
