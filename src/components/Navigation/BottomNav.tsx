import React from 'react';
import { Box, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Home, Search, Inventory2, Settings } from '@mui/icons-material';

interface BottomNavProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ value, onChange }) => {
  return (
    <Box sx={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#F5F0E8',
      borderTop: '1px solid #E0D6C2'
    }}>
      <BottomNavigation
        value={value}
        onChange={onChange}
        showLabels
        sx={{
          backgroundColor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            color: '#8B7355',
            minWidth: 'auto',
            padding: '6px 0',
            '&.Mui-selected': {
              color: '#4A6741'
            },
            '&:hover': {
              color: '#4A6741'
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              marginTop: '4px',
              '&.Mui-selected': {
                fontSize: '0.75rem'
              }
            },
            // 移除 focus 方框
            '&.Mui-focusVisible': {
              backgroundColor: 'transparent'
            },
            outline: 'none'
          }
        }}
      >
        <BottomNavigationAction label="首页" icon={<Home />} />
        <BottomNavigationAction label="搜索" icon={<Search />} />
        <BottomNavigationAction label="收纳箱" icon={<Inventory2 />} />
        <BottomNavigationAction label="设置" icon={<Settings />} />
      </BottomNavigation>
    </Box>
  );
};