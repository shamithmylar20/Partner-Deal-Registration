import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Save, X, User, Building, Mail, MapPin, Shield, Calendar, CheckCircle, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userDeals, setUserDeals] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const { toast } = useToast();

  // Profile data from backend APIs
  const [profileData, setProfileData] = useState({
    // Non-editable (from Google Auth)
    firstName: "",
    lastName: "",
    email: "",
    
    // Company info (from Users sheet)
    company: "",
    role: "",
    joinDate: "",
    
    // Editable fields (from UserProfiles sheet)
    territory: "",
    company_description: "",
    company_size: "",
    website_url: "",
    
    // Computed fields
    dealCount: 0,
    avatarUrl: ""
  });

  const [formData, setFormData] = useState(profileData);

  // Load user profile data from backend
  useEffect(() => {
    if (user && isAuthenticated) {
      loadUserProfile();
      loadUserDeals();
    }
  }, [user, isAuthenticated]);

  // Load profile data from backend
  const loadUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await fetch('http://localhost:3001/api/v1/admin/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const profile = data.profile;
        
        const profileData = {
          // Non-editable from Google Auth
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          email: profile.email || "",
          
          // Company info  
          company: profile.partner_company || "",
          role: profile.role === 'admin' ? 'Administrator' : 'Partner Manager',
          joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          
          // Editable fields
          territory: profile.territory || "North America",
          company_description: profile.company_description || "",
          company_size: profile.company_size || "",
          website_url: profile.website_url || "",
          
          dealCount: 0, // Will be loaded separately
          avatarUrl: ""
        };
        
        setProfileData(profileData);
        setFormData(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Profile Load Error",
        description: "Could not load profile data. Using authentication data.",
        variant: "destructive"
      });
      
      // Fallback to auth data
      const authData = {
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        company: user?.partnerName || user?.partnerId || "",
        role: user?.role === 'admin' ? 'Administrator' : 'Partner Manager',
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        territory: "North America",
        company_description: "",
        company_size: "",
        website_url: "",
        dealCount: 0,
        avatarUrl: ""
      };
      
      setProfileData(authData);
      setFormData(authData);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Load user's own deals (not all deals)
  const loadUserDeals = async () => {
    try {
      setLoadingDeals(true);
      const response = await fetch('http://localhost:3001/api/v1/admin/profile/deals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserDeals(data.deals || []);
        
        // Update deal count in profile data
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
      console.error('Error loading user deals:', error);
    } finally {
      setLoadingDeals(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/v1/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          territory: formData.territory,
          company_description: formData.company_description,
          company_size: formData.company_size,
          website_url: formData.website_url,
          company: formData.company
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setProfileData(formData);
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: result.message || "Your profile information has been successfully updated.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Update Failed",
          description: error.message || "There was an error updating your profile.",
          variant: "destructive"
        });
      }
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

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
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
                    <Label htmlFor="firstName" className="flex items-center gap-2">
                      First Name
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      disabled // Always disabled - from Google Auth
                      className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">
                      From Google authentication
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="flex items-center gap-2">
                      Last Name
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      disabled // Always disabled - from Google Auth
                      className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">
                      From Google authentication
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    Email Address
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled // Always disabled - from Google Auth
                      className="pl-10 bg-muted/50 text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email address from Google authentication cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="territory">Territory/Region</Label>
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
                        className="pl-10 bg-muted/50"
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
                  {isEditing ? "Update your company details" : "Your partner company details"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  {isEditing ? (
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Enter your company name..."
                    />
                  ) : (
                    <Input
                      value={formData.company}
                      disabled
                      className="bg-muted/50"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Company Description</Label>
                  {isEditing ? (
                    <Textarea
                      value={formData.company_description}
                      onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
                      placeholder="Brief description of your company..."
                      rows={3}
                    />
                  ) : (
                    <Textarea
                      value={formData.company_description || "No description provided"}
                      disabled
                      className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                      rows={3}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Company Size</Label>
                  {isEditing ? (
                    <Select
                      value={formData.company_size}
                      onValueChange={(value) => setFormData({ ...formData, company_size: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="501-1000">501-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={formData.company_size || "Not specified"}
                      disabled
                      className="bg-muted/50"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Website URL</Label>
                  {isEditing ? (
                    <Input
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      placeholder="https://yourcompany.com"
                    />
                  ) : (
                    <Input
                      value={formData.website_url || "Not provided"}
                      disabled
                      className="bg-muted/50"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Total Deals Registered</Label>
                  <Input 
                    value={loadingDeals ? "Loading..." : profileData.dealCount.toString()} 
                    disabled 
                    className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          {userDeals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Deal Activity</CardTitle>
                <CardDescription>
                  Your recent deal registrations (only deals you submitted)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userDeals.slice(0, 3).map((deal: any, index: number) => (
                    <div key={deal.id || index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{deal.company_name || deal.customer_company}</p>
                        <p className="text-sm text-muted-foreground">
                          {deal.domain} • {deal.customer_industry || deal.industry}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            deal.status === 'approved' ? 'bg-green-100 text-green-800' :
                            deal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            deal.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {deal.status?.charAt(0).toUpperCase() + deal.status?.slice(1) || 'Pending'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          ${parseInt(deal.deal_value || '0').toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {deal.created_at ? new Date(deal.created_at).toLocaleDateString() : 'Recent'}
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
                    {profileData.role === 'Administrator' ? 'Admin account' : 'Active partner account'}
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