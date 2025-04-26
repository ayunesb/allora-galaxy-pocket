
import React, { useState } from 'react';
import VaultItemsList from './VaultItemsList';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const VaultPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Knowledge Vault</h1>
        
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/vault/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Strategy
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search strategies..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button variant="outline" className="shrink-0">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Strategies</TabsTrigger>
          <TabsTrigger value="public">Public</TabsTrigger>
          <TabsTrigger value="private">Private</TabsTrigger>
          <TabsTrigger value="remixed">Remixed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <VaultItemsList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="public" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Public Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground flex flex-col items-center justify-center py-10">
                <p>Public strategies will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="private" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Private Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground flex flex-col items-center justify-center py-10">
                <p>Private strategies will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="remixed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Remixed Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground flex flex-col items-center justify-center py-10">
                <p>Remixed strategies will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VaultPage;
