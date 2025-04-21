
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-background to-muted">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-6xl font-bold">
          🚀 Allora OS
        </h1>
        <p className="text-xl text-muted-foreground">
          An AI-powered operating system for founders, teams, and plugins.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link 
            to="/docs" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            Read the Docs
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            Explore Demos
          </Link>
        </div>
      </div>
    </div>
  );
}
