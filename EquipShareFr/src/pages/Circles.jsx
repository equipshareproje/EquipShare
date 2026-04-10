import React, { useState } from 'react';
import Button from '../components/Button';

/**
 * Trusted Circles Component
 * 
 * Displays a collection of verified communities that users can join to access trusted peer networks.
 * Each circle represents a verified group (email domain, address verification, etc.)
 * 
 * Sample data matches the wireframe provided:
 * - Tech Hub (245 members, @techub.com) - Pre-joined
 * - University Circle (1863 members, @university.edu) - Pre-joined
 * - Downtown Neighborhood (57 members, verified address) - Available to join
 * - Creative Studios (142 members, @creativestudios.com) - Available to join
 */
export default function Circles() {
  const [joinedCircles, setJoinedCircles] = useState(['Tech Hub', 'University Circle']);

  const circles = [
    {
      id: 1,
      name: 'Tech Hub',
      members: 245,
      verificationCriteria: '@techub.com',
      image: 'BUSINESS',
    },
    {
      id: 2,
      name: 'University Circle',
      members: 1863,
      verificationCriteria: '@university.edu',
      image: 'EDUCATION',
    },
    {
      id: 3,
      name: 'Downtown Neighborhood',
      members: 57,
      verificationCriteria: 'Verified address',
      image: 'COMMUNITY',
    },
    {
      id: 4,
      name: 'Creative Studios',
      members: 142,
      verificationCriteria: '@creativestudios.com',
      image: 'DESIGN',
    },
  ];

  const handleJoinCircle = (circleName) => {
    if (!joinedCircles.includes(circleName)) {
      setJoinedCircles([...joinedCircles, circleName]);
    }
  };

  const handleLeaveCircle = (circleName) => {
    setJoinedCircles(joinedCircles.filter(c => c !== circleName));
  };

  const isJoined = (circleName) => joinedCircles.includes(circleName);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header Section */}
      <div className="bg-primary text-white py-12 mb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-4xl font-bold mb-3">Trusted Circles</h1>
          <p className="text-lg text-white max-w-2xl opacity-90">
            Join verified communities to connect with trusted peers and build stronger networks within your circle.
          </p>
        </div>
      </div>

      {/* Circles Grid */}
      <div className="container mx-auto px-4 max-w-7xl pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {circles.map(circle => (
            <div
              key={circle.id}
              className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Circle Header with Icon */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-border">
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-1">
                    {circle.name}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {circle.members.toLocaleString()} members
                  </p>
                </div>
                <span className="text-4xl">{circle.image}</span>
              </div>

              {/* Verification Criteria */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                  Verification criteria
                </p>
                <p className="text-text-primary font-medium">{circle.verificationCriteria}</p>
              </div>

              {/* Join/Leave Button */}
              {isJoined(circle.name) ? (
                <Button
                  variant="secondary"
                  onClick={() => handleLeaveCircle(circle.name)}
                  className="w-full"
                >
                  ✓ Joined
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => handleJoinCircle(circle.name)}
                  className="w-full"
                >
                  Join
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info Section */}
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
                Choose a circle matching your verification criteria (email domain, university, address, etc.), join the circle, and gain access to trusted member benefits.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary mb-2">Your Circles</h3>
              <p className="text-text-secondary">
                Currently joined: <span className="font-bold">{joinedCircles.length}</span> {joinedCircles.length === 1 ? 'circle' : 'circles'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
