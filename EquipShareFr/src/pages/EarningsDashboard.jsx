import React, { useState } from 'react';

const EarningsDashboard = () => {
  // Mock transaction data - realistic earnings history
  const [transactions, setTransactions] = useState([
    {
      id: 'T001',
      date: '2026-03-15',
      equipment: 'Professional Camera Kit',
      renter: 'Fatima Al-Dosari',
      days: 7,
      dailyRate: 50,
      subtotal: 350,
      serviceFee: 35,
      total: 385,
      status: 'completed',
    },
    {
      id: 'T002',
      date: '2026-03-22',
      equipment: 'DJI Mavic 3 Drone',
      renter: 'Ahmed Al-Otaibi',
      days: 3,
      dailyRate: 75,
      subtotal: 225,
      serviceFee: 22.5,
      total: 247.5,
      status: 'completed',
    },
    {
      id: 'T003',
      date: '2026-03-28',
      equipment: 'Laptop Stand (Premium)',
      renter: 'Sarah Mohammed',
      days: 14,
      dailyRate: 15,
      subtotal: 210,
      serviceFee: 21,
      total: 231,
      status: 'completed',
    },
    {
      id: 'T004',
      date: '2026-04-02',
      equipment: 'RGB Ring Light with Stand',
      renter: 'Omar Al-Shammari',
      days: 5,
      dailyRate: 20,
      subtotal: 100,
      serviceFee: 10,
      total: 110,
      status: 'completed',
    },
    {
      id: 'T005',
      date: '2026-04-05',
      equipment: 'Blue Yeti Microphone',
      renter: 'Noor Al-Khalif',
      days: 10,
      dailyRate: 25,
      subtotal: 250,
      serviceFee: 25,
      total: 275,
      status: 'pending',
    },
    {
      id: 'T006',
      date: '2026-04-08',
      equipment: 'Audio Interface 2i2',
      renter: 'Hassan Al-Ghamdi',
      days: 8,
      dailyRate: 35,
      subtotal: 280,
      serviceFee: 28,
      total: 308,
      status: 'pending',
    },
  ]);

  // State for filters and modals
  const [filterStartDate, setFilterStartDate] = useState('2026-03-01');
  const [filterEndDate, setFilterEndDate] = useState('2026-04-30');
  const [filterEquipment, setFilterEquipment] = useState('all');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // Calculate totals
  const completedTotal = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.total, 0);

  const pendingTotal = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.total, 0);

  const totalEarnings = completedTotal + pendingTotal;
  const minimumPayoutThreshold = 100;

  // Get unique equipment names for filter
  const uniqueEquipment = ['all', ...new Set(transactions.map(t => t.equipment))];

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const dateCheck = t.date >= filterStartDate && t.date <= filterEndDate;
    const equipmentCheck = filterEquipment === 'all' || t.equipment === filterEquipment;
    return dateCheck && equipmentCheck;
  });

  // Monthly earnings calculation
  const monthlyEarnings = {};
  transactions.forEach(t => {
    const month = t.date.substring(0, 7); // YYYY-MM format
    if (!monthlyEarnings[month]) {
      monthlyEarnings[month] = 0;
    }
    monthlyEarnings[month] += t.total;
  });

  // Get months for chart
  const months = Object.keys(monthlyEarnings).sort();
  const maxEarning = Math.max(...Object.values(monthlyEarnings));

  // Handle payout request
  const handlePayoutRequest = () => {
    const amount = parseFloat(payoutAmount);
    
    if (!amount || amount <= 0) {
      alert('❌ Please enter a valid payout amount');
      return;
    }

    if (amount > completedTotal) {
      alert('❌ Payout amount exceeds available balance (completed transactions only)');
      return;
    }

    if (amount < minimumPayoutThreshold) {
      alert(`❌ Minimum payout amount is SAR ${minimumPayoutThreshold}`);
      return;
    }

    alert(`✅ Payout request of SAR ${amount.toFixed(2)} submitted successfully!\n✉️ Confirmation email sent to your registered account.`);
    setPayoutAmount('');
    setShowPayoutModal(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status) => {
    return status === 'completed'
      ? 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium'
      : 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium';
  };

  const getStatusLabel = (status) => {
    return status === 'completed' ? '✓ Completed' : '⏳ Pending';
  };

  return (
    <div className="min-h-screen bg-[#F4F7F8] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0A1F29] mb-2">Earnings Dashboard</h1>
          <p className="text-[#4A6572] text-lg">Track your rental income and manage payouts</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#003E51]">
            <p className="text-[#4A6572] font-medium text-sm mb-2">Total Earnings</p>
            <p className="text-3xl font-bold text-[#003E51]">SAR {totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-[#4A6572] mt-2">{transactions.length} transactions</p>
          </div>

          {/* Completed Balance */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#1A7F5A]">
            <p className="text-[#4A6572] font-medium text-sm mb-2">Available Balance</p>
            <p className="text-3xl font-bold text-[#1A7F5A]">SAR {completedTotal.toFixed(2)}</p>
            <p className="text-xs text-[#4A6572] mt-2">✓ Ready to withdraw</p>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#D97706]">
            <p className="text-[#4A6572] font-medium text-sm mb-2">Pending Earnings</p>
            <p className="text-3xl font-bold text-[#D97706]">SAR {pendingTotal.toFixed(2)}</p>
            <p className="text-xs text-[#4A6572] mt-2">⏳ Awaiting completion</p>
          </div>

          {/* Request Payout Button */}
          <div className="bg-gradient-to-br from-[#003E51] to-[#002A38] rounded-lg shadow-md p-6 text-white flex flex-col justify-between">
            <div>
              <p className="font-medium text-sm mb-2 opacity-90">Ready to receive?</p>
              <p className="text-sm opacity-75">Min. SAR {minimumPayoutThreshold}</p>
            </div>
            <button
              onClick={() => setShowPayoutModal(true)}
              className="mt-4 bg-white text-[#003E51] font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition"
            >
              Request Payout
            </button>
          </div>
        </div>

        {/* Monthly Earnings Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-[#0A1F29] mb-6">Monthly Revenue</h2>
          
          <div className="flex items-end justify-between h-64 gap-2 px-4">
            {months.map(month => {
              const earning = monthlyEarnings[month];
              const height = (earning / maxEarning) * 100;
              const [year, monthNum] = month.split('-');
              const monthName = new Date(year, monthNum - 1).toLocaleString('en-US', { month: 'short' });

              return (
                <div key={month} className="flex-1 flex flex-col items-center">
                  {/* Bar */}
                  <div
                    className="w-full bg-gradient-to-t from-[#00879E] to-[#005570] rounded-t-lg transition hover:from-[#003E51] hover:to-[#00879E] cursor-pointer"
                    style={{ height: `${height}%`, minHeight: '20px' }}
                    title={`${monthName}: SAR ${earning.toFixed(2)}`}
                  />
                  {/* Value */}
                  <p className="text-sm font-semibold text-[#0A1F29] mt-3">{monthName}</p>
                  <p className="text-xs text-[#4A6572]">SAR {earning.toFixed(0)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-[#0A1F29] mb-4">Filter Transactions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range Start */}
            <div>
              <label className="block text-sm font-medium text-[#0A1F29] mb-2">From Date</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full border border-[#D0DDE2] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00879E] bg-white text-[#0A1F29]"
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className="block text-sm font-medium text-[#0A1F29] mb-2">To Date</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full border border-[#D0DDE2] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00879E] bg-white text-[#0A1F29]"
              />
            </div>

            {/* Equipment Filter */}
            <div>
              <label className="block text-sm font-medium text-[#0A1F29] mb-2">Equipment</label>
              <select
                value={filterEquipment}
                onChange={(e) => setFilterEquipment(e.target.value)}
                className="w-full border border-[#D0DDE2] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00879E] bg-white text-[#0A1F29]"
              >
                {uniqueEquipment.map(eq => (
                  <option key={eq} value={eq}>
                    {eq === 'all' ? 'All Equipment' : eq}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Transaction History Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-[#D0DDE2]">
            <h2 className="text-xl font-bold text-[#0A1F29]">Transaction History</h2>
            <p className="text-sm text-[#4A6572] mt-1">Showing {filteredTransactions.length} transaction(s)</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F4F7F8] border-b border-[#D0DDE2]">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-[#0A1F29]">Date</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#0A1F29]">Equipment</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#0A1F29]">Renter</th>
                  <th className="px-6 py-3 text-center font-semibold text-[#0A1F29]">Days</th>
                  <th className="px-6 py-3 text-right font-semibold text-[#0A1F29]">Rate/Day</th>
                  <th className="px-6 py-3 text-right font-semibold text-[#0A1F29]">Subtotal</th>
                  <th className="px-6 py-3 text-right font-semibold text-[#0A1F29]">Service Fee</th>
                  <th className="px-6 py-3 text-right font-semibold text-[#0A1F29]">Total</th>
                  <th className="px-6 py-3 text-center font-semibold text-[#0A1F29]">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map(transaction => (
                    <tr
                      key={transaction.id}
                      className="border-b border-[#D0DDE2] hover:bg-[#F4F7F8] transition"
                    >
                      <td className="px-6 py-3 text-[#0A1F29]">{formatDate(transaction.date)}</td>
                      <td className="px-6 py-3 text-[#0A1F29] font-medium">{transaction.equipment}</td>
                      <td className="px-6 py-3 text-[#4A6572]">{transaction.renter}</td>
                      <td className="px-6 py-3 text-center text-[#0A1F29]">{transaction.days}</td>
                      <td className="px-6 py-3 text-right text-[#0A1F29]">SAR {transaction.dailyRate}</td>
                      <td className="px-6 py-3 text-right text-[#0A1F29]">SAR {transaction.subtotal.toFixed(2)}</td>
                      <td className="px-6 py-3 text-right text-[#00879E] font-medium">
                        -SAR {transaction.serviceFee.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-[#003E51]">
                        SAR {transaction.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={getStatusBadge(transaction.status)}>
                          {getStatusLabel(transaction.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-[#4A6572]">
                      No transactions found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          {filteredTransactions.length > 0 && (
            <div className="bg-[#F4F7F8] px-6 py-4 border-t border-[#D0DDE2] flex justify-end gap-8">
              <div>
                <p className="text-sm text-[#4A6572]">Subtotal</p>
                <p className="text-lg font-bold text-[#0A1F29]">
                  SAR {filteredTransactions.reduce((sum, t) => sum + t.subtotal, 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#4A6572]">Service Fees (10%)</p>
                <p className="text-lg font-bold text-[#00879E]">
                  -SAR {filteredTransactions.reduce((sum, t) => sum + t.serviceFee, 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#4A6572]">Total</p>
                <p className="text-lg font-bold text-[#003E51]">
                  SAR {filteredTransactions.reduce((sum, t) => sum + t.total, 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#0A1F29] mb-2">Request Payout</h2>
            <p className="text-[#4A6572] mb-6">Transfer your available earnings to your registered account</p>

            {/* Info Box */}
            <div className="bg-[#F4F7F8] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#4A6572] mb-2">Available Balance:</p>
              <p className="text-2xl font-bold text-[#003E51]">SAR {completedTotal.toFixed(2)}</p>
              <p className="text-xs text-[#4A6572] mt-2">
                Minimum: SAR {minimumPayoutThreshold} | Maximum: SAR {completedTotal.toFixed(2)}
              </p>
            </div>

            {/* Input Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#0A1F29] mb-2">
                Payout Amount (SAR)
              </label>
              <input
                type="number"
                min={minimumPayoutThreshold}
                max={completedTotal}
                step="10"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder={`Min: ${minimumPayoutThreshold}`}
                className="w-full border-2 border-[#D0DDE2] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00879E] focus:border-transparent bg-white text-[#0A1F29]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 bg-[#D0DDE2] text-[#0A1F29] font-semibold py-3 px-4 rounded-lg hover:bg-[#C0CDD2] transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePayoutRequest}
                className="flex-1 bg-[#003E51] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#002A38] transition"
              >
                Submit Request
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-[#4A6572] mt-4 text-center">
              Payouts are processed within 3-5 business days to your registered bank account.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsDashboard;
