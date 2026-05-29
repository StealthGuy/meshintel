import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { NetworkMapContainer } from './components/map/NetworkMapContainer';
import { Dashboard } from './components/dashboard/Dashboard';
import { NodeDetails } from './components/dashboard/NodeDetails';
import { NetworkRobustness } from './components/dashboard/NetworkRobustness';
import { LandingPage } from './components/landing/LandingPage';
import { LandingPageIt } from './components/landing/LandingPageIt';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/it" element={<LandingPageIt />} />
      <Route
        path="/*"
        element={
          <MainLayout>
            <Routes>
              <Route path="map" element={<NetworkMapContainer />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="robustness" element={<NetworkRobustness />} />
              <Route path="node-details/:nodeId" element={<NodeDetails />} />
              <Route path="*" element={<Navigate to="/map" replace />} />
            </Routes>
          </MainLayout>
        }
      />
    </Routes>
  );
}

export default App;
