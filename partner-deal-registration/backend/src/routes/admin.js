const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const googleSheetsService = require('../services/googleSheetsService');

const router = express.Router();

// List of approved admin users
const ADMIN_USERS = [
  'huseini@daxa.ai',
  'apoorva@daxa.ai', 
  'sridhar@daxa.ai',
  'admin@daxa.ai'
];

/**
 * Middleware to check admin permissions
 */
const requireAdmin = (req, res, next) => {
  const userEmail = req.user?.email?.toLowerCase();
  
  if (!ADMIN_USERS.includes(userEmail)) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You do not have admin permissions'
    });
  }
  
  next();
};

/**
 * @route GET /api/v1/admin/pending-deals
 * @desc Get all pending deals for approval
 */
router.get('/pending-deals', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const deals = await googleSheetsService.getSheetData('Deals');
    
    if (!deals || deals.length <= 1) {
      return res.json({
        deals: [],
        total: 0,
        message: 'No pending deals found'
      });
    }

    const headers = deals[0];
    const pendingDeals = [];

    // Filter for pending deals (status = 'submitted')
    for (let i = 1; i < deals.length; i++) {
      const deal = {};
      headers.forEach((header, index) => {
        deal[header] = deals[i][index] || '';
      });
      
      if (deal.status === 'submitted') {
        pendingDeals.push(deal);
      }
    }

    // Sort by creation date (newest first)
    pendingDeals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      deals: pendingDeals,
      total: pendingDeals.length,
      message: `Found ${pendingDeals.length} pending deals`
    });

  } catch (error) {
    console.error('Get pending deals error:', error);
    res.status(500).json({
      error: 'Failed to retrieve pending deals',
      message: error.message
    });
  }
});

/**
 * @route POST /api/v1/admin/deals/:id/approve
 * @desc Approve a deal
 */
router.post('/deals/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { approver_name } = req.body;
    const userEmail = req.user.email;
    
    // Find the deal
    const deal = await googleSheetsService.findRowByValue('Deals', 'id', id);
    
    if (!deal) {
      return res.status(404).json({
        error: 'Deal not found',
        dealId: id
      });
    }

    if (deal.status !== 'submitted') {
      return res.status(400).json({
        error: 'Deal cannot be approved',
        message: `Deal status is '${deal.status}'. Only submitted deals can be approved.`
      });
    }

    // Update the deal status
    const dealData = await googleSheetsService.getSheetData('Deals');
    const headers = dealData[0];
    const dealRowIndex = deal._rowIndex;

    if (dealRowIndex) {
      // Find column indices
      const statusIndex = headers.indexOf('status');
      const approvedByIndex = headers.indexOf('approved_by');
      const approvedAtIndex = headers.indexOf('approved_at');

      // Update the row
      const updatedRow = [...dealData[dealRowIndex - 1]];
      updatedRow[statusIndex] = 'approved';
      updatedRow[approvedByIndex] = approver_name || userEmail;
      updatedRow[approvedAtIndex] = new Date().toISOString();

      await googleSheetsService.updateRow('Deals', dealRowIndex, updatedRow);

      // Add audit log
      const auditData = [
        googleSheetsService.generateId(),
        id,
        userEmail,
        'approved',
        new Date().toISOString(),
        `Deal approved by ${approver_name || userEmail}`
      ];

      await googleSheetsService.appendToSheet('Audit_Log', auditData);

      res.json({
        message: 'Deal approved successfully',
        dealId: id,
        approver: approver_name || userEmail,
        status: 'approved'
      });

    } else {
      throw new Error('Could not find deal row to update');
    }

  } catch (error) {
    console.error('Approve deal error:', error);
    res.status(500).json({
      error: 'Failed to approve deal',
      message: error.message
    });
  }
});

/**
 * @route POST /api/v1/admin/deals/:id/reject
 * @desc Reject a deal
 */
