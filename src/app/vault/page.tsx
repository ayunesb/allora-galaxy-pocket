
import React from 'react';
import { VaultItemsList } from './VaultItemsList';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const VaultPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Knowledge Vault</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Saved Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <VaultItemsList />
        </CardContent>
      </Card>
    </div>
  );
};

export default VaultPage;
