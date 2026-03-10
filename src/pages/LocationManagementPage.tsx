import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add, Edit, Delete, Backup, Restore, Assessment, Logout, Person, Lock } from '@mui/icons-material';
import { Layout } from '../components/Layout';
import { TopAppBar } from '../components/Navigation/TopAppBar';
import { BottomNav } from '../components/Navigation/BottomNav';
import { LocationTree } from '../components/LocationTree';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { AlertDialog } from '../components/AlertDialog';

interface LocationManagementPageProps {
  onTabChange: (event: React.SyntheticEvent, value: number) => void;
  currentTab: number;
}

export const LocationManagementPage: React.FC<LocationManagementPageProps> = ({
  onTabChange,
  currentTab
}) => {
  const { state, addRoom, updateRoom, deleteRoom, addLocation, updateLocation, deleteLocation, dispatch } = useAppContext();
  const { user, signOut, updatePassword } = useAuth();
  const { rooms, locations, items, suitcases } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);

  const [roomName, setRoomName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  // 修改密码
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  // 确认弹窗状态
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmColor?: 'primary' | 'error' | 'warning' | 'success';
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  // 提示弹窗状态
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ open: false, title: '', message: '', type: 'info' });

  // 统计信息
  const stats = {
    totalItems: items.length,
    totalRooms: rooms.length,
    totalLocations: locations.length,
    totalSuitcases: suitcases.length,
    itemsWithPhotos: items.filter(i => i.photos.length > 0).length,
    itemsWithLocation: items.filter(i => i.location_id).length,
    itemsWithSuitcase: items.filter(i => i.suitcase_id).length,
    categories: [...new Set(items.map(i => i.category).filter(Boolean))].length
  };

  // 退出登录
  const handleSignOut = () => {
    setConfirmDialog({
      open: true,
      title: '退出登录',
      message: '确定要退出登录吗？',
      confirmColor: 'warning',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        await signOut();
      }
    });
  };

  // 修改密码
  const handleUpdatePassword = async () => {
    setPasswordError(null);
    setPasswordMessage(null);

    if (!newPassword.trim()) {
      setPasswordError('请输入新密码');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('密码至少需要6个字符');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致');
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordMessage('密码修改成功！');
        setTimeout(() => {
          setPasswordDialogOpen(false);
          setNewPassword('');
          setConfirmPassword('');
          setPasswordMessage(null);
        }, 2000);
      }
    } catch {
      setPasswordError('修改失败，请稍后重试');
    } finally {
      setPasswordLoading(false);
    }
  };

  // 数据备份
  const handleBackup = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      items: state.items,
      rooms: state.rooms,
      locations: state.locations,
      suitcases: state.suitcases
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `收纳记备份_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 数据恢复
  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (!data.items || !data.rooms) {
          setAlertDialog({
            open: true,
            title: '错误',
            message: '备份文件格式不正确',
            type: 'error'
          });
          return;
        }

        setConfirmDialog({
          open: true,
          title: '恢复数据',
          message: `确定要恢复数据吗？这将覆盖当前所有数据。\n\n备份时间：${new Date(data.exportedAt).toLocaleString()}\n物品数量：${data.items.length}`,
          confirmColor: 'warning',
          onConfirm: () => {
            setConfirmDialog(prev => ({ ...prev, open: false }));
            dispatch({ type: 'SET_ITEMS', payload: data.items || [] });
            dispatch({ type: 'SET_ROOMS', payload: data.rooms || [] });
            dispatch({ type: 'SET_LOCATIONS', payload: data.locations || [] });
            dispatch({ type: 'SET_SUITCASES', payload: data.suitcases || [] });
            setAlertDialog({
              open: true,
              title: '成功',
              message: '数据恢复成功！',
              type: 'success'
            });
          }
        });
      } catch {
        setAlertDialog({
          open: true,
          title: '错误',
          message: '文件解析失败，请确保是有效的备份文件',
          type: 'error'
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenRoomDialog = (roomId: string | null = null) => {
    if (roomId) {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        setRoomName(room.name);
        setEditingRoom(roomId);
      }
    } else {
      setRoomName('');
      setEditingRoom(null);
    }
    setRoomDialogOpen(true);
  };

  const handleOpenLocationDialog = (locationId: string | null = null) => {
    if (locationId) {
      const location = locations.find(l => l.id === locationId);
      if (location) {
        setLocationName(location.name);
        setSelectedRoomId(location.room_id);
        setSelectedParentId(location.parent_id);
        setEditingLocation(locationId);
      }
    } else {
      setLocationName('');
      setSelectedRoomId(rooms[0]?.id || null);
      setSelectedParentId(null);
      setEditingLocation(null);
    }
    setLocationDialogOpen(true);
  };

  const handleSaveRoom = () => {
    if (!roomName.trim()) {
      alert('请输入房间名称');
      return;
    }

    if (editingRoom) {
      const room = rooms.find(r => r.id === editingRoom);
      if (room) {
        updateRoom({ ...room, name: roomName });
      }
    } else {
      addRoom({ name: roomName, order: rooms.length + 1 });
    }

    setRoomDialogOpen(false);
  };

  const handleSaveLocation = () => {
    if (!locationName.trim()) {
      alert('请输入位置名称');
      return;
    }

    if (!selectedRoomId) {
      alert('请选择所属房间');
      return;
    }

    if (editingLocation) {
      const location = locations.find(l => l.id === editingLocation);
      if (location) {
        updateLocation({ ...location, name: locationName, room_id: selectedRoomId, parent_id: selectedParentId });
      }
    } else {
      addLocation({
        name: locationName,
        room_id: selectedRoomId,
        parent_id: selectedParentId,
        order: locations.filter(l => l.room_id === selectedRoomId && l.parent_id === selectedParentId).length + 1
      });
    }

    setLocationDialogOpen(false);
  };

  const handleDeleteRoom = (roomId: string) => {
    setConfirmDialog({
      open: true,
      title: '删除房间',
      message: '确定要删除这个房间吗？\n\n删除后房间内的位置和物品会失去关联。',
      confirmColor: 'error',
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        deleteRoom(roomId);
      }
    });
  };

  const handleDeleteLocation = (locationId: string) => {
    setConfirmDialog({
      open: true,
      title: '删除位置',
      message: '确定要删除这个位置吗？\n\n删除后位置内的物品会失去关联。',
      confirmColor: 'error',
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        deleteLocation(locationId);
      }
    });
  };

  // 获取用户邮箱首字母
  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <Layout>
      <TopAppBar title="设置" />

      <Box sx={{ pb: 12 }}>
        {/* 用户信息 */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                backgroundColor: '#4A6741',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
            >
              {userInitial}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person sx={{ color: '#8B7355', fontSize: 20 }} />
                <Typography variant="body1" sx={{ color: '#8B7355', fontWeight: 'bold' }}>
                  {user?.email}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#A08060', mt: 0.5 }}>
                数据已同步到云端
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Lock />}
              onClick={() => setPasswordDialogOpen(true)}
              sx={{
                flex: 1,
                borderColor: '#4A6741',
                color: '#4A6741',
                borderRadius: 2,
                '&:hover': { borderColor: '#3A5235', backgroundColor: 'rgba(74, 103, 65, 0.1)' }
              }}
            >
              修改密码
            </Button>
            <Button
              variant="outlined"
              startIcon={<Logout />}
              onClick={handleSignOut}
              sx={{
                flex: 1,
                borderColor: '#8B7355',
                color: '#8B7355',
                borderRadius: 2,
                '&:hover': { borderColor: '#6B5335', backgroundColor: 'rgba(139, 115, 85, 0.1)' }
              }}
            >
              退出登录
            </Button>
          </Box>
        </Paper>

        {/* 统计信息 */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Assessment sx={{ color: '#4A6741', mr: 1 }} />
            <Typography variant="subtitle2" sx={{ color: '#8B7355', fontWeight: 'bold' }}>
              物品统计
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#F9F6F0', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ color: '#4A6741', fontWeight: 'bold' }}>{stats.totalItems}</Typography>
              <Typography variant="body2" sx={{ color: '#8B7355' }}>物品总数</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#F9F6F0', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ color: '#4A6741', fontWeight: 'bold' }}>{stats.totalSuitcases}</Typography>
              <Typography variant="body2" sx={{ color: '#8B7355' }}>收纳箱</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#F9F6F0', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ color: '#4A6741', fontWeight: 'bold' }}>{stats.totalRooms}</Typography>
              <Typography variant="body2" sx={{ color: '#8B7355' }}>房间数</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#F9F6F0', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ color: '#4A6741', fontWeight: 'bold' }}>{stats.totalLocations}</Typography>
              <Typography variant="body2" sx={{ color: '#8B7355' }}>存放位置</Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#8B7355' }}>有照片的物品</Typography>
              <Typography variant="body2" sx={{ color: '#4A6741', fontWeight: 'bold' }}>{stats.itemsWithPhotos}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#8B7355' }}>已设置位置</Typography>
              <Typography variant="body2" sx={{ color: '#4A6741', fontWeight: 'bold' }}>{stats.itemsWithLocation}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#8B7355' }}>已关联收纳箱</Typography>
              <Typography variant="body2" sx={{ color: '#4A6741', fontWeight: 'bold' }}>{stats.itemsWithSuitcase}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#8B7355' }}>物品类别</Typography>
              <Typography variant="body2" sx={{ color: '#4A6741', fontWeight: 'bold' }}>{stats.categories}</Typography>
            </Box>
          </Box>
        </Paper>

        {/* 数据备份恢复 */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#8B7355', mb: 2, fontWeight: 'bold' }}>
            数据管理
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              variant="outlined"
              startIcon={<Backup />}
              onClick={handleBackup}
              fullWidth
              sx={{
                borderColor: '#4A6741',
                color: '#4A6741',
                borderRadius: 2,
                '&:hover': { borderColor: '#3A5235', backgroundColor: 'rgba(74, 103, 65, 0.1)' }
              }}
            >
              备份数据
            </Button>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleRestore}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<Restore />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth
              sx={{
                borderColor: '#8B7355',
                color: '#8B7355',
                borderRadius: 2,
                '&:hover': { borderColor: '#6B5335', backgroundColor: 'rgba(139, 115, 85, 0.1)' }
              }}
            >
              恢复数据
            </Button>
          </Box>
        </Paper>

        {/* 房间管理 */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#8B7355', fontWeight: 'bold' }}>
              房间管理
            </Typography>
            <IconButton onClick={() => handleOpenRoomDialog()} sx={{ color: '#4A6741' }}>
              <Add />
            </IconButton>
          </Box>

          {rooms.length > 0 ? (
            <Box sx={{ border: '1px solid #E0D6C2', borderRadius: 2, overflow: 'hidden' }}>
              {rooms.map((room, index) => (
                <Box
                  key={room.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 2,
                    borderBottom: index < rooms.length - 1 ? '1px solid #E0D6C2' : 'none',
                    backgroundColor: '#F9F6F0',
                    '&:hover': {
                      backgroundColor: '#F0E6D2'
                    }
                  }}
                >
                  <Typography sx={{ color: '#8B7355' }}>
                    {room.name}
                  </Typography>
                  <Box>
                    <IconButton onClick={() => handleOpenRoomDialog(room.id)} sx={{ color: '#8B7355', mr: 1 }}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteRoom(room.id)} sx={{ color: '#D32F2F' }}>
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4, color: '#8B7355' }}>
              <Typography variant="body2">
                还没有添加房间，点击右上角 + 添加
              </Typography>
            </Box>
          )}
        </Paper>

        {/* 位置管理 */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#8B7355', fontWeight: 'bold' }}>
              存放位置
            </Typography>
            <IconButton onClick={() => handleOpenLocationDialog()} sx={{ color: '#4A6741' }}>
              <Add />
            </IconButton>
          </Box>

          {rooms.length > 0 ? (
            <LocationTree
              rooms={rooms}
              locations={locations}
              onSelect={() => {}}
              selectedLocationId={null}
              onEditLocation={handleOpenLocationDialog}
              onDeleteLocation={handleDeleteLocation}
              showActions={true}
            />
          ) : (
            <Box sx={{ textAlign: 'center', py: 4, color: '#8B7355' }}>
              <Typography variant="body2">
                请先添加房间
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* 房间对话框 */}
      <Dialog open={roomDialogOpen} onClose={() => setRoomDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#8B7355', fontWeight: 'bold' }}>
          {editingRoom ? '编辑房间' : '添加房间'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="房间名称 *"
            fullWidth
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
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
          <Button onClick={() => setRoomDialogOpen(false)} sx={{ color: '#8B7355' }}>
            取消
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveRoom}
            sx={{
              backgroundColor: '#4A6741',
              '&:hover': { backgroundColor: '#3A5235' },
              borderRadius: 2
            }}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 位置对话框 */}
      <Dialog open={locationDialogOpen} onClose={() => setLocationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#8B7355', fontWeight: 'bold' }}>
          {editingLocation ? '编辑位置' : '添加位置'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="位置名称 *"
            fullWidth
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            sx={{
              mt: 2,
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#E0D6C2' },
                '&:hover fieldset': { borderColor: '#8B7355' },
                '&.Mui-focused fieldset': { borderColor: '#4A6741' }
              }
            }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>所属房间 *</InputLabel>
            <Select
              value={selectedRoomId || ''}
              label="所属房间 *"
              onChange={(e) => {
                setSelectedRoomId(e.target.value || null);
                setSelectedParentId(null);
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#E0D6C2' },
                  '&:hover fieldset': { borderColor: '#8B7355' },
                  '&.Mui-focused fieldset': { borderColor: '#4A6741' }
                }
              }}
            >
              {rooms.map(room => (
                <MenuItem key={room.id} value={room.id}>
                  {room.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>父位置（可选）</InputLabel>
            <Select
              value={selectedParentId || ''}
              label="父位置（可选）"
              onChange={(e) => setSelectedParentId(e.target.value || null)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#E0D6C2' },
                  '&:hover fieldset': { borderColor: '#8B7355' },
                  '&.Mui-focused fieldset': { borderColor: '#4A6741' }
                }
              }}
            >
              <MenuItem value="">
                <em>无（顶级位置）</em>
              </MenuItem>
              {locations
                .filter(loc => loc.room_id === selectedRoomId)
                .map(location => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLocationDialogOpen(false)} sx={{ color: '#8B7355' }}>
            取消
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveLocation}
            sx={{
              backgroundColor: '#4A6741',
              '&:hover': { backgroundColor: '#3A5235' },
              borderRadius: 2
            }}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 修改密码对话框 */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#8B7355', fontWeight: 'bold' }}>
          修改密码
        </DialogTitle>
        <DialogContent>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}
          {passwordMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {passwordMessage}
            </Alert>
          )}
          <TextField
            label="新密码"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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
            label="确认新密码"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#E0D6C2' },
                '&:hover fieldset': { borderColor: '#8B7355' },
                '&.Mui-focused fieldset': { borderColor: '#4A6741' }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => {
            setPasswordDialogOpen(false);
            setNewPassword('');
            setConfirmPassword('');
            setPasswordError(null);
            setPasswordMessage(null);
          }} sx={{ color: '#8B7355' }}>
            取消
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdatePassword}
            disabled={passwordLoading}
            sx={{
              backgroundColor: '#4A6741',
              '&:hover': { backgroundColor: '#3A5235' },
              borderRadius: 2
            }}
          >
            {passwordLoading ? <CircularProgress size={24} color="inherit" /> : '确认修改'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 确认弹窗 */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmColor={confirmDialog.confirmColor}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      />

      {/* 提示弹窗 */}
      <AlertDialog
        open={alertDialog.open}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        onClose={() => setAlertDialog(prev => ({ ...prev, open: false }))}
      />

      <BottomNav value={currentTab} onChange={onTabChange} />
    </Layout>
  );
};