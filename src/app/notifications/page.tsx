
import React from 'react';
// Import as default export
import GrowthPanel from './GrowthPanel';

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <GrowthPanel />
    </div>
  );
}