router.post('/deals/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { approver_name, rejection_reason } = req.body;
    const userEmail = req.user.email;
    
    if (!rejection_reason || rejection_reason.trim() === '') {
      return res.status(400).json({
        error: 'Rejection reason is required'
      });
    }

    // Find the deal
    const deal = await googleSheetsService.findRowByValue('Deals', 'id', id);
    
    if (!deal) {
      return res.status(404).json({
        error: 'Deal not found',
        dealId: id
      });
    }

    if (deal.status !== 'submitted') {
      return res.status(400).json({
        error: 'Deal cannot be rejected',
        message: `Deal status is '${deal.status}'. Only submitted deals can be rejected.`
      });
    }

    // Update the deal status
    const dealData = await googleSheetsService.getSheetData('Deals');
    const headers = dealData[0];
    const dealRowIndex = deal._rowIndex;

    if (dealRowIndex) {
      // Find column indices
      const statusIndex = headers.indexOf('status');
      const approvedByIndex = headers.indexOf('approved_by');
      const approvedAtIndex = headers.indexOf('approved_at');
      const rejectionReasonIndex = headers.indexOf('rejection_reason');

      // Update the row
      const updatedRow = [...dealData[dealRowIndex - 1]];
      updatedRow[statusIndex] = 'rejected';
      updatedRow[approvedByIndex] = approver_name || userEmail;
      updatedRow[approvedAtIndex] = new Date().toISOString();
      updatedRow[rejectionReasonIndex] = rejection_reason.trim();

      await googleSheetsService.updateRow('Deals', dealRowIndex, updatedRow);

      // Add audit log
      const auditData = [
        googleSheetsService.generateId(),
        id,
        userEmail,
        'rejected',
        new Date().toISOString(),
        `Deal rejected by ${approver_name || userEmail}: ${rejection_reason}`
      ];

      await googleSheetsService.appendToSheet('Audit_Log', auditData);

      res.json({
        message: 'Deal rejected successfully',
        dealId: id,
        rejector: approver_name || userEmail,
        status: 'rejected',
        reason: rejection_reason
      });

    } else {
      throw new Error('Could not find deal row to update');
    }

  } catch (error) {
    console.error('Reject deal error:', error);
    res.status(500).json({
      error: 'Failed to reject deal',
      message: error.message
    });
  }
});

/**
 * @route GET /api/v1/admin/deals/stats
 * @desc Get approval statistics
 */
router.get('/deals/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const deals = await googleSheetsService.getSheetData('Deals');
    
    if (!deals || deals.length <= 1) {
      return res.json({
        total: 0,
        submitted: 0,
        approved: 0,
        rejected: 0,
        totalValue: 0,
        averageApprovalTime: 0
      });
    }

    const headers = deals[0];
    const stats = {
      total: deals.length - 1,
      submitted: 0,
      approved: 0,
      rejected: 0,
      totalValue: 0,
      approvalTimes: []
    };

    for (let i = 1; i < deals.length; i++) {
      const deal = {};
      headers.forEach((header, index) => {
        deal[header] = deals[i][index] || '';
      });
      
      // Count by status
      if (deal.status === 'submitted') stats.submitted++;
      else if (deal.status === 'approved') stats.approved++;
      else if (deal.status === 'rejected') stats.rejected++;

      // Calculate total value
      const dealValue = parseFloat(deal.deal_value?.replace(/[^0-9.]/g, '') || 0);
      if (!isNaN(dealValue)) {
        stats.totalValue += dealValue;
      }

      // Calculate approval time for approved/rejected deals
      if ((deal.status === 'approved' || deal.status === 'rejected') && deal.approved_at && deal.created_at) {
        const createdTime = new Date(deal.created_at);
        const approvedTime = new Date(deal.approved_at);
        const approvalTimeHours = (approvedTime - createdTime) / (1000 * 60 * 60);
        stats.approvalTimes.push(approvalTimeHours);
      }
    }

    // Calculate average approval time
    const averageApprovalTime = stats.approvalTimes.length > 0 
      ? stats.approvalTimes.reduce((a, b) => a + b, 0) / stats.approvalTimes.length 
      : 0;

    res.json({
      ...stats,
      averageApprovalTime: Math.round(averageApprovalTime * 100) / 100 // Round to 2 decimal places
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve statistics',
      message: error.message
    });
  }
});

module.exports = router;