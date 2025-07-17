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
  Check as CheckIcon,
  Close as CloseIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { payments, properties } from '../utils/api';

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

const Payments = () => {
  const [paymentList, setPaymentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [tenantProperties, setTenantProperties] = useState([]);
  const [formData, setFormData] = useState({
    tenantName: '',
    propertyId: '',
    propertyAddress: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    description: '',
  });

  useEffect(() => {
    fetchPayments();
    fetchTenantProperties();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await payments.getAll();
      setPaymentList(response.data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments');
      // Set mock data for demonstration
      setPaymentList([
        {
          id: 1,
          tenantName: 'John Doe',
          propertyAddress: '123 Main Street, Apartment 4B',
          amount: 450000,
          paymentDate: '2025-07-01',
          paymentMethod: 'Bank Transfer',
          status: 'confirmed',
          description: 'July 2025 rent payment',
        },
        {
          id: 2,
          tenantName: 'Jane Smith',
          propertyAddress: '789 Pine Street, Apartment 2A',
          amount: 380000,
          paymentDate: '2025-07-15',
          paymentMethod: 'Mobile Money',
          status: 'pending',
          description: 'July 2025 rent payment',
        },
        {
          id: 3,
          tenantName: 'Mike Johnson',
          propertyAddress: '456 Oak Avenue, House',
          amount: 750000,
          paymentDate: '2025-06-28',
          paymentMethod: 'Cash',
          status: 'confirmed',
          description: 'June 2025 rent payment',
        },
        {
          id: 4,
          tenantName: 'John Doe',
          propertyAddress: '123 Main Street, Apartment 4B',
          amount: 450000,
          paymentDate: '2025-07-16',
          paymentMethod: 'Bank Transfer',
          status: 'rejected',
          description: 'August 2025 rent payment - insufficient funds',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantProperties = async () => {
    try {
      const response = await properties.getAll();
      console.log('Properties response:', response.data);
      // For tenants, they should only see properties they're associated with
      // For now, we'll show all properties, but this should be filtered by tenant
      setTenantProperties(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching tenant properties:', err);
      // Set mock data for demonstration
      setTenantProperties([
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

  const handleOpenDialog = () => {
    setFormData({
      tenantName: '',
      propertyId: '',
      propertyAddress: '',
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      description: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    try {
      // Extract year and month from the payment date for paymentMonth
      const paymentDate = new Date(formData.paymentDate);
      const paymentMonth = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
      
      const paymentData = {
        amount: parseInt(formData.amount) || 0,
        paymentDate: formData.paymentDate,
        paymentMonth: paymentMonth,
        paymentMethod: formData.paymentMethod,
      };

      console.log('Sending payment data:', paymentData);
      await payments.create(paymentData);
      fetchPayments();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving payment:', err);
      setError('Failed to save payment');
    }
  };

  const handleConfirmPayment = async (id) => {
    try {
      await payments.confirm(id);
      fetchPayments();
    } catch (err) {
      console.error('Error confirming payment:', err);
      setError('Failed to confirm payment');
    }
  };

  const handleRejectPayment = async (id) => {
    try {
      await payments.reject(id);
      fetchPayments();
    } catch (err) {
      console.error('Error rejecting payment:', err);
      setError('Failed to reject payment');
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
    const selectedProperty = tenantProperties.find(p => p.id.toString() === propertyId);
    
    setFormData(prev => ({
      ...prev,
      propertyId: propertyId,
      propertyAddress: selectedProperty ? `${selectedProperty.address}, ${selectedProperty.city}` : '',
      amount: selectedProperty ? selectedProperty.rent_amount.toString() : prev.amount,
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Rent Payments
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Record Payment
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
              <TableCell>Property</TableCell>
              <TableCell>Amount (CFA)</TableCell>
              <TableCell>Payment Date</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentList.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <PaymentIcon sx={{ mr: 1, color: 'primary.main' }} />
                    {payment.tenantName}
                  </Box>
                </TableCell>
                <TableCell>{payment.propertyAddress}</TableCell>
                <TableCell>{formatCFA(payment.amount)}</TableCell>
                <TableCell>
                  {new Date(payment.paymentDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{payment.paymentMethod}</TableCell>
                <TableCell>
                  <Chip
                    label={payment.status}
                    color={getStatusColor(payment.status)}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>
                  {payment.status === 'pending' && (
                    <>
                      <IconButton
                        onClick={() => handleConfirmPayment(payment.id)}
                        color="success"
                        size="small"
                        title="Confirm Payment"
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleRejectPayment(payment.id)}
                        color="error"
                        size="small"
                        title="Reject Payment"
                      >
                        <CloseIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Record Payment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Record New Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tenant Name"
                name="tenantName"
                value={formData.tenantName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount (CFA)"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                required
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
                  {tenantProperties.map((property) => (
                    <MenuItem key={property.id} value={property.id.toString()}>
                      {property.address}, {property.city} - {formatCFA(property.rent_amount)}/month
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {formData.propertyAddress && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  Selected: {formData.propertyAddress}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Payment Date"
                name="paymentDate"
                type="date"
                value={formData.paymentDate}
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
                select
                label="Payment Method"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
                required
              >
                <option value="">Select Method</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Check">Check</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Payments;
