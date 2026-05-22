import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import adminService from '../services/admin.service';

interface Specialty {
  id: number;
  name: string;
}

export default function AdminSpecialties() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadSpecialties = async () => {
    try {
      const all = await adminService.getSpecialties().catch(() => []);
      setSpecialties(all as Specialty[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecialties();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await adminService.createSpecialty(newName.trim());
      setNewName('');
      setAlert({ type: 'success', text: 'Specialty added.' });
      loadSpecialties();
    } catch {
      setAlert({ type: 'error', text: 'Failed to add specialty.' });
    }
  };

  const handleEdit = async (id: number) => {
    if (!editName.trim()) return;
    try {
      await adminService.editSpecialty(id, editName.trim());
      setEditId(null);
      setEditName('');
      setAlert({ type: 'success', text: 'Specialty updated.' });
      loadSpecialties();
    } catch {
      setAlert({ type: 'error', text: 'Failed to update specialty.' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminService.deleteSpecialty(id);
      setAlert({ type: 'success', text: 'Specialty deleted.' });
      loadSpecialties();
    } catch {
      setAlert({ type: 'error', text: 'Failed to delete specialty.' });
    }
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
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
        Specialties Management
      </Typography>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
          {alert.text}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="New Specialty"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            size="small"
            fullWidth
          />
          <Button variant="contained" onClick={handleAdd} sx={{ minWidth: 100 }}>
            Add
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ borderRadius: 3 }}>
        <List>
          {specialties.length === 0 ? (
            <ListItem>
              <ListItemText primary="No specialties found." sx={{ color: 'text.secondary' }} />
            </ListItem>
          ) : (
            specialties.map((s) => (
              <ListItem
                key={s.id}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      edge="end"
                      onClick={() => {
                        setEditId(s.id);
                        setEditName(s.name);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton edge="end" onClick={() => handleDelete(s.id)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                {editId === s.id ? (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexGrow: 1 }}>
                    <TextField
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      size="small"
                      fullWidth
                    />
                    <Button size="small" variant="contained" onClick={() => handleEdit(s.id)}>
                      Save
                    </Button>
                    <Button size="small" onClick={() => setEditId(null)}>
                      Cancel
                    </Button>
                  </Box>
                ) : (
                  <ListItemText primary={s.name} />
                )}
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
}
