
import React from 'react';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Linkedin, Mail } from 'lucide-react';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  url,
  title,
  description
}) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = description ? encodeURIComponent(description) : '';
  
  const socialPlatforms = [
    {
      name: 'Twitter',
      icon: <Twitter className="h-4 w-4 mr-2" />,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'bg-[#1DA1F2] hover:bg-[#1a91da] text-white'
    },
    {
      name: 'Facebook',
      icon: <Facebook className="h-4 w-4 mr-2" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-[#1877F2] hover:bg-[#1669d9] text-white'
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="h-4 w-4 mr-2" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'bg-[#0A66C2] hover:bg-[#0958a8] text-white'
    },
    {
      name: 'Email',
      icon: <Mail className="h-4 w-4 mr-2" />,
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      color: 'bg-gray-600 hover:bg-gray-700 text-white'
    }
  ];
  
  return (
    <div className="flex flex-wrap gap-2">
      {socialPlatforms.map((platform) => (
        <Button
          key={platform.name}
          variant="outline"
          className={platform.color}
          onClick={() => window.open(platform.url, '_blank')}
        >
          {platform.icon}
          {platform.name}
        </Button>
      ))}
    </div>
  );
};
