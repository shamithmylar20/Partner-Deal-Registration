import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/form/FormField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CoreInfoStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const CoreInfoStep = ({ formData, setFormData }: CoreInfoStepProps) => {
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

  // Update form data when local state changes
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
      {/* Partner Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Partner Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            label="Partner Company"
            required
            tooltip="Your company name from your partner profile. Locked to ensure correct attribution."
          >
            <Select
              value={partnerInfo.company}
              onValueChange={(value) => setPartnerInfo({...partnerInfo, company: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="techflow-solutions">TechFlow Solutions</SelectItem>
                <SelectItem value="digital-innovations">Digital Innovations Inc.</SelectItem>
                <SelectItem value="cloudware-partners">CloudWare Partners</SelectItem>
                <SelectItem value="databridge-consulting">DataBridge Consulting</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              label="Submitter Name"
              required
              tooltip="Your full name. Appears on notifications and approval routing."
            >
              <Input
                value={partnerInfo.submitterName}
                onChange={(e) => setPartnerInfo({...partnerInfo, submitterName: e.target.value})}
                placeholder="e.g., John Smith"
              />
            </FormField>

            <FormField
              label="Submitter Email"
              required
              tooltip="We'll send confirmations and follow-ups here."
            >
              <Input
                type="email"
                value={partnerInfo.submitterEmail}
                onChange={(e) => setPartnerInfo({...partnerInfo, submitterEmail: e.target.value})}
                placeholder="e.g., john.smith@techflow.com"
              />
            </FormField>
          </div>

          <FormField
            label="Territory/Region"
            required
            tooltip="Select your sales region. Used for routing to the right approvers."
          >
            <Select
              value={partnerInfo.territory}
              onValueChange={(value) => setPartnerInfo({...partnerInfo, territory: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select territory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="north-america">North America</SelectItem>
                <SelectItem value="emea">EMEA</SelectItem>
                <SelectItem value="apac">APAC</SelectItem>
                <SelectItem value="latam">Latin America</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </CardContent>
      </Card>

      <Separator />

      {/* Customer Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            label="Legal Entity Name"
            tooltip="Registered legal name if different from the public name."
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