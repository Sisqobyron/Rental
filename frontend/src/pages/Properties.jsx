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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { properties } from '../utils/api';

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

const Properties = () => {
  const [propertyList, setPropertyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    rent: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await properties.getAll();
      setPropertyList(response.data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties');
      // Set mock data for demonstration
      setPropertyList([
        {
          id: 1,
          address: '123 Main Street, Apartment 4B',
          type: 'apartment',
          rent: 450000,
          bedrooms: 2,
          bathrooms: 1,
          status: 'occupied',
          description: 'Modern 2-bedroom apartment',
        },
        {
          id: 2,
          address: '456 Oak Avenue, House',
          type: 'house',
          rent: 750000,
          bedrooms: 3,
          bathrooms: 2,
          status: 'vacant',
          description: '3-bedroom family house with garden',
        },
        {
          id: 3,
          address: '789 Pine Street, Apartment 2A',
          type: 'apartment',
          rent: 380000,
          bedrooms: 1,
          bathrooms: 1,
          status: 'occupied',
          description: 'Cozy 1-bedroom apartment',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (property = null) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        address: property.address || '',
        city: property.city || property.type || '',
        rent: (property.rent || property.rent_amount || '').toString(),
        bedrooms: (property.bedrooms || '').toString(),
        bathrooms: (property.bathrooms || '').toString(),
        description: property.description || '',
      });
    } else {
      setEditingProperty(null);
      setFormData({
        address: '',
        city: '',
        rent: '',
        bedrooms: '',
        bathrooms: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProperty(null);
  };

  const handleSubmit = async () => {
    try {
      const propertyData = {
        address: formData.address,
        city: formData.city,
        description: formData.description,
        rentAmount: parseInt(formData.rent) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        isAvailable: 1 // Default to available
      };

      if (editingProperty) {
        await properties.update(editingProperty.id, propertyData);
      } else {
        await properties.create(propertyData);
      }
      
      fetchProperties();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving property:', err);
      setError('Failed to save property');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await properties.delete(id);
        fetchProperties();
      } catch (err) {
        console.error('Error deleting property:', err);
        setError('Failed to delete property');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied':
        return 'success';
      case 'vacant':
        return 'warning';
      case 'maintenance':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Properties
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Property
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
              <TableCell>Address</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Rent (CFA)</TableCell>
              <TableCell>Bedrooms</TableCell>
              <TableCell>Bathrooms</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {propertyList.map((property) => (
              <TableRow key={property.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    {property.address}
                  </Box>
                </TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>
                  {property.city || property.type || 'N/A'}
                </TableCell>
                <TableCell>{formatCFA(property.rent || property.rent_amount || 0)}</TableCell>
                <TableCell>{property.bedrooms || 'N/A'}</TableCell>
                <TableCell>{property.bathrooms || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={property.status || (property.is_available ? 'vacant' : 'occupied')}
                    color={getStatusColor(property.status || (property.is_available ? 'vacant' : 'occupied'))}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(property)}
                    color="primary"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(property.id)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Property Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProperty ? 'Edit Property' : 'Add New Property'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Rent (CFA)"
                name="rent"
                type="number"
                value={formData.rent}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bedrooms"
                name="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bathrooms"
                name="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleChange}
                required
              />
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
            {editingProperty ? 'Update' : 'Add'} Property
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Properties;
