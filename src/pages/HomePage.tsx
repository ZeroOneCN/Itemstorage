import React from 'react';
import { Box, Typography, Grid, Fab } from '@mui/material';
import { Add } from '@mui/icons-material';
import { Layout } from '../components/Layout';
import { TopAppBar } from '../components/Navigation/TopAppBar';
import { BottomNav } from '../components/Navigation/BottomNav';
import { ItemCard } from '../components/ItemCard';
import { useAppContext } from '../context/AppContext';

interface HomePageProps {
  onAddItem: () => void;
  onItemClick: (itemId: string) => void;
  onTabChange: (event: React.SyntheticEvent, value: number) => void;
  currentTab: number;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  onAddItem, 
  onItemClick, 
  onTabChange, 
  currentTab 
}) => {
  const { state } = useAppContext();
  const { items } = state;

  const recentItems = [...items].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 6);

  return (
    <Layout>
      <TopAppBar title="收纳记" />

      <Box sx={{ pb: 12 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: '#8B7355', mb: 2, fontWeight: 'bold' }}>
            最近添加
          </Typography>

          <Grid container spacing={3}>
            {recentItems.length > 0 ? (
              recentItems.map(item => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                  <ItemCard 
                    item={item} 
                    onClick={() => onItemClick(item.id)} 
                  />
                </Grid>
              ))
            ) : (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8, 
                  color: '#8B7355' 
                }}>
                  <Typography variant="body1">
                    还没有添加物品，点击右下角按钮开始添加
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>

      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 20,
          backgroundColor: '#4A6741',
          '&:hover': {
            backgroundColor: '#3A5235'
          }
        }}
        onClick={onAddItem}
      >
        <Add />
      </Fab>

      <BottomNav value={currentTab} onChange={onTabChange} />
    </Layout>
  );
};
