import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Save, X, User, Building, Mail, MapPin, Shield, Calendar, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userDeals, setUserDeals] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const { toast } = useToast();

  // Initialize profile data from authenticated user
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    territory: "",
    company: "",
    role: "",
    joinDate: "",
    dealCount: 0,
    avatarUrl: ""
  });

  const [formData, setFormData] = useState(profileData);

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user && isAuthenticated) {
      const userData = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        territory: "North America", // This could come from user profile API
        company: user.partnerName || user.partnerId || "",
        role: user.role === 'admin' ? 'Administrator' : 'Partner Manager',
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), // Could come from user.createdAt
        dealCount: 0, // Will be loaded from API
        avatarUrl: "" // Could store Google profile picture
      };
      
      setProfileData(userData);
      setFormData(userData);
      
      // Load user's deal count
      loadUserDeals();
    }
  }, [user, isAuthenticated]);

  // Load user's deals to get deal count and recent activity
  const loadUserDeals = async () => {
    try {
      setLoadingDeals(true);
      const response = await fetch('http://localhost:3001/api/v1/deals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserDeals(data.deals || []);
        setProfileData(prev => ({
          ...prev,
          dealCount: data.deals?.length || 0
        }));
        setFormData(prev => ({
          ...prev,
          dealCount: data.deals?.length || 0
        }));
      }
    } catch (error) {
      console.error('Error loading deals:', error);
    } finally {
      setLoadingDeals(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // In a real app, this would call a profile update API
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfileData(formData);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData);
    setIsEditing(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, this would upload to cloud storage
      const mockUrl = URL.createObjectURL(file);
      setFormData({ ...formData, avatarUrl: mockUrl });
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated.",
      });
    }
  };

  // Generate initials for avatar
  const getInitials = () => {
    const first = profileData.firstName?.[0] || '';
    const last = profileData.lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  // Show loading state if user data is not available
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view your profile.</p>
          <Link to="/auth" className="text-primary hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={formData.avatarUrl} alt="Profile picture" />
                    <AvatarFallback className="text-lg font-semibold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                      <Upload className="w-3 h-3" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </label>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <p className="text-muted-foreground">{profileData.role}</p>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Partner since {profileData.joinDate} • 
                    {loadingDeals ? (
                      <span>Loading deals...</span>
                    ) : (
                      <span>{profileData.dealCount} deals registered</span>
                    )}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  {isEditing ? "Update your personal details and contact information" : "Your personal details from Google authentication"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled // Email from Google OAuth should not be editable
                      className="pl-10 bg-muted/50"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email address from your Google authentication cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="territory">Territory</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                    {isEditing ? (
                      <Select
                        value={formData.territory}
                        onValueChange={(value) => setFormData({ ...formData, territory: value })}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="North America">North America</SelectItem>
                          <SelectItem value="EMEA">EMEA</SelectItem>
                          <SelectItem value="APAC">APAC</SelectItem>
                          <SelectItem value="Latin America">Latin America</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={formData.territory}
                        disabled
                        className="pl-10"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Your partner company details (from authentication)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input value={profileData.company} disabled className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground">
                    Company information is linked to your authentication
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Partner Role</Label>
                  <Input value={profileData.role} disabled className="bg-muted/50" />
                </div>

                <div className="space-y-2">
                  <Label>Partnership Start Date</Label>
                  <Input value={profileData.joinDate} disabled className="bg-muted/50" />
                </div>

                <div className="space-y-2">
                  <Label>Total Deals Registered</Label>
                  <Input 
                    value={loadingDeals ? "Loading..." : profileData.dealCount.toString()} 
                    disabled 
                    className="bg-muted/50"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          {userDeals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Deal Activity</CardTitle>
                <CardDescription>
                  Your latest deal registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userDeals.slice(0, 3).map((deal: any, index: number) => (
                    <div key={deal.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{deal.company_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {deal.domain} • {deal.customer_industry}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          ${parseInt(deal.deal_value || '0').toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(deal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {userDeals.length > 3 && (
                  <div className="text-center mt-4">
                    <Link to="/dashboard" className="text-sm text-primary hover:underline">
                      View all {userDeals.length} deals →
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Account Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Account Security
              </CardTitle>
              <CardDescription>
                Your account is secured with Google OAuth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Google Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Signed in with Google OAuth • {user?.email}
                  </p>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Account Status</p>
                  <p className="text-sm text-muted-foreground">
                    Active partner account
                  </p>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Session Security</p>
                  <p className="text-sm text-muted-foreground">
                    JWT token-based authentication
                  </p>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Secure</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;