import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { Inventory2, Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // 检查是否有有效的重置密码会话
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setValidSession(true);
        } else {
          // 尝试从 URL 获取 token
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const type = hashParams.get('type');

          if (accessToken && type === 'recovery') {
            // 使用 token 设置会话
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (!error) {
              setValidSession(true);
            } else {
              setError('链接已失效，请重新申请重置密码');
            }
          } else {
            setError('无效的重置链接');
          }
        }
      } catch {
        setError('验证失败，请重新申请重置密码');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleResetPassword = async () => {
    setError(null);

    if (!newPassword.trim()) {
      setError('请输入新密码');
      return;
    }

    if (newPassword.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // 3秒后跳转到登录页
        setTimeout(() => {
          supabase.auth.signOut();
          navigate('/');
        }, 3000);
      }
    } catch {
      setError('修改失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 加载中
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F5F0E8'
        }}
      >
        <CircularProgress sx={{ color: '#4A6741' }} />
      </Box>
    );
  }

  // 成功
  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F5F0E8',
          padding: 2
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            maxWidth: 400,
            width: '100%',
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <Lock sx={{ fontSize: 64, color: '#4A6741', mb: 2 }} />
          <Typography variant="h5" sx={{ color: '#4A6741', fontWeight: 'bold', mb: 2 }}>
            密码修改成功！
          </Typography>
          <Typography variant="body1" sx={{ color: '#8B7355' }}>
            请使用新密码重新登录
          </Typography>
          <Typography variant="body2" sx={{ color: '#A08060', mt: 2 }}>
            即将跳转到登录页面...
          </Typography>
        </Paper>
      </Box>
    );
  }

  // 无效链接
  if (!validSession) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F5F0E8',
          padding: 2
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            maxWidth: 400,
            width: '100%',
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" sx={{ color: '#D32F2F', fontWeight: 'bold', mb: 2 }}>
            链接无效
          </Typography>
          <Typography variant="body1" sx={{ color: '#8B7355', mb: 3 }}>
            {error || '此链接已过期或无效'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{
              backgroundColor: '#4A6741',
              '&:hover': { backgroundColor: '#3A5235' },
              borderRadius: 2
            }}
          >
            返回登录
          </Button>
        </Paper>
      </Box>
    );
  }

  // 重置密码表单
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F0E8',
        padding: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          maxWidth: 400,
          width: '100%',
          borderRadius: 3
        }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Inventory2 sx={{ fontSize: 64, color: '#4A6741', mb: 2 }} />
          <Typography variant="h4" sx={{ color: '#8B7355', fontWeight: 'bold' }}>
            重置密码
          </Typography>
          <Typography variant="body2" sx={{ color: '#8B7355', mt: 1 }}>
            请输入您的新密码
          </Typography>
        </Box>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 表单 */}
        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}>
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
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#E0D6C2' },
                '&:hover fieldset': { borderColor: '#8B7355' },
                '&.Mui-focused fieldset': { borderColor: '#4A6741' }
              }
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={submitting}
            sx={{
              backgroundColor: '#4A6741',
              color: 'white',
              py: 1.5,
              borderRadius: 2,
              '&:hover': { backgroundColor: '#3A5235' },
              '&:disabled': { backgroundColor: '#C0C0C0' }
            }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : '确认修改'}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ color: '#A08060', mt: 3, textAlign: 'center' }}>
          修改密码后将需要重新登录所有设备
        </Typography>
      </Paper>
    </Box>
  );
};