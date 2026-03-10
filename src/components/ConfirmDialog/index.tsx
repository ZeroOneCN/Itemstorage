import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'error' | 'warning' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  confirmColor = 'primary',
  onConfirm,
  onCancel
}) => {
  const getColorStyles = () => {
    switch (confirmColor) {
      case 'error':
        return { backgroundColor: '#D32F2F', '&:hover': { backgroundColor: '#B71C1C' } };
      case 'warning':
        return { backgroundColor: '#ED6C02', '&:hover': { backgroundColor: '#E65100' } };
      case 'success':
        return { backgroundColor: '#2E7D32', '&:hover': { backgroundColor: '#1B5E20' } };
      default:
        return { backgroundColor: '#4A6741', '&:hover': { backgroundColor: '#3A5235' } };
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
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
        <IconButton onClick={onCancel} sx={{ color: '#8B7355' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ color: '#5D4E37', whiteSpace: 'pre-line' }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onCancel}
          sx={{
            color: '#8B7355',
            borderRadius: 2,
            flex: 1
          }}
        >
          {cancelText}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          sx={{
            ...getColorStyles(),
            borderRadius: 2,
            flex: 1
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};