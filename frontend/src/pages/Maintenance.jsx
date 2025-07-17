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
  Build as BuildIcon,
} from '@mui/icons-material';
import { maintenance, properties } from '../utils/api';

const Maintenance = () => {
  const [requestList, setRequestList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [landlordProperties, setLandlordProperties] = useState([]);
  const [formData, setFormData] = useState({
    tenantName: '',
    propertyId: '',
    propertyAddress: '',
    issue: '',
    description: '',
    priority: '',
    category: '',
  });

  useEffect(() => {
    fetchMaintenanceRequests();
    fetchLandlordProperties();
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      const response = await maintenance.getAll();
      setRequestList(response.data || []);
    } catch (err) {
      console.error('Error fetching maintenance requests:', err);
      setError('Failed to load maintenance requests');
      // Set mock data for demonstration
      setRequestList([
        {
          id: 1,
          tenantName: 'John Doe',
          propertyAddress: '123 Main Street, Apartment 4B',
          issue: 'Leaky faucet in kitchen',
          description: 'The kitchen faucet has been dripping constantly for 3 days',
          priority: 'medium',
          category: 'plumbing',
          status: 'in_progress',
          createdAt: '2025-07-15',
        },
        {
          id: 2,
          tenantName: 'Jane Smith',
          propertyAddress: '789 Pine Street, Apartment 2A',
          issue: 'Air conditioning not working',
          description: 'AC unit stopped working, no cold air coming out',
          priority: 'high',
          category: 'hvac',
          status: 'pending',
          createdAt: '2025-07-16',
        },
        {
          id: 3,
          tenantName: 'Mike Johnson',
          propertyAddress: '456 Oak Avenue, House',
          issue: 'Broken light fixture in living room',
          description: 'Light fixture fell from ceiling, needs replacement',
          priority: 'low',
          category: 'electrical',
          status: 'completed',
          createdAt: '2025-07-10',
        },
        {
          id: 4,
          tenantName: 'John Doe',
          propertyAddress: '123 Main Street, Apartment 4B',
          issue: 'Clogged bathroom drain',
          description: 'Bathroom sink drain is completely blocked',
          priority: 'medium',
          category: 'plumbing',
          status: 'pending',
          createdAt: '2025-07-17',
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

  const handleOpenDialog = (request = null) => {
    if (request) {
      setEditingRequest(request);
      setFormData({
        tenantName: request.tenantName,
        propertyId: request.propertyId || '',
        propertyAddress: request.propertyAddress,
        issue: request.issue,
        description: request.description,
        priority: request.priority,
        category: request.category,
      });
    } else {
      setEditingRequest(null);
      setFormData({
        tenantName: '',
        propertyId: '',
        propertyAddress: '',
        issue: '',
        description: '',
        priority: '',
        category: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRequest(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingRequest) {
        await maintenance.updateStatus(editingRequest.id, 'in_progress');
      } else {
        await maintenance.create(formData);
      }
      
      fetchMaintenanceRequests();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving maintenance request:', err);
      setError('Failed to save maintenance request');
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await maintenance.updateStatus(id, newStatus);
      fetchMaintenanceRequests();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
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
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Maintenance Requests
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Request
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
              <TableCell>Issue</TableCell>
              <TableCell>Tenant</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requestList.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <BuildIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {request.issue}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {request.description.substring(0, 50)}...
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{request.tenantName}</TableCell>
                <TableCell>{request.propertyAddress}</TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>
                  {request.category}
                </TableCell>
                <TableCell>
                  <Chip
                    label={request.priority}
                    color={getPriorityColor(request.priority)}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={request.status.replace('_', ' ')}
                    color={getStatusColor(request.status)}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>
                  {new Date(request.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(request)}
                    color="primary"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  {request.status === 'pending' && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleStatusUpdate(request.id, 'in_progress')}
                      sx={{ ml: 1 }}
                    >
                      Start
                    </Button>
                  )}
                  {request.status === 'in_progress' && (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleStatusUpdate(request.id, 'completed')}
                      sx={{ ml: 1 }}
                    >
                      Complete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Maintenance Request Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRequest ? 'Edit Maintenance Request' : 'Add New Maintenance Request'}
        </DialogTitle>
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
                select
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
                required
              >
                <option value="">Select Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </TextField>
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
                      {property.address}, {property.city}
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
                select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
                required
              >
                <option value="">Select Category</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="hvac">HVAC</option>
                <option value="appliance">Appliance</option>
                <option value="structural">Structural</option>
                <option value="other">Other</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Issue Summary"
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Detailed Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingRequest ? 'Update' : 'Submit'} Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Maintenance;
