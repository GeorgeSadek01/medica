import { Link } from 'react-router';
import { Box, Button, Typography, Container } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

export default function UnauthorizedPage() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          403 - Unauthorized
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You do not have permission to access this page.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button component={Link} to="/dashboard" variant="contained">
            Go to Dashboard
          </Button>
          <Button component={Link} to="/login" variant="outlined">
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
