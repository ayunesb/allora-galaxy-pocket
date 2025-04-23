
import { AutoApprovalSettings } from "./components/AutoApprovalSettings";
import { ApiKeySettings } from "./components/ApiKeySettings";
import AutonomyToggle from "./AutonomyToggle";

export default function SettingsPanel() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Admin Settings</h1>
      
      <div className="max-w-2xl space-y-6">
        <AutoApprovalSettings />
        <ApiKeySettings />
        <AutonomyToggle />
      </div>
    </div>
  );
}
