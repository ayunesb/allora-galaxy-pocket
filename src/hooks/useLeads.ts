import { Lead } from '../types/lead';

export function useLeads(): Lead[] {
  return [
    { name: 'Sarah Connor', email: 'sarah@sky.net', status: 'New' },
    { name: 'Neo Anderson', email: 'neo@matrix.com', status: 'Contacted' },
    { name: 'Tony Stark', email: 'tony@starkindustries.com', status: 'Followed Up' },
  ];
}
