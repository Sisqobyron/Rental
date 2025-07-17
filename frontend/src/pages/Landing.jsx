import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Fade,
  Slide,
  Zoom,
  Paper,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material';
import {
  Home,
  SearchRounded,
  PaymentRounded,
  BuildRounded,
  SecurityRounded,
  TrendingUpRounded,
  StarRounded,
  KeyboardArrowRight,
  Phone,
  Email,
  LocationOn,
  CheckCircleRounded
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { styled, keyframes } from '@mui/material/styles';

// Styled components with animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(-45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark}, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
  backgroundSize: '400% 400%',
  animation: `${gradient} 15s ease infinite`,
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.3)',
    zIndex: 1
  }
}));

const FloatingIcon = styled(Box)({
  animation: `${float} 6s ease-in-out infinite`,
  fontSize: '4rem',
  color: 'rgba(255,255,255,0.1)',
  position: 'absolute',
});

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: theme.shadows[10],
    '& .feature-icon': {
      transform: 'scale(1.1) rotate(5deg)',
      color: theme.palette.primary.main,
    }
  }
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
  border: `1px solid ${theme.palette.primary.main}30`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[8],
  }
}));

const Landing = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [visible, setVisible] = useState({});

  useEffect(() => {
    // Trigger animations on mount
    const timer = setTimeout(() => {
      setVisible({
        hero: true,
        features: true,
        stats: true,
        testimonials: true
      });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: <Home />,
      title: 'Property Management',
      description: 'Efficiently manage your rental properties with our comprehensive dashboard.',
      color: '#2196F3'
    },
    {
      icon: <SearchRounded />,
      title: 'Smart Search',
      description: 'Find the perfect rental property with advanced search and filtering options.',
      color: '#4CAF50'
    },
    {
      icon: <PaymentRounded />,
      title: 'Payment Tracking',
      description: 'Track rent payments, generate receipts, and monitor payment history.',
      color: '#FF9800'
    },
    {
      icon: <BuildRounded />,
      title: 'Maintenance Requests',
      description: 'Streamline maintenance requests and track repair progress in real-time.',
      color: '#9C27B0'
    },
    {
      icon: <SecurityRounded />,
      title: 'Secure Platform',
      description: 'Your data is protected with enterprise-grade security and encryption.',
      color: '#F44336'
    },
    {
      icon: <TrendingUpRounded />,
      title: 'Analytics & Reports',
      description: 'Get insights into your rental business with detailed analytics and reports.',
      color: '#00BCD4'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Properties Listed', icon: <Home /> },
    { number: '5000+', label: 'Happy Tenants', icon: <StarRounded /> },
    { number: '500+', label: 'Landlords', icon: <SecurityRounded /> },
    { number: '99.9%', label: 'Uptime', icon: <TrendingUpRounded /> }
  ];

  const testimonials = [
    {
      name: 'Jean Ngono',
      role: 'Property Owner',
      avatar: 'JN',
      text: 'This platform has revolutionized how I manage my rental properties in Douala. Highly recommended!',
      rating: 5
    },
    {
      name: 'Marie Kamdem',
      role: 'Tenant',
      avatar: 'MK',
      text: 'Finding my perfect apartment was so easy with their smart search feature. Great experience!',
      rating: 5
    },
    {
      name: 'Paul Biya',
      role: 'Landlord',
      avatar: 'PB',
      text: 'The payment tracking and maintenance request features have saved me countless hours.',
      rating: 5
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        {/* Floating Background Icons */}
        <FloatingIcon sx={{ top: '10%', left: '10%', animationDelay: '0s' }}>
          <Home fontSize="inherit" />
        </FloatingIcon>
        <FloatingIcon sx={{ top: '20%', right: '15%', animationDelay: '2s' }}>
          <SearchRounded fontSize="inherit" />
        </FloatingIcon>
        <FloatingIcon sx={{ bottom: '30%', left: '20%', animationDelay: '4s' }}>
          <PaymentRounded fontSize="inherit" />
        </FloatingIcon>
        <FloatingIcon sx={{ bottom: '20%', right: '10%', animationDelay: '1s' }}>
          <BuildRounded fontSize="inherit" />
        </FloatingIcon>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in={visible.hero} timeout={1000}>
                <Box>
                  <Chip 
                    label="🏠 #1 Property Management Platform in Cameroon" 
                    color="secondary" 
                    sx={{ mb: 3, fontSize: '0.9rem' }}
                  />
                  <Typography 
                    variant={isMobile ? "h3" : "h2"} 
                    component="h1" 
                    color="white" 
                    fontWeight="bold" 
                    gutterBottom
                  >
                    Find Your Perfect
                    <Box component="span" sx={{ 
                      background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      display: 'block'
                    }}>
                      Rental Home
                    </Box>
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color="rgba(255,255,255,0.9)" 
                    paragraph
                    sx={{ maxWidth: 500 }}
                  >
                    Connect landlords and tenants seamlessly. Manage properties, track payments, 
                    and handle maintenance requests all in one powerful platform.
                  </Typography>
                  <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="large"
                      color="secondary"
                      endIcon={<KeyboardArrowRight />}
                      onClick={() => navigate('/properties')}
                      sx={{ 
                        borderRadius: '25px',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                      }}
                    >
                      Browse Properties
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/auth')}
                      sx={{ 
                        borderRadius: '25px',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      Get Started
                    </Button>
                  </Box>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              <Slide direction="left" in={visible.hero} timeout={1200}>
                <Box
                  component={motion.div}
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  sx={{
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '120%',
                      height: '120%',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                      borderRadius: '50%',
                      zIndex: -1
                    }
                  }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                    alt="Modern House" 
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '20px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                      filter: 'brightness(1.1) contrast(1.1)'
                    }}
                  />
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Stats Section */}
      <Box sx={{ py: 8, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Fade in={visible.stats} timeout={1000}>
            <Grid container spacing={4}>
              {stats.map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Zoom in={visible.stats} timeout={800 + index * 200}>
                    <StatsCard>
                      <Box sx={{ color: 'primary.main', mb: 1 }}>
                        {stat.icon}
                      </Box>
                      <Typography variant="h4" fontWeight="bold" color="primary">
                        {stat.number}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </StatsCard>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Fade>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Fade in={visible.features} timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Why Choose Our Platform?
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                Experience the future of property management with our comprehensive suite of tools
              </Typography>
            </Box>
          </Fade>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Slide 
                  direction="up" 
                  in={visible.features} 
                  timeout={600 + index * 100}
                >
                  <FeatureCard>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <Avatar 
                        className="feature-icon"
                        sx={{ 
                          width: 80, 
                          height: 80, 
                          bgcolor: feature.color, 
                          mx: 'auto', 
                          mb: 3,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {React.cloneElement(feature.icon, { sx: { fontSize: '2rem' } })}
                      </Avatar>
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </FeatureCard>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 10, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Fade in={visible.testimonials} timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                What Our Users Say
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Real feedback from landlords and tenants across Cameroon
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Zoom in={visible.testimonials} timeout={800 + index * 200}>
                  <Card sx={{ 
                    height: '100%', 
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: (theme) => theme.shadows[8]
                    },
                    transition: 'all 0.3s ease'
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <StarRounded key={i} sx={{ color: '#FFD700', fontSize: '1.2rem' }} />
                        ))}
                      </Box>
                      <Typography variant="body1" paragraph sx={{ fontStyle: 'italic' }}>
                        "{testimonial.text}"
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          {testimonial.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {testimonial.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {testimonial.role}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ 
        py: 10, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Container maxWidth="md">
          <Fade in={visible.testimonials} timeout={1200}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Ready to Get Started?
              </Typography>
              <Typography variant="h6" paragraph sx={{ opacity: 0.9 }}>
                Join thousands of landlords and tenants who trust our platform
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  onClick={() => navigate('/auth')}
                  sx={{ 
                    borderRadius: '25px',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                  }}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/properties')}
                  sx={{ 
                    borderRadius: '25px',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  View Properties
                </Button>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, backgroundColor: '#1a1a1a', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                RentEase Cameroon
              </Typography>
              <Typography variant="body2" paragraph sx={{ opacity: 0.8 }}>
                Your trusted partner for property management and rental solutions across Cameroon.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton color="inherit" size="small">
                  <Phone />
                </IconButton>
                <IconButton color="inherit" size="small">
                  <Email />
                </IconButton>
                <IconButton color="inherit" size="small">
                  <LocationOn />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={4}>
                <Grid item xs={6} md={3}>
                  <Typography variant="h6" gutterBottom>
                    Platform
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button color="inherit" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                      For Landlords
                    </Button>
                    <Button color="inherit" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                      For Tenants
                    </Button>
                    <Button color="inherit" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                      Property Search
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="h6" gutterBottom>
                    Support
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button color="inherit" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                      Help Center
                    </Button>
                    <Button color="inherit" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                      Contact Us
                    </Button>
                    <Button color="inherit" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                      FAQ
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="h6" gutterBottom>
                    Company
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button color="inherit" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                      About Us
                    </Button>
                    <Button color="inherit" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                      Careers
                    </Button>
                    <Button color="inherit" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                      Blog
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="h6" gutterBottom>
                    Legal
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button color="inherit" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                      Privacy Policy
                    </Button>
                    <Button color="inherit" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                      Terms of Service
                    </Button>
                    <Button color="inherit" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                      Cookie Policy
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              © 2025 RentEase Cameroon. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
