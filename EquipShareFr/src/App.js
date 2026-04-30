import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Marketplace from './pages/Marketplace';
import EquipmentDetail from './pages/EquipmentDetail';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import PublicProfile from './pages/PublicProfile';
import UserProfile from './pages/UserProfile';
import CreateListing from './pages/CreateListing';
import AdminDashboard from './pages/AdminDashboard';
import EarningsDashboard from './pages/EarningsDashboard';
import MyListings from './pages/MyListings';
import EditListing from './pages/EditListing';
import Circles from './pages/Circles';
import Verified from './pages/Verified';
import VerifyFailed from './pages/VerifyFailed';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
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
              <Route path="/profile" element={<ProtectedRoute element={<UserProfile />} fallbackPath="/signin" />} />
              <Route path="/user/:userId" element={<PublicProfile />} />
              <Route path="/create-listing" element={<CreateListing />} />
              <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" fallbackPath="/marketplace" />} />
              <Route path="/earnings" element={<EarningsDashboard />} />
              <Route path="/my-listings" element={<MyListings />} />
              <Route path="/circles" element={<Circles />} />
              <Route path="/edit-listing/:listingId" element={<EditListing />} />
              <Route path="/verified" element={<Verified />} />
              <Route path="/verify-failed" element={<VerifyFailed />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
