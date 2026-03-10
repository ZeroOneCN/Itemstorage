import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { LoginPage } from './pages/LoginPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { HomePage } from './pages/HomePage';
import { AddItemPage } from './pages/AddItemPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { SearchPage } from './pages/SearchPage';
import { SuitcasePage } from './pages/SuitcasePage';
import { LocationManagementPage } from './pages/LocationManagementPage';
import { CircularProgress, Box } from '@mui/material';

// 登录页面包装器
const LoginPageWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <LoginPage onSuccess={() => navigate('/')} />;
};

// 添加物品页面包装器
const AddItemPageWrapper: React.FC<{
  onBack: () => void;
  onTabChange: (event: React.SyntheticEvent, value: number) => void;
  currentTab: number;
}> = ({ onBack, onTabChange, currentTab }) => {
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get('id') || undefined;
  return (
    <AddItemPage
      itemId={itemId}
      onSave={onBack}
      onCancel={onBack}
      onTabChange={onTabChange}
      currentTab={currentTab}
    />
  );
};

// 物品详情页面包装器
const ItemDetailPageWrapper: React.FC<{
  onBack: () => void;
  onEdit: (itemId: string) => void;
  onDelete: () => void;
  onTabChange: (event: React.SyntheticEvent, value: number) => void;
  currentTab: number;
}> = ({ onBack, onEdit, onDelete, onTabChange, currentTab }) => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        物品不存在
      </Box>
    );
  }
  
  return (
    <ItemDetailPage
      itemId={id}
      onBack={onBack}
      onEdit={onEdit}
      onDelete={onDelete}
      onTabChange={onTabChange}
      currentTab={currentTab}
    />
  );
};

// 主页面包装器
const MainPageWrapper: React.FC<{
  tab: number;
  onTabChange: (event: React.SyntheticEvent, value: number) => void;
  onAddItem: () => void;
  onItemClick: (itemId: string, suitcaseId?: string) => void;
  selectedSuitcaseId?: string | null;
}> = ({ tab, onTabChange, onAddItem, onItemClick, selectedSuitcaseId }) => {
  const [searchParams] = useSearchParams();
  const suitcaseId = searchParams.get('suitcaseId') || selectedSuitcaseId;

  if (tab === 0) {
    return (
      <HomePage
        onAddItem={onAddItem}
        onItemClick={onItemClick}
        onTabChange={onTabChange}
        currentTab={tab}
      />
    );
  }
  
  if (tab === 1) {
    return (
      <SearchPage
        onItemClick={onItemClick}
        onTabChange={onTabChange}
        currentTab={tab}
      />
    );
  }
  
  if (tab === 2) {
    return (
      <SuitcasePage
        onItemClick={onItemClick}
        onTabChange={onTabChange}
        currentTab={tab}
        selectedSuitcaseId={suitcaseId}
      />
    );
  }
  
  return (
    <LocationManagementPage
      onTabChange={onTabChange}
      currentTab={tab}
    />
  );
};

// 主应用内容
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 从 URL 获取当前 tab
  const getTabFromPath = () => {
    const tab = searchParams.get('tab');
    if (tab) {
      const tabNum = parseInt(tab, 10);
      if (tabNum >= 0 && tabNum <= 3) {
        return tabNum;
      }
    }
    return 0;
  };

  const [currentTab, setCurrentTab] = useState(getTabFromPath());
  const [selectedSuitcaseId, setSelectedSuitcaseId] = useState<string | null>(null);

  // 同步 tab 到 URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    const tabNum = tab ? parseInt(tab, 10) : 0;
    if (tabNum !== currentTab && tabNum >= 0 && tabNum <= 3) {
      setCurrentTab(tabNum);
    }
  }, [searchParams, currentTab]);

  // 加载中
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#F5F0E8' }}>
        <CircularProgress sx={{ color: '#4A6741' }} />
      </Box>
    );
  }

  // 未登录显示登录页
  if (!user) {
    return (
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<LoginPageWrapper />} />
      </Routes>
    );
  }

  // 切换主页面 tab
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    // 更新 URL
    navigate(`/?tab=${newValue}`, { replace: true });
  };

  // 添加物品
  const handleAddItem = () => {
    navigate(`/add?tab=${currentTab}`);
  };

  // 编辑物品
  const handleEditItem = (itemId: string) => {
    navigate(`/add?id=${itemId}&tab=${currentTab}`);
  };

  // 查看物品详情
  const handleItemClick = (itemId: string, suitcaseId?: string) => {
    if (suitcaseId) {
      setSelectedSuitcaseId(suitcaseId);
    }
    navigate(`/item/${itemId}?tab=${currentTab}`);
  };

  // 返回主页面
  const goBack = () => {
    navigate(`/?tab=${currentTab}`, { replace: true });
  };

  return (
    <AppProvider>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/add" element={
          <AddItemPageWrapper
            onBack={goBack}
            onTabChange={handleTabChange}
            currentTab={currentTab}
          />
        } />
        <Route path="/item/:id" element={
          <ItemDetailPageWrapper
            onBack={goBack}
            onEdit={handleEditItem}
            onDelete={goBack}
            onTabChange={handleTabChange}
            currentTab={currentTab}
          />
        } />
        <Route path="*" element={
          <MainPageWrapper
            tab={currentTab}
            onTabChange={handleTabChange}
            onAddItem={handleAddItem}
            onItemClick={handleItemClick}
            selectedSuitcaseId={selectedSuitcaseId}
          />
        } />
      </Routes>
    </AppProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;