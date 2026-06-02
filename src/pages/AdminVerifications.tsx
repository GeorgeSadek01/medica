import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import adminService from '../services/admin.service';

interface Document {
  id: number;
  doctor_id: number;
  doctor_name: string;
  doctor_email: string;
  specialty: string;
  identity_document: string;
  medical_certificate: string;
  status: string;
  rejection_reason: string;
  uploaded_at: string;
}

export default function AdminVerifications() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<Document | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      const data = await adminService.getDocuments();
      setDocuments(data as Document[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleApprove = async (doc: Document) => {
    setActionLoading(true);
    try {
      await adminService.reviewDocument(doc.id, { status: 'approved' });
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, status: 'approved', rejection_reason: '' } : d)),
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reviewing) return;
    setActionLoading(true);
    try {
      await adminService.reviewDocument(reviewing.id, {
        status: 'rejected',
        rejection_reason: rejectionReason,
      });
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === reviewing.id
            ? { ...d, status: 'rejected', rejection_reason: rejectionReason }
            : d,
        ),
      );
      setReviewing(null);
      setRejectionReason('');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const pendingCount = documents.filter((d) => d.status === 'pending').length;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Doctor Document Verification
        </Typography>
        {pendingCount > 0 && (
          <Chip
            label={`${pendingCount} pending`}
            color="warning"
            size="small"
          />
        )}
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f9fafb' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Doctor</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Specialty</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Documents</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Uploaded</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No documents uploaded yet.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id} hover sx={{ opacity: doc.status === 'rejected' ? 0.6 : 1 }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {doc.doctor_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {doc.doctor_email}
                    </Typography>
                  </TableCell>
                  <TableCell>{doc.specialty}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {doc.identity_document && (
                        <Tooltip title="View Identity Document">
                          <IconButton size="small" color="primary" onClick={() => setPreviewUrl(doc.identity_document)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {doc.medical_certificate && (
                        <Tooltip title="View Medical Certificate">
                          <IconButton size="small" color="primary" onClick={() => setPreviewUrl(doc.medical_certificate)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={doc.status}
                      size="small"
                      color={
                        doc.status === 'approved' ? 'success' :
                        doc.status === 'rejected' ? 'error' : 'warning'
                      }
                      variant={doc.status === 'pending' ? 'outlined' : 'filled'}
                    />
                    {doc.rejection_reason && (
                      <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                        Reason: {doc.rejection_reason}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {doc.status === 'pending' && (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          disabled={actionLoading}
                          onClick={() => handleApprove(doc)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => { setReviewing(doc); setRejectionReason(''); }}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!reviewing} onClose={() => { setReviewing(null); setRejectionReason(''); }} maxWidth="sm" fullWidth>
        <DialogTitle>Review Documents</DialogTitle>
        <DialogContent>
          {reviewing && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle2">{reviewing.doctor_name} ({reviewing.doctor_email})</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Specialty: {reviewing.specialty}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                {reviewing.identity_document && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    href={reviewing.identity_document}
                    target="_blank"
                  >
                    View Identity
                  </Button>
                )}
                {reviewing.medical_certificate && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    href={reviewing.medical_certificate}
                    target="_blank"
                  >
                    View Certificate
                  </Button>
                )}
              </Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Rejection reason (required for rejection)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setReviewing(null); setRejectionReason(''); }}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={actionLoading || !rejectionReason.trim()}
            startIcon={<CancelIcon />}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!previewUrl} onClose={() => setPreviewUrl(null)} maxWidth="md" fullWidth>
        <DialogTitle>Document Preview</DialogTitle>
        <DialogContent>
          {previewUrl && (
            <Box sx={{ textAlign: 'center' }}>
              {previewUrl.endsWith('.pdf') ? (
                <iframe src={previewUrl} width="100%" height="500px" title="Document" />
              ) : (
                <img src={previewUrl} alt="Document" style={{ maxWidth: '100%', maxHeight: '500px' }} />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewUrl(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
