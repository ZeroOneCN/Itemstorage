import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box
} from '@mui/material';
import { Close, CheckCircle, Error, Info } from '@mui/icons-material';

interface AlertDialogProps {
  open: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  title,
  message,
  type,
  onClose
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle sx={{ fontSize: 48, color: '#4A6741' }} />;
      case 'error':
        return <Error sx={{ fontSize: 48, color: '#D32F2F' }} />;
      default:
        return <Info sx={{ fontSize: 48, color: '#2196F3' }} />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#4A6741', '&:hover': { backgroundColor: '#3A5235' } };
      case 'error':
        return { backgroundColor: '#D32F2F', '&:hover': { backgroundColor: '#B71C1C' } };
      default:
        return { backgroundColor: '#2196F3', '&:hover': { backgroundColor: '#1976D2' } };
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: '#FDFBF7'
        }
      }}
    >
      <DialogTitle
        sx={{
          color: '#8B7355',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pr: 1
        }}
      >
        {title}
        <IconButton onClick={onClose} sx={{ color: '#8B7355' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          {getIcon()}
          <Typography variant="body1" sx={{ color: '#5D4E37', mt: 2, textAlign: 'center' }}>
            {message}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            ...getButtonColor(),
            borderRadius: 2,
            minWidth: 100
          }}
        >
          确定
        </Button>
      </DialogActions>
    </Dialog>
  );
};