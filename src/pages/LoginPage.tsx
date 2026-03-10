import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Inventory2 } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { signUp, signIn, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // 忘记密码对话框
  const [forgotDialogOpen, setForgotDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim() || !password.trim()) {
      setError('请输入邮箱和密码');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message === 'Invalid login credentials'
            ? '邮箱或密码错误'
            : error.message);
        } else {
          onSuccess();
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setMessage('注册成功！请检查邮箱完成验证后登录。');
          setIsLogin(true);
        }
      }
    } catch {
      setError('发生错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      setResetError('请输入邮箱');
      return;
    }

    setResetLoading(true);
    setResetError(null);
    setResetMessage(null);

    try {
      const { error } = await resetPassword(resetEmail);
      if (error) {
        setResetError(error.message);
      } else {
        setResetMessage('重置密码邮件已发送，请检查邮箱');
        setTimeout(() => {
          setForgotDialogOpen(false);
          setResetEmail('');
          setResetMessage(null);
        }, 3000);
      }
    } catch {
      setResetError('发送失败，请稍后重试');
    } finally {
      setResetLoading(false);
    }
  };

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
            收纳记
          </Typography>
          <Typography variant="body2" sx={{ color: '#8B7355', mt: 1 }}>
            拍照即记，位置精准到抽屉
          </Typography>
        </Box>

        {/* 错误/成功提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {/* 表单 */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="邮箱"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            label="密码"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mb: isLogin ? 1 : 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#E0D6C2' },
                '&:hover fieldset': { borderColor: '#8B7355' },
                '&.Mui-focused fieldset': { borderColor: '#4A6741' }
              }
            }}
          />

          {/* 忘记密码链接 */}
          {isLogin && (
            <Box sx={{ textAlign: 'right', mb: 2 }}>
              <Button
                type="button"
                onClick={() => setForgotDialogOpen(true)}
                sx={{ color: '#8B7355', fontSize: '0.875rem', p: 0 }}
              >
                忘记密码？
              </Button>
            </Box>
          )}

          {!isLogin && (
            <TextField
              label="确认密码"
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
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              backgroundColor: '#4A6741',
              color: 'white',
              py: 1.5,
              borderRadius: 2,
              '&:hover': { backgroundColor: '#3A5235' },
              '&:disabled': { backgroundColor: '#C0C0C0' }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : isLogin ? '登录' : '注册'}
          </Button>
        </Box>

        {/* 切换登录/注册 */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: '#8B7355' }}>
            {isLogin ? '还没有账号？' : '已有账号？'}
            <Button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
              }}
              sx={{ color: '#4A6741', fontWeight: 'bold' }}
            >
              {isLogin ? '注册' : '登录'}
            </Button>
          </Typography>
        </Box>
      </Paper>

      {/* 忘记密码对话框 */}
      <Dialog open={forgotDialogOpen} onClose={() => setForgotDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#8B7355', fontWeight: 'bold' }}>
          重置密码
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#8B7355', mb: 2 }}>
            请输入您的注册邮箱，我们将发送重置密码链接到您的邮箱。
          </Typography>
          {resetError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {resetError}
            </Alert>
          )}
          {resetMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {resetMessage}
            </Alert>
          )}
          <TextField
            label="邮箱"
            type="email"
            fullWidth
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
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
          <Button onClick={() => setForgotDialogOpen(false)} sx={{ color: '#8B7355' }}>
            取消
          </Button>
          <Button
            variant="contained"
            onClick={handleResetPassword}
            disabled={resetLoading}
            sx={{
              backgroundColor: '#4A6741',
              '&:hover': { backgroundColor: '#3A5235' },
              borderRadius: 2
            }}
          >
            {resetLoading ? <CircularProgress size={24} color="inherit" /> : '发送'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};