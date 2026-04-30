import React, { useState, useEffect } from 'react';
import disputesApi from '../api/disputes';
import reportsApi from '../api/reports';
import circlesApi from '../api/circles';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('disputes');

  // Disputes
  const [disputes, setDisputes] = useState([]);
  const [disputesLoading, setDisputesLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [rulingEnum, setRulingEnum] = useState('');
  const [rulingNote, setRulingNote] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [resolvingDispute, setResolvingDispute] = useState(false);
  const [markingDisputeId, setMarkingDisputeId] = useState(null);

  // Reports
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportAction, setReportAction] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [resolvingReport, setResolvingReport] = useState(false);
  const [markingReportId, setMarkingReportId] = useState(null);

  // Circles
  const [circles, setCircles] = useState([]);
  const [circlesLoading, setCirclesLoading] = useState(true);
  const [circleMembers, setCircleMembers] = useState({});
  const [membersLoading, setMembersLoading] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState(null);

  // Create circle form
  const [showNewCircleForm, setShowNewCircleForm] = useState(false);
  const [newCircle, setNewCircle] = useState({ name: '', description: '', eligibilityCriteria: '', emailDomainRule: '' });
  const [circleFormErrors, setCircleFormErrors] = useState({});
  const [creatingCircle, setCreatingCircle] = useState(false);

  useEffect(() => {
    loadDisputes();
    loadReports();
    loadCircles();
  }, []);

  const loadDisputes = async () => {
    setDisputesLoading(true);
    try {
      const res = await disputesApi.getDisputes();
      const data = res.data.data;
      setDisputes(Array.isArray(data) ? data : data?.disputes || []);
    } catch (err) {
      console.error('Failed to load disputes:', err);
    } finally {
      setDisputesLoading(false);
    }
  };

  const loadReports = async () => {
    setReportsLoading(true);
    try {
      const res = await reportsApi.getReports();
      const data = res.data.data;
      setReports(Array.isArray(data) ? data : data?.reports || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  const loadCircles = async () => {
    setCirclesLoading(true);
    try {
      const res = await circlesApi.getCircles();
      const data = res.data.data;
      setCircles(Array.isArray(data) ? data : data?.circles || []);
    } catch (err) {
      console.error('Failed to load circles:', err);
    } finally {
      setCirclesLoading(false);
    }
  };

  const handleMarkDisputeUnderReview = async (dispute) => {
    setMarkingDisputeId(dispute._id);
    try {
      await disputesApi.markUnderReview(dispute._id);
      setDisputes((prev) =>
        prev.map((d) => d._id === dispute._id ? { ...d, status: 'UnderReview' } : d)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setMarkingDisputeId(null);
    }
  };

  const handleMarkReportUnderReview = async (report) => {
    setMarkingReportId(report._id);
    try {
      await reportsApi.markUnderReview(report._id);
      setReports((prev) =>
        prev.map((r) => r._id === report._id ? { ...r, status: 'UnderReview' } : r)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setMarkingReportId(null);
    }
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute || !rulingEnum) return;
    if (rulingNote.trim().length < 10) {
      alert('Ruling note must be at least 10 characters.');
      return;
    }
    setResolvingDispute(true);
    try {
      const body = { ruling: rulingEnum, rulingNote: rulingNote.trim() };
      if (rulingEnum === 'LenderResponsible' && refundAmount) {
        body.refundAmount = parseFloat(refundAmount);
      }
      await disputesApi.resolveDispute(selectedDispute._id, body);
      setDisputes((prev) =>
        prev.map((d) =>
          d._id === selectedDispute._id ? { ...d, status: 'Resolved', ruling: rulingEnum } : d
        )
      );
      setSelectedDispute(null);
      setRulingEnum('');
      setRulingNote('');
      setRefundAmount('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve dispute.');
    } finally {
      setResolvingDispute(false);
    }
  };

  const handleResolveReport = async () => {
    if (!selectedReport || !reportAction) return;
    setResolvingReport(true);
    try {
      await reportsApi.resolveReport(selectedReport._id, {
        action: reportAction,
        note: reportNote.trim() || undefined,
      });
      setReports((prev) =>
        prev.map((r) =>
          r._id === selectedReport._id ? { ...r, status: 'Resolved', adminAction: reportAction, adminNote: reportNote.trim() || undefined } : r
        )
      );
      setSelectedReport(null);
      setReportAction('');
      setReportNote('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve report.');
    } finally {
      setResolvingReport(false);
    }
  };

  const handleViewMembers = async (circle) => {
    setSelectedCircle(circle);
    if (circleMembers[circle._id]) return;
    setMembersLoading(true);
    try {
      const res = await circlesApi.getMembers(circle._id);
      const data = res.data.data;
      setCircleMembers((prev) => ({
        ...prev,
        [circle._id]: Array.isArray(data) ? data : data?.members || [],
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load members.');
    } finally {
      setMembersLoading(false);
    }
  };

  const handleCreateCircle = async () => {
    // Client-side validation matching backend rules
    const errs = {};
    if (!newCircle.name.trim()) errs.name = 'Circle name is required.';
    if (!newCircle.description.trim()) errs.description = 'Description is required.';
    else if (newCircle.description.trim().length < 10) errs.description = 'Description must be at least 10 characters.';
    if (!newCircle.eligibilityCriteria.trim()) errs.eligibilityCriteria = 'Eligibility criteria is required.';
    if (Object.keys(errs).length > 0) { setCircleFormErrors(errs); return; }
    setCircleFormErrors({});
    setCreatingCircle(true);
    try {
      const payload = {
        name: newCircle.name.trim(),
        description: newCircle.description.trim(),
        eligibilityCriteria: newCircle.eligibilityCriteria.trim(),
      };
      if (newCircle.emailDomainRule.trim()) payload.emailDomainRule = newCircle.emailDomainRule.trim();
      const res = await circlesApi.createCircle(payload);
      const created = res.data.data;
      setCircles((prev) => [...prev, created]);
      setNewCircle({ name: '', description: '', eligibilityCriteria: '', emailDomainRule: '' });
      setCircleFormErrors({});
      setShowNewCircleForm(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create circle.';
      setCircleFormErrors({ submit: msg });
    } finally {
      setCreatingCircle(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isOpen = (status) => status === 'Open' || status === 'UnderReview';

  const tabs = [
    { id: 'disputes', label: `Disputes (${disputes.filter((d) => isOpen(d.status)).length})` },
    { id: 'reports', label: `Reports (${reports.filter((r) => isOpen(r.status)).length})` },
    { id: 'circles', label: `Circles (${circles.length})` },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7F8]">
      <div className="bg-gradient-to-r from-[#003E51] to-[#002A38] text-white py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-200">Platform moderation, disputes, and trust management</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#D0DDE2] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-4 font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-[#003E51] border-b-2 border-[#003E51]'
                  : 'text-[#4A6572] hover:text-[#003E51]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Disputes Tab */}
        {activeTab === 'disputes' && (
          <div>
            {disputesLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#003E51] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : disputes.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-lg text-[#4A6572]">No disputes found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map((dispute) => (
                  <div key={dispute._id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-[#003E51]">
                            {dispute.bookingId?.listingId?.title || dispute.equipment || 'Dispute'}
                          </h3>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            dispute.status === 'Resolved'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {dispute.status}
                          </span>
                        </div>
                        <p className="text-sm text-[#4A6572]">
                          Filed: {formatDate(dispute.createdAt)} •{' '}
                          Filed by: {dispute.filedById?.name || '—'}{dispute.filedByRole ? ` (${dispute.filedByRole})` : ''}
                        </p>
                      </div>
                    </div>

                    <p className="text-[#4A6572] mb-4">{dispute.description || dispute.issue || '—'}</p>

                    {dispute.status !== 'Resolved' && (
                      <div className="flex gap-2">
                        {dispute.status === 'Open' && (
                          <button
                            onClick={() => handleMarkDisputeUnderReview(dispute)}
                            disabled={markingDisputeId === dispute._id}
                            className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition"
                          >
                            {markingDisputeId === dispute._id ? 'Updating…' : 'Mark Under Review'}
                          </button>
                        )}
                        <button
                          onClick={() => { setSelectedDispute(dispute); setRulingEnum(''); setRulingNote(''); setRefundAmount(''); }}
                          className="px-4 py-2 bg-[#003E51] text-white text-sm font-medium rounded-lg hover:bg-[#002A38] transition"
                        >
                          Resolve Dispute
                        </button>
                      </div>
                    )}

                    {dispute.ruling && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs font-semibold text-green-900 mb-1">Ruling:</p>
                        <p className="text-sm text-green-800">{dispute.ruling}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            {reportsLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#003E51] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-lg text-[#4A6572]">No reports found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report._id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-[#003E51]">
                            {report.listingId?.title || report.listing || 'Report'}
                          </h3>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            report.status === 'Resolved'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-sm text-[#4A6572]">
                          Reported: {formatDate(report.createdAt)} •{' '}
                          By: {report.reportedById?.name || '—'}
                        </p>
                      </div>
                    </div>

                    <p className="text-[#4A6572] mb-4">{report.reason || report.description || '—'}</p>

                    {report.status !== 'Resolved' && (
                      <div className="flex gap-2">
                        {report.status === 'Open' && (
                          <button
                            onClick={() => handleMarkReportUnderReview(report)}
                            disabled={markingReportId === report._id}
                            className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition"
                          >
                            {markingReportId === report._id ? 'Updating…' : 'Mark Under Review'}
                          </button>
                        )}
                        <button
                          onClick={() => { setSelectedReport(report); setReportAction(''); setReportNote(''); }}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
                        >
                          Resolve Report
                        </button>
                      </div>
                    )}

                    {report.adminAction && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs font-semibold text-green-900 mb-1">Action taken: {report.adminAction}</p>
                        {report.adminNote && (
                          <p className="text-sm text-green-800">{report.adminNote}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Circles Tab */}
        {activeTab === 'circles' && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowNewCircleForm(true)}
                className="px-4 py-2 bg-[#003E51] text-white text-sm font-medium rounded-lg hover:bg-[#002A38] transition"
              >
                + Create Circle
              </button>
            </div>

            {circlesLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#003E51] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : circles.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-lg text-[#4A6572]">No circles yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {circles.map((circle) => (
                  <div key={circle._id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-[#003E51] text-lg">{circle.name}</h3>
                        <p className="text-sm text-[#4A6572]">{(circle.memberCount || 0).toLocaleString()} members</p>
                      </div>
                    </div>
                    {circle.description && (
                      <p className="text-sm text-[#4A6572] mb-3">{circle.description}</p>
                    )}
                    {circle.eligibilityCriteria && (
                      <p className="text-xs text-[#00879E] mb-4">Criteria: {circle.eligibilityCriteria}</p>
                    )}
                    <button
                      onClick={() => handleViewMembers(circle)}
                      className="text-sm text-[#003E51] font-medium hover:underline"
                    >
                      View Members →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resolve Dispute Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-[#003E51] mb-3">Resolve Dispute</h2>
            <p className="text-sm text-[#4A6572] mb-4">
              Equipment: <strong>{selectedDispute.bookingId?.listingId?.title || selectedDispute.equipment || '—'}</strong>
            </p>
            <p className="text-sm text-[#4A6572] mb-4">{selectedDispute.description || selectedDispute.issue}</p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-bold text-[#003E51] mb-2">Ruling *</label>
                <select
                  value={rulingEnum}
                  onChange={(e) => setRulingEnum(e.target.value)}
                  className="w-full px-4 py-3 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                >
                  <option value="">Select ruling…</option>
                  <option value="RenterResponsible">Renter Responsible</option>
                  <option value="LenderResponsible">Lender Responsible</option>
                  <option value="NoFaultFound">No Fault Found</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#003E51] mb-2">
                  Ruling Note * <span className="text-xs font-normal text-[#4A6572]">(min 10 characters)</span>
                </label>
                <textarea
                  value={rulingNote}
                  onChange={(e) => setRulingNote(e.target.value)}
                  rows="3"
                  placeholder="Explain the decision…"
                  className="w-full px-4 py-3 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                />
                <p className="text-xs text-[#4A6572] mt-1">{rulingNote.trim().length}/10 minimum</p>
              </div>
              {rulingEnum === 'LenderResponsible' && (
                <div>
                  <label className="block text-sm font-bold text-[#003E51] mb-2">Refund Amount (SAR) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="e.g. 150.00"
                    className="w-full px-4 py-3 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedDispute(null)}
                className="flex-1 px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#0A1F29] font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveDispute}
                disabled={
                  !rulingEnum ||
                  rulingNote.trim().length < 10 ||
                  (rulingEnum === 'LenderResponsible' && !refundAmount) ||
                  resolvingDispute
                }
                className="flex-1 px-4 py-2 bg-[#003E51] text-white rounded-lg font-medium hover:bg-[#002A38] disabled:opacity-50"
              >
                {resolvingDispute ? 'Resolving…' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-[#003E51] mb-3">Resolve Report</h2>
            <p className="text-sm text-[#4A6572] mb-4">
              Listing: <strong>{selectedReport.listingId?.title || selectedReport.listing || '—'}</strong>
            </p>
            <p className="text-sm text-[#4A6572] mb-4">{selectedReport.reason || selectedReport.description}</p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-bold text-[#003E51] mb-2">Action *</label>
                <select
                  value={reportAction}
                  onChange={(e) => setReportAction(e.target.value)}
                  className="w-full px-4 py-3 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                >
                  <option value="">Select action…</option>
                  <option value="Dismiss">Dismiss — no violation found</option>
                  <option value="WarnLender">Warn Lender</option>
                  <option value="RemoveListing">Remove Listing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#003E51] mb-2">Note (optional)</label>
                <textarea
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  rows="3"
                  placeholder="Additional notes…"
                  className="w-full px-4 py-3 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedReport(null)}
                className="flex-1 px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#0A1F29] font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveReport}
                disabled={!reportAction || resolvingReport}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {resolvingReport ? 'Resolving…' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {selectedCircle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#003E51]">{selectedCircle.name} — Members</h2>
              <button onClick={() => setSelectedCircle(null)} className="text-[#4A6572] hover:text-[#0A1F29] text-2xl">✕</button>
            </div>

            {membersLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-[#003E51] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (circleMembers[selectedCircle._id] || []).length === 0 ? (
              <p className="text-[#4A6572] text-center py-8">No members yet.</p>
            ) : (
              <div className="space-y-3">
                {(circleMembers[selectedCircle._id] || []).map((member) => (
                  <div key={member._id || member.id} className="flex items-center justify-between p-3 bg-[#F4F7F8] rounded-lg">
                    <div>
                      <p className="font-medium text-[#003E51]">{member.name}</p>
                      <p className="text-xs text-[#4A6572]">{member.email}</p>
                    </div>
                    <span className="text-xs text-[#4A6572]">{formatDate(member.joinedAt || member.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Circle Modal */}
      {showNewCircleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-[#003E51] mb-4">Create Trusted Circle</h2>
            {circleFormErrors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{circleFormErrors.submit}</p>
              </div>
            )}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-[#003E51] mb-2">Circle Name *</label>
                <input
                  type="text"
                  value={newCircle.name}
                  onChange={(e) => { setNewCircle({ ...newCircle, name: e.target.value }); setCircleFormErrors((p) => ({ ...p, name: '' })); }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${circleFormErrors.name ? 'border-red-400' : 'border-[#D0DDE2]'}`}
                  placeholder="e.g. KFUPM Students"
                />
                {circleFormErrors.name && <p className="text-red-600 text-xs mt-1">{circleFormErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-[#003E51] mb-2">Description * <span className="font-normal text-[#4A6572]">(min 10 chars)</span></label>
                <textarea
                  value={newCircle.description}
                  onChange={(e) => { setNewCircle({ ...newCircle, description: e.target.value }); setCircleFormErrors((p) => ({ ...p, description: '' })); }}
                  rows="3"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${circleFormErrors.description ? 'border-red-400' : 'border-[#D0DDE2]'}`}
                  placeholder="Describe this circle…"
                />
                {circleFormErrors.description && <p className="text-red-600 text-xs mt-1">{circleFormErrors.description}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-[#003E51] mb-2">Eligibility Criteria *</label>
                <input
                  type="text"
                  value={newCircle.eligibilityCriteria}
                  onChange={(e) => { setNewCircle({ ...newCircle, eligibilityCriteria: e.target.value }); setCircleFormErrors((p) => ({ ...p, eligibilityCriteria: '' })); }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${circleFormErrors.eligibilityCriteria ? 'border-red-400' : 'border-[#D0DDE2]'}`}
                  placeholder="e.g. Verified KFUPM email address required"
                />
                {circleFormErrors.eligibilityCriteria && <p className="text-red-600 text-xs mt-1">{circleFormErrors.eligibilityCriteria}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-[#003E51] mb-2">Email Domain Rule <span className="font-normal text-[#4A6572]">(optional — gates self-join)</span></label>
                <input
                  type="text"
                  value={newCircle.emailDomainRule}
                  onChange={(e) => setNewCircle({ ...newCircle, emailDomainRule: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                  placeholder="e.g. kfupm.edu.sa"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowNewCircleForm(false); setCircleFormErrors({}); }}
                className="flex-1 px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#0A1F29] font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCircle}
                disabled={!newCircle.name || !newCircle.description || !newCircle.eligibilityCriteria || creatingCircle}
                className="flex-1 px-4 py-2 bg-[#003E51] text-white rounded-lg font-medium hover:bg-[#002A38] disabled:opacity-50"
              >
                {creatingCircle ? 'Creating…' : 'Create Circle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
