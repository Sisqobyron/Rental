import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Search,
  LocationOn,
  Home,
  Bathtub,
  SquareFoot,
  Message,
  FilterList
} from '@mui/icons-material';
import { api } from '../utils/api';
import { formatCFA } from '../utils/currency';

const PropertySearch = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: ''
  });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [messageDialog, setMessageDialog] = useState(false);
  const [messageData, setMessageData] = useState({
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchAvailableProperties();
  }, []);

  const fetchAvailableProperties = async () => {
    try {
      setLoading(true);
      const response = await api.get('/properties/available');
      setProperties(response.data.data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      console.log('Search filters:', filters);
      console.log('Query params:', queryParams.toString());

      const response = await api.get(`/properties/search?${queryParams.toString()}`);
      console.log('Search response:', response.data);
      setProperties(response.data.data || []);
      
      if (response.data.data?.length === 0) {
        toast.info('No properties found matching your criteria');
      }
    } catch (error) {
      console.error('Error searching properties:', error);
      toast.error('Failed to search properties');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: ''
    });
    fetchAvailableProperties();
  };

  const handleContactLandlord = (property) => {
    setSelectedProperty(property);
    setMessageData({
      subject: `Inquiry about ${property.address}`,
      message: `Hi ${property.landlord_first_name}, I'm interested in your property at ${property.address}. Could you please provide more information?`
    });
    setMessageDialog(true);
  };

  const sendMessage = async () => {
    try {
      await api.post('/messages', {
        receiver_id: selectedProperty.landlord_id,
        property_id: selectedProperty.id,
        subject: messageData.subject,
        message: messageData.message
      });
      
      setMessageDialog(false);
      setMessageData({ subject: '', message: '' });
      setSelectedProperty(null);
      
      // Show success message
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Search Properties
      </Typography>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search by address, description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="City"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={6} md={1.5}>
            <TextField
              fullWidth
              label="Min Price (CFA)"
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={6} md={1.5}>
            <TextField
              fullWidth
              label="Max Price (CFA)"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={6} md={1}>
            <FormControl fullWidth>
              <InputLabel>Bedrooms</InputLabel>
              <Select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                label="Bedrooms"
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="1">1+</MenuItem>
                <MenuItem value="2">2+</MenuItem>
                <MenuItem value="3">3+</MenuItem>
                <MenuItem value="4">4+</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={1}>
            <FormControl fullWidth>
              <InputLabel>Bathrooms</InputLabel>
              <Select
                value={filters.bathrooms}
                onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                label="Bathrooms"
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="1">1+</MenuItem>
                <MenuItem value="2">2+</MenuItem>
                <MenuItem value="3">3+</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            onClick={handleSearch}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Search />}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <Button 
            variant="outlined" 
            onClick={clearFilters}
            startIcon={<FilterList />}
            disabled={loading}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Results Section */}
      <Typography variant="h6" gutterBottom>
        {properties.length} Properties Found
      </Typography>

      <Grid container spacing={3}>
        {properties.map((property) => (
          <Grid item xs={12} md={6} lg={4} key={property.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {property.address}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {property.city}
                  </Typography>
                </Box>

                <Typography variant="h5" color="primary" gutterBottom>
                  {formatCFA(property.rent_amount)}/month
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip 
                    icon={<Home />} 
                    label={`${property.bedrooms} bed`} 
                    size="small" 
                  />
                  <Chip 
                    icon={<Bathtub />} 
                    label={`${property.bathrooms} bath`} 
                    size="small" 
                  />
                  {property.square_feet && (
                    <Chip 
                      icon={<SquareFoot />} 
                      label={`${property.square_feet} sqft`} 
                      size="small" 
                    />
                  )}
                </Box>

                {property.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {property.description}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Landlord: {property.landlord_first_name} {property.landlord_last_name}
                  </Typography>
                  <IconButton 
                    color="primary" 
                    onClick={() => handleContactLandlord(property)}
                    title="Contact Landlord"
                  >
                    <Message />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {properties.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No properties found matching your criteria
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search filters
          </Typography>
        </Box>
      )}

      {/* Message Dialog */}
      <Dialog open={messageDialog} onClose={() => setMessageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Contact Landlord</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Subject"
            value={messageData.subject}
            onChange={(e) => setMessageData(prev => ({ ...prev, subject: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={4}
            value={messageData.message}
            onChange={(e) => setMessageData(prev => ({ ...prev, message: e.target.value }))}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialog(false)}>Cancel</Button>
          <Button 
            onClick={sendMessage} 
            variant="contained"
            disabled={!messageData.subject || !messageData.message}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PropertySearch;
