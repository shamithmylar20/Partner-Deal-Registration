import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { isAuthenticated, user, logout } = useAuth();

  // Dynamic navigation based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { href: "/", label: "Home" },
      { href: "/dashboard", label: "Dashboard" }
    ];
    
    // Add admin-only navigation
    if (user?.role === 'admin') {
      baseItems.push({ href: "/admin", label: "Deal Approval" });
    }
    
    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-foreground">Daxa</span>
                <span className="text-sm text-muted-foreground ml-2 hidden sm:inline">
                  Partner Portal
                </span>
              </Link>
            </div>
          </div>

          {/* Navigation - Only show when authenticated */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center relative">
              <div className="flex items-center space-x-8 relative">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="relative px-3 py-2 text-foreground hover:text-primary transition-colors duration-300 z-10"
                  >
                    {location.pathname === item.href && (
                      <motion.div
                        layoutId="lamp"
                        className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-lg"
                        style={{
                          boxShadow: `
                            0 0 20px hsl(var(--primary) / 0.3),
                            0 0 40px hsl(var(--primary) / 0.2),
                            0 0 60px hsl(var(--primary) / 0.1)
                          `
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30
                        }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                ))}
              </div>
            </nav>
          )}

          {/* Auth Actions */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <Link to="/register">Register Deal</Link>
                </Button>
              </>
            ) : (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Welcome, {user?.firstName} 
                  {user?.role === 'admin' && <span className="text-primary font-medium ml-1">(Admin)</span>}
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/profile">Profile</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    window.location.href = '/';
                  }}
                >
                  Sign Out
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button - Show when authenticated */}
          {isAuthenticated && (
            <div className="md:hidden">
              <Button variant="ghost" size="sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};