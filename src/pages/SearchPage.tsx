import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Grid,
  Paper
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { Layout } from '../components/Layout';
import { TopAppBar } from '../components/Navigation/TopAppBar';
import { BottomNav } from '../components/Navigation/BottomNav';
import { ItemCard } from '../components/ItemCard';
import { useAppContext } from '../context/AppContext';

interface SearchPageProps {
  onItemClick: (itemId: string) => void;
  onTabChange: (event: React.SyntheticEvent, value: number) => void;
  currentTab: number;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  onItemClick,
  onTabChange,
  currentTab
}) => {
  const { state } = useAppContext();
  const { items, locations, rooms, suitcases } = state;

  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();

    return items.filter(item => {
      if (item.name.toLowerCase().includes(query)) {
        return true;
      }

      if (item.description.toLowerCase().includes(query)) {
        return true;
      }

      if (item.category.toLowerCase().includes(query)) {
        return true;
      }

      if (item.tags.some(tag => tag.toLowerCase().includes(query))) {
        return true;
      }

      if (item.location_id) {
        let location = locations.find(loc => loc.id === item.location_id);
        while (location) {
          if (location.name.toLowerCase().includes(query)) {
            return true;
          }
          if (location.parent_id) {
            location = locations.find(loc => loc.id === location?.parent_id);
          } else {
            const room = rooms.find(room => room.id === location?.room_id);
            if (room && room.name.toLowerCase().includes(query)) {
              return true;
            }
            break;
          }
        }
      }

      if (item.suitcase_id) {
        const suitcase = suitcases.find(s => s.id === item.suitcase_id);
        if (suitcase && (suitcase.name.toLowerCase().includes(query) || suitcase.description.toLowerCase().includes(query))) {
          return true;
        }
      }

      return false;
    });
  }, [searchQuery, items, locations, rooms, suitcases]);

  return (
    <Layout>
      <TopAppBar title="搜索" />

      <Box sx={{ pb: 12 }}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <TextField
            fullWidth
            placeholder="搜索物品、位置、标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search sx={{ color: '#8B7355', mr: 1 }} />
              ),
              sx: {
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#E0D6C2' },
                  '&:hover fieldset': { borderColor: '#8B7355' },
                  '&.Mui-focused fieldset': { borderColor: '#4A6741' }
                }
              }
            }}
          />
        </Paper>

        {searchQuery ? (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#8B7355', mb: 2, fontWeight: 'bold' }}>
              搜索结果 ({searchResults.length})
            </Typography>

            {searchResults.length > 0 ? (
              <Grid container spacing={3}>
                {searchResults.map(item => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                    <ItemCard 
                      item={item} 
                      onClick={() => onItemClick(item.id)} 
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: 8, 
                color: '#8B7355' 
              }}>
                <Typography variant="body1">
                  没有找到匹配的物品
                </Typography>
              </Box>
            )}
          </Paper>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8, 
            color: '#8B7355' 
          }}>
            <Search sx={{ fontSize: 64, mb: 2, color: '#E0D6C2' }} />
            <Typography variant="h6">
              搜索物品
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              输入关键词搜索物品、位置或标签
            </Typography>
          </Box>
        )}
      </Box>

      <BottomNav value={currentTab} onChange={onTabChange} />
    </Layout>
  );
};
