
import { CreativeLayout } from "../layout/CreativeLayout";

interface SocialSectionProps {
  captions: string[];
}

export function SocialSection({ captions }: SocialSectionProps) {
  return (
    <CreativeLayout title="📱 Social Captions">
      <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
        {captions.map((caption, i) => (
          <li key={i}>{caption}</li>
        ))}
      </ul>
    </CreativeLayout>
  );
}
