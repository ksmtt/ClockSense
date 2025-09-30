import { ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';

export function ClockifyApiGuide() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      title: "Get your API Key",
      description: "Go to your Clockify profile settings",
      url: "https://clockify.me/user/settings",
      code: "Look for 'API' section and generate a new API key"
    },
    {
      title: "Find your Workspace ID",
      description: "Go to workspace settings or check the URL",
      url: "https://clockify.me/workspaces",
      code: "URL format: clockify.me/workspaces/{WORKSPACE_ID}/dashboard"
    },
    {
      title: "Get your User ID",
      description: "Use the Clockify API to get your user ID",
      url: "https://clockify.me/developers-api",
      code: `curl -H "X-Api-Key: YOUR_API_KEY" https://api.clockify.me/api/v1/user`
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>How to Find Your Clockify API Credentials</CardTitle>
        <CardDescription>
          Follow these steps to get the required information from your Clockify account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="rounded-full w-6 h-6 flex items-center justify-center p-0">
                {index + 1}
              </Badge>
              <h4 className="font-medium">{step.title}</h4>
            </div>
            
            <p className="text-sm text-muted-foreground ml-9">
              {step.description}
            </p>
            
            <div className="ml-9 space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="normal-case"
                >
                  <a href={step.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open in Clockify
                  </a>
                </Button>
              </div>
              
              {step.code && (
                <div className="relative">
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    <code>{step.code}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(step.code, index)}
                  >
                    {copiedStep === index ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}

        <Alert>
          <AlertDescription>
            <strong>Security Note:</strong> Never share your API key publicly. 
            It provides full access to your Clockify account. When this app is deployed 
            as a Clockify addon, authentication will be handled securely via X-Token.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}