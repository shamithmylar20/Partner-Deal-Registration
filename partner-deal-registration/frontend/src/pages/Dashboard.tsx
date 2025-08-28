import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Copy,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/services/apiClient';
import { useToast } from '@/hooks/use-toast';

interface Deal {
  id: string;
  company_name: string;
  deal_value: string;
  status: string;
  created_at: string;
  expected_close_date: string;
  primary_product?: string;
  submitter_name: string;
  partner_company: string;
}

interface Metrics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  submitted: number;
  totalValue: number;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved": return "default";
    case "pending": 
    case "submitted": 
    case "under_review": return "secondary";
    case "rejected": return "destructive";
    default: return "outline";
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [deals, setDeals] = useState<Deal[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    submitted: 0,
    totalValue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Load deals and stats in parallel
        const [dealsResponse, statsResponse] = await Promise.all([
          apiClient.getDeals(),
          apiClient.getDealStats()
        ]);
        
        setDeals(dealsResponse.deals || []);
        setMetrics(statsResponse);
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        toast({
          title: "Error Loading Data",
          description: "Failed to load dashboard data. Please try refreshing the page.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [toast]);

  // Filter deals based on search and status
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.submitter_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || deal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Create metrics cards data
  const metricsCards = [
    {
      title: "Total Deals",
      value: metrics.total.toString(),
      change: metrics.total > 0 ? `${metrics.total} registered` : "No deals yet",
      icon: TrendingUp,
      description: "total registered"
    },
    {
      title: "Pending Approval",
      value: metrics.submitted.toString(),
      change: metrics.submitted > 0 ? `${metrics.submitted} submitted` : "None pending",
      icon: Clock,
      description: "awaiting review"
    },
    {
      title: "Approved Deals",
      value: metrics.approved.toString(),
      change: metrics.approved > 0 ? "Great work!" : "None yet",
      icon: CheckCircle,
      description: "approved deals"
    },
    {
      title: "Pipeline Value",
      value: formatCurrency(metrics.totalValue),
      change: metrics.totalValue > 0 ? "Active pipeline" : "Start registering",
      icon: TrendingUp,
      description: "total value"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.firstName || 'Partner'}!
            </h1>
            <p className="text-muted-foreground">
              Manage your deal registrations and track performance
            </p>
          </div>
          <Button asChild>
            <a href="/register">
              <Plus className="w-4 h-4 mr-2" />
              Register New Deal
            </a>
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricsCards.map((metric, index) => (
            <Card key={index} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="text-primary font-medium mr-1">{metric.change}</span>
                  {metric.description}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="deals" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="deals">Deal Registrations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deals" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Deal Registrations ({filteredDeals.length})</CardTitle>
                <CardDescription>View and manage all your registered deals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search deals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                {/* Deals List */}
                <div className="space-y-4">
                  {filteredDeals.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {deals.length === 0 ? 'No Deals Registered' : 'No Deals Match Your Filter'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {deals.length === 0 
                          ? 'Start by registering your first deal to see it appear here.' 
                          : 'Try adjusting your search or filter criteria.'}
                      </p>
                      {deals.length === 0 && (
                        <Button asChild>
                          <a href="/register">
                            <Plus className="w-4 h-4 mr-2" />
                            Register Your First Deal
                          </a>
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredDeals.map((deal) => (
                      <Card key={deal.id} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-foreground">
                                  {deal.company_name}
                                </h3>
                                <Badge variant={getStatusColor(deal.status)}>
                                  {deal.status}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                                <div>
                                  <span className="font-medium">Deal ID:</span> {deal.id}
                                </div>
                                <div>
                                  <span className="font-medium">Value:</span> {formatCurrency(parseFloat(deal.deal_value || '0'))}
                                </div>
                                <div>
                                  <span className="font-medium">Submitted:</span> {formatDate(deal.created_at)}
                                </div>
                                <div>
                                  <span className="font-medium">Expected Close:</span> {deal.expected_close_date ? formatDate(deal.expected_close_date) : 'TBD'}
                                </div>
                                <div>
                                  <span className="font-medium">Submitter:</span> {deal.submitter_name}
                                </div>
                                <div>
                                  <span className="font-medium">Partner:</span> {deal.partner_company}
                                </div>
                              </div>
                              
                              {deal.primary_product && (
                                <div className="flex gap-2">
                                  <Badge variant="outline">{deal.primary_product}</Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>Track your deal registration performance and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Detailed analytics and reporting features will be available in the next update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Partner Settings</CardTitle>
                <CardDescription>Manage your partner profile and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Settings Panel</h3>
                  <p className="text-muted-foreground">
                    Partner settings and profile management features will be available in the next update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;