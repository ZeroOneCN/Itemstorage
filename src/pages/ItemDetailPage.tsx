import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
  Divider,
  Button
} from '@mui/material';
import { Edit, Delete, ArrowBack } from '@mui/icons-material';
import { Layout } from '../components/Layout';
import { TopAppBar } from '../components/Navigation/TopAppBar';
import { BottomNav } from '../components/Navigation/BottomNav';
import { useAppContext } from '../context/AppContext';
import { IconButton } from '@mui/material';
import { ConfirmDialog } from '../components/ConfirmDialog';


interface ItemDetailPageProps {
  itemId: string;
  onBack: () => void;
  onEdit: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onTabChange: (event: React.SyntheticEvent, value: number) => void;
  currentTab: number;
}

export const ItemDetailPage: React.FC<ItemDetailPageProps> = ({
  itemId,
  onBack,
  onEdit,
  onDelete,
  onTabChange,
  currentTab
}) => {
  const { state, deleteItem } = useAppContext();
  const { items, locations, rooms, suitcases } = state;

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const item = items.find(item => item.id === itemId);

  const getLocationChain = (locationId: string | null): string[] => {
    const chain: string[] = [];
    if (!locationId) return chain;

    let currentLocation = locations.find(loc => loc.id === locationId);
    while (currentLocation) {
      chain.unshift(currentLocation.name);
      if (currentLocation.parent_id) {
        currentLocation = locations.find(loc => loc.id === currentLocation?.parent_id);
      } else {
        const room = rooms.find(room => room.id === currentLocation?.room_id);
        if (room) {
          chain.unshift(room.name);
        }
        break;
      }
    }
    return chain;
  };

  const handleDelete = () => {
    setConfirmDialogOpen(true);
  };

  const confirmDelete = () => {
    if (item) {
      deleteItem(item.id);
      onDelete(item.id);
    }
    setConfirmDialogOpen(false);
  };

  if (!item) {
    return (
      <Layout>
        <TopAppBar 
          title="物品详情" 
          actions={
            <Button
              startIcon={<ArrowBack />}
              onClick={onBack}
              sx={{ 
                color: '#8B7355',
                '&:focus': { outline: 'none' }
              }}
            >
              返回
            </Button>
          }
        />
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: '#8B7355', textAlign: 'center', mt: 4 }}>
            物品不存在
          </Typography>
        </Box>
        <BottomNav value={currentTab} onChange={onTabChange} />
      </Layout>
    );
  }

  const suitcase = item.suitcase_id ? suitcases.find(s => s.id === item.suitcase_id) : null;
  const locationChain = getLocationChain(item.location_id);

  return (
    <Layout>
      <TopAppBar
        title="物品详情"
        actions={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={onBack}
              sx={{ 
                color: '#8B7355',
                '&:focus': { outline: 'none' }
              }}
            >
              返回
            </Button>
            <IconButton 
              onClick={() => onEdit(item.id)} 
              sx={{ 
                color: '#8B7355',
                '&:focus': { outline: 'none' }
              }}
            >
              <Edit />
            </IconButton>
            <IconButton 
              onClick={handleDelete} 
              sx={{ 
                color: '#D32F2F',
                '&:focus': { outline: 'none' }
              }}
            >
              <Delete />
            </IconButton>
          </Box>
        }
      />

      <Box sx={{ pb: 12 }}>
        {item.photos.length > 0 && (
          <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{
              height: 300,
              backgroundColor: '#F0E6D2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={item.main_photo || item.photos[0]}
                alt={item.name}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </Box>
            {item.photos.length > 1 && (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 1,
                padding: 2
              }}>
                {item.photos.map((photo, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: photo === (item.main_photo || item.photos[0]) ? '#4A6741' : '#E0D6C2'
                    }}
                  />
                ))}
              </Box>
            )}
          </Paper>
        )}

        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ color: '#8B7355', mb: 2, fontWeight: 'bold' }}>
            {item.name}
          </Typography>

          {item.description && (
            <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
              {item.description}
            </Typography>
          )}

          {item.category && (
            <Box sx={{ mb: 2 }}>
              <Chip
                label={item.category}
                sx={{ backgroundColor: '#E0D6C2', color: '#8B7355' }}
              />
            </Box>
          )}

          {item.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {item.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  sx={{ backgroundColor: '#F0E6D2', color: '#8B7355' }}
                />
              ))}
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#8B7355', mb: 2, fontWeight: 'bold' }}>
            存放位置
          </Typography>
          {suitcase ? (
            <Box sx={{ p: 2, backgroundColor: '#F0E6D2', borderRadius: 2 }}>
              <Typography variant="body1" sx={{ color: '#8B7355' }}>
                🧳 {suitcase.name}
              </Typography>
            </Box>
          ) : locationChain.length > 0 ? (
            <Box sx={{ p: 2, backgroundColor: '#F0E6D2', borderRadius: 2 }}>
              <Typography variant="body1" sx={{ color: '#8B7355' }}>
                {locationChain.join(' → ')}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 2, backgroundColor: '#F0E6D2', borderRadius: 2 }}>
              <Typography variant="body1" sx={{ color: '#8B7355' }}>
                未设置位置
              </Typography>
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#8B7355', mb: 2, fontWeight: 'bold' }}>
            其他信息
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#999' }}>
                创建时间
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                {new Date(item.created_at).toLocaleString()}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#999' }}>
                更新时间
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                {new Date(item.updated_at).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <BottomNav value={currentTab} onChange={onTabChange} />

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={confirmDialogOpen}
        title="删除物品"
        message="确定要删除这个物品吗？\n\n此操作不可撤销。"
        confirmColor="error"
        confirmText="删除"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialogOpen(false)}
      />
    </Layout>
  );
};