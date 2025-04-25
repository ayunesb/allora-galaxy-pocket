
import React from 'react';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';

export default function ConnectionTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">System Connection Test</h1>
      <SupabaseConnectionTest />
    </div>
  );
}
