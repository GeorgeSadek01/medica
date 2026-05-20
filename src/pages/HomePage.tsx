import { Box, Typography } from '@mui/material';

function HomePage() {
  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h2" gutterBottom>
        Welcome to Medica
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Your healthcare management platform
      </Typography>
    </Box>
  );
}

export default HomePage;
