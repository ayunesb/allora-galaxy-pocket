
import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRoutes from './AppRoutes.tsx';
import './index.css';
import { ThemeProvider } from '@/components/ui/theme';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  </React.StrictMode>
);
