import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  Home,
  People,
  AttachMoney,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  LocationOn,
  Bed,
  Bathtub,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { dashboard, api } from '../utils/api';

const formatCFA = (amount) => {
  return new Intl.NumberFormat('fr-CF', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(amount);
};

const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        </Box>
        <Icon sx={{ fontSize: 40, color: `${color}.main` }} />
      </Box>
    </CardContent>
  </Card>
);

const LandlordDashboard = () => {
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Properties management state
  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [propertyDialog, setPropertyDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyFormData, setPropertyFormData] = useState({
    address: '',
    city: '',
    description: '',
    rentAmount: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    isAvailable: true,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, monthlyResponse] = await Promise.all([
          dashboard.getStats(),
          dashboard.getMonthlySummary(),
        ]);

        setStats(statsResponse.data);
        setMonthlyData(monthlyResponse.data || []);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setPropertiesLoading(true);
      const response = await api.get('/properties');
      setProperties(response.data.data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
      // Set mock data for demonstration
      setProperties([
        {
          id: 1,
          address: 'Rue de la Liberté, Akwa',
          city: 'Douala',
          description: 'Appartement moderne de 3 chambres avec vue sur le fleuve Wouri',
          rent_amount: 150000,
          bedrooms: 3,
          bathrooms: 2,
          square_feet: 120,
          is_available: 1,
          tenant_name: 'Jean Dupont',
          tenant_email: 'jean.dupont@email.com'
        },
        {
          id: 2,
          address: 'Avenue Charles de Gaulle, Bonanjo',
          city: 'Douala',
          description: 'Studio moderne dans le quartier des affaires',
          rent_amount: 80000,
          bedrooms: 1,
          bathrooms: 1,
          square_feet: 45,
          is_available: 1,
          tenant_name: null,
          tenant_email: null
        },
        {
          id: 3,
          address: 'Quartier Makepe Missoke',
          city: 'Douala',
          description: 'Maison familiale avec jardin',
          rent_amount: 200000,
          bedrooms: 4,
          bathrooms: 3,
          square_feet: 180,
          is_available: 0,
          tenant_name: 'Marie Kamdem',
          tenant_email: 'marie.kamdem@email.com'
        }
      ]);
    } finally {
      setPropertiesLoading(false);
    }
  };

  const handlePropertyFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPropertyFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePropertySubmit = async () => {
    try {
      const propertyData = {
        ...propertyFormData,
        rentAmount: parseInt(propertyFormData.rentAmount),
        bedrooms: parseInt(propertyFormData.bedrooms),
        bathrooms: parseInt(propertyFormData.bathrooms),
        squareFeet: propertyFormData.squareFeet ? parseInt(propertyFormData.squareFeet) : null,
      };

      if (editingProperty) {
        await api.put(`/properties/${editingProperty.id}`, propertyData);
      } else {
        await api.post('/properties', propertyData);
      }

      fetchProperties();
      handleClosePropertyDialog();
    } catch (err) {
      console.error('Error saving property:', err);
    }
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setPropertyFormData({
      address: property.address,
      city: property.city,
      description: property.description || '',
      rentAmount: property.rent_amount.toString(),
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      squareFeet: property.square_feet ? property.square_feet.toString() : '',
      isAvailable: Boolean(property.is_available),
    });
    setPropertyDialog(true);
  };

  const handleAddProperty = () => {
    setEditingProperty(null);
    setPropertyFormData({
      address: '',
      city: '',
      description: '',
      rentAmount: '',
      bedrooms: '',
      bathrooms: '',
      squareFeet: '',
      isAvailable: true,
    });
    setPropertyDialog(true);
  };

  const handleClosePropertyDialog = () => {
    setPropertyDialog(false);
    setEditingProperty(null);
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await api.delete(`/properties/${propertyId}`);
        fetchProperties();
      } catch (err) {
        console.error('Error deleting property:', err);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const mockStats = stats || {
    totalProperties: 8,
    totalTenants: 12,
    monthlyRevenue: 2850000,
    occupancyRate: 85,
  };

  const mockMonthlyData = monthlyData.length > 0 ? monthlyData : [
    { month: 'Jan', revenue: 2400000 },
    { month: 'Feb', revenue: 2100000 },
    { month: 'Mar', revenue: 2800000 },
    { month: 'Apr', revenue: 2650000 },
    { month: 'May', revenue: 2850000 },
    { month: 'Jun', revenue: 2900000 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Landlord Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Welcome to your property management overview
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Properties"
            value={mockStats.totalProperties}
            icon={Home}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tenants"
            value={mockStats.totalTenants}
            icon={People}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Revenue"
            value={formatCFA(mockStats.monthlyRevenue)}
            icon={AttachMoney}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Occupancy Rate"
            value={`${mockStats.occupancyRate}%`}
            icon={TrendingUp}
            color="info"
          />
        </Grid>

        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Revenue Trend
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    tickFormatter={(value) => formatCFA(value).replace('CFA', '').trim()}
                  />
                  <RechartsTooltip 
                    formatter={(value) => [formatCFA(value), 'Revenue']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#1976d2" 
                    strokeWidth={2}
                    dot={{ fill: '#1976d2' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box>
              <Typography variant="body2" color="textSecondary" paragraph>
                • New tenant registered for Property #3
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                • Rent payment confirmed: {formatCFA(450000)}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                • Maintenance request submitted for Property #7
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                • Property #5 lease renewal due next month
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  onClick={handleAddProperty}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Home sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body2">
                      Add New Property
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <People sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                    <Typography variant="body2">
                      Register Tenant
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AttachMoney sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="body2">
                      Confirm Payment
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                    <Typography variant="body2">
                      View Reports
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Properties Management Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                My Properties
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddProperty}
              >
                Add Property
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Property Details</TableCell>
                    <TableCell>Rent</TableCell>
                    <TableCell>Features</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Tenant</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {property.address}
                          </Typography>
                          <Box display="flex" alignItems="center" mt={0.5}>
                            <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              {property.city}
                            </Typography>
                          </Box>
                          {property.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {property.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" color="primary">
                          {formatCFA(property.rent_amount)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          per month
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          <Chip
                            icon={<Bed />}
                            label={`${property.bedrooms} bed`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            icon={<Bathtub />}
                            label={`${property.bathrooms} bath`}
                            size="small"
                            variant="outlined"
                          />
                          {property.square_feet && (
                            <Chip
                              label={`${property.square_feet} sqft`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={property.is_available ? 'Available' : 'Occupied'}
                          color={property.is_available ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {property.tenant_name ? (
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {property.tenant_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {property.tenant_email}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No tenant
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton size="small" color="primary">
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Property">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEditProperty(property)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Property">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteProperty(property.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {properties.length === 0 && !propertiesLoading && (
              <Box textAlign="center" py={4}>
                <Home sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No Properties Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Start by adding your first property to manage
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddProperty}
                >
                  Add Your First Property
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Property Dialog */}
      <Dialog open={propertyDialog} onClose={handleClosePropertyDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProperty ? 'Edit Property' : 'Add New Property'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Property Address"
                name="address"
                value={propertyFormData.address}
                onChange={handlePropertyFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={propertyFormData.city}
                onChange={handlePropertyFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={propertyFormData.description}
                onChange={handlePropertyFormChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Monthly Rent (CFA)"
                name="rentAmount"
                type="number"
                value={propertyFormData.rentAmount}
                onChange={handlePropertyFormChange}
                required
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Bedrooms"
                name="bedrooms"
                type="number"
                value={propertyFormData.bedrooms}
                onChange={handlePropertyFormChange}
                required
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Bathrooms"
                name="bathrooms"
                type="number"
                value={propertyFormData.bathrooms}
                onChange={handlePropertyFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Square Feet"
                name="squareFeet"
                type="number"
                value={propertyFormData.squareFeet}
                onChange={handlePropertyFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Availability Status</InputLabel>
                <Select
                  value={propertyFormData.isAvailable}
                  onChange={handlePropertyFormChange}
                  name="isAvailable"
                  label="Availability Status"
                >
                  <MenuItem value={true}>Available for Rent</MenuItem>
                  <MenuItem value={false}>Currently Occupied</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePropertyDialog}>Cancel</Button>
          <Button 
            onClick={handlePropertySubmit} 
            variant="contained"
            disabled={!propertyFormData.address || !propertyFormData.city || !propertyFormData.rentAmount}
          >
            {editingProperty ? 'Update Property' : 'Add Property'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LandlordDashboard;
