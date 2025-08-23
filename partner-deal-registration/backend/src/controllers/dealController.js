const googleSheetsService = require('../services/googleSheetsService');

/**
 * Create new deal registration
 * POST /api/v1/deals
 */
const createDeal = async (req, res) => {
  try {
    const {
      // Quick Check fields
      companyName,
      domain,
      
      // Core Info fields
      partnerCompany,
      submitterName,
      submitterEmail,
      territory,
      customerLegalName,
      customerIndustry,
      customerLocation,
      
      // Deal Intelligence fields
      dealStage,
      expectedCloseDate,
      dealValue,
      contractType,
      primaryProduct,
      
      // Documentation fields
      additionalNotes,
      uploadedFiles,
      agreedToTerms
    } = req.body;

    // Basic validation
    if (!companyName || !domain || !partnerCompany || !submitterName || !submitterEmail) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['companyName', 'domain', 'partnerCompany', 'submitterName', 'submitterEmail']
      });
    }

    if (!agreedToTerms) {
      return res.status(400).json({
        error: 'Must agree to terms and conditions'
      });
    }

    // Check for duplicate deals
    const duplicateCheck = await checkDuplicateDeals(companyName, domain);
    
    if (duplicateCheck.hasDuplicates) {
      return res.status(409).json({
        error: 'Potential duplicate deal detected',
        duplicates: duplicateCheck.duplicates,
        message: 'Please review existing deals or contact your partner manager'
      });
    }

    // Create customer record
    const customer = await createOrFindCustomer({
      companyName,
      domain,
      legalName: customerLegalName,
      industry: customerIndustry,
      location: customerLocation
    });

    // Create deal record
    const dealData = [
      googleSheetsService.generateId(), // id
      req.user?.partnerId || '', // partner_id (from authenticated user)
      customer.id, // customer_id
      req.user?.id || '', // submitter_id (from authenticated user)
      'submitted', // status
      partnerCompany,
      submitterName,
      submitterEmail,
      territory,
      companyName,
      domain,
      customerLegalName || '',
      customerIndustry,
      customerLocation,
      dealStage,
      expectedCloseDate,
      dealValue,
      contractType,
      primaryProduct || '',
      additionalNotes || '',
      uploadedFiles ? JSON.stringify(uploadedFiles) : '',
      agreedToTerms.toString(),
      '', // duplicate_score
      '', // potential_duplicates
      '', // approved_by
      '', // approved_at
      googleSheetsService.getCurrentTimestamp(), // created_at
      googleSheetsService.getCurrentTimestamp()  // updated_at
    ];

    await googleSheetsService.appendToSheet('Deals', dealData);

    // Get the created deal
    const createdDeal = await googleSheetsService.findRowByValue('Deals', 'company_name', companyName);

    console.log(`✅ Deal created successfully for ${companyName}`);

    res.status(201).json({
      message: 'Deal registration submitted successfully',
      dealId: createdDeal.id,
      status: 'submitted',
      estimatedApprovalTime: getEstimatedApprovalTime(dealValue),
      nextSteps: [
        'Deal submitted for review',
        'You will receive an email confirmation shortly',
        'Approval typically takes 24-48 hours',
        'Contact your partner manager for urgent requests'
      ]
    });

  } catch (error) {
    console.error('Deal creation error:', error);
    res.status(500).json({
      error: 'Failed to create deal registration',
      message: error.message
    });
  }
};

/**
 * Get all deals (with basic filtering)
 * GET /api/v1/deals
 */
const getDeals = async (req, res) => {
  try {
    const { status, partner, limit = 50 } = req.query;
    
    const deals = await googleSheetsService.getSheetData('Deals');
    
    if (!deals || deals.length < 2) {
      return res.json({
        deals: [],
        total: 0,
        message: 'No deals found'
      });
    }

    const headers = deals[0];
    let dealRecords = [];

    // Convert to objects
    for (let i = 1; i < deals.length && dealRecords.length < limit; i++) {
      const deal = {};
      headers.forEach((header, index) => {
        deal[header] = deals[i][index] || '';
      });
      
      // Apply filters
      if (status && deal.status !== status) continue;
      if (partner && deal.partner_company !== partner) continue;
      
      dealRecords.push(deal);
    }

    res.json({
      deals: dealRecords,
      total: dealRecords.length,
      filters: { status, partner, limit }
    });

  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({
      error: 'Failed to retrieve deals',
      message: error.message
    });
  }
};

/**
 * Get single deal by ID
 * GET /api/v1/deals/:id
 */
const getDealById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deal = await googleSheetsService.findRowByValue('Deals', 'id', id);
    
    if (!deal) {
      return res.status(404).json({
        error: 'Deal not found',
        dealId: id
      });
    }

    res.json({
      deal: deal,
      message: 'Deal retrieved successfully'
    });

  } catch (error) {
    console.error('Get deal error:', error);
    res.status(500).json({
      error: 'Failed to retrieve deal',
      message: error.message
    });
  }
};

/**
 * Check for duplicate deals
 */
const checkDuplicateDeals = async (companyName, domain) => {
  try {
    const deals = await googleSheetsService.getSheetData('Deals');
    const duplicates = [];

    if (deals && deals.length > 1) {
      const headers = deals[0];
      const companyIndex = headers.indexOf('company_name');
      const domainIndex = headers.indexOf('domain');
      const statusIndex = headers.indexOf('status');

      for (let i = 1; i < deals.length; i++) {
        const row = deals[i];
        const existingCompany = row[companyIndex] || '';
        const existingDomain = row[domainIndex] || '';
        const existingStatus = row[statusIndex] || '';

        // Check for exact matches on active deals
        if (existingStatus !== 'rejected') {
          if (existingCompany.toLowerCase() === companyName.toLowerCase() ||
              existingDomain.toLowerCase() === domain.toLowerCase()) {
            
            const duplicate = {};
            headers.forEach((header, index) => {
              duplicate[header] = row[index] || '';
            });
            duplicates.push(duplicate);
          }
        }
      }
    }

    return {
      hasDuplicates: duplicates.length > 0,
      duplicates: duplicates
    };

  } catch (error) {
    console.error('Duplicate check error:', error);
    return { hasDuplicates: false, duplicates: [] };
  }
};

/**
 * Create or find customer
 */
const createOrFindCustomer = async (customerData) => {
  try {
    // Check if customer exists
    let customer = await googleSheetsService.findRowByValue('Customers', 'domain', customerData.domain);
    
    if (!customer) {
      // Create new customer
      const customerRecord = [
        googleSheetsService.generateId(),
        customerData.companyName,
        customerData.domain,
        customerData.legalName || '',
        customerData.industry,
        customerData.location,
        '', // country
        googleSheetsService.getCurrentTimestamp(),
        googleSheetsService.getCurrentTimestamp()
      ];

      await googleSheetsService.appendToSheet('Customers', customerRecord);
      customer = await googleSheetsService.findRowByValue('Customers', 'domain', customerData.domain);
    }

    return customer;
  } catch (error) {
    console.error('Customer creation error:', error);
    throw error;
  }
};

/**
 * Get estimated approval time based on deal value
 */
const getEstimatedApprovalTime = (dealValue) => {
  const value = parseFloat(dealValue?.replace(/[^0-9.]/g, '') || 0);
  
  if (value >= 500000) {
    return '3-5 business days';
  } else if (value >= 100000) {
    return '2-3 business days';
  } else {
    return '1-2 business days';
  }
};

module.exports = {
  createDeal,
  getDeals,
  getDealById,
  checkDuplicateDeals,
  createOrFindCustomer,
  getEstimatedApprovalTime
};