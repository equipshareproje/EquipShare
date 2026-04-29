import React, { useState, useEffect } from 'react';
import circlesApi from '../api/circles';
import Button from '../components/Button';

export default function Circles() {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // circle _id being acted on

  useEffect(() => {
    const load = async () => {
      try {
        const res = await circlesApi.getCircles();
        const data = res.data.data;
        setCircles(Array.isArray(data) ? data : data?.circles || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load circles.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleJoin = async (circle) => {
    setActionLoading(circle._id);
    try {
      await circlesApi.joinCircle(circle._id);
      setCircles((prev) =>
        prev.map((c) => c._id === circle._id ? { ...c, isMember: true, memberCount: (c.memberCount || 0) + 1 } : c)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join circle.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeave = async (circle) => {
    setActionLoading(circle._id);
    try {
      await circlesApi.leaveCircle(circle._id);
      setCircles((prev) =>
        prev.map((c) => c._id === circle._id ? { ...c, isMember: false, memberCount: Math.max((c.memberCount || 1) - 1, 0) } : c)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave circle.');
    } finally {
      setActionLoading(null);
    }
  };

  const joinedCount = circles.filter((c) => c.isMember).length;

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-primary text-white py-12 mb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-4xl font-bold mb-3">Trusted Circles</h1>
          <p className="text-lg text-white max-w-2xl opacity-90">
            Join verified communities to connect with trusted peers and build stronger networks within your circle.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl pb-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#003E51] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : circles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-lg text-[#4A6572]">No circles available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {circles.map((circle) => (
              <div
                key={circle._id}
                className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-border">
                  <div>
                    <h2 className="text-2xl font-bold text-primary mb-1">{circle.name}</h2>
                    <p className="text-sm text-text-secondary">
                      {(circle.memberCount || circle.members || 0).toLocaleString()} members
                    </p>
                  </div>
                  {circle.isMember && (
                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">Joined</span>
                  )}
                </div>

                {circle.description && (
                  <p className="text-text-secondary text-sm mb-4">{circle.description}</p>
                )}

                {circle.verificationCriteria && (
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                      Verification criteria
                    </p>
                    <p className="text-text-primary font-medium">{circle.verificationCriteria}</p>
                  </div>
                )}

                {circle.isMember ? (
                  <Button
                    variant="secondary"
                    onClick={() => handleLeave(circle)}
                    className="w-full"
                    disabled={actionLoading === circle._id}
                  >
                    {actionLoading === circle._id ? 'Leaving…' : 'Leave Circle'}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => handleJoin(circle)}
                    className="w-full"
                    disabled={actionLoading === circle._id}
                  >
                    {actionLoading === circle._id ? 'Joining…' : 'Join'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border-t border-border py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-bold text-primary mb-2">Why Join?</h3>
              <p className="text-text-secondary">
                Access exclusive listings from verified members, build trust through shared verification, and connect with peers who share common interests.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary mb-2">How It Works</h3>
              <p className="text-text-secondary">
                Choose a circle matching your verification criteria, join the circle, and gain access to trusted member benefits.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary mb-2">Your Circles</h3>
              <p className="text-text-secondary">
                Currently joined: <span className="font-bold">{joinedCount}</span> {joinedCount === 1 ? 'circle' : 'circles'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
