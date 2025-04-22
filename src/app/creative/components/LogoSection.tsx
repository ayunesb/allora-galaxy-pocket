
import { CreativeLayout } from "../layout/CreativeLayout";

interface LogoSectionProps {
  logoText: string;
}

export function LogoSection({ logoText }: LogoSectionProps) {
  return (
    <CreativeLayout title="🖼 Logo">
      <p className="text-sm text-gray-600">{logoText}</p>
    </CreativeLayout>
  );
}
