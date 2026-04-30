import React, { useState, useEffect } from 'react';
import earningsApi from '../api/earnings';

export default function EarningsDashboard() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('transactions');

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, txRes, payoutsRes] = await Promise.all([
          earningsApi.getSummary(),
          earningsApi.getTransactions(),
          earningsApi.getPayouts(),
        ]);
        setSummary(summaryRes.data.data || summaryRes.data);
        const txData = txRes.data.data;
        setTransactions(Array.isArray(txData) ? txData : txData?.transactions || []);
        const payoutsData = payoutsRes.data.data;
        setPayouts(Array.isArray(payoutsData) ? payoutsData : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load earnings data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter by completedAt (the correct API field)
  const filteredTransactions = transactions.filter((t) => {
    const date = t.completedAt || '';
    if (filterStartDate && date < filterStartDate) return false;
    if (filterEndDate && date > filterEndDate) return false;
    return true;
  });

  // Monthly chart from API breakdown (uses amount field per spec)
  const monthlyEarnings = (() => {
    const breakdown = summary?.monthlyBreakdown;
    if (Array.isArray(breakdown) && breakdown.length > 0) {
      const map = {};
      breakdown.forEach((b) => { if (b.month) map[b.month] = b.amount ?? 0; });
      return map;
    }
    // Fallback: derive from transactions using completedAt + totalAmount
    const map = {};
    transactions.forEach((t) => {
      const month = (t.completedAt || '').substring(0, 7);
      if (month) map[month] = (map[month] || 0) + (t.totalAmount || 0);
    });
    return map;
  })();
  const months = Object.keys(monthlyEarnings).sort();
  const maxEarning = Math.max(...Object.values(monthlyEarnings), 1);

  const handlePayoutRequest = async () => {
    setPayoutLoading(true);
    setPayoutSuccess('');
    try {
      const res = await earningsApi.requestPayout();
      const newPayout = res.data.data;
      setPayoutSuccess('Payout request submitted! Processed within 3-5 business days.');
      if (newPayout) setPayouts((prev) => [newPayout, ...prev]);
      setShowPayoutModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to request payout.';
      alert(msg);
    } finally {
      setPayoutLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const payoutStatusBadge = (status) => {
    const map = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Processing: 'bg-blue-100 text-blue-800',
      Paid: 'bg-green-100 text-green-800',
      Failed: 'bg-red-100 text-red-700',
    };
    return `${map[status] || 'bg-gray-100 text-gray-700'} px-3 py-1 rounded-full text-xs font-medium`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#003E51] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalEarnings = summary?.totalEarnings ?? 0;
  const pendingPayoutBalance = summary?.pendingPayoutBalance ?? 0;

  return (
    <div className="min-h-screen bg-[#F4F7F8] pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0A1F29] mb-2">Earnings Dashboard</h1>
          <p className="text-[#4A6572] text-lg">Track your rental income and manage payouts</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        {payoutSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg text-green-700 text-sm">{payoutSuccess}</div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#003E51]">
            <p className="text-[#4A6572] font-medium text-sm mb-2">Total Earnings</p>
            <p className="text-3xl font-bold text-[#003E51]">SAR {totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-[#4A6572] mt-2">{transactions.length} completed transactions</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#1A7F5A]">
            <p className="text-[#4A6572] font-medium text-sm mb-2">Pending Payout Balance</p>
            <p className="text-3xl font-bold text-[#1A7F5A]">SAR {pendingPayoutBalance.toFixed(2)}</p>
            <p className="text-xs text-[#4A6572] mt-2">Awaiting payout request</p>
          </div>

          <div className="bg-gradient-to-br from-[#003E51] to-[#002A38] rounded-lg shadow-md p-6 text-white flex flex-col justify-between">
            <div>
              <p className="font-medium text-sm mb-2 opacity-90">Ready to receive?</p>
              <p className="text-sm opacity-75">Min. SAR 50</p>
            </div>
            <button
              onClick={() => setShowPayoutModal(true)}
              className="mt-4 bg-white text-[#003E51] font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition"
            >
              Request Payout
            </button>
          </div>
        </div>

        {/* Monthly Chart */}
        {months.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-[#0A1F29] mb-6">Monthly Revenue</h2>
            <div className="flex items-end justify-between h-48 gap-2 px-4">
              {months.map((month) => {
                const earning = monthlyEarnings[month];
                const height = (earning / maxEarning) * 100;
                const [year, monthNum] = month.split('-');
                const monthName = new Date(year, monthNum - 1).toLocaleString('en-US', { month: 'short' });
                return (
                  <div key={month} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-[#00879E] to-[#005570] rounded-t-lg transition"
                      style={{ height: `${height}%`, minHeight: '8px' }}
                      title={`${monthName}: SAR ${earning.toFixed(2)}`}
                    />
                    <p className="text-sm font-semibold text-[#0A1F29] mt-2">{monthName}</p>
                    <p className="text-xs text-[#4A6572]">SAR {earning.toFixed(0)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#D0DDE2]">
          {['transactions', 'payouts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 font-medium transition capitalize ${
                activeTab === tab
                  ? 'text-[#003E51] border-b-2 border-[#003E51]'
                  : 'text-[#4A6572] hover:text-[#003E51]'
              }`}
            >
              {tab === 'transactions' ? 'Transaction History' : 'Payout History'}
            </button>
          ))}
        </div>

        {activeTab === 'transactions' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-bold text-[#0A1F29] mb-4">Filter Transactions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0A1F29] mb-2">From Date</label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="w-full border border-[#D0DDE2] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00879E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A1F29] mb-2">To Date</label>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="w-full border border-[#D0DDE2] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00879E]"
                  />
                </div>
              </div>
            </div>

            {/* Transaction Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-[#D0DDE2]">
                <h2 className="text-xl font-bold text-[#0A1F29]">Transaction History</h2>
                <p className="text-sm text-[#4A6572] mt-1">Showing {filteredTransactions.length} transaction(s)</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F4F7F8] border-b border-[#D0DDE2]">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-[#0A1F29]">Completed</th>
                      <th className="px-6 py-3 text-left font-semibold text-[#0A1F29]">Equipment</th>
                      <th className="px-6 py-3 text-left font-semibold text-[#0A1F29]">Renter</th>
                      <th className="px-6 py-3 text-right font-semibold text-[#0A1F29]">Days</th>
                      <th className="px-6 py-3 text-right font-semibold text-[#0A1F29]">Subtotal</th>
                      <th className="px-6 py-3 text-right font-semibold text-[#0A1F29]">Fee</th>
                      <th className="px-6 py-3 text-right font-semibold text-[#0A1F29]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((t, i) => (
                        <tr key={t.bookingId || i} className="border-b border-[#D0DDE2] hover:bg-[#F4F7F8] transition">
                          <td className="px-6 py-3 text-[#0A1F29]">{formatDate(t.completedAt)}</td>
                          <td className="px-6 py-3 text-[#0A1F29] font-medium">{t.listingTitle || '—'}</td>
                          <td className="px-6 py-3 text-[#4A6572]">{t.renterName || '—'}</td>
                          <td className="px-6 py-3 text-right text-[#4A6572]">{t.totalDays ?? '—'}</td>
                          <td className="px-6 py-3 text-right text-[#4A6572]">SAR {(t.subtotal || 0).toFixed(2)}</td>
                          <td className="px-6 py-3 text-right text-[#4A6572]">SAR {(t.serviceFee || 0).toFixed(2)}</td>
                          <td className="px-6 py-3 text-right font-bold text-[#003E51]">SAR {(t.totalAmount || 0).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-[#4A6572]">
                          {transactions.length === 0 ? 'No transactions yet.' : 'No transactions match the selected filters.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'payouts' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-[#D0DDE2]">
              <h2 className="text-xl font-bold text-[#0A1F29]">Payout History</h2>
              <p className="text-sm text-[#4A6572] mt-1">{payouts.length} payout request(s)</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F4F7F8] border-b border-[#D0DDE2]">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A1F29]">Date</th>
                    <th className="px-6 py-3 text-right font-semibold text-[#0A1F29]">Amount</th>
                    <th className="px-6 py-3 text-center font-semibold text-[#0A1F29]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.length > 0 ? (
                    payouts.map((p, i) => (
                      <tr key={p._id || i} className="border-b border-[#D0DDE2] hover:bg-[#F4F7F8] transition">
                        <td className="px-6 py-3 text-[#0A1F29]">{formatDate(p.createdAt)}</td>
                        <td className="px-6 py-3 text-right font-bold text-[#003E51]">SAR {(p.amount || 0).toFixed(2)}</td>
                        <td className="px-6 py-3 text-center">
                          <span className={payoutStatusBadge(p.status)}>{p.status}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-[#4A6572]">No payout requests yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#0A1F29] mb-2">Request Payout</h2>
            <p className="text-[#4A6572] mb-6">Transfer your available earnings to your registered account</p>

            <div className="bg-[#F4F7F8] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#4A6572] mb-2">Pending Payout Balance:</p>
              <p className="text-2xl font-bold text-[#003E51]">SAR {pendingPayoutBalance.toFixed(2)}</p>
              <p className="text-xs text-[#4A6572] mt-2">Minimum payout: SAR 50</p>
            </div>

            {pendingPayoutBalance < 50 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">Your balance is below the minimum payout of SAR 50.</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 bg-[#D0DDE2] text-[#0A1F29] font-semibold py-3 px-4 rounded-lg hover:bg-[#C0CDD2] transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePayoutRequest}
                disabled={payoutLoading || pendingPayoutBalance < 50}
                className="flex-1 bg-[#003E51] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#002A38] disabled:opacity-50 transition"
              >
                {payoutLoading ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>

            <p className="text-xs text-[#4A6572] mt-4 text-center">
              Payouts are processed within 3-5 business days to your registered bank account.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
