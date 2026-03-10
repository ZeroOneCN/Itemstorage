import React from 'react';
import { Box, Typography } from '@mui/material';

interface TopAppBarProps {
  title: string;
  actions?: React.ReactNode;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ title, actions }) => {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F5F0E8',
        borderBottom: '1px solid #E0D6C2',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        marginBottom: 2
      }}
    >
      <Typography variant="h6" sx={{ color: '#8B7355', fontWeight: 'bold' }}>
        {title}
      </Typography>
      {actions && <Box>{actions}</Box>}
    </Box>
  );
};
