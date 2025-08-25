import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Building2, DollarSign, Calendar, User, Mail, MapPin, UserPlus, Shield } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";

interface Deal {
  id: string;
  status: string;
  created_at: string;
  company_name: string;
  domain: string;
  partner_company: string;
  submitter_name: string;
  submitter_email: string;
  territory: string;
  customer_industry: string;
  customer_location: string;
  deal_stage: string;
  expected_close_date: string;
  deal_value: string;
  contract_type: string;
  primary_product: string;
  additional_notes: string;
  customer_legal_name: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

const AdminApproval = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingDeal, setProcessingDeal] = useState<string | null>(null);
  
  // Add New Admin Modal State
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    partnerCompany: 'Daxa Internal',
    password: ''
  });

  // Check if current user is an approver (either by email OR by role)
  const approvers = ['huseini@daxa.ai', 'apoorva@daxa.ai', 'sridhar@daxa.ai', 'admin@daxa.ai'];
  const isApprover = user && (
    approvers.includes(user.email.toLowerCase()) || 
    user.role === 'admin'
  );

  useEffect(() => {
    if (isApprover) {
      loadPendingDeals();
    }
  }, [isApprover]);

  const loadPendingDeals = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/v1/admin/pending-deals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDeals(data.deals || []);
      }
    } catch (error) {
      console.error('Error loading deals:', error);
      toast({
        title: "Error",
        description: "Failed to load pending deals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (dealId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      setProcessingDeal(dealId);
      
      const response = await fetch(`http://localhost:3001/api/v1/admin/deals/${dealId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          approver_name: user?.firstName + ' ' + user?.lastName,
          rejection_reason: reason
        })
      });

      if (response.ok) {
        toast({
          title: action === 'approve' ? "Deal Approved" : "Deal Rejected",
          description: `Deal has been ${action}d successfully`,
        });
        
        // Reload deals
        loadPendingDeals();
      } else {
        throw new Error(`Failed to ${action} deal`);
      }
    } catch (error) {
      console.error(`Error ${action}ing deal:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} deal`,
        variant: "destructive"
      });
    } finally {
      setProcessingDeal(null);
    }
  };

  const handleAddAdmin = async () => {
    try {
      setAddingAdmin(true);
      
      const response = await fetch('http://localhost:3001/api/v1/admin/add-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify(newAdminForm)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Admin Added Successfully",
          description: `${newAdminForm.firstName} ${newAdminForm.lastName} has been added as an admin.`,
        });
        
        // Reset form and close modal
        setNewAdminForm({
          email: '',
          firstName: '',
          lastName: '',
          partnerCompany: 'Daxa Internal',
          password: ''
        });
        setIsAddAdminOpen(false);
      } else {
        throw new Error(data.message || 'Failed to add admin');
      }
    } catch (error: any) {
      console.error('Error adding admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add new admin",
        variant: "destructive"
      });
    } finally {
      setAddingAdmin(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewAdminForm({ ...newAdminForm, password });
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isApprover) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access the approval dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Deal Approval Dashboard</h1>
            <p className="text-muted-foreground">Review and approve pending deal registrations</p>
          </div>
          
          {/* Add New Admin Button */}
          <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Add New Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Add New Admin
                </DialogTitle>
                <DialogDescription>
                  Create a new admin account. The new admin will be able to approve deals and manage the system.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@company.com"
                    value={newAdminForm.email}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={newAdminForm.firstName}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, firstName: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={newAdminForm.lastName}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, lastName: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="partnerCompany" className="text-right">
                    Company
                  </Label>
                  <Input
                    id="partnerCompany"
                    value={newAdminForm.partnerCompany}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, partnerCompany: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Input
                      id="password"
                      type="text"
                      placeholder="Enter password"
                      value={newAdminForm.password}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateRandomPassword}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-md">
                  <p><strong>Note:</strong> The new admin will be able to:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Approve and reject deal registrations</li>
                    <li>Access the admin dashboard</li>
                    <li>Add other admin users</li>
                  </ul>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddAdminOpen(false);
                    setNewAdminForm({
                      email: '',
                      firstName: '',
                      lastName: '',
                      partnerCompany: 'Daxa Internal',
                      password: ''
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleAddAdmin}
                  disabled={
                    addingAdmin || 
                    !newAdminForm.email || 
                    !newAdminForm.firstName || 
                    !newAdminForm.lastName ||
                    !newAdminForm.password
                  }
                >
                  {addingAdmin ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Admin
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading pending deals...</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">All caught up!</h2>
            <p className="text-muted-foreground">No pending deals require approval at this time.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {deals.map((deal) => (
              <DealCard 
                key={deal.id} 
                deal={deal} 
                onApprove={(reason) => handleApproval(deal.id, 'approve', reason)}
                onReject={(reason) => handleApproval(deal.id, 'reject', reason)}
                processing={processingDeal === deal.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DealCard: React.FC<{
  deal: Deal;
  onApprove: (reason?: string) => void;
  onReject: (reason?: string) => void;
  processing: boolean;
}> = ({ deal, onApprove, onReject, processing }) => {
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleReject = () => {
    if (showRejectReason && rejectionReason.trim()) {
      onReject(rejectionReason);
      setShowRejectReason(false);
      setRejectionReason('');
    } else {
      setShowRejectReason(true);
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {deal.company_name}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-1">
              <span>{deal.domain}</span>
              <Badge variant="secondary">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(deal.created_at)}
              </Badge>
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending Approval
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Partner Info */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Partner Company</p>
            <p className="font-medium">{deal.partner_company}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Submitted By</p>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{deal.submitter_name}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Territory</p>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{deal.territory}</span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Industry</p>
            <p>{deal.customer_industry}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Location</p>
            <p>{deal.customer_location}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Deal Stage</p>
            <Badge variant="secondary">{deal.deal_stage}</Badge>
          </div>
        </div>

        {/* Deal Details */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Deal Value</p>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-600">{formatCurrency(deal.deal_value)}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Expected Close</p>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{formatDate(deal.expected_close_date)}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Contract Type</p>
            <Badge variant="outline">{deal.contract_type}</Badge>
          </div>
        </div>

        {/* Additional Notes */}
        {deal.additional_notes && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Additional Notes</p>
            <p className="text-sm bg-muted p-3 rounded-md">{deal.additional_notes}</p>
          </div>
        )}

        {/* Rejection Reason Input */}
        {showRejectReason && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Rejection Reason</p>
            <Textarea
              placeholder="Please provide a reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={() => onApprove()}
            disabled={processing}
            className="flex-1"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Deal
              </>
            )}
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={processing || (showRejectReason && !rejectionReason.trim())}
            className="flex-1"
          >
            <XCircle className="w-4 h-4 mr-2" />
            {showRejectReason ? 'Confirm Rejection' : 'Reject Deal'}
          </Button>

          {showRejectReason && (
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectReason(false);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminApproval;