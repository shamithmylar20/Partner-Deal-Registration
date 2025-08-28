import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/form/FormField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DealIntelligenceStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const DealIntelligenceStep = ({ formData, setFormData }: DealIntelligenceStepProps) => {
  const [dealDetails, setDealDetails] = useState({
    dealStage: formData.dealStage || "",
    expectedCloseDate: formData.expectedCloseDate || "",
    dealValue: formData.dealValue || "",
    contractType: formData.contractType || "",
    primaryProduct: formData.primaryProduct || ""
  });

  // Calculate deal value display
  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Update form data when local state changes
  useEffect(() => {
    setFormData({
      ...formData,
      dealStage: dealDetails.dealStage,
      expectedCloseDate: dealDetails.expectedCloseDate,
      dealValue: dealDetails.dealValue,
      contractType: dealDetails.contractType,
      primaryProduct: dealDetails.primaryProduct
    });
  }, [dealDetails, formData, setFormData]);

  return (
    <div className="space-y-6">
      {/* Deal Intelligence Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Deal Intelligence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              label="Deal Stage"
              required
              tooltip="Current sales stage. Drives routing and SLA expectations."
            >
              <Select
                value={dealDetails.dealStage}
                onValueChange={(value) => setDealDetails({...dealDetails, dealStage: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select deal stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed-won">Closed Won</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Contract Type"
              required
              tooltip="Is this a New logo, an Expansion, or a Renewal?"
            >
              <Select
                value={dealDetails.contractType}
                onValueChange={(value) => setDealDetails({...dealDetails, contractType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contract type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Business</SelectItem>
                  <SelectItem value="expansion">Expansion</SelectItem>
                  <SelectItem value="renewal">Renewal</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              label="Deal Value (USD)"
              required
              tooltip="Estimated contract value in USD. Used for approval tiers."
            >
              <Input
                value={dealDetails.dealValue}
                onChange={(e) => setDealDetails({...dealDetails, dealValue: e.target.value})}
                placeholder="e.g., 150000"
              />
              {dealDetails.dealValue && (
                <div className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(dealDetails.dealValue)}
                </div>
              )}
            </FormField>

            <FormField
              label="Expected Close Date"
              required
              tooltip="Projected close date. Must be in the future."
            >
              <Input
                type="date"
                value={dealDetails.expectedCloseDate}
                onChange={(e) => setDealDetails({...dealDetails, expectedCloseDate: e.target.value})}
              />
            </FormField>
          </div>

          <FormField
            label="Primary Product (Optional)"
            tooltip="Select the main product if required for ownership/routing."
          >
            <Select
              value={dealDetails.primaryProduct}
              onValueChange={(value) => setDealDetails({...dealDetails, primaryProduct: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select primary product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mcp-server">MCP Server</SelectItem>
                <SelectItem value="safe-rag">Safe RAG</SelectItem>
                <SelectItem value="proxima-ai">Proxima AI</SelectItem>
                <SelectItem value="pebblo-modules">Safe Inter (AI Gateway)</SelectItem>
                <SelectItem value="professional-services">Professional Services</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </CardContent>
      </Card>
    </div>
  );
};