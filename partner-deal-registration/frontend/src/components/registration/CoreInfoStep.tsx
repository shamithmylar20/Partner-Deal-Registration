import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/form/FormField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, User, Mail, MapPin, Lock } from "lucide-react";

interface CoreInfoStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const CoreInfoStep = ({ formData, setFormData }: CoreInfoStepProps) => {
  const { user } = useAuth();
  
  const [partnerInfo, setPartnerInfo] = useState({
    company: formData.partnerCompany || "",
    submitterName: formData.submitterName || "",
    submitterEmail: formData.submitterEmail || "",
    territory: formData.territory || ""
  });

  const [customerInfo, setCustomerInfo] = useState({
    legalName: formData.customerLegalName || "",
    industry: formData.customerIndustry || "",
    location: formData.customerLocation || ""
  });

  // Auto-populate partner info from authenticated user
  useEffect(() => {
    if (user) {
      const autoPartnerInfo = {
        company: user.partnerName || user.partnerId || "Unknown Company",
        submitterName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        submitterEmail: user.email || "",
        territory: partnerInfo.territory // Keep territory editable for now
      };
      
      setPartnerInfo(autoPartnerInfo);
    }
  }, [user]);

  // Update form data when state changes
  useEffect(() => {
    setFormData({
      ...formData,
      partnerCompany: partnerInfo.company,
      submitterName: partnerInfo.submitterName,
      submitterEmail: partnerInfo.submitterEmail,
      territory: partnerInfo.territory,
      customerLegalName: customerInfo.legalName,
      customerIndustry: customerInfo.industry,
      customerLocation: customerInfo.location
    });
  }, [partnerInfo, customerInfo, formData, setFormData]);

  return (
    <div className="space-y-6">
      {/* Partner Information Section - Auto-populated & Read-only */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Partner Information
            <Badge variant="secondary" className="text-xs">
              <Lock className="w-3 h-3 mr-1" />
              From Your Profile
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Partner Company - Read-only, auto-populated */}
          <FormField
            label="Partner Company"
            required
            tooltip="Your company name from your authenticated profile. This ensures accurate deal attribution."
          >
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                value={partnerInfo.company}
                disabled
                className="pl-10 bg-muted/30 text-muted-foreground cursor-not-allowed"
                placeholder="Loading your company..."
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ✓ Auto-populated from your profile
            </p>
          </FormField>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Submitter Name - Read-only, auto-populated */}
            <FormField
              label="Submitter Name"
              required
              tooltip="Your full name from your profile. This appears on notifications and approval routing."
            >
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  value={partnerInfo.submitterName}
                  disabled
                  className="pl-10 bg-muted/30 text-muted-foreground cursor-not-allowed"
                  placeholder="Loading your name..."
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ✓ Auto-populated from your profile
              </p>
            </FormField>

            {/* Submitter Email - Read-only, auto-populated */}
            <FormField
              label="Submitter Email"
              required
              tooltip="Your email address from your profile. We'll send confirmations and follow-ups here."
            >
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="email"
                  value={partnerInfo.submitterEmail}
                  disabled
                  className="pl-10 bg-muted/30 text-muted-foreground cursor-not-allowed"
                  placeholder="Loading your email..."
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ✓ Auto-populated from your profile
              </p>
            </FormField>
          </div>

          {/* Territory - Still editable as it might vary per deal */}
          <FormField
            label="Territory/Region"
            required
            tooltip="Select your sales region for this deal. Used for routing to the right approvers."
          >
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
              <Select
                value={partnerInfo.territory}
                onValueChange={(value) => setPartnerInfo({...partnerInfo, territory: value})}
              >
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Select territory for this deal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="north-america">North America</SelectItem>
                  <SelectItem value="emea">EMEA</SelectItem>
                  <SelectItem value="apac">APAC</SelectItem>
                  <SelectItem value="latam">Latin America</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FormField>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">
                  Why is this information locked?
                </p>
                <p className="text-blue-700">
                  Partner information is automatically populated from your authenticated profile to ensure accurate deal attribution and prevent errors. This also speeds up the registration process.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Customer Information Section - Remains editable */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            label="Legal Entity Name"
            tooltip="Registered legal name if different from the public company name entered in step 1."
            helpText="Only required if different from Customer Company Name"
          >
            <Input
              value={customerInfo.legalName}
              onChange={(e) => setCustomerInfo({...customerInfo, legalName: e.target.value})}
              placeholder="e.g., ACME Corporation Inc."
            />
          </FormField>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              label="Industry"
              required
              tooltip="Choose the client's primary industry. Helps with routing and reporting."
            >
              <Select
                value={customerInfo.industry}
                onValueChange={(value) => setCustomerInfo({...customerInfo, industry: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial-services">Financial Services</SelectItem>
                  <SelectItem value="healthcare">Healthcare & Life Sciences</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="retail">Retail & E-commerce</SelectItem>
                  <SelectItem value="government">Government & Public Sector</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="energy">Energy & Utilities</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Headquarters Location"
              required
              tooltip="Client HQ city & country. Used for regional routing."
            >
              <Input
                value={customerInfo.location}
                onChange={(e) => setCustomerInfo({...customerInfo, location: e.target.value})}
                placeholder="e.g., San Francisco, CA, USA"
              />
            </FormField>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};