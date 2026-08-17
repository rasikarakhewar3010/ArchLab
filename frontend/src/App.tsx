/**
 * App — Root Application Component
 * ===================================
 * Uses React Router with AuthProvider for global auth state.
 *
 * Routes:
 *   /                  → DesignStudio (free-form canvas)
 *   /auth              → Login / Register
 *   /my-designs        → Saved designs gallery
 *   /challenges        → ChallengesDashboard
 *   /challenges/:slug  → ChallengeWorkspace
 *   /learn             → Learning Hub
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { AuthProvider } from './context/AuthContext';
import DesignStudio from './pages/DesignStudio';
import ChallengesDashboard from './pages/ChallengesDashboard';
import ChallengeWorkspace from './pages/ChallengeWorkspace';
import AuthPage from './pages/AuthPage';
import MyDesigns from './pages/MyDesigns';
import LearningHub from './pages/LearningHub';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ReactFlowProvider>
          <Routes>
            <Route path="/" element={<DesignStudio />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/my-designs" element={<MyDesigns />} />
            <Route path="/challenges" element={<ChallengesDashboard />} />
            <Route path="/challenges/:slug" element={<ChallengeWorkspace />} />
            <Route path="/learn" element={<LearningHub />} />
          </Routes>
        </ReactFlowProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
