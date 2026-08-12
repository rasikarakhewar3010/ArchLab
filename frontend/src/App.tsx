/**
 * App — Root Application Component (Phase 3: Routing)
 * =====================================================
 * Now uses React Router to switch between:
 *   - `/` → DesignStudio (free-form canvas)
 *   - `/challenges` → ChallengesDashboard
 *   - `/challenges/:slug` → ChallengeWorkspace
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import DesignStudio from './pages/DesignStudio';
import ChallengesDashboard from './pages/ChallengesDashboard';
import ChallengeWorkspace from './pages/ChallengeWorkspace';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <ReactFlowProvider>
        <Routes>
          <Route path="/" element={<DesignStudio />} />
          <Route path="/challenges" element={<ChallengesDashboard />} />
          <Route path="/challenges/:slug" element={<ChallengeWorkspace />} />
        </Routes>
      </ReactFlowProvider>
    </BrowserRouter>
  );
}
