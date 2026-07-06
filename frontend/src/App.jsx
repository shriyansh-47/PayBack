import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import GroupView from './pages/GroupView';
import GroupsList from './pages/GroupsList';
import Settings from './pages/Settings';
import Expenses from './pages/Expenses';
import Layout from './components/Layout';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/groups" element={<GroupsList />} />
          <Route path="/group/:groupId" element={<GroupView />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
