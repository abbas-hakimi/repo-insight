import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DependencyGraphPage from './pages/DependencyGraphPage.jsx';
import RepositoryDashboard from './pages/RepositoryDashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RepositoryDashboard />} />
        <Route path="/dependency-graph" element={<DependencyGraphPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
