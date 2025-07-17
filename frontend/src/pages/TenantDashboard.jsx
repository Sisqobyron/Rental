import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Home,
  Payment,
  Build,
  CalendarToday,
} from '@mui/icons-material';
import { payments, maintenance } from '../utils/api';

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

const InfoCard = ({ title, value, icon: Icon, color = 'primary', action }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h5" component="div">
            {value}
          </Typography>
        </Box>
        <Icon sx={{ fontSize: 40, color: `${color}.main` }} />
      </Box>
      {action && action}
    </CardContent>
  </Card>
);

const TenantDashboard = () => {
  const [rentPayments, setRentPayments] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setLoading(true);
        // In a real app, these would be filtered for the current tenant
        const [paymentsResponse, maintenanceResponse] = await Promise.all([
          payments.getAll().catch(() => ({ data: [] })),
          maintenance.getAll().catch(() => ({ data: [] })),
        ]);

        setRentPayments(paymentsResponse.data || []);
        setMaintenanceRequests(maintenanceResponse.data || []);
      } catch (err) {
        console.error('Tenant data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, []);

  // Mock data for tenant
  const tenantInfo = {
    propertyAddress: "123 Main Street, Apartment 4B",
    monthlyRent: 450000,
    leaseEnd: "2025-12-31",
    rentDue: "2025-08-01",
    securityDeposit: 900000,
  };

  const currentDate = new Date();
  const rentDueDate = new Date("2025-08-01");
  const timeDiff = rentDueDate - currentDate;
  const daysUntilRent = isNaN(timeDiff) ? 0 : Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  const handlePayRent = () => {
    // This would typically open a payment modal or redirect to payment page
    alert('Payment functionality will be implemented here');
  };

  const handleMaintenanceRequest = () => {
    // This would typically open a maintenance request form
    alert('Maintenance request form will be implemented here');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tenant Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Manage your rental property and payments
      </Typography>

      <Grid container spacing={3}>
        {/* Property Info */}
        <Grid item xs={12} md={6}>
          <InfoCard
            title="My Property"
            value={tenantInfo.propertyAddress}
            icon={Home}
            color="primary"
          />
        </Grid>

        {/* Rent Status */}
        <Grid item xs={12} md={6}>
          <InfoCard
            title="Monthly Rent"
            value={formatCFA(tenantInfo.monthlyRent)}
            icon={Payment}
            color="success"
            action={
              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Next payment due in {daysUntilRent} days
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small"
                  onClick={handlePayRent}
                >
                  Pay Rent
                </Button>
              </Box>
            }
          />
        </Grid>

        {/* Lease Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Lease Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Lease End Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(tenantInfo.leaseEnd).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Security Deposit
                  </Typography>
                  <Typography variant="body1">
                    {formatCFA(tenantInfo.securityDeposit)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Lease Progress
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={65} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    65% of lease term completed
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<Payment />}
                onClick={handlePayRent}
                fullWidth
              >
                Pay Rent
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                startIcon={<Build />}
                onClick={handleMaintenanceRequest}
                fullWidth
              >
                Request Maintenance
              </Button>
              <Button 
                variant="outlined" 
                color="info" 
                startIcon={<CalendarToday />}
                fullWidth
              >
                Schedule Inspection
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Payments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Payments
            </Typography>
            <Box>
              {[
                { date: '2025-07-01', amount: 450000, status: 'confirmed' },
                { date: '2025-06-01', amount: 450000, status: 'confirmed' },
                { date: '2025-05-01', amount: 450000, status: 'confirmed' },
              ].map((payment, index) => (
                <Box key={index} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box>
                    <Typography variant="body2">
                      {new Date(payment.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatCFA(payment.amount)}
                    </Typography>
                  </Box>
                  <Chip 
                    label={payment.status} 
                    color="success" 
                    size="small"
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Maintenance Requests */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Maintenance Requests
            </Typography>
            <Box>
              {[
                { issue: 'Leaky faucet in kitchen', status: 'in_progress', date: '2025-07-15' },
                { issue: 'Air conditioning not working', status: 'completed', date: '2025-07-10' },
                { issue: 'Broken light fixture', status: 'pending', date: '2025-07-08' },
              ].map((request, index) => (
                <Box key={index} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">
                      {request.issue}
                    </Typography>
                    <Chip 
                      label={request.status.replace('_', ' ')} 
                      color={
                        request.status === 'completed' ? 'success' :
                        request.status === 'in_progress' ? 'warning' : 'default'
                      }
                      size="small"
                    />
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Submitted: {new Date(request.date).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Reminder:</strong> Your rent payment for August is due in {daysUntilRent} days. 
              Click "Pay Rent" to make your payment online.
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TenantDashboard;
