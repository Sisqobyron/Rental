const LegalAgreement = require('../models/LegalAgreement');
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');

class LegalAgreementController {
  static async createAgreement(req, res) {
    try {
      const {
        tenantId,
        propertyId,
        agreementType = 'lease',
        rentDueDay = 1,
        lateFeeAmount = 0.00,
        lateFeeGraceDays = 5,
        securityDepositTerms = 'Security deposit equals one month rent. Refundable upon satisfactory condition of property at lease termination.',
        propertyDamagePolicy = 'Tenant is responsible for all damages beyond normal wear and tear. Landlord will provide itemized list of deductions from security deposit.',
        maintenanceResponsibility = 'Landlord responsible for major repairs and structural maintenance. Tenant responsible for minor repairs, cleaning, and maintenance under $100.',
        terminationNoticeDays = 30,
        petPolicy = 'No pets allowed without written permission from landlord.',
        smokingPolicy = 'No smoking allowed on the premises.',
        guestPolicy = 'Guests allowed for maximum 7 consecutive days without landlord approval.',
        utilitiesIncluded = 'None. Tenant responsible for all utilities.',
        parkingDetails = 'No parking space included.',
        additionalTerms = ''
      } = req.body;

      // Verify tenant exists and user has permission
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      // Check if user is landlord of the property or the tenant
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      if (req.user.role === 'landlord' && property.landlord_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized - not your property' });
      }

      if (req.user.role === 'tenant' && tenant.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized - not your tenant record' });
      }

      const agreementData = {
        tenantId,
        propertyId,
        agreementType,
        rentDueDay,
        lateFeeAmount,
        lateFeeGraceDays,
        securityDepositTerms,
        propertyDamagePolicy,
        maintenanceResponsibility,
        terminationNoticeDays,
        petPolicy,
        smokingPolicy,
        guestPolicy,
        utilitiesIncluded,
        parkingDetails,
        additionalTerms
      };

      const agreement = await LegalAgreement.create(agreementData);

      res.status(201).json({
        message: 'Legal agreement created successfully',
        agreement
      });
    } catch (error) {
      console.error('Create agreement error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async getAgreements(req, res) {
    try {
      let agreements;

      if (req.user.role === 'landlord') {
        // Get all agreements for properties owned by this landlord
        const { propertyId } = req.query;
        if (propertyId) {
          const property = await Property.findById(propertyId);
          if (!property || property.landlord_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
          }
          agreements = await LegalAgreement.findByPropertyId(propertyId);
        } else {
          // Get all agreements for all properties owned by this landlord
          const properties = await Property.findByLandlord(req.user.id);
          agreements = [];
          for (const property of properties) {
            const propertyAgreements = await LegalAgreement.findByPropertyId(property.id);
            agreements = agreements.concat(propertyAgreements);
          }
        }
      } else {
        // Tenant - get agreements for their tenant records
        const tenants = await Tenant.findByUserId(req.user.id);
        agreements = [];
        for (const tenant of tenants) {
          const tenantAgreements = await LegalAgreement.findByTenantId(tenant.id);
          agreements = agreements.concat(tenantAgreements);
        }
      }

      res.json({
        message: 'Legal agreements retrieved successfully',
        agreements
      });
    } catch (error) {
      console.error('Get agreements error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async getAgreementById(req, res) {
    try {
      const { id } = req.params;
      
      const agreement = await LegalAgreement.findById(id);
      if (!agreement) {
        return res.status(404).json({ error: 'Agreement not found' });
      }

      // Check permission
      const property = await Property.findById(agreement.property_id);
      const tenant = await Tenant.findById(agreement.tenant_id);

      if (req.user.role === 'landlord' && property.landlord_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      if (req.user.role === 'tenant' && tenant.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      res.json({
        message: 'Agreement retrieved successfully',
        agreement
      });
    } catch (error) {
      console.error('Get agreement error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async updateAgreement(req, res) {
    try {
      const { id } = req.params;
      
      const agreement = await LegalAgreement.findById(id);
      if (!agreement) {
        return res.status(404).json({ error: 'Agreement not found' });
      }

      // Check if agreement is already signed
      if (agreement.landlord_signature && agreement.tenant_signature) {
        return res.status(400).json({ error: 'Cannot modify a fully signed agreement' });
      }

      // Check permission (only landlord can update agreement terms)
      const property = await Property.findById(agreement.property_id);
      if (req.user.role !== 'landlord' || property.landlord_id !== req.user.id) {
        return res.status(403).json({ error: 'Only the landlord can modify agreement terms' });
      }

      await LegalAgreement.update(id, req.body);

      res.json({ message: 'Agreement updated successfully' });
    } catch (error) {
      console.error('Update agreement error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async signAgreement(req, res) {
    try {
      const { id } = req.params;
      
      const agreement = await LegalAgreement.findById(id);
      if (!agreement) {
        return res.status(404).json({ error: 'Agreement not found' });
      }

      // Determine signature type based on user role and property ownership
      const property = await Property.findById(agreement.property_id);
      const tenant = await Tenant.findById(agreement.tenant_id);

      let signatureType;
      if (req.user.role === 'landlord' && property.landlord_id === req.user.id) {
        signatureType = 'landlord';
        if (agreement.landlord_signature) {
          return res.status(400).json({ error: 'Landlord has already signed this agreement' });
        }
      } else if (req.user.role === 'tenant' && tenant.user_id === req.user.id) {
        signatureType = 'tenant';
        if (agreement.tenant_signature) {
          return res.status(400).json({ error: 'Tenant has already signed this agreement' });
        }
      } else {
        return res.status(403).json({ error: 'Unauthorized to sign this agreement' });
      }

      await LegalAgreement.signAgreement(id, signatureType, req.user.id);

      // Check if both parties have signed
      const updatedAgreement = await LegalAgreement.findById(id);
      const fullyExecuted = updatedAgreement.landlord_signature && updatedAgreement.tenant_signature;

      res.json({
        message: `Agreement signed successfully by ${signatureType}`,
        fullyExecuted,
        agreement: updatedAgreement
      });
    } catch (error) {
      console.error('Sign agreement error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async deleteAgreement(req, res) {
    try {
      const { id } = req.params;
      
      const agreement = await LegalAgreement.findById(id);
      if (!agreement) {
        return res.status(404).json({ error: 'Agreement not found' });
      }

      // Only landlord can delete agreements and only if not fully signed
      const property = await Property.findById(agreement.property_id);
      if (req.user.role !== 'landlord' || property.landlord_id !== req.user.id) {
        return res.status(403).json({ error: 'Only the landlord can delete agreements' });
      }

      if (agreement.landlord_signature && agreement.tenant_signature) {
        return res.status(400).json({ error: 'Cannot delete a fully signed agreement' });
      }

      await LegalAgreement.delete(id);

      res.json({ message: 'Agreement deleted successfully' });
    } catch (error) {
      console.error('Delete agreement error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  // Get default agreement template
  static getDefaultTemplate(req, res) {
    const defaultTemplate = {
      rentDueDay: 1,
      lateFeeAmount: 50.00,
      lateFeeGraceDays: 5,
      securityDepositTerms: 'Security deposit equals one month rent. Refundable upon satisfactory condition of property at lease termination, minus any unpaid rent or damages beyond normal wear and tear.',
      propertyDamagePolicy: 'Tenant is responsible for all damages beyond normal wear and tear. This includes but is not limited to: holes in walls, carpet stains, broken appliances, damaged fixtures. Landlord will provide itemized list of deductions from security deposit within 30 days of lease termination.',
      maintenanceResponsibility: 'Landlord is responsible for major repairs and structural maintenance including: plumbing, electrical, heating/cooling systems, appliances provided with property. Tenant is responsible for minor repairs, cleaning, and maintenance under $100 including: light bulbs, batteries, air filters, minor clogs.',
      terminationNoticeDays: 30,
      petPolicy: 'No pets allowed without written permission from landlord. If pets are approved, additional pet deposit of $200 per pet required.',
      smokingPolicy: 'No smoking allowed anywhere on the premises, including balconies and common areas.',
      guestPolicy: 'Guests are welcome for visits up to 7 consecutive days. Guests staying longer than 7 days require landlord approval and may be subject to additional fees.',
      utilitiesIncluded: 'Water and trash collection included in rent. Tenant responsible for electricity, gas, internet, and cable.',
      parkingDetails: 'One parking space included. Additional parking may be available for extra fee.',
      additionalTerms: 'Property must be kept clean and in good condition. No alterations to property without written landlord consent. Rent due by 5th of each month to avoid late fees.'
    };

    res.json({
      message: 'Default agreement template',
      template: defaultTemplate
    });
  }
}

module.exports = LegalAgreementController;
