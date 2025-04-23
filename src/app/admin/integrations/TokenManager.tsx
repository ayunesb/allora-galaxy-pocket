
import { useState } from "react";
import { useTokenStorage } from "@/hooks/useTokenStorage";
import { useTenant } from "@/hooks/useTenant";
import { SUPPORTED_SERVICES } from "@/config/supportedServices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plug } from "lucide-react";

type TokenType = 'access' | 'refresh' | 'both';

export default function TokenManager() {
  const { tenant } = useTenant();
  const { storeToken, isStoring } = useTokenStorage();
  const [service, setService] = useState<keyof typeof SUPPORTED_SERVICES>();
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [tokenType, setTokenType] = useState<TokenType>("access");
  const [expiresIn, setExpiresIn] = useState("3600"); // Default 1 hour

  const handleSave = async () => {
    if (!service || !accessToken) {
      toast.error("Please fill in required fields");
      return;
    }

    const success = await storeToken({
      token: accessToken,
      service: SUPPORTED_SERVICES[service],
      refresh_token: tokenType !== "access" ? refreshToken : undefined,
      expires_in: parseInt(expiresIn)
    });

    if (success) {
      toast.success("Token saved successfully");
      setAccessToken("");
      setRefreshToken("");
    }
  };

  const testConnection = async () => {
    try {
      const response = await fetch(`https://lxsuqqlfuftnvuvtctsx.supabase.co/functions/v1/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          service,
          tenant_id: tenant?.id
        })
      });

      if (!response.ok) throw new Error('Connection test failed');
      
      toast.success("Connection test successful!");
    } catch (error) {
      toast.error("Connection test failed");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Integration Token Manager</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Service</Label>
            <Select value={service} onValueChange={(val: keyof typeof SUPPORTED_SERVICES) => setService(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select service..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SUPPORTED_SERVICES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Token Type</Label>
            <Select value={tokenType} onValueChange={(val: TokenType) => setTokenType(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="access">Access Token Only</SelectItem>
                <SelectItem value="refresh">Refresh Token Only</SelectItem>
                <SelectItem value="both">Both Tokens</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Access Token</Label>
            <Input 
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              type="password"
              placeholder="Enter access token..."
            />
          </div>

          {tokenType !== "access" && (
            <div className="space-y-2">
              <Label>Refresh Token</Label>
              <Input
                value={refreshToken}
                onChange={(e) => setRefreshToken(e.target.value)}
                type="password"
                placeholder="Enter refresh token..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Expires In (seconds)</Label>
            <Input
              type="number"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              placeholder="Token expiration in seconds..."
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={isStoring}>
              Save Token
            </Button>
            <Button 
              variant="outline" 
              onClick={testConnection}
              disabled={!service}>
              <Plug className="mr-2 h-4 w-4" />
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
