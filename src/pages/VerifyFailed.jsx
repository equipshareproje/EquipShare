import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authApi from '../api/auth';

export default function VerifyFailed() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState('');

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setSent('');
    try {
      await authApi.resendVerification(email.trim());
      setSent('Verification email sent! Check your inbox.');
    } catch {
      setSent('Request submitted. If this email is registered, you will receive a new link.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-md p-12 max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-red-500">✕</span>
        </div>
        <h1 className="text-3xl font-bold text-[#003E51] mb-3">Verification Failed</h1>
        <p className="text-[#4A6572] mb-8">
          The verification link is invalid or has expired. Request a new one below.
        </p>

        {sent ? (
          <p className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-sm">{sent}</p>
        ) : (
          <form onSubmit={handleResend} className="mb-6 text-left">
            <label className="block text-sm font-medium text-[#0A1F29] mb-2">Your email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] mb-3"
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-[#003E51] hover:bg-[#002A38] text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {sending ? 'Sending…' : 'Resend Verification Email'}
            </button>
          </form>
        )}

        <Link to="/signin" className="text-[#00879E] hover:underline text-sm font-medium">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
