
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center gap-4 md:h-24 md:flex-row md:justify-between">
        <div className="text-center md:text-left">
          <p className="text-sm leading-loose text-muted-foreground">
            Built with ❤️ by ALLORA APP team
          </p>
        </div>
        
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/legal/terms" className="hover:underline">Terms</Link>
          <Link to="/legal/privacy" className="hover:underline">Privacy</Link>
          <Link to="/legal/cookie" className="hover:underline">Cookies</Link>
          <Link to="/legal/ai-disclosure" className="hover:underline">AI Disclosure</Link>
          <Link to="/legal/dpa" className="hover:underline">DPA</Link>
        </nav>
      </div>
    </footer>
  );
}
