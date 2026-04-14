'use client';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';
import { useState } from 'react';

export default function SuspendDialog({ open, onClose, onSubmit, loading, error, setError }) {
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendDays, setSuspendDays]     = useState('');

  const handleSubmit = () => {
    if (!suspendReason.trim()) return setError('Reason is required');
    if (!suspendDays || isNaN(suspendDays) || Number(suspendDays) < 1) {
      return setError('Enter valid number of days');
    }
    onSubmit({ suspend_reason: suspendReason, suspend_days: Number(suspendDays) });
  };

  const handleClose = () => {
    setSuspendReason('');
    setSuspendDays('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Suspend User</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Box>
            <InputLabel required>Reason</InputLabel>
            <OutlinedInput
              fullWidth
              placeholder="Enter suspension reason"
              value={suspendReason}
              onChange={(e) => { setSuspendReason(e.target.value); setError(''); }}
            />
          </Box>
          <Box>
            <InputLabel required>Number of Days</InputLabel>
            <OutlinedInput
              fullWidth
              type="number"
              placeholder="e.g. 15"
                    inputProps={{min: 0}}
                            onKeyDown={(e) => {
                    if (e.key === '-' ||e.key === '+' || e.key === 'e') {
                    e.preventDefault();
                    }
                }}
                value={suspendDays}
              onChange={(e) => { setSuspendDays(e.target.value); setError(''); }}
            />
          </Box>
          {error && <FormHelperText error>{error}</FormHelperText>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} variant="outlined">Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={loading}
          endIcon={loading && <CircularProgress size={14} color="inherit" />}
        >
          Suspend
        </Button>
      </DialogActions>
    </Dialog>
  );
}