import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { login } = useAuth();

  useEffect(() => {
    const handleAuthCallback = () => {
      try {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
          toast({
            title: "Authentication Failed",
            description: "There was an error signing you in. Please try again.",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }

        if (token && userParam) {
          // Parse user data
          const user = JSON.parse(decodeURIComponent(userParam));
          
          // Use context login method
          login(token, user);

          toast({
            title: "Login Successful",
            description: `Welcome back, ${user.firstName}!`,
          });

          // Role-based redirect after Google OAuth
          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            // Partners go to deal registration page
            navigate('/register');
          }
        } else {
          throw new Error('Missing authentication data');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to process authentication. Please try again.",
          variant: "destructive"
        });
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, toast, login]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;