import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

const Footer = () => {
  return (
    <Box component="footer" sx={{ mt: 'auto' }}>
      <Divider />
      <Box
        sx={{
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Medica. All rights reserved.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Healthcare Appointment System
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
