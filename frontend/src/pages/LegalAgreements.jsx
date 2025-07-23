import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Alert,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Gavel as GavelIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  ExpandMore as ExpandMoreIcon,
  Assignment as DocumentIcon,
  Security as SecurityIcon,
  Build as MaintenanceIcon,
  Pets as PetIcon,
  SmokeFree as NoSmokingIcon,
} from '@mui/icons-material';
import { legalAgreements, tenants, properties } from '../utils/api';

const LegalAgreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [tenantList, setTenantList] = useState([]);
  const [propertyList, setPropertyList] = useState([]);
  const [formData, setFormData] = useState({
    tenantId: '',
    propertyId: '',
    rentDueDay: 1,
    lateFeeAmount: 50,
    lateFeeGraceDays: 5,
    securityDepositTerms: '',
    propertyDamagePolicy: '',
    maintenanceResponsibility: '',
    terminationNoticeDays: 30,
    petPolicy: '',
    smokingPolicy: 'No smoking allowed',
    guestPolicy: '',
    utilitiesIncluded: '',
    parkingDetails: '',
    additionalTerms: ''
  });

  useEffect(() => {
    fetchAgreements();
    fetchTenants();
    fetchProperties();
  }, []);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const response = await legalAgreements.getAll();
      setAgreements(response.data.agreements || []);
    } catch (err) {
      console.error('Error fetching agreements:', err);
      setError('Failed to load agreements');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await tenants.getAll();
      setTenantList(response.data || []);
    } catch (err) {
      console.error('Error fetching tenants:', err);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await properties.getAll();
      setPropertyList(response.data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
    }
  };

  const loadDefaultTemplate = async () => {
    try {
      const response = await legalAgreements.getTemplate();
      setFormData(prev => ({
        ...prev,
        ...response.data.template
      }));
    } catch (err) {
      console.error('Error loading template:', err);
    }
  };

  const handleOpenDialog = (agreement = null) => {
    if (agreement) {
      setSelectedAgreement(agreement);
      setFormData({
        tenantId: agreement.tenant_id,
        propertyId: agreement.property_id,
        rentDueDay: agreement.rent_due_day || 1,
        lateFeeAmount: agreement.late_fee_amount || 50,
        lateFeeGraceDays: agreement.late_fee_grace_days || 5,
        securityDepositTerms: agreement.security_deposit_terms || '',
        propertyDamagePolicy: agreement.property_damage_policy || '',
        maintenanceResponsibility: agreement.maintenance_responsibility || '',
        terminationNoticeDays: agreement.termination_notice_days || 30,
        petPolicy: agreement.pet_policy || '',
        smokingPolicy: agreement.smoking_policy || 'No smoking allowed',
        guestPolicy: agreement.guest_policy || '',
        utilitiesIncluded: agreement.utilities_included || '',
        parkingDetails: agreement.parking_details || '',
        additionalTerms: agreement.additional_terms || ''
      });
    } else {
      setSelectedAgreement(null);
      loadDefaultTemplate();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAgreement(null);
    setFormData({
      tenantId: '',
      propertyId: '',
      rentDueDay: 1,
      lateFeeAmount: 50,
      lateFeeGraceDays: 5,
      securityDepositTerms: '',
      propertyDamagePolicy: '',
      maintenanceResponsibility: '',
      terminationNoticeDays: 30,
      petPolicy: '',
      smokingPolicy: 'No smoking allowed',
      guestPolicy: '',
      utilitiesIncluded: '',
      parkingDetails: '',
      additionalTerms: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedAgreement) {
        await legalAgreements.update(selectedAgreement.id, formData);
      } else {
        await legalAgreements.create(formData);
      }
      fetchAgreements();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving agreement:', err);
      setError('Failed to save agreement');
    }
  };

  const handleSign = async (agreementId) => {
    try {
      await legalAgreements.sign(agreementId);
      fetchAgreements();
    } catch (err) {
      console.error('Error signing agreement:', err);
      setError('Failed to sign agreement');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getStatusChip = (agreement) => {
    if (agreement.landlord_signature && agreement.tenant_signature) {
      return <Chip label="Fully Executed" color="success" icon={<CheckIcon />} />;
    } else if (agreement.landlord_signature || agreement.tenant_signature) {
      return <Chip label="Partially Signed" color="warning" icon={<PendingIcon />} />;
    } else {
      return <Chip label="Pending Signatures" color="default" icon={<PendingIcon />} />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GavelIcon color="primary" />
          Legal Agreements
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Agreement
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {agreements.map((agreement) => (
          <Grid item xs={12} md={6} lg={4} key={agreement.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {agreement.address}
                  </Typography>
                  {getStatusChip(agreement)}
                </Box>
                
                <Typography color="text.secondary" gutterBottom>
                  {agreement.first_name} {agreement.last_name}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <List dense>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 35 }}>
                      <DocumentIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Rent Due" 
                      secondary={`Day ${agreement.rent_due_day} of each month`} 
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 35 }}>
                      <SecurityIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Late Fee" 
                      secondary={`${agreement.late_fee_amount} CFA after ${agreement.late_fee_grace_days} days`} 
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 35 }}>
                      <PetIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Pet Policy" 
                      secondary={agreement.pet_policy || 'Not specified'} 
                    />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleOpenDialog(agreement)}>
                  View Details
                </Button>
                {!agreement.landlord_signature || !agreement.tenant_signature ? (
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={() => handleSign(agreement.id)}
                  >
                    Sign Agreement
                  </Button>
                ) : null}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Agreement Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedAgreement ? 'View/Edit Agreement' : 'Create New Legal Agreement'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Tenant"
                name="tenantId"
                value={formData.tenantId}
                onChange={handleChange}
                SelectProps={{ native: true }}
                required
                disabled={!!selectedAgreement}
              >
                <option value="">Select Tenant</option>
                {tenantList.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.first_name} {tenant.last_name} - {tenant.address}
                  </option>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Property"
                name="propertyId"
                value={formData.propertyId}
                onChange={handleChange}
                SelectProps={{ native: true }}
                required
                disabled={!!selectedAgreement}
              >
                <option value="">Select Property</option>
                {propertyList.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.address}, {property.city}
                  </option>
                ))}
              </TextField>
            </Grid>

            {/* Financial Terms */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Financial Terms</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Rent Due Day"
                        name="rentDueDay"
                        type="number"
                        value={formData.rentDueDay}
                        onChange={handleChange}
                        inputProps={{ min: 1, max: 31 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Late Fee Amount (CFA)"
                        name="lateFeeAmount"
                        type="number"
                        value={formData.lateFeeAmount}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Late Fee Grace Days"
                        name="lateFeeGraceDays"
                        type="number"
                        value={formData.lateFeeGraceDays}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Security Deposit Terms"
                        name="securityDepositTerms"
                        multiline
                        rows={2}
                        value={formData.securityDepositTerms}
                        onChange={handleChange}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Property Care & Maintenance */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Property Care & Maintenance</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Property Damage Policy"
                        name="propertyDamagePolicy"
                        multiline
                        rows={3}
                        value={formData.propertyDamagePolicy}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Maintenance Responsibility"
                        name="maintenanceResponsibility"
                        multiline
                        rows={3}
                        value={formData.maintenanceResponsibility}
                        onChange={handleChange}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Policies */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Property Policies</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Pet Policy"
                        name="petPolicy"
                        multiline
                        rows={2}
                        value={formData.petPolicy}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Smoking Policy"
                        name="smokingPolicy"
                        value={formData.smokingPolicy}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Guest Policy"
                        name="guestPolicy"
                        multiline
                        rows={2}
                        value={formData.guestPolicy}
                        onChange={handleChange}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Additional Terms */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Additional Terms</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Termination Notice Days"
                        name="terminationNoticeDays"
                        type="number"
                        value={formData.terminationNoticeDays}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Utilities Included"
                        name="utilitiesIncluded"
                        value={formData.utilitiesIncluded}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Parking Details"
                        name="parkingDetails"
                        value={formData.parkingDetails}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Additional Terms"
                        name="additionalTerms"
                        multiline
                        rows={4}
                        value={formData.additionalTerms}
                        onChange={handleChange}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedAgreement ? 'Update' : 'Create'} Agreement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LegalAgreements;
