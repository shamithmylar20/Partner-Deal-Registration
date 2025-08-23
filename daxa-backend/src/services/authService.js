const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const googleSheetsService = require('./googleSheetsService');

class AuthService {
  
  /**
   * Register a new partner user
   */
  async registerUser(userData) {
    const { email, password, firstName, lastName, company, territory } = userData;
    
    try {
      // Check if user already exists
      const existingUser = await this.findUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create or find partner company
      let partner = await this.findPartnerByName(company);
      
      if (!partner) {
        // Create new partner
        const partnerData = [
          googleSheetsService.generateId(),
          company,
          'reseller',
          territory,
          'pending',
          `${firstName} ${lastName}`,
          email,
          '',
          '',
          googleSheetsService.getCurrentTimestamp(),
          googleSheetsService.getCurrentTimestamp()
        ];
        
        await googleSheetsService.appendToSheet('Partners', partnerData);
        partner = await this.findPartnerByName(company);
      }

      // Create user
      const userData = [
        googleSheetsService.generateId(),
        partner.id,
        email,
        passwordHash,
        firstName,
        lastName,
        'partner_user',
        'pending',
        '',
        'false',
        '',
        googleSheetsService.getCurrentTimestamp(),
        googleSheetsService.getCurrentTimestamp()
      ];

      await googleSheetsService.appendToSheet('Users', userData);
      const user = await this.findUserByEmail(email);

      console.log(`✅ New user registered: ${email}`);
      
      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        status: user.status,
        partnerName: partner.company_name
      };

    } catch (error) {
      console.error('User registration error:', error);
      throw error;
    }
  }

  /**
   * Login user with email and password
   */
  async loginUser(email, password) {
    try {
      const user = await this.findUserByEmail(email);
      
      if (!user || user.status !== 'active') {
        throw new Error('Invalid credentials or account not active');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Get partner information
      const partner = await this.findPartnerById(user.partner_id);

      // Generate tokens
      const tokens = this.generateTokens(user);

      console.log(`✅ User logged in: ${email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          partnerId: user.partner_id,
          partnerName: partner?.company_name || 'Unknown Partner'
        },
        ...tokens
      };

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Google SSO Login
   */
  async googleLogin(googleUser) {
    try {
      let user = await this.findUserByEmail(googleUser.email);

      if (!user) {
        // Create new user from Google data
        const domain = googleUser.email.split('@')[1];
        
        // Create partner if doesn't exist
        let partner = await this.findPartnerByName(domain);
        if (!partner) {
          const partnerData = [
            googleSheetsService.generateId(),
            domain,
            'reseller',
            'North America',
            'pending',
            googleUser.name,
            googleUser.email,
            '',
            '',
            googleSheetsService.getCurrentTimestamp(),
            googleSheetsService.getCurrentTimestamp()
          ];
          
          await googleSheetsService.appendToSheet('Partners', partnerData);
          partner = await this.findPartnerByName(domain);
        }

        // Create user
        const userData = [
          googleSheetsService.generateId(),
          partner.id,
          googleUser.email,
          '', // No password for SSO users
          googleUser.given_name || googleUser.name,
          googleUser.family_name || '',
          'partner_user',
          'active', // SSO users are automatically active
          googleSheetsService.getCurrentTimestamp(),
          'true',
          googleUser.sub,
          googleSheetsService.getCurrentTimestamp(),
          googleSheetsService.getCurrentTimestamp()
        ];

        await googleSheetsService.appendToSheet('Users', userData);
        user = await this.findUserByEmail(googleUser.email);
      }

      // Generate tokens
      const tokens = this.generateTokens(user);
      const partner = await this.findPartnerById(user.partner_id);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          partnerId: user.partner_id,
          partnerName: partner?.company_name || 'Unknown Partner'
        },
        ...tokens
      };

    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  /**
   * Generate JWT tokens
   */
  generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      partnerId: user.partner_id
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    return { accessToken };
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email) {
    return await googleSheetsService.findRowByValue('Users', 'email', email);
  }

  /**
   * Find partner by name
   */
  async findPartnerByName(companyName) {
    return await googleSheetsService.findRowByValue('Partners', 'company_name', companyName);
  }

  /**
   * Find partner by ID
   */
  async findPartnerById(partnerId) {
    return await googleSheetsService.findRowByValue('Partners', 'id', partnerId);
  }
}

module.exports = new AuthService();