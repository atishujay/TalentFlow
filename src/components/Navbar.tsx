import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Users, ClipboardList, Home } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/candidates', label: 'Candidates', icon: Users },
    { path: '/assessments', label: 'Assessments', icon: ClipboardList },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center"
              >
                <Briefcase className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                TalentFlow
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-4">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative px-3 py-2 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-2">
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? 'text-blue-600'
                          : 'text-gray-600 group-hover:text-blue-600'
                      }`}
                    />
                    <span
                      className={`text-sm font-medium transition-colors hidden sm:inline ${
                        isActive
                          ? 'text-blue-600'
                          : 'text-gray-700 group-hover:text-blue-600'
                      }`}
                    >
                      {link.label}
                    </span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-50 rounded-lg -z-10"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
