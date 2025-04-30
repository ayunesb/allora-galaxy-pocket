
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Users, FileText, Settings, Bell } from 'lucide-react';
import SelectFeature from './components/SelectFeature';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="p-8 max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Allora OS</h1>
          <p className="text-lg text-gray-600">
            AI-powered business operating system
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-green-700">Welcome to the latest version</h2>
            <p className="mb-6 text-gray-600">
              Your project has been updated to the latest Lovable version. You can now use new features
              like the direct "Select" functionality to edit components more easily.
            </p>
            <SelectFeature />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-green-700">Main Modules</h2>
            <ul className="space-y-3">
              {[
                { icon: <Activity size={18} />, name: 'KPI Dashboard', path: '/insights/kpis' },
                { icon: <FileText size={18} />, name: 'Strategy Vault', path: '/vault' },
                { icon: <Users size={18} />, name: 'Agent Performance', path: '/agents/performance' },
                { icon: <Bell size={18} />, name: 'Feedback Engine', path: '/feedback' },
                { icon: <Settings size={18} />, name: 'System Health', path: '/system/health' }
              ].map((item, i) => (
                <li key={i}>
                  <Link 
                    to={item.path}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-green-600">{item.icon}</span>
                      {item.name}
                    </span>
                    <ArrowRight size={16} className="text-green-600" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 p-5 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-3 text-green-800">
            <span className="bg-green-100 p-1.5 rounded-full">✅</span>
            <p className="font-medium">App is running with the latest Lovable features enabled</p>
          </div>
          <p className="mt-2 text-sm text-green-700 pl-10">
            Try clicking directly on elements in the preview to edit them with the new Select feature.
          </p>
        </div>
      </div>
    </div>
  );
}
