import { useState, useEffect } from 'react';
import { Zap, AlertCircle, CheckCircle, RefreshCw, Eye, EyeOff, HelpCircle, Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ClockifyApiGuide } from './ClockifyApiGuide';
import { ClockifyConfig, getAuthFromUrlParams } from '../services/clockifyApi';

interface ClockifySettingsProps {
  isConfigured: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  user: any;
  workspace: any;
  useClockifyApi: boolean;
  onConnect: (config: ClockifyConfig) => Promise<boolean>;
  onDisconnect: () => void;
  onRefresh: () => Promise<boolean>;
  onToggleApi: (enabled: boolean) => void;
}

export function ClockifySettings({
  isConfigured,
  isConnected,
  isLoading,
  error,
  user,
  workspace,
  useClockifyApi,
  onConnect,
  onDisconnect,
  onRefresh,
  onToggleApi
}: ClockifySettingsProps) {
  const [formData, setFormData] = useState({
    apiKey: '',
    workspaceId: '',
    userId: ''
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [urlAuth, setUrlAuth] = useState<{ addonToken: string; userId: string } | null>(null);

  // Check for URL-based authentication on mount
  useEffect(() => {
    const auth = getAuthFromUrlParams();
    setUrlAuth(auth);
  }, []);

  const handleConnect = async () => {
    // Check required fields based on auth method
    if (urlAuth) {
      if (!formData.workspaceId) return;
    } else {
      if (!formData.apiKey || !formData.workspaceId || !formData.userId) return;
    }

    setIsConnecting(true);
    try {
      // Create config based on auth method
      const config: ClockifyConfig = urlAuth
        ? {
            addonToken: urlAuth.addonToken,
            userId: urlAuth.userId,
            workspaceId: formData.workspaceId,
          }
        : {
            apiKey: formData.apiKey,
            userId: formData.userId,
            workspaceId: formData.workspaceId,
          };

      const success = await onConnect(config);
      if (success) {
        setFormData({ apiKey: '', workspaceId: '', userId: '' });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
    setFormData({ apiKey: '', workspaceId: '', userId: '' });
  };

  const getConnectionStatus = () => {
    if (isLoading || isConnecting) return { text: 'Connecting...', variant: 'secondary' as const };
    if (error) return { text: 'Connection Error', variant: 'destructive' as const };
    if (isConnected) return { text: 'Connected', variant: 'default' as const };
    if (isConfigured) return { text: 'Configured', variant: 'secondary' as const };
    return { text: 'Not Configured', variant: 'outline' as const };
  };

  const status = getConnectionStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Clockify API Integration
          </div>
          <Badge variant={status.variant}>{status.text}</Badge>
        </CardTitle>
        <CardDescription>
          Connect to your Clockify account to automatically sync time entries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Use Clockify API</Label>
            <p className="text-xs text-muted-foreground">
              Enable to sync real time entries from Clockify
            </p>
          </div>
          <Switch
            checked={useClockifyApi}
            onCheckedChange={onToggleApi}
            disabled={!isConnected && useClockifyApi}
          />
        </div>

        <Separator />

        {/* Addon Authentication Status */}
        {urlAuth && (
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary">Clockify Addon Authentication</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Authentication detected from URL parameters. Using x-addon-token for secure API access.
              </p>
              <div className="mt-2 text-xs">
                <span className="text-muted-foreground">User ID:</span> {urlAuth.userId}
              </div>
            </div>
          </div>
        )}

        {/* Connection Status */}
        {isConnected && user && workspace && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <Label className="text-xs text-muted-foreground">User</Label>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Workspace</Label>
                <p className="font-medium">{workspace.name}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center gap-1 normal-case"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="normal-case"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}

        {/* Connection Form */}
        {!isConnected && (
          <div className="space-y-4">
            {!urlAuth && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>You can find your API credentials in your Clockify account settings.</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="normal-case">
                        <HelpCircle className="w-4 h-4 mr-1" />
                        Help
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Clockify API Setup Guide</DialogTitle>
                        <DialogDescription>
                          Step-by-step instructions to get your API credentials
                        </DialogDescription>
                      </DialogHeader>
                      <ClockifyApiGuide />
                    </DialogContent>
                  </Dialog>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {/* Show API Key field only if not using addon auth */}
              {!urlAuth && (
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="relative">
                    <Input
                      id="api-key"
                      type={showApiKey ? 'text' : 'password'}
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder="Your Clockify API key"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="workspace-id">Workspace ID</Label>
                <Input
                  id="workspace-id"
                  value={formData.workspaceId}
                  onChange={(e) => setFormData({ ...formData, workspaceId: e.target.value })}
                  placeholder="Your Clockify workspace ID"
                />
                <p className="text-xs text-muted-foreground">
                  Found in your workspace URL or settings
                </p>
              </div>

              {/* Show User ID field only if not using addon auth */}
              {!urlAuth && (
                <div className="space-y-2">
                  <Label htmlFor="user-id">User ID</Label>
                  <Input
                    id="user-id"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    placeholder="Your Clockify user ID"
                  />
                  <p className="text-xs text-muted-foreground">
                    Found in your profile settings
                  </p>
                </div>
              )}

              <Button
                onClick={handleConnect}
                disabled={
                  (urlAuth ? !formData.workspaceId : (!formData.apiKey || !formData.workspaceId || !formData.userId)) 
                  || isConnecting
                }
                className="w-full normal-case"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Connect to Clockify
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Info */}
        <Alert>
          <AlertDescription className="text-xs">
            <strong>Note:</strong> {urlAuth 
              ? 'Authentication is handled automatically via x-addon-token. Only workspace configuration is needed.'
              : 'Your API credentials are stored locally in your browser for security. When deployed as a Clockify addon, authentication will be handled automatically.'
            }
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}