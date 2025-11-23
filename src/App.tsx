import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import Audit from '@/pages/Audit';
import Feed from '@/pages/Feed';
import Chat from '@/pages/Chat';
import ReportDetail from '@/pages/ReportDetail';
import Ranking from '@/pages/Ranking';
import Propositions from '@/pages/Propositions';
import Profile from '@/pages/Profile';
import PublicProfile from '@/pages/PublicProfile';
import OfficialDiary from '@/pages/OfficialDiary';
import PropositionDetails from '@/pages/PropositionDetails';
import Rewards from '@/pages/Rewards';

import Login from '@/pages/Login';
import Register from '@/pages/Register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route path="profile/:id" element={<PublicProfile />} />
          <Route path="propositions/:id" element={<PropositionDetails />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="audit" element={<Audit />} />
            <Route path="feed" element={<Feed />} />
            <Route path="report/:id" element={<ReportDetail />} />
            <Route path="chat" element={<Chat />} />
            <Route path="ranking" element={<Ranking />} />
            <Route path="propositions" element={<Propositions />} />
            <Route path="official-diary" element={<OfficialDiary />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
