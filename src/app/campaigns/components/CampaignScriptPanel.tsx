
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CampaignScriptPanelProps {
  channel: string;
  content: string;
}

export function CampaignScriptPanel({ channel, content }: CampaignScriptPanelProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast(`${channel} script copied to clipboard`);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const getChannelColor = (channel: string) => {
    const channelMap: Record<string, string> = {
      email: "bg-blue-100 text-blue-800",
      whatsapp: "bg-green-100 text-green-800",
      social: "bg-purple-100 text-purple-800",
      tiktok: "bg-black text-white",
      meta: "bg-blue-500 text-white",
      linkedin: "bg-blue-700 text-white",
      twitter: "bg-sky-500 text-white",
      sms: "bg-yellow-100 text-yellow-800",
      default: "bg-gray-100 text-gray-800"
    };
    
    return channelMap[channel.toLowerCase()] || channelMap.default;
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between bg-muted/20 px-4 py-2 border-b">
        <Badge className={cn("capitalize", getChannelColor(channel))}>
          {channel}
        </Badge>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 gap-1"
          onClick={handleCopy}
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <CardContent className="p-4">
        <pre className="whitespace-pre-wrap font-mono text-sm bg-muted/10 p-3 rounded-md overflow-x-auto">
          {content}
        </pre>
      </CardContent>
    </Card>
  );
}
