import { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Switch, IconButton, Button, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Pagination,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/admin.service';
import SearchBar from '../components/shared/SearchBar';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active?: boolean;
  verified?: boolean;
}

const ITEMS_PER_PAGE = 8;

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState<{ type: 'delete' | 'makeAdmin'; user: User } | null>(null);

  const loadUsers = async () => {
    try {
      const all = await adminService.getAllUsers().catch(() => []);
      setUsers(all as User[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const displayed = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleToggle = async (user: User) => {
    const newStatus = !(user.is_active ?? true);
    await adminService.toggleUserStatus(user.id, newStatus);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: newStatus } : u)));
  };

  const handleDelete = async (user: User) => {
    await adminService.softDeleteUser(user.id);
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, is_active: false, deleted_at: new Date().toISOString() } : u)),
    );
    setConfirmDialog(null);
  };

  const handleMakeAdmin = async (user: User) => {
    await adminService.makeAdmin(user.id);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: 'admin' } : u)));
    setConfirmDialog(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Users Management
        </Typography>
      </Box>

      <Box sx={{ mb: 3, maxWidth: 400 }}>
        <SearchBar
          placeholder="Search by name or email..."
          onSearch={setSearch}
        />
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f9fafb' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayed.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              displayed.map((u) => (
                <TableRow
                  key={u.id}
                  hover
                  sx={{ opacity: u.is_active === false ? 0.5 : 1 }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>
                    {u.first_name} {u.last_name}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={u.role}
                      size="small"
                      color={
                        u.role === 'doctor' ? 'primary' :
                        u.role === 'admin' ? 'warning' : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Switch
                        checked={u.is_active ?? true}
                        onChange={() => handleToggle(u)}
                        color="success"
                        size="small"
                      />
                      <Chip
                        label={(u.is_active ?? true) ? 'Active' : 'Inactive'}
                        size="small"
                        color={(u.is_active ?? true) ? 'success' : 'error'}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        color="info"
                        title="View Profile"
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      {u.role !== 'admin' && (
                        <IconButton
                          size="small"
                          color="warning"
                          title="Make Admin"
                          onClick={() => setConfirmDialog({ type: 'makeAdmin', user: u })}
                        >
                          <AdminPanelSettingsIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        title="Delete User"
                        onClick={() => setConfirmDialog({ type: 'delete', user: u })}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
          />
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
        Showing {displayed.length} of {filtered.length} user{filtered.length !== 1 ? 's' : ''}
      </Typography>

      <Dialog open={!!confirmDialog} onClose={() => setConfirmDialog(null)}>
        <DialogTitle>
          {confirmDialog?.type === 'delete' ? 'Confirm Delete' : 'Confirm Make Admin'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog?.type === 'delete'
              ? `Are you sure you want to soft-delete "${confirmDialog?.user.first_name} ${confirmDialog?.user.last_name}"? They will be marked as inactive.`
              : `Make "${confirmDialog?.user.first_name} ${confirmDialog?.user.last_name}" an admin? They will gain full admin access.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={confirmDialog?.type === 'delete' ? 'error' : 'warning'}
            onClick={() =>
              confirmDialog?.type === 'delete'
                ? handleDelete(confirmDialog.user)
                : handleMakeAdmin(confirmDialog!.user)
            }
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
