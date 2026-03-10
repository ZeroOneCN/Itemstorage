import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Paper,
  Autocomplete
} from '@mui/material';
import { Save, Close } from '@mui/icons-material';
import { Layout } from '../components/Layout';
import { TopAppBar } from '../components/Navigation/TopAppBar';
import { BottomNav } from '../components/Navigation/BottomNav';
import { PhotoUploader } from '../components/PhotoUploader';
import { LocationTree } from '../components/LocationTree';
import { useAppContext } from '../context/AppContext';


interface AddItemPageProps {
  itemId?: string;
  onSave: () => void;
  onCancel: () => void;
  onTabChange: (event: React.SyntheticEvent, value: number) => void;
  currentTab: number;
}

export const AddItemPage: React.FC<AddItemPageProps> = ({
  itemId,
  onSave,
  onCancel,
  onTabChange,
  currentTab
}) => {
  const { state, addItem, updateItem } = useAppContext();
  const { rooms, locations, suitcases, items } = state;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [locationId, setLocationId] = useState<string | null>(null);
  const [suitcaseId, setSuitcaseId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [mainPhoto, setMainPhoto] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // 从现有物品中提取所有类别
  const existingCategories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));

  useEffect(() => {
    if (itemId) {
      const item = items.find(item => item.id === itemId);
      if (item) {
        setName(item.name);
        setDescription(item.description);
        setCategory(item.category);
        setLocationId(item.location_id);
        setSuitcaseId(item.suitcase_id);
        setPhotos(item.photos);
        setMainPhoto(item.main_photo);
        setTags(item.tags);
      }
    }
  }, [itemId, items]);

  const handlePhotosChange = (newPhotos: string[], newMainPhoto: string | null) => {
    setPhotos(newPhotos);
    setMainPhoto(newMainPhoto);
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('请输入物品名称');
      return;
    }

    try {
      if (itemId) {
        const item = items.find(item => item.id === itemId);
        if (item) {
          await updateItem({
            ...item,
            name,
            description,
            category,
            location_id: locationId,
            suitcase_id: suitcaseId,
            photos,
            main_photo: mainPhoto,
            tags,
          });
        }
      } else {
        await addItem({
          name,
          description,
          category,
          location_id: locationId,
          suitcase_id: suitcaseId,
          photos,
          main_photo: mainPhoto,
          tags,
        });
      }
      
      onSave();
    } catch (error) {
      console.error('保存物品失败:', error);
      alert('保存失败，请重试');
    }
  };

  return (
    <Layout>
      <TopAppBar
        title={itemId ? '编辑物品' : '添加物品'}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Close />}
              onClick={onCancel}
              sx={{
                borderColor: '#8B7355',
                color: '#8B7355',
                borderRadius: 2,
                '&:hover': { borderColor: '#6B5335', backgroundColor: 'rgba(139, 115, 85, 0.1)' },
                '&:focus': { outline: 'none' }
              }}
            >
              取消
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              sx={{
                backgroundColor: '#4A6741',
                '&:hover': { backgroundColor: '#3A5235' },
                borderRadius: 2,
                '&:focus': { outline: 'none' }
              }}
            >
              保存
            </Button>
          </Box>
        }
      />

      <Box sx={{ pb: 12 }}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#8B7355', mb: 2, fontWeight: 'bold' }}>
            基本信息
          </Typography>

          <TextField
            label="物品名称 *"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              mb: 2,
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
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#E0D6C2' },
                '&:hover fieldset': { borderColor: '#8B7355' },
                '&.Mui-focused fieldset': { borderColor: '#4A6741' }
              }
            }}
          />

          <Autocomplete
            freeSolo
            options={existingCategories}
            value={category}
            onChange={(_event, newValue) => setCategory(newValue || '')}
            onInputChange={(_event, newInputValue) => setCategory(newInputValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="类别"
                fullWidth
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#E0D6C2' },
                    '&:hover fieldset': { borderColor: '#8B7355' },
                    '&.Mui-focused fieldset': { borderColor: '#4A6741' }
                  }
                }}
              />
            )}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="suitcase-select-label">收纳箱</InputLabel>
            <Select
              labelId="suitcase-select-label"
              value={suitcaseId || ''}
              label="收纳箱"
              onChange={(e) => setSuitcaseId(e.target.value || null)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#E0D6C2' },
                  '&:hover fieldset': { borderColor: '#8B7355' },
                  '&.Mui-focused fieldset': { borderColor: '#4A6741' }
                }
              }}
            >
              <MenuItem value="">
                <em>无</em>
              </MenuItem>
              {suitcases.map(suitcase => (
                <MenuItem key={suitcase.id} value={suitcase.id}>
                  {suitcase.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#8B7355', mb: 2, fontWeight: 'bold' }}>
            存放位置
          </Typography>
          <LocationTree
            rooms={rooms}
            locations={locations}
            onSelect={setLocationId}
            selectedLocationId={locationId}
          />
        </Paper>

        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <PhotoUploader
            photos={photos}
            mainPhoto={mainPhoto}
            onPhotosChange={handlePhotosChange}
          />
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#8B7355', mb: 2, fontWeight: 'bold' }}>
            标签
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              label="添加标签"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              sx={{
                flexGrow: 1,
                mr: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#E0D6C2' },
                  '&:hover fieldset': { borderColor: '#8B7355' },
                  '&.Mui-focused fieldset': { borderColor: '#4A6741' }
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddTag}
              sx={{
                backgroundColor: '#4A6741',
                '&:hover': { backgroundColor: '#3A5235' },
                borderRadius: 2
              }}
            >
              添加
            </Button>
          </Box>
          {tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  sx={{ backgroundColor: '#E0D6C2', color: '#8B7355' }}
                />
              ))}
            </Box>
          )}
        </Paper>
      </Box>

      <BottomNav value={currentTab} onChange={onTabChange} />
    </Layout>
  );
};