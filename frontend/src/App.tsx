import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { NetworkMapContainer } from './components/map/NetworkMapContainer';
import { ExecutiveReport } from './components/dashboard/ExecutiveReport';
import { NodeDetails } from './components/dashboard/NodeDetails';
import { NetworkRobustness } from './components/dashboard/NetworkRobustness';

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/map" replace />} />
        <Route path="/map" element={<NetworkMapContainer />} />
        <Route path="/report" element={<ExecutiveReport />} />
        <Route path="/robustness" element={<NetworkRobustness />} />
        <Route path="/node-details/:nodeId" element={<NodeDetails />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
