import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Paper
} from '@mui/material';
import { Add, Edit, Delete, Inventory2 } from '@mui/icons-material';
import { Layout } from '../components/Layout';
import { TopAppBar } from '../components/Navigation/TopAppBar';
import { BottomNav } from '../components/Navigation/BottomNav';
import { ItemCard } from '../components/ItemCard';
import { useAppContext } from '../context/AppContext';

interface SuitcasePageProps {
  onItemClick: (itemId: string, suitcaseId?: string) => void;
  onTabChange: (event: React.SyntheticEvent, value: number) => void;
  currentTab: number;
  selectedSuitcaseId?: string | null;
}

export const SuitcasePage: React.FC<SuitcasePageProps> = ({
  onItemClick,
  onTabChange,
  currentTab,
  selectedSuitcaseId: externalSelectedId
}) => {
  const { state, addSuitcase, updateSuitcase, deleteSuitcase } = useAppContext();
  const { suitcases, items } = state;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSuitcase, setEditingSuitcase] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // 使用外部传入的选中ID，如果没有则使用内部状态
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const selectedSuitcaseId = externalSelectedId ?? internalSelectedId;

  const handleOpenDialog = (suitcaseId: string | null = null) => {
    if (suitcaseId) {
      const suitcase = suitcases.find(s => s.id === suitcaseId);
      if (suitcase) {
        setName(suitcase.name);
        setDescription(suitcase.description);
        setEditingSuitcase(suitcaseId);
      }
    } else {
      setName('');
      setDescription('');
      setEditingSuitcase(null);
    }
    setDialogOpen(true);
  };

  const handleSaveSuitcase = () => {
    if (!name.trim()) {
      alert('请输入收纳箱名称');
      return;
    }

    if (editingSuitcase) {
      const suitcase = suitcases.find(s => s.id === editingSuitcase);
      if (suitcase) {
        updateSuitcase({ ...suitcase, name, description });
      }
    } else {
      addSuitcase({ name, description, photos: [] });
    }

    setDialogOpen(false);
  };

  const handleDeleteSuitcase = (suitcaseId: string) => {
    if (window.confirm('确定要删除这个收纳箱吗？删除后收纳箱内的物品会失去关联。')) {
      deleteSuitcase(suitcaseId);
      if (selectedSuitcaseId === suitcaseId) {
        setInternalSelectedId(null);
      }
    }
  };

  const handleSuitcaseSelect = (suitcaseId: string) => {
    setInternalSelectedId(suitcaseId);
  };

  const handleItemClick = (itemId: string) => {
    onItemClick(itemId, selectedSuitcaseId || undefined);
  };

  const getSuitcaseItems = (suitcaseId: string) => {
    return items.filter(item => item.suitcase_id === suitcaseId);
  };

  return (
    <Layout>
      <TopAppBar
        title="收纳箱"
        actions={
          <IconButton 
            onClick={() => handleOpenDialog()} 
            sx={{ 
              color: '#4A6741',
              '&:focus': { outline: 'none' }
            }}
          >
            <Add />
          </IconButton>
        }
      />

      <Box sx={{ pb: 12 }}>
        {suitcases.length > 0 ? (
          <>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#8B7355', mb: 2, fontWeight: 'bold' }}>
                收纳箱列表
              </Typography>
              <Grid container spacing={3}>
                {suitcases.map(suitcase => (
                  <Grid size={{ xs: 12, sm: 6 }} key={suitcase.id}>
                    <Card
                      sx={{
                        borderRadius: 2,
                        boxShadow: 2,
                        border: selectedSuitcaseId === suitcase.id ? '2px solid #4A6741' : '1px solid #E0D6C2',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-2px)'
                        }
                      }}
                      onClick={() => handleSuitcaseSelect(suitcase.id)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Inventory2 sx={{ color: '#8B7355', mr: 1 }} />
                              <Typography variant="h6" sx={{ color: '#8B7355' }}>
                                {suitcase.name}
                              </Typography>
                            </Box>
                            {suitcase.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {suitcase.description}
                              </Typography>
                            )}
                            <Typography variant="body2" sx={{ color: '#8B7355' }}>
                              物品数量：{getSuitcaseItems(suitcase.id).length}
                            </Typography>
                          </Box>
                          <Box>
                            <IconButton
                              onClick={(e) => { e.stopPropagation(); handleOpenDialog(suitcase.id); }}
                              sx={{ color: '#8B7355', mr: 1, '&:focus': { outline: 'none' } }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              onClick={(e) => { e.stopPropagation(); handleDeleteSuitcase(suitcase.id); }}
                              sx={{ color: '#D32F2F', '&:focus': { outline: 'none' } }}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {selectedSuitcaseId && (
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#8B7355', mb: 2, fontWeight: 'bold' }}>
                  {suitcases.find(s => s.id === selectedSuitcaseId)?.name} 内的物品
                </Typography>

                <Grid container spacing={3}>
                  {getSuitcaseItems(selectedSuitcaseId).length > 0 ? (
                    getSuitcaseItems(selectedSuitcaseId).map(item => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                        <ItemCard
                          item={item}
                          onClick={() => handleItemClick(item.id)}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{
                        textAlign: 'center',
                        py: 4,
                        color: '#8B7355'
                      }}>
                        <Typography variant="body1">
                          这个收纳箱还没有添加物品
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}
          </>
        ) : (
          <Box sx={{
            textAlign: 'center',
            py: 8,
            color: '#8B7355'
          }}>
            <Inventory2 sx={{ fontSize: 64, mb: 2, color: '#E0D6C2' }} />
            <Typography variant="h6">
              还没有创建收纳箱
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              点击右上角按钮创建第一个收纳箱
            </Typography>
          </Box>
        )}
      </Box>

      <BottomNav value={currentTab} onChange={onTabChange} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#8B7355', fontWeight: 'bold' }}>
          {editingSuitcase ? '编辑收纳箱' : '添加收纳箱'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="收纳箱名称 *"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#E0D6C2' },
                '&:hover fieldset': { borderColor: '#8B7355' },
                '&.Mui-focused fieldset': { borderColor: '#4A6741' }
              }
            }}
          />
          <TextField
            label="描述"
            fullWidth
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#E0D6C2' },
                '&:hover fieldset': { borderColor: '#8B7355' },
                '&.Mui-focused fieldset': { borderColor: '#4A6741' }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setDialogOpen(false)} 
            sx={{ color: '#8B7355', '&:focus': { outline: 'none' } }}
          >
            取消
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSuitcase}
            sx={{
              backgroundColor: '#4A6741',
              '&:hover': { backgroundColor: '#3A5235' },
              borderRadius: 2,
              '&:focus': { outline: 'none' }
            }}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};