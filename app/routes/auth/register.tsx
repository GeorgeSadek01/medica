import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { register, clearError } from '~/store/authSlice';
import { useEffect } from 'react';
import type { UserRole } from '~/lib/auth';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [role, setRole] = useState<UserRole>('patient');

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(
      register({
        email,
        password,
        password2,
        first_name: firstName,
        last_name: lastName,
        role,
      })
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Create Account
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          label="First Name"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="Last Name"
          autoComplete="family-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </Box>
      <TextField
        margin="normal"
        required
        fullWidth
        label="Email Address"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Confirm Password"
        type="password"
        autoComplete="new-password"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Role</InputLabel>
        <Select value={role} label="Role" onChange={(e) => setRole(e.target.value as UserRole)}>
          <MenuItem value="patient">Patient</MenuItem>
          <MenuItem value="doctor">Doctor</MenuItem>
        </Select>
      </FormControl>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 1.2 }}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
      </Button>
      <Typography align="center">
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#1976d2' }}>
          Sign In
        </Link>
      </Typography>
    </Box>
  );
}
