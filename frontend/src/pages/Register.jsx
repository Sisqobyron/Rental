import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Container,
  MenuItem,
  Grid,
  Fade,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Visibility,
  VisibilityOff,
  HowToReg as RegisterIcon,
} from '@mui/icons-material';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'tenant',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const result = await register({
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`,
    });
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
      }}
    >
      <Container component="main" maxWidth="md">
        <Fade in timeout={800}>
          <Paper
            elevation={24}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: 3,
                textAlign: 'center',
                color: 'white',
              }}
            >
              <RegisterIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h4" fontWeight="700" sx={{ fontFamily: 'Inter, sans-serif' }}>
                Join PropertyManager
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                Create your account to get started
              </Typography>
            </Box>

            <Box sx={{ padding: 4 }}>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      fontSize: '1.2rem',
                    },
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      name="firstName"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(248, 250, 252, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(248, 250, 252, 1)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(248, 250, 252, 1)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 500,
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: 'rgba(102, 126, 234, 0.7)' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(248, 250, 252, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(248, 250, 252, 1)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(248, 250, 252, 1)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 500,
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: 'rgba(102, 126, 234, 0.7)' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(248, 250, 252, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(248, 250, 252, 1)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(248, 250, 252, 1)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 500,
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: 'rgba(102, 126, 234, 0.7)' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="phone"
                      label="Phone Number"
                      name="phone"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(248, 250, 252, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(248, 250, 252, 1)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(248, 250, 252, 1)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 500,
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: 'rgba(102, 126, 234, 0.7)' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      select
                      id="role"
                      label="Account Type"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(248, 250, 252, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(248, 250, 252, 1)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(248, 250, 252, 1)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 500,
                        },
                      }}
                    >
                      <MenuItem value="tenant">Tenant</MenuItem>
                      <MenuItem value="landlord">Landlord</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(248, 250, 252, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(248, 250, 252, 1)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(248, 250, 252, 1)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 500,
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: 'rgba(102, 126, 234, 0.7)' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ color: 'rgba(102, 126, 234, 0.7)' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(248, 250, 252, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(248, 250, 252, 1)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(248, 250, 252, 1)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 500,
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: 'rgba(102, 126, 234, 0.7)' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              sx={{ color: 'rgba(102, 126, 234, 0.7)' }}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 4,
                    mb: 3,
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: 'rgba(102, 126, 234, 0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Create Account'
                  )}
                </Button>
                
                <Box textAlign="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      style={{ 
                        color: '#667eea',
                        textDecoration: 'none',
                        fontWeight: 600,
                        transition: 'color 0.2s ease',
                      }}
                    >
                      Sign in here
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Register;
