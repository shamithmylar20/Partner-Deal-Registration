import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSSOLogin = (provider: string) => {
    setIsLoading(true);
    toast({
      title: `${provider} Authentication`,
      description: `Redirecting to ${provider} sign in...`,
    });
    
    if (provider === 'Google') {
      // Connect to real backend Google OAuth
      window.location.href = 'http://localhost:3001/api/v1/auth/google';
    } else if (provider === 'Microsoft') {
      // For Microsoft - you'll need to implement this endpoint in backend
      window.location.href = 'http://localhost:3001/api/v1/auth/microsoft';
    } else {
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Not Implemented",
          description: `${provider} login will be available soon.`,
          variant: "destructive"
        });
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Daxa Partner Portal</h1>
          <p className="text-muted-foreground">Sign in or register to access the deal registration system</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In or Register</CardTitle>
            <CardDescription>
              Use your corporate Google or Microsoft account to access the partner portal. 
              New users will be automatically registered.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* SSO Buttons */}
            <div className="space-y-3">
              <Button 
                variant="default" 
                className="w-full h-12 text-base"
                onClick={() => handleSSOLogin("Google")}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? "Connecting..." : "Continue with Google"}
              </Button>

              <Separator className="my-4" />
              
              <Button 
                variant="outline" 
                className="w-full h-12 text-base"
                onClick={() => handleSSOLogin("Microsoft")}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                </svg>
                Continue with Microsoft
              </Button>
            </div>

            {/* Information Section */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h3 className="font-medium text-sm">How it works:</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>Existing Partners:</strong> Sign in with your registered corporate account</li>
                <li>• <strong>New Partners:</strong> Your account will be created automatically and submitted for approval</li>
              </ul>
            </div>

            {/* Quick Admin Access (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="border-t pt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 mb-2 font-medium">Development Testing</p>
                  <p className="text-xs text-blue-700 mb-2">
                    For testing: Use admin@daxa.ai or shamith@daxa.ai with Google OAuth
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;