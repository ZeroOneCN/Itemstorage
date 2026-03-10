import React from 'react';
import { Box } from '@mui/material';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * 布局组件，提供统一的页面布局
 * @param children 子组件
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box 
      sx={{
        minHeight: '100vh', 
        backgroundColor: '#F5F0E8',
        padding: {
          xs: '16px',
          sm: '24px',
          md: '32px'
        }
      }}
    >
      <Box 
        sx={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
