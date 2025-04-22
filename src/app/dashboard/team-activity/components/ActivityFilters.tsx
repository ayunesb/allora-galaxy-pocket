
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

interface ActivityFiltersProps {
  users: any[];
  eventTypes: string[];
  filters: {
    user: string;
    actionType: string;
    dateRange: string;
    search: string;
  };
  onFiltersChange: (newFilters: any) => void;
}

export function ActivityFilters({ users, eventTypes, filters, onFiltersChange }: ActivityFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="user-filter" className="block text-sm font-medium mb-1">
              User
            </label>
            <Select 
              value={filters.user} 
              onValueChange={(value) => onFiltersChange({ ...filters, user: value })}
            >
              <SelectTrigger id="user-filter">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.user_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="action-filter" className="block text-sm font-medium mb-1">
              Action Type
            </label>
            <Select 
              value={filters.actionType} 
              onValueChange={(value) => onFiltersChange({ ...filters, actionType: value })}
            >
              <SelectTrigger id="action-filter">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="date-filter" className="block text-sm font-medium mb-1">
              Time Period
            </label>
            <Select 
              value={filters.dateRange} 
              onValueChange={(value) => onFiltersChange({ ...filters, dateRange: value })}
            >
              <SelectTrigger id="date-filter">
                <SelectValue placeholder="Last 7 days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium mb-1">
              Search
            </label>
            <Input
              id="search"
              placeholder="Search messages..."
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
