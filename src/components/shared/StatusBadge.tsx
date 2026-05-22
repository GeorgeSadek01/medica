import Chip from '@mui/material/Chip';

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface StatusBadgeProps {
  status: AppointmentStatus;
}

const statusConfig: Record<
  AppointmentStatus,
  {
    label: string;
    color: 'warning' | 'success' | 'info' | 'error';
  }
> = {
  pending: { label: 'Pending', color: 'warning' },
  confirmed: { label: 'Confirmed', color: 'success' },
  completed: { label: 'Completed', color: 'info' },
  cancelled: { label: 'Cancelled', color: 'error' },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status];
  return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
};

export default StatusBadge;
