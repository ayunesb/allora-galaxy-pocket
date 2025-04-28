import { RouteObject } from 'react-router-dom';

// Import app pages
import CampaignCenter from '@/app/campaigns/CampaignCenter';
import CampaignCreatePage from '@/app/campaigns/create';
import CampaignWizard from '@/app/campaigns/wizard';
import LaunchReadinessPage from '@/app/launch-readiness/page';
// Import other pages as needed

// Define app routes
export const appRoutes: RouteObject[] = [
  {
    path: "/campaigns",
    children: [
      { index: true, element: <CampaignCenter /> },
      { path: "create", element: <CampaignCreatePage /> },
      { path: "wizard", element: <CampaignWizard /> },
      // Other campaign routes...
    ],
  },
  {
    path: "/launch-readiness",
    element: <LaunchReadinessPage />
  },
  // Other app routes...
];
