import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { tenants, properties } from '../utils/api';

const formatCFA = (amount) => {
  // Handle undefined, null, or non-numeric values
  const numAmount = Number(amount);
  if (isNaN(numAmount)) {
    return 'N/A';
  }
  
  return new Intl.NumberFormat('fr-CF', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(numAmount);
};

const Tenants = () => {
  const [tenantList, setTenantList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [landlordProperties, setLandlordProperties] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    propertyAddress: '', // Keep for backward compatibility
    rentAmount: '',
    leaseStart: '',
    leaseEnd: '',
  });

  useEffect(() => {
    fetchTenants();
    fetchLandlordProperties();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await tenants.getAll();
      setTenantList(response.data || []);
    } catch (err) {
      console.error('Error fetching tenants:', err);
      setError('Failed to load tenants');
      // Set mock data for demonstration
      setTenantList([
        {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+237 123 456 789',
          propertyAddress: '123 Main Street, Apartment 4B',
          rentAmount: 450000,
          leaseStart: '2025-01-01',
          leaseEnd: '2025-12-31',
          status: 'active',
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane.smith@email.com',
          phone: '+237 987 654 321',
          propertyAddress: '789 Pine Street, Apartment 2A',
          rentAmount: 380000,
          leaseStart: '2025-03-01',
          leaseEnd: '2026-02-28',
          status: 'active',
        },
        {
          id: 3,
          name: 'Mike Johnson',
          email: 'mike.johnson@email.com',
          phone: '+237 555 666 777',
          propertyAddress: '456 Oak Avenue, House',
          rentAmount: 750000,
          leaseStart: '2024-06-01',
          leaseEnd: '2025-05-31',
          status: 'pending',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLandlordProperties = async () => {
    try {
      const response = await properties.getAll();
      console.log('Properties response:', response.data);
      setLandlordProperties(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching landlord properties:', err);
      // Set mock data for demonstration
      setLandlordProperties([
        {
          id: 1,
          address: 'Rue de la Liberté, Akwa',
          city: 'Douala',
          rent_amount: 150000
        },
        {
          id: 2,
          address: 'Avenue Charles de Gaulle, Bonanjo',
          city: 'Douala',
          rent_amount: 200000
        },
        {
          id: 3,
          address: 'Quartier Makepe Missoke',
          city: 'Douala',
          rent_amount: 120000
        }
      ]);
    }
  };

  const handleOpenDialog = (tenant = null) => {
    if (tenant) {
      setEditingTenant(tenant);
      setFormData({
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        propertyId: tenant.propertyId || '',
        propertyAddress: tenant.propertyAddress,
        rentAmount: (tenant.rentAmount || '').toString(),
        leaseStart: tenant.leaseStart,
        leaseEnd: tenant.leaseEnd,
      });
    } else {
      setEditingTenant(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        propertyId: '',
        propertyAddress: '',
        rentAmount: '',
        leaseStart: '',
        leaseEnd: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTenant(null);
  };

  const handleSubmit = async () => {
    try {
      const tenantData = {
        ...formData,
        rentAmount: parseInt(formData.rentAmount) || 0,
      };

      if (editingTenant) {
        await tenants.updateStatus(editingTenant.id, 'active');
      } else {
        await tenants.create(tenantData);
      }
      
      fetchTenants();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving tenant:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = 'Failed to save tenant';
      if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. Only landlords can create tenants.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePropertyChange = (e) => {
    const propertyId = e.target.value;
    const selectedProperty = landlordProperties.find(p => p.id.toString() === propertyId);
    
    setFormData(prev => ({
      ...prev,
      propertyId: propertyId,
      propertyAddress: selectedProperty ? `${selectedProperty.address}, ${selectedProperty.city}` : '',
      rentAmount: selectedProperty ? selectedProperty.rent_amount.toString() : prev.rentAmount
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Tenants
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Tenant
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tenant</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Rent (CFA)</TableCell>
              <TableCell>Lease Period</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenantList.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {tenant.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {tenant.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{tenant.phone}</TableCell>
                <TableCell>{tenant.propertyAddress}</TableCell>
                <TableCell>{formatCFA(tenant.rentAmount)}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {tenant.leaseStart ? new Date(tenant.leaseStart).toLocaleDateString() : 'N/A'} - 
                  </Typography>
                  <Typography variant="body2">
                    {tenant.leaseEnd ? new Date(tenant.leaseEnd).toLocaleDateString() : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={tenant.status}
                    color={getStatusColor(tenant.status)}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(tenant)}
                    color="primary"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Tenant Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Rent (CFA)"
                name="rentAmount"
                type="number"
                value={formData.rentAmount}
                onChange={handleChange}
                required
                InputProps={{
                  readOnly: !!formData.propertyId,
                }}
                helperText={formData.propertyId ? "Rent amount is set from selected property" : ""}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Property</InputLabel>
                <Select
                  value={formData.propertyId}
                  onChange={handlePropertyChange}
                  label="Property"
                  name="propertyId"
                >
                  <MenuItem value="">
                    <em>Select a property</em>
                  </MenuItem>
                  {landlordProperties.map((property) => (
                    <MenuItem key={property.id} value={property.id.toString()}>
                      {property.address}, {property.city} - {formatCFA(property.rent_amount)}/month
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lease Start Date"
                name="leaseStart"
                type="date"
                value={formData.leaseStart}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lease End Date"
                name="leaseEnd"
                type="date"
                value={formData.leaseEnd}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTenant ? 'Update' : 'Add'} Tenant
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tenants;
