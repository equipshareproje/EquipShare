import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Initialize mock data
  const mockVerifications = [
    {
      id: 1,
      name: 'Muhammad Al-Rasheed',
      email: 'm.rasheed@kfupm.edu.sa',
      joinDate: '2026-03-20',
      documentType: 'Student ID',
      documentUrl: 'https://via.placeholder.com/300x200?text=Student+ID',
      submittedDate: '2026-04-08',
      status: 'pending',
    },
    {
      id: 2,
      name: 'Fatima Al-Dossary',
      email: 'f.dossary@kfupm.edu.sa',
      joinDate: '2026-02-10',
      documentType: 'National ID',
      documentUrl: 'https://via.placeholder.com/300x200?text=National+ID',
      submittedDate: '2026-04-07',
      status: 'pending',
    },
    {
      id: 3,
      name: 'Ahmed Hassan',
      email: 'a.hassan@email.com',
      joinDate: '2026-01-15',
      documentType: 'Passport',
      documentUrl: 'https://via.placeholder.com/300x200?text=Passport',
      submittedDate: '2026-04-05',
      status: 'pending',
    },
  ];

  const mockCircles = [
    {
      id: 1,
      name: 'KFUPM Students',
      description: 'Verified KFUPM student community',
      members: 847,
      eligibility: '@kfupm.edu.sa email domain',
      created: '2026-01-15',
      active: true,
    },
    {
      id: 2,
      name: 'KFUPM Faculty',
      description: 'KFUPM faculty and staff',
      members: 42,
      eligibility: '@kfupm.edu.sa email (staff)',
      created: '2026-01-20',
      active: true,
    },
  ];

  const mockDisputes = [
    {
      id: 'D001',
      bookingRef: 'BOOK-2026-0201-5521',
      equipment: 'Camera Kit',
      lenderName: 'Jane Doe',
      renterId: 5,
      renterName: 'Ahmed Hassan',
      renterAvatar: 'https://via.placeholder.com/40?text=AH',
      issue: 'Equipment returned with visible damage on lens',
      filedDate: '2026-04-08',
      daysOpen: 2,
      status: 'open',
      preRentalPhotos: [
        { id: 1, caption: 'Front view - pristine condition', timestamp: '03/01/2026, 09:15:32 AM', url: 'https://via.placeholder.com/200x150?text=Pre1' },
        { id: 2, caption: 'Side view - no damage', timestamp: '03/01/2026, 09:16:02 AM', url: 'https://via.placeholder.com/200x150?text=Pre2' },
        { id: 3, caption: 'Lens cap on', timestamp: '03/01/2026, 09:16:45 AM', url: 'https://via.placeholder.com/200x150?text=Pre3' },
      ],
      postRentalPhotos: [
        { id: 1, caption: 'Scratches on lens', timestamp: '04/08/2026, 03:27:08 PM', url: 'https://via.placeholder.com/200x150?text=Post1' },
        { id: 2, caption: 'Damage on side', timestamp: '04/08/2026, 03:27:43 PM', url: 'https://via.placeholder.com/200x150?text=Post2' },
        { id: 3, caption: 'Close-up of scratches', timestamp: '04/08/2026, 03:28:06 PM', url: 'https://via.placeholder.com/200x150?text=Post3' },
      ],
      ruling: null,
    },
    {
      id: 'D002',
      bookingRef: 'BOOK-2026-0301-1782',
      equipment: 'Pressure Washer',
      lenderName: 'John Smith',
      renterId: 12,
      renterName: 'Sarah Al-Qahtani',
      renterAvatar: 'https://via.placeholder.com/40?text=SQ',
      issue: 'Renter failed to return within rental period',
      filedDate: '2026-04-05',
      daysOpen: 5,
      status: 'open',
      preRentalPhotos: [
        { id: 1, caption: 'Equipment before rental', timestamp: '03/25/2026, 02:10:15 PM', url: 'https://via.placeholder.com/200x150?text=PreW1' },
        { id: 2, caption: 'All parts intact', timestamp: '03/25/2026, 02:10:52 PM', url: 'https://via.placeholder.com/200x150?text=PreW2' },
        { id: 3, caption: 'Serial number visible', timestamp: '03/25/2026, 02:11:30 PM', url: 'https://via.placeholder.com/200x150?text=PreW3' },
      ],
      postRentalPhotos: [],
      ruling: null,
    },
  ];

  const mockFlaggedListings = [
    {
      id: 'F001',
      listing: 'Professional Camera Package',
      listingId: 15,
      lender: 'Unknown Seller',
      reason: 'Suspicious pricing - 90% below market',
      flags: 7,
      reportedDate: '2026-04-08',
      status: 'pending',
      reports: [
        'Price seems unrealistic for professional camera - possible scam',
        'No history with this seller',
        'Photos low quality',
      ],
    },
    {
      id: 'F002',
      listing: 'Electronics Bundle',
      listingId: 22,
      lender: 'John Seller',
      reason: 'No photos, vague description',
      flags: 3,
      reportedDate: '2026-04-07',
      status: 'pending',
      reports: [
        'Missing detailed specifications',
        'Bundle seems too good to be true',
      ],
    },
    {
      id: 'F003',
      listing: 'Laptop - Very Cheap',
      listingId: 31,
      lender: 'New User',
      reason: 'Multiple reports of scam behavior',
      flags: 12,
      reportedDate: '2026-04-06',
      status: 'pending',
      reports: [
        'Brand logos look fake',
        'Documentation not provided',
        'Similar scam listings by same user',
      ],
    },
  ];

  // FR-A1: Pending Verifications (with localStorage)
  const [pendingVerifications, setPendingVerifications] = useState([]);

  // FR-A2: Trusted Circles (with localStorage)
  const [trustedCircles, setTrustedCircles] = useState([]);

  // FR-A3: Disputes (with localStorage)
  const [disputes, setDisputes] = useState([]);

  // FR-A4: Flagged Listings (with localStorage)
  const [flaggedListings, setFlaggedListings] = useState([]);

  // UI State
  const [showNewCircleForm, setShowNewCircleForm] = useState(false);
  const [newCircle, setNewCircle] = useState({ name: '', description: '', eligibility: '' });
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [selectedRuling, setSelectedRuling] = useState('');
  const [selectedCircle, setSelectedCircle] = useState(null); // For member management
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [circleMembers, setCircleMembers] = useState({}); // Store members by circle ID

  // Load admin data from localStorage on mount
  useEffect(() => {
    const savedVerifications = localStorage.getItem('admin_pendingVerifications');
    const savedCircles = localStorage.getItem('admin_trustedCircles');
    const savedDisputes = localStorage.getItem('admin_disputes');
    const savedFlaggedListings = localStorage.getItem('admin_flaggedListings');
    const savedMembers = localStorage.getItem('admin_circleMembers');

    if (savedVerifications) {
      try {
        setPendingVerifications(JSON.parse(savedVerifications));
      } catch (error) {
        console.error('Failed to load verifications:', error);
        setPendingVerifications(mockVerifications);
      }
    } else {
      setPendingVerifications(mockVerifications);
    }

    if (savedCircles) {
      try {
        setTrustedCircles(JSON.parse(savedCircles));
      } catch (error) {
        console.error('Failed to load circles:', error);
        setTrustedCircles(mockCircles);
      }
    } else {
      setTrustedCircles(mockCircles);
    }

    if (savedDisputes) {
      try {
        setDisputes(JSON.parse(savedDisputes));
      } catch (error) {
        console.error('Failed to load disputes:', error);
        setDisputes(mockDisputes);
      }
    } else {
      setDisputes(mockDisputes);
    }

    if (savedFlaggedListings) {
      try {
        setFlaggedListings(JSON.parse(savedFlaggedListings));
      } catch (error) {
        console.error('Failed to load flagged listings:', error);
        setFlaggedListings(mockFlaggedListings);
      }
    } else {
      setFlaggedListings(mockFlaggedListings);
    }

    // Load circle members
    if (savedMembers) {
      try {
        setCircleMembers(JSON.parse(savedMembers));
      } catch (error) {
        console.error('Failed to load circle members:', error);
        initializeDefaultMembers();
      }
    } else {
      initializeDefaultMembers();
    }
  }, []);

  // Save functions
  const savePendingVerifications = (data) => {
    setPendingVerifications(data);
    localStorage.setItem('admin_pendingVerifications', JSON.stringify(data));
  };

  const saveTrustedCircles = (data) => {
    setTrustedCircles(data);
    localStorage.setItem('admin_trustedCircles', JSON.stringify(data));
  };

  const saveDisputes = (data) => {
    setDisputes(data);
    localStorage.setItem('admin_disputes', JSON.stringify(data));
  };

  const saveFlaggedListings = (data) => {
    setFlaggedListings(data);
    localStorage.setItem('admin_flaggedListings', JSON.stringify(data));
  };

  // Initialize default members for circles
  const initializeDefaultMembers = () => {
    const defaultMembers = {
      1: [ // KFUPM Students
        { id: 1, name: 'Muhammad Al-Rasheed', email: 'm.rasheed@kfupm.edu.sa', joinedDate: '2026-03-20', status: 'active', violationCount: 0 },
        { id: 2, name: 'Fatima Al-Dossary', email: 'f.dossary@kfupm.edu.sa', joinedDate: '2026-02-10', status: 'active', violationCount: 0 },
        { id: 3, name: 'Ahmed Hassan', email: 'a.hassan@kfupm.edu.sa', joinedDate: '2026-01-15', status: 'active', violationCount: 1 },
        { id: 4, name: 'Nora Al-Otaibi', email: 'n.otaibi@kfupm.edu.sa', joinedDate: '2026-02-28', status: 'active', violationCount: 0 },
        { id: 5, name: 'Salem Al-Subaie', email: 's.subaie@kfupm.edu.sa', joinedDate: '2026-01-05', status: 'suspended', violationCount: 3 },
      ],
      2: [ // KFUPM Faculty
        { id: 6, name: 'Dr. Mohammed Al-Zamil', email: 'm.zamil@kfupm.edu.sa', joinedDate: '2026-01-10', status: 'active', violationCount: 0 },
        { id: 7, name: 'Dr. Huda Al-Rasheed', email: 'h.rasheed@kfupm.edu.sa', joinedDate: '2026-01-20', status: 'active', violationCount: 0 },
      ]
    };
    setCircleMembers(defaultMembers);
    localStorage.setItem('admin_circleMembers', JSON.stringify(defaultMembers));
  };

  const saveCircleMembers = (data) => {
    setCircleMembers(data);
    localStorage.setItem('admin_circleMembers', JSON.stringify(data));
  };

  // Member management handlers
  const handleViewMembers = (circle) => {
    setSelectedCircle(circle);
    setShowMembersModal(true);
  };

  const handleRemoveMember = (memberId) => {
    if (!selectedCircle) return;
    const updated = { ...circleMembers };
    updated[selectedCircle.id] = updated[selectedCircle.id].filter(m => m.id !== memberId);
    saveCircleMembers(updated);
    alert('✅ Member removed from circle');
  };

  const handleSuspendMember = (memberId) => {
    if (!selectedCircle) return;
    const updated = { ...circleMembers };
    const circleIdx = updated[selectedCircle.id].findIndex(m => m.id === memberId);
    if (circleIdx !== -1) {
      updated[selectedCircle.id][circleIdx].status = 'suspended';
      updated[selectedCircle.id][circleIdx].violationCount += 1;
      saveCircleMembers(updated);
      alert('⚠️ Member suspended due to violations');
    }
  };

  // FR-A1 Handlers
  const handleVerifyUser = (userId) => {
    const updated = pendingVerifications.filter(v => v.id !== userId);
    savePendingVerifications(updated);
    alert('✅ User verified and account activated!');
  };

  const handleRejectUser = (userId) => {
    const updated = pendingVerifications.filter(v => v.id !== userId);
    savePendingVerifications(updated);
    alert('❌ User verification rejected. Rejection email sent.');
  };

  // FR-A2 Handlers
  const handleCreateCircle = () => {
    if (newCircle.name && newCircle.description && newCircle.eligibility) {
      const circle = {
        id: trustedCircles.length + 1,
        ...newCircle,
        members: 0,
        created: new Date().toISOString().split('T')[0],
        active: true,
      };
      saveTrustedCircles([...trustedCircles, circle]);
      setNewCircle({ name: '', description: '', eligibility: '' });
      setShowNewCircleForm(false);
      alert('✅ Trusted Circle created successfully!');
    }
  };

  const handleDeactivateCircle = (circleId) => {
    const updated = trustedCircles.map(c => c.id === circleId ? { ...c, active: false } : c);
    saveTrustedCircles(updated);
    alert('⚠️ Trusted Circle deactivated');
  };

  // FR-A3 Handlers
  const handleResolveDispute = () => {
    if (!selectedRuling) {
      alert('Please select a ruling');
      return;
    }
    const updatedDisputes = disputes.map(d =>
      d.id === selectedDispute.id ? { ...d, status: 'resolved', ruling: selectedRuling } : d
    );
    saveDisputes(updatedDisputes);
    setSelectedDispute(null);
    setSelectedRuling('');
    alert(`✅ Dispute resolved: ${selectedRuling}`);
  };

  // FR-A4 Handlers
  const handleModerationAction = (listingId, action) => {
    const timestamp = new Date().toISOString();
    const auditLog = {
      listingId,
      action,
      timestamp,
      adminId: 'admin@equipshare.com',
    };

    // Save to audit log
    const existingLogs = localStorage.getItem('admin_auditLogs') || '[]';
    let logs = [];
    try {
      logs = JSON.parse(existingLogs);
    } catch (e) {
      logs = [];
    }
    logs.push(auditLog);
    localStorage.setItem('admin_auditLogs', JSON.stringify(logs));

    if (action === 'dismiss') {
      const updated = flaggedListings.filter(f => f.listingId !== listingId);
      saveFlaggedListings(updated);
      alert('✅ Flag dismissed - listing remains active');
    } else if (action === 'warn') {
      alert('⚠️ Warning sent to lender - listing remains active\n📧 Email notification queued');
    } else if (action === 'remove') {
      const updated = flaggedListings.filter(f => f.listingId !== listingId);
      saveFlaggedListings(updated);
      alert('🚫 Listing removed and lender notified\n📧 Removal notice sent to lender');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F8]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003E51] to-[#002A38] text-white py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-4xl font-bold mb-2">🛡️ Admin Dashboard</h1>
          <p className="text-gray-200">Platform moderation, verifications, and trust management</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#D0DDE2] overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-4 font-medium transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'text-[#003E51] border-b-2 border-[#003E51]'
                : 'text-[#4A6572] hover:text-[#003E51]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('verifications')}
            className={`pb-4 px-4 font-medium transition whitespace-nowrap ${
              activeTab === 'verifications'
                ? 'text-[#003E51] border-b-2 border-[#003E51]'
                : 'text-[#4A6572] hover:text-[#003E51]'
            }`}
          >
            FR-A1: Verifications ({pendingVerifications.length})
          </button>
          <button
            onClick={() => setActiveTab('circles')}
            className={`pb-4 px-4 font-medium transition whitespace-nowrap ${
              activeTab === 'circles'
                ? 'text-[#003E51] border-b-2 border-[#003E51]'
                : 'text-[#4A6572] hover:text-[#003E51]'
            }`}
          >
            FR-A2: Circles ({trustedCircles.filter(c => c.active).length})
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`pb-4 px-4 font-medium transition whitespace-nowrap ${
              activeTab === 'disputes'
                ? 'text-[#003E51] border-b-2 border-[#003E51]'
                : 'text-[#4A6572] hover:text-[#003E51]'
            }`}
          >
            FR-A3: Disputes ({disputes.filter(d => d.status === 'open').length})
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`pb-4 px-4 font-medium transition whitespace-nowrap ${
              activeTab === 'moderation'
                ? 'text-[#003E51] border-b-2 border-[#003E51]'
                : 'text-[#4A6572] hover:text-[#003E51]'
            }`}
          >
            FR-A4: Moderation ({flaggedListings.length})
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <p className="text-[#4A6572] text-sm font-medium mb-2">Pending Verifications</p>
              <p className="text-4xl font-bold text-[#003E51] mb-4">{pendingVerifications.length}</p>
              <button
                onClick={() => setActiveTab('verifications')}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Review Now →
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <p className="text-[#4A6572] text-sm font-medium mb-2">Open Disputes</p>
              <p className="text-4xl font-bold text-[#003E51] mb-4">{disputes.filter(d => d.status === 'open').length}</p>
              <button
                onClick={() => setActiveTab('disputes')}
                className="text-red-600 hover:underline text-sm font-medium"
              >
                Mediate →
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <p className="text-[#4A6572] text-sm font-medium mb-2">Flagged Listings</p>
              <p className="text-4xl font-bold text-[#003E51] mb-4">{flaggedListings.length}</p>
              <button
                onClick={() => setActiveTab('moderation')}
                className="text-yellow-600 hover:underline text-sm font-medium"
              >
                Moderate →
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <p className="text-[#4A6572] text-sm font-medium mb-2">Active Circles</p>
              <p className="text-4xl font-bold text-[#003E51] mb-4">{trustedCircles.filter(c => c.active).length}</p>
              <button
                onClick={() => setActiveTab('circles')}
                className="text-green-600 hover:underline text-sm font-medium"
              >
                Manage →
              </button>
            </div>
          </div>
        )}

        {/* FR-A1: Verifications Tab */}
        {activeTab === 'verifications' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-[#003E51] mb-1">FR-A1: User Identity Verification</h2>
              <p className="text-[#4A6572]">Review and approve pending user identity documents</p>
            </div>
            {pendingVerifications.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <p className="text-green-700 font-medium">✅ All users verified! No pending verifications.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingVerifications.map(user => (
                  <div key={user.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm font-semibold text-[#4A6572] mb-2">Document Preview</p>
                        <img
                          src={user.documentUrl}
                          alt={user.documentType}
                          className="w-full h-40 object-cover rounded-lg border border-[#D0DDE2]"
                        />
                      </div>

                      <div>
                        <p className="text-lg font-bold text-[#003E51] mb-1">{user.name}</p>
                        <p className="text-sm text-[#4A6572] mb-3">{user.email}</p>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Document:</span> {user.documentType}</p>
                          <p><span className="font-medium">Joined:</span> {user.joinDate}</p>
                          <p><span className="font-medium">Submitted:</span> {user.submittedDate}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 justify-center">
                        <button
                          onClick={() => handleVerifyUser(user.id)}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleRejectUser(user.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FR-A2: Trusted Circles Tab */}
        {activeTab === 'circles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="bg-white rounded-lg shadow-md p-6 flex-1 mr-4">
                <h2 className="text-2xl font-bold text-[#003E51]">FR-A2: Trusted Circle Management</h2>
                <p className="text-[#4A6572]">Create and manage community verification groups</p>
              </div>
              <button
                onClick={() => setShowNewCircleForm(!showNewCircleForm)}
                className="bg-[#003E51] hover:bg-[#002A38] text-white font-medium py-3 px-6 rounded-lg transition"
              >
                + Create Circle
              </button>
            </div>

            {showNewCircleForm && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-[#003E51] mb-4">Create New Trusted Circle</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0A1F29] mb-1">Circle Name</label>
                    <input
                      type="text"
                      value={newCircle.name}
                      onChange={(e) => setNewCircle({ ...newCircle, name: e.target.value })}
                      placeholder="e.g., KFUPM Alumni"
                      className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A1F29] mb-1">Description</label>
                    <textarea
                      value={newCircle.description}
                      onChange={(e) => setNewCircle({ ...newCircle, description: e.target.value })}
                      placeholder="Brief description of the circle's purpose"
                      className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                      rows="2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A1F29] mb-1">Eligibility Criteria</label>
                    <input
                      type="text"
                      value={newCircle.eligibility}
                      onChange={(e) => setNewCircle({ ...newCircle, eligibility: e.target.value })}
                      placeholder="e.g., Organization: KFUPM"
                      className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowNewCircleForm(false)}
                      className="flex-1 px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#0A1F29] font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateCircle}
                      className="flex-1 px-4 py-2 bg-[#003E51] text-white rounded-lg font-medium hover:bg-[#002A38]"
                    >
                      Create Circle
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trustedCircles.map(circle => (
                <div key={circle.id} className="bg-white rounded-lg shadow-md p-6 border border-[#D0DDE2]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-[#003E51]">{circle.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      circle.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {circle.active ? '✓ Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-[#4A6572] mb-4">{circle.description}</p>
                  <div className="space-y-2 text-sm mb-4">
                    <p><span className="font-medium text-[#0A1F29]">Members:</span> {circle.members}</p>
                    <p><span className="font-medium text-[#0A1F29]">Eligibility:</span> {circle.eligibility}</p>
                    <p><span className="font-medium text-[#0A1F29]">Created:</span> {circle.created}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewMembers(circle)}
                      className="flex-1 text-[#00879E] hover:underline font-medium text-sm"
                    >
                      View Members
                    </button>
                    <button
                      onClick={() => handleDeactivateCircle(circle.id)}
                      className="flex-1 text-red-600 hover:underline font-medium text-sm"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FR-A3: Disputes Tab */}
        {activeTab === 'disputes' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-[#003E51] mb-1">FR-A3: Dispute Mediation</h2>
              <p className="text-[#4A6572]">Review and resolve disputes with Visual Handshake photo evidence</p>
            </div>

            {disputes.filter(d => d.status === 'open').length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <p className="text-green-700 font-medium">✅ No open disputes! Platform is healthy.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.filter(d => d.status === 'open').map(dispute => (
                  <div key={dispute.id} className="bg-white rounded-lg shadow-md p-6">
                    {!selectedDispute || selectedDispute.id !== dispute.id ? (
                      <div>
                        <div className="mb-4 pb-4 border-b border-[#D0DDE2]">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-lg font-bold text-[#003E51]">{dispute.equipment}</p>
                              <p className="text-sm text-[#4A6572]">{dispute.bookingRef}</p>
                            </div>
                            <span className="text-xs font-semibold bg-red-100 text-red-700 px-3 py-1 rounded">
                              ⏱️ {dispute.daysOpen} days open
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <p><span className="font-medium">Lender:</span> {dispute.lenderName}</p>
                            <p><span className="font-medium">Renter:</span> {dispute.renterName}</p>
                            <p><span className="font-medium">Photos:</span> Pre: {dispute.preRentalPhotos.length} | Post: {dispute.postRentalPhotos.length}</p>
                          </div>
                        </div>
                        <p className="text-sm text-[#0A1F29] mb-4"><span className="font-medium">Issue:</span> {dispute.issue}</p>
                        <button
                          onClick={() => setSelectedDispute(dispute)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
                        >
                          👁️ Review Evidence & Make Ruling
                        </button>
                      </div>
                    ) : (
                      <div>
                        <button
                          onClick={() => setSelectedDispute(null)}
                          className="text-[#00879E] font-medium text-sm mb-4"
                        >
                          ← Back to Disputes
                        </button>

                        {/* Booking Details */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-[#D0DDE2]">
                          <h3 className="font-bold text-[#003E51] mb-3">📋 Booking Details</h3>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-[#4A6572]">Booking Ref</p>
                              <p className="font-medium text-[#0A1F29]">{selectedDispute.bookingRef}</p>
                            </div>
                            <div>
                              <p className="text-[#4A6572]">Equipment</p>
                              <p className="font-medium text-[#0A1F29]">{selectedDispute.equipment}</p>
                            </div>
                            <div>
                              <p className="text-[#4A6572]">Lender</p>
                              <p className="font-medium text-[#0A1F29]">{selectedDispute.lenderName}</p>
                            </div>
                            <div>
                              <p className="text-[#4A6572]">Renter</p>
                              <p className="font-medium text-[#0A1F29]">{selectedDispute.renterName}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-[#4A6572]">Dispute Reason</p>
                              <p className="font-medium text-[#0A1F29]">{selectedDispute.issue}</p>
                            </div>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-[#003E51] mb-4">Visual Evidence</h3>

                        {/* Pre-rental photos */}
                        <div className="mb-6">
                          <p className="text-sm font-bold text-[#0A1F29] mb-2">📸 Pre-Rental Handover ({selectedDispute.preRentalPhotos.length} photos)</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {selectedDispute.preRentalPhotos.map(photo => (
                              <div key={photo.id} className="border border-[#D0DDE2] rounded-lg overflow-hidden">
                                <img src={photo.url} alt={photo.caption} className="w-full h-32 object-cover" />
                                <div className="p-2 text-xs bg-gray-50">
                                  <p className="font-medium text-[#0A1F29]">{photo.caption}</p>
                                  <p className="text-[#4A6572]">{photo.timestamp}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Post-rental photos */}
                        <div className="mb-6">
                          <p className="text-sm font-bold text-[#0A1F29] mb-2">📸 Post-Rental Return ({selectedDispute.postRentalPhotos.length} photos)</p>
                          {selectedDispute.postRentalPhotos.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {selectedDispute.postRentalPhotos.map(photo => (
                                <div key={photo.id} className="border border-[#D0DDE2] rounded-lg overflow-hidden">
                                  <img src={photo.url} alt={photo.caption} className="w-full h-32 object-cover" />
                                  <div className="p-2 text-xs bg-gray-50">
                                    <p className="font-medium text-[#0A1F29]">{photo.caption}</p>
                                    <p className="text-[#4A6572]">{photo.timestamp}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-[#4A6572] italic">No post-rental photos submitted</p>
                          )}
                        </div>

                        {/* Ruling */}
                        <div className="border-t border-[#D0DDE2] pt-6">
                          <p className="text-sm font-bold text-[#0A1F29] mb-3">Make a Ruling</p>
                          <div className="space-y-2 mb-4">
                            <label className="flex items-center gap-2 p-2 border border-[#D0DDE2] rounded hover:bg-blue-50 cursor-pointer">
                              <input
                                type="radio"
                                checked={selectedRuling === 'lender-win'}
                                onChange={() => setSelectedRuling('lender-win')}
                              />
                              <span className="text-sm"><span className="font-medium">Renter Responsible:</span> Renter caused damage (charge fee)</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 border border-[#D0DDE2] rounded hover:bg-green-50 cursor-pointer">
                              <input
                                type="radio"
                                checked={selectedRuling === 'renter-win'}
                                onChange={() => setSelectedRuling('renter-win')}
                              />
                              <span className="text-sm"><span className="font-medium">Lender Responsible:</span> Pre-existing damage (full refund)</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 border border-[#D0DDE2] rounded hover:bg-purple-50 cursor-pointer">
                              <input
                                type="radio"
                                checked={selectedRuling === 'split'}
                                onChange={() => setSelectedRuling('split')}
                              />
                              <span className="text-sm"><span className="font-medium">Split Decision:</span> Both parties at fault (50/50 split)</span>
                            </label>
                          </div>

                          {/* Financial Impact Preview */}
                          {selectedRuling && (
                            <div className={`mb-6 p-4 rounded-lg border-2 ${
                              selectedRuling === 'lender-win' 
                                ? 'bg-green-50 border-green-300' 
                                : selectedRuling === 'renter-win'
                                ? 'bg-blue-50 border-blue-300'
                                : 'bg-purple-50 border-purple-300'
                            }`}>
                              <p className="text-sm font-bold text-[#0A1F29] mb-2">💰 Financial Impact</p>
                              <div className="text-sm space-y-1">
                                <p><span className="font-medium">Rental Amount:</span> SAR 250</p>
                                {selectedRuling === 'lender-win' && (
                                  <>
                                    <p><span className="font-medium text-green-700">Damage Charge:</span> SAR 150</p>
                                    <p className="font-bold text-green-800">Renter Charged: SAR 150 | Lender Receives: SAR 150</p>
                                  </>
                                )}
                                {selectedRuling === 'renter-win' && (
                                  <>
                                    <p><span className="font-medium text-blue-700">Full Refund:</span> SAR 250</p>
                                    <p className="font-bold text-blue-800">Renter Refunded: SAR 250 | Lender Charged: SAR 250</p>
                                  </>
                                )}
                                {selectedRuling === 'split' && (
                                  <>
                                    <p><span className="font-medium text-purple-700">Split Charge:</span> SAR 75 each</p>
                                    <p className="font-bold text-purple-800">Renter Refunded: SAR 175 | Lender Receives: SAR 75 (loses SAR 75)</p>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedDispute(null)}
                              className="flex-1 px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#0A1F29] font-medium hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleResolveDispute}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                              disabled={!selectedRuling}
                            >
                              Submit Ruling
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FR-A4: Moderation Tab */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-[#003E51] mb-1">FR-A4: Content Moderation</h2>
              <p className="text-[#4A6572]">Review flagged listings and take moderation actions</p>
            </div>

            {flaggedListings.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <p className="text-green-700 font-medium">✅ All listings approved! No flagged content.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {flaggedListings.map(listing => (
                  <div
                    key={listing.id}
                    className={`rounded-lg p-6 ${
                      listing.flags >= 10
                        ? 'bg-red-50 border-2 border-red-300'
                        : 'bg-white border border-[#D0DDE2] shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-lg font-bold text-[#003E51]">{listing.listing}</p>
                        <p className="text-sm text-[#4A6572]">Lender: {listing.lender}</p>
                      </div>
                      <span className={`inline-block font-bold px-3 py-1 rounded text-sm ${
                        listing.flags >= 10
                          ? 'bg-red-200 text-red-800'
                          : listing.flags >= 7
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-orange-200 text-orange-800'
                      }`}>
                        🚩 {listing.flags} flags
                      </span>
                    </div>

                    <div className="mb-4 p-3 bg-gray-50 rounded border border-[#D0DDE2]">
                      <p className="text-sm"><span className="font-medium">Reason:</span> {listing.reason}</p>
                      <p className="text-xs text-[#4A6572] mt-1">Reported: {listing.reportedDate}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-[#0A1F29] mb-2">User Reports:</p>
                      <ul className="space-y-1">
                        {listing.reports.map((report, idx) => (
                          <li key={idx} className="text-sm text-[#4A6572] flex gap-2">
                            <span>•</span> {report}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-4 p-3 bg-blue-50 border border-blue-300 rounded">
                      <p className="text-xs font-medium text-blue-800 mb-2">ℹ️ Listing ID: {listing.listingId}</p>
                      <p className="text-sm text-blue-900">Preview this listing to verify the content before taking action.</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => window.open(`/equipment/${listing.listingId}`, '_blank')}
                        className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg font-medium hover:bg-blue-50 text-sm transition"
                      >
                        👁️ View Listing
                      </button>
                      <button
                        onClick={() => handleModerationAction(listing.listingId, 'dismiss')}
                        className="px-4 py-2 border border-green-300 text-green-700 rounded-lg font-medium hover:bg-green-50 text-sm transition"
                      >
                        👍 Dismiss
                      </button>
                      <button
                        onClick={() => handleModerationAction(listing.listingId, 'warn')}
                        className="px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg font-medium hover:bg-yellow-50 text-sm transition"
                      >
                        ⚠️ Issue Warning
                      </button>
                      <button
                        onClick={() => handleModerationAction(listing.listingId, 'remove')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition"
                      >
                        🚫 Remove Listing
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Members Modal */}
        {showMembersModal && selectedCircle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-[#D0DDE2] p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#003E51]">{selectedCircle.name} - Members</h2>
                  <p className="text-[#4A6572] text-sm mt-1">Total: {circleMembers[selectedCircle.id]?.length || 0} members</p>
                </div>
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-light"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-3">
                {circleMembers[selectedCircle.id]?.length > 0 ? (
                  circleMembers[selectedCircle.id].map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-[#D0DDE2]">
                      <div className="flex-1">
                        <p className="font-medium text-[#0A1F29]">{member.name}</p>
                        <p className="text-sm text-[#4A6572]">{member.email}</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <span className={`text-xs px-2 py-1 rounded ${
                            member.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {member.status === 'active' ? '✓ Active' : '⚠️ Suspended'}
                          </span>
                          {member.violationCount > 0 && (
                            <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded">
                              {member.violationCount} violation{member.violationCount > 1 ? 's' : ''}
                            </span>
                          )}
                          <span className="text-xs text-[#4A6572]">Joined: {member.joinedDate}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {member.status === 'active' && (
                          <button
                            onClick={() => handleSuspendMember(member.id)}
                            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
                          >
                            Suspend
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-[#4A6572] py-6">No members in this circle yet</p>
                )}
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-[#D0DDE2] p-4 flex justify-end">
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="px-6 py-2 bg-[#003E51] text-white rounded-lg font-medium hover:bg-[#002A38] transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
