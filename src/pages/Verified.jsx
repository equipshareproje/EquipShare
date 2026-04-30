import React from 'react';
import { Link } from 'react-router-dom';

export default function Verified() {
  return (
    <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-md p-12 max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-green-600">✓</span>
        </div>
        <h1 className="text-3xl font-bold text-[#003E51] mb-3">Email Verified!</h1>
        <p className="text-[#4A6572] mb-8">
          Your email address has been verified. You can now sign in to your EquipShare account.
        </p>
        <Link
          to="/signin"
          className="inline-block bg-[#003E51] hover:bg-[#002A38] text-white font-semibold py-3 px-8 rounded-lg transition"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
