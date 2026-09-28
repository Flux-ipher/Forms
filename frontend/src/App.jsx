import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FormBuilder from './components/FormBuilder';
import FormRenderer from './components/FormRenderer';
import Analytics from './components/Analytics';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { Home, Plus } from 'lucide-react';
import { api } from './api';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

function Navigation() {
  const navigate = useNavigate();
  
  const handleNew = async () => {
    try {
      const form = await api.createForm();
      navigate(`/build/${form.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center text-primary-600">
              <Home className="h-6 w-6 mr-2" />
              <span className="font-bold text-xl tracking-tight">FormFlow</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="border-transparent text-gray-500 hover:border-primary-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                Dashboard
              </Link>
              <button onClick={handleNew} className="border-transparent text-gray-500 hover:border-primary-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                <Plus className="w-4 h-4 mr-1"/> New Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function AdminLayout({ children }) {
  return (
    <ProtectedRoute>
      <Navigation />
      <main className="py-0">
        {children}
      </main>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Route - Anyone with the link can access */}
          <Route path="/form/:id" element={<FormRenderer />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          {/* Admin Routes - Requires 6-character code */}
          <Route path="/*" element={
            <AdminLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/build/:id" element={<FormBuilder />} />
                <Route path="/analytics/:id" element={<Analytics />} />
                <Route path="/settings/:id" element={<Settings />} />
              </Routes>
            </AdminLayout>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
