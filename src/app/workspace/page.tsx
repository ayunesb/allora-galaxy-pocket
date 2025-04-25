
import React from 'react';
import { Card } from '@/components/ui/card';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import { CreateWorkspaceForm } from './components/CreateWorkspaceForm';

export default function WorkspacePage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Workspace Management</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Select Workspace</h2>
          <WorkspaceSwitcher />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Workspace</h2>
          <CreateWorkspaceForm />
        </Card>
      </div>
    </div>
  );
}
