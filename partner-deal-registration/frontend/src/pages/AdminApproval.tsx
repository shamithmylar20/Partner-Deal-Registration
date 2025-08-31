import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Clock, Plus, Users, Eye, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/services/apiClient"; // PRODUCTION READY

interface Deal {
  id: string;
  company_name: string;
  domain: string;
  partner_company: string;
  submitter_name: string;
  submitter_email: string;
  deal_value: string;
  customer_industry: string;
  deal_stage: string;
  expected_close_date: string;
  status: string;
  created_at: string;
  approved_at?: string;
  rejection_reason?: string;
}

interface AdminUser {
  email: string;
  added_by: string;
  added_at: string;
  status: string;
}

const AdminApproval = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingDeal, setProcessingDeal] = useState<string | null>(null);
  
  // Admin Management State
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [isViewAdminsOpen, setIsViewAdminsOpen] = useState(false);
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminList, setAdminList] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');

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

  // PRODUCTION READY - Uses apiClient instead of direct fetch
  const loadPendingDeals = async () => {
    try {
      setLoading(true);
      const data = await apiClient.request('/admin/pending-deals');
      setDeals(data.deals || []);
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

  // PRODUCTION READY - Uses apiClient instead of direct fetch
  const loadAdminList = async () => {
    try {
      setLoadingAdmins(true);
      const data = await apiClient.request('/admin/list');
      setAdminList(data.admins || []);
    } catch (error) {
      console.error('Error loading admin list:', error);
      toast({
        title: "Error",
        description: "Failed to load admin list",
        variant: "destructive"
      });
    } finally {
      setLoadingAdmins(false);
    }
  };

  // PRODUCTION READY - Uses apiClient instead of direct fetch
  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdminEmail.trim())) {
      toast({
        title: "Invalid Email Format",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    try {
      setAddingAdmin(true);
      const data = await apiClient.request('/admin/add', {
        method: 'POST',
        body: JSON.stringify({ email: newAdminEmail.trim() })
      });

      toast({
        title: "Admin Added",
        description: data.message || "Admin has been successfully added to the system",
      });

      setNewAdminEmail('');
      setIsAddAdminOpen(false);
      loadAdminList();
    } catch (error: any) {
      toast({
        title: "Failed to Add Admin",
        description: error.message || "There was an error adding the admin",
        variant: "destructive"
      });
    } finally {
      setAddingAdmin(false);
    }
  };

  // PRODUCTION READY - Uses apiClient instead of direct fetch
  const handleRemoveAdmin = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} as an admin?`)) {
      return;
    }

    try {
      const data = await apiClient.request('/admin/remove', {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      toast({
        title: "Admin Removed",
        description: data.message || "Admin has been successfully removed",
      });

      loadAdminList();
    } catch (error: any) {
      toast({
        title: "Failed to Remove Admin",
        description: error.message || "There was an error removing the admin",
        variant: "destructive"
      });
    }
  };

  // PRODUCTION READY - Uses apiClient instead of direct fetch
  const handleDealAction = async (dealId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
    try {
      setProcessingDeal(dealId);
      const data = await apiClient.request(`/admin/deals/${dealId}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ 
          ...(rejectionReason && { rejectionReason }) 
        })
      });

      toast({
        title: action === 'approve' ? "Deal Approved" : "Deal Rejected",
        description: data.message || `Deal has been ${action}d successfully`,
      });

      // Refresh the deals list
      loadPendingDeals();
    } catch (error: any) {
      toast({
        title: `Failed to ${action} deal`,
        description: error.message || `There was an error ${action}ing the deal`,
        variant: "destructive"
      });
    } finally {
      setProcessingDeal(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseInt(value.replace(/[^\d]/g, ''));
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (!isApprover) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              You don't have permission to access the admin approval panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Contact your administrator if you believe this is an error.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Approval</h1>
              <p className="text-sm text-muted-foreground">
                Review and manage deal registrations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* View Admins Dialog */}
              <Dialog open={isViewAdminsOpen} onOpenChange={setIsViewAdminsOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={loadAdminList}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View Admins
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Admin Users</DialogTitle>
                    <DialogDescription>
                      Manage users with admin privileges
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {loadingAdmins ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground mt-2">Loading admins...</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {adminList.map((admin, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{admin.email}</p>
                              <p className="text-sm text-muted-foreground">
                                Added by {admin.added_by} on {formatDate(admin.added_at)}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveAdmin(admin.email)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {adminList.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">
                            No admin users found
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Add Admin Dialog */}
              <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Admin</DialogTitle>
                    <DialogDescription>
                      Grant admin privileges to a user by their email address
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">Email Address</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="Enter email address..."
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddAdminOpen(false)}
                        disabled={addingAdmin}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddAdmin}
                        disabled={addingAdmin}
                      >
                        {addingAdmin ? "Adding..." : "Add Admin"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading pending deals...</p>
          </div>
        ) : deals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">All caught up!</h3>
              <p className="text-muted-foreground">There are no pending deals to review.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Pending Deals ({deals.length})
              </h2>
            </div>

            <div className="grid gap-6">
              {deals.map((deal) => (
                <Card key={deal.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{deal.company_name}</CardTitle>
                        <CardDescription className="text-base">
                          {deal.domain} • {deal.customer_industry}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending Review
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Deal Information */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-foreground">Deal Information</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Value:</span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(deal.deal_value)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Stage:</span>
                            <span>{deal.deal_stage}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Expected Close:</span>
                            <span>{formatDate(deal.expected_close_date)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Submitted:</span>
                            <span>{formatDate(deal.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Partner Information */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-foreground">Partner Information</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Company:</span>
                            <span>{deal.partner_company}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Submitter:</span>
                            <span>{deal.submitter_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="text-sm">{deal.submitter_email}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{deal.company_name} - Deal Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Full deal details would go here */}
                            <p>Full deal information and history...</p>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={processingDeal === deal.id}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Deal</DialogTitle>
                            <DialogDescription>
                              Please provide a reason for rejecting this deal registration.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="rejectionReason">Rejection Reason</Label>
                              <Textarea
                                id="rejectionReason"
                                placeholder="Enter the reason for rejection..."
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline">Cancel</Button>
                              <Button 
                                variant="destructive"
                                onClick={() => {
                                  const reason = (document.getElementById('rejectionReason') as HTMLTextAreaElement)?.value;
                                  handleDealAction(deal.id, 'reject', reason);
                                }}
                              >
                                Reject Deal
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        size="sm"
                        onClick={() => handleDealAction(deal.id, 'approve')}
                        disabled={processingDeal === deal.id}
                      >
                        {processingDeal === deal.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApproval;