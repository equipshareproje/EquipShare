import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Marketplace from './pages/Marketplace';
import EquipmentDetail from './pages/EquipmentDetail';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import PublicProfile from './pages/PublicProfile';
import CreateListing from './pages/CreateListing';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-background">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/equipment/:id" element={<EquipmentDetail />} />
              <Route path="/checkout/:id" element={<Checkout />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/user/:userId" element={<PublicProfile />} />
              <Route path="/create-listing" element={<CreateListing />} />
              <Route path="/admin" element={<AdminDashboard />} />
              {/* Other routes will be added here */}
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
