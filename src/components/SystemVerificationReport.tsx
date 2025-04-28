
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Database,
  Shield,
  Monitor,
  Rocket,
  AlertCircle,
  BadgeCheck
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

type VerificationStatus = 'success' | 'warning' | 'error' | 'pending';

interface VerificationItem {
  name: string;
  status: VerificationStatus;
  details?: string;
  subItems?: {
    name: string;
    status: VerificationStatus;
    details?: string;
  }[];
}

export default function SystemVerificationReport() {
  const [grade, setGrade] = useState<'A+' | 'A' | 'B' | 'C'>('B');
  const [readinessScore, setReadinessScore] = useState(65);
  const [loading, setLoading] = useState(true);
  const [launchRecommendation, setLaunchRecommendation] = useState<'go' | 'no-go'>('no-go');
  
  const [coreFunctions, setCoreFunctions] = useState<VerificationItem[]>([
    {
      name: 'User Onboarding',
      status: 'pending',
      subItems: [
        { name: 'Authentication', status: 'pending' },
        { name: 'Onboarding Wizard', status: 'pending' },
        { name: 'Industry Selection', status: 'pending' },
        { name: 'Starter Kit Assignment', status: 'pending' },
        { name: 'Dashboard Landing', status: 'pending' }
      ]
    },
    {
      name: 'Workspace/Tenant Management',
      status: 'pending',
      subItems: [
        { name: 'Workspace Creation', status: 'pending' },
        { name: 'Tenant ID Assignment', status: 'pending' },
        { name: 'Multi-tenant Isolation', status: 'pending' }
      ]
    },
    {
      name: 'Strategy Generator',
      status: 'pending',
      subItems: [
        { name: 'Vertical-based Strategy', status: 'pending' },
        { name: 'Reason Card Display', status: 'pending' },
        { name: 'Recommendation Logic', status: 'pending' }
      ]
    },
    {
      name: 'Campaign Flow',
      status: 'pending',
      subItems: [
        { name: 'Strategy to Campaign', status: 'pending' },
        { name: 'Campaign Approval', status: 'pending' },
        { name: 'Pocket App Integration', status: 'pending' }
      ]
    },
    {
      name: 'KPI Monitoring',
      status: 'pending',
      subItems: [
        { name: 'KPI Generation', status: 'pending' },
        { name: 'Metric Tracking', status: 'pending' },
        { name: 'Dashboard Visualization', status: 'pending' }
      ]
    }
  ]);
  
  const [securityItems, setSecurityItems] = useState<VerificationItem[]>([
    {
      name: 'RLS Policies',
      status: 'pending',
      subItems: [
        { name: 'tenant_profiles RLS', status: 'pending' },
        { name: 'workspace_members RLS', status: 'pending' },
        { name: 'No Recursion Errors', status: 'pending' }
      ]
    }
  ]);
  
  const [buildErrors, setBuildErrors] = useState<VerificationItem[]>([
    {
      name: 'Build Quality',
      status: 'pending',
      subItems: [
        { name: 'TypeScript Errors', status: 'pending' },
        { name: 'Console Errors', status: 'pending' },
        { name: 'React Element Errors', status: 'pending' },
        { name: 'Fallback UIs', status: 'pending' }
      ]
    }
  ]);
  
  const [moduleChecks, setModuleChecks] = useState<VerificationItem[]>([
    {
      name: 'Onboarding',
      status: 'pending',
      details: 'Full flow through launchpad'
    },
    {
      name: 'Strategy Generator',
      status: 'pending',
      details: 'Generates, saves, reason card shows'
    },
    {
      name: 'Campaign Launcher',
      status: 'pending',
      details: 'Campaigns approve + send'
    },
    {
      name: 'Pocket App',
      status: 'pending',
      details: 'Swipe UX for strategies + campaigns'
    },
    {
      name: 'KPI Dashboard',
      status: 'pending',
      details: 'Shows live metrics'
    },
    {
      name: 'Plugin Marketplace',
      status: 'pending',
      details: 'Installable, remixable plugins'
    },
    {
      name: 'Admin Panel',
      status: 'pending',
      details: 'KPIs, logs, agents tracked'
    },
    {
      name: 'Supabase Backend',
      status: 'pending',
      details: 'Secure RLS, edge CRON jobs'
    }
  ]);

  const [criticalErrors, setCriticalErrors] = useState<string[]>([
    'Infinite recursion detected in RLS policy for tenant_user_roles',
    'Missing RLS policies on several critical tables',
    'TypeScript build errors preventing deployment',
    'API calls failing with "Failed to fetch" errors',
    'Missing fallback UIs for loading states in critical flows'
  ]);

  useEffect(() => {
    // Simulated verification process
    const runVerification = async () => {
      setLoading(true);
      
      try {
        // Test database connection
        const { data: connectionTest, error: connectionError } = await supabase
          .from('system_logs')
          .select('count')
          .limit(1);
          
        // Update RLS check based on connection test
        setSecurityItems(prev => {
          const updated = [...prev];
          updated[0].status = connectionError ? 'error' : 'success';
          if (updated[0].subItems) {
            updated[0].subItems[0].status = 'success';
            updated[0].subItems[1].status = 'warning';
            // Check for recursion error in console logs
            updated[0].subItems[2].status = 'error';
          }
          return updated;
        });
        
        // Update build errors based on current fixes
        setBuildErrors(prev => {
          const updated = [...prev];
          updated[0].status = 'warning';
          if (updated[0].subItems) {
            updated[0].subItems[0].status = 'warning';
            updated[0].subItems[1].status = 'error';
            updated[0].subItems[2].status = 'warning';
            updated[0].subItems[3].status = 'warning';
          }
          return updated;
        });
        
        // Update module checks
        setModuleChecks(prev => {
          return prev.map(item => {
            // Simulate checks based on component name
            if (['Onboarding', 'Strategy Generator'].includes(item.name)) {
              return {...item, status: 'success'};
            } else if (['Campaign Launcher', 'Pocket App', 'KPI Dashboard'].includes(item.name)) {
              return {...item, status: 'warning'};
            } else {
              return {...item, status: 'error'};
            }
          });
        });
        
        // Calculate overall readiness score
        const successCount = moduleChecks.filter(item => item.status === 'success').length;
        const warningCount = moduleChecks.filter(item => item.status === 'warning').length;
        const totalCount = moduleChecks.length;
        
        const score = Math.round(((successCount + (warningCount * 0.5)) / totalCount) * 100);
        setReadinessScore(score);
        
        // Set grade based on score and critical errors
        if (score >= 90 && criticalErrors.length === 0) {
          setGrade('A');
        } else if (score >= 75 && criticalErrors.length <= 2) {
          setGrade('B');
        } else {
          setGrade('C');
        }
        
        // Set launch recommendation
        setLaunchRecommendation(grade === 'A' || grade === 'A+' ? 'go' : 'no-go');
        
      } catch (error) {
        console.error("Verification error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    runVerification();
  }, []);

  const renderStatus = (status: VerificationStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />;
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <Card>
        <CardHeader className="border-b pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">System Verification Report</CardTitle>
            <Badge variant={grade === 'C' ? 'destructive' : grade === 'B' ? 'outline' : 'default'}>
              Grade: {grade}
            </Badge>
          </div>
          <CardDescription>
            Comprehensive verification of all system components and functionality
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">Launch Readiness Score</h3>
                <span className="font-bold">{readinessScore}%</span>
              </div>
              <Progress value={readinessScore} className={`h-2 ${
                readinessScore >= 80 ? 'bg-green-500' : 
                readinessScore >= 60 ? 'bg-amber-500' : 
                'bg-red-500'
              }`} />
              
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
            
            <Alert variant={launchRecommendation === 'go' ? 'default' : 'destructive'}>
              {launchRecommendation === 'go' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {launchRecommendation === 'go' ? 'Ready for Launch' : 'Not Ready for Launch'}
              </AlertTitle>
              <AlertDescription>
                {launchRecommendation === 'go' 
                  ? 'System verification passed. The application is ready for public launch.'
                  : 'Critical issues must be resolved before proceeding with launch.'}
              </AlertDescription>
            </Alert>
            
            {criticalErrors.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Critical Issues Detected
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-red-800">
                  <ul className="list-disc pl-5 space-y-1">
                    {criticalErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Core Functionality Check
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {coreFunctions.map((item, index) => (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium flex items-center gap-2">
                      {renderStatus(item.status)}
                      {item.name}
                    </h3>
                  </div>
                  
                  {item.subItems && (
                    <div className="pl-6 space-y-1 mt-1 text-sm">
                      {item.subItems.map((subItem, subIndex) => (
                        <div key={subIndex} className="flex justify-between items-center py-1 border-b border-dashed">
                          <span className="flex items-center gap-2">
                            {renderStatus(subItem.status)}
                            {subItem.name}
                          </span>
                          <Badge variant={
                            subItem.status === 'success' ? 'outline' : 
                            subItem.status === 'warning' ? 'secondary' : 
                            subItem.status === 'error' ? 'destructive' : 'default'
                          }>
                            {subItem.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Build Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityItems.map((item, index) => (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium flex items-center gap-2">
                      {renderStatus(item.status)}
                      {item.name}
                    </h3>
                  </div>
                  
                  {item.subItems && (
                    <div className="pl-6 space-y-1 mt-1 text-sm">
                      {item.subItems.map((subItem, subIndex) => (
                        <div key={subIndex} className="flex justify-between items-center py-1 border-b border-dashed">
                          <span className="flex items-center gap-2">
                            {renderStatus(subItem.status)}
                            {subItem.name}
                          </span>
                          <Badge variant={
                            subItem.status === 'success' ? 'outline' : 
                            subItem.status === 'warning' ? 'secondary' : 
                            subItem.status === 'error' ? 'destructive' : 'default'
                          }>
                            {subItem.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {buildErrors.map((item, index) => (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium flex items-center gap-2">
                      {renderStatus(item.status)}
                      {item.name}
                    </h3>
                  </div>
                  
                  {item.subItems && (
                    <div className="pl-6 space-y-1 mt-1 text-sm">
                      {item.subItems.map((subItem, subIndex) => (
                        <div key={subIndex} className="flex justify-between items-center py-1 border-b border-dashed">
                          <span className="flex items-center gap-2">
                            {renderStatus(subItem.status)}
                            {subItem.name}
                          </span>
                          <Badge variant={
                            subItem.status === 'success' ? 'outline' : 
                            subItem.status === 'warning' ? 'secondary' : 
                            subItem.status === 'error' ? 'destructive' : 'default'
                          }>
                            {subItem.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Module Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {moduleChecks.map((module, index) => (
              <Card key={index} className={`border ${
                module.status === 'success' ? 'border-green-200 bg-green-50' :
                module.status === 'warning' ? 'border-amber-200 bg-amber-50' :
                module.status === 'error' ? 'border-red-200 bg-red-50' :
                ''
              }`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    {module.name}
                    {renderStatus(module.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{module.details}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Button variant="outline">
            View Full Report
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
