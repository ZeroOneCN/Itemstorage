import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { AddItemPage } from './pages/AddItemPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { SearchPage } from './pages/SearchPage';
import { SuitcasePage } from './pages/SuitcasePage';
import { LocationManagementPage } from './pages/LocationManagementPage';
import { CircularProgress, Box } from '@mui/material';

type Page = 'home' | 'addItem' | 'editItem' | 'itemDetail' | 'search' | 'suitcase' | 'locationManagement';

// 主应用内容
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<{page: Page, tab: number}>({ page: 'home', tab: 0 });
  const [selectedSuitcaseId, setSelectedSuitcaseId] = useState<string | null>(null);

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
    return <LoginPage onSuccess={() => {}} />;
  }

  // 切换主页面 tab
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);

    let targetPage: Page;
    switch (newValue) {
      case 0: targetPage = 'home'; break;
      case 1: targetPage = 'search'; break;
      case 2: targetPage = 'suitcase'; break;
      case 3: targetPage = 'locationManagement'; break;
      default: targetPage = 'home';
    }

    setCurrentPage(targetPage);
    setPreviousPage({ page: targetPage, tab: newValue });
  };

  // 导航到子页面
  const navigateToDetail = (page: Page, itemId?: string, suitcaseId?: string) => {
    setPreviousPage({ page: currentPage, tab: currentTab });
    
    if (currentPage === 'suitcase' && suitcaseId) {
      setSelectedSuitcaseId(suitcaseId);
    }
    
    setCurrentPage(page);
    if (itemId) {
      setSelectedItemId(itemId);
    }
  };

  // 返回上一页
  const goBack = () => {
    setCurrentPage(previousPage.page);
    setCurrentTab(previousPage.tab);
    setSelectedItemId(null);
    setEditingItemId(null);
  };

  const handleAddItem = () => {
    setEditingItemId(null);
    navigateToDetail('addItem');
  };

  const handleEditItem = (itemId: string) => {
    setEditingItemId(itemId);
    navigateToDetail('editItem', itemId);
  };

  const handleItemClick = (itemId: string, suitcaseId?: string) => {
    navigateToDetail('itemDetail', itemId, suitcaseId);
  };

  return (
    <AppProvider>
      {currentPage === 'home' && (
        <HomePage
          onAddItem={handleAddItem}
          onItemClick={handleItemClick}
          onTabChange={handleTabChange}
          currentTab={currentTab}
        />
      )}
      {(currentPage === 'addItem' || currentPage === 'editItem') && (
        <AddItemPage
          itemId={editingItemId || undefined}
          onSave={goBack}
          onCancel={goBack}
          onTabChange={handleTabChange}
          currentTab={currentTab}
        />
      )}
      {currentPage === 'itemDetail' && selectedItemId && (
        <ItemDetailPage
          itemId={selectedItemId}
          onBack={goBack}
          onEdit={handleEditItem}
          onDelete={goBack}
          onTabChange={handleTabChange}
          currentTab={currentTab}
        />
      )}
      {currentPage === 'search' && (
        <SearchPage
          onItemClick={handleItemClick}
          onTabChange={handleTabChange}
          currentTab={currentTab}
        />
      )}
      {currentPage === 'suitcase' && (
        <SuitcasePage
          onItemClick={handleItemClick}
          onTabChange={handleTabChange}
          currentTab={currentTab}
          selectedSuitcaseId={selectedSuitcaseId}
        />
      )}
      {currentPage === 'locationManagement' && (
        <LocationManagementPage
          onTabChange={handleTabChange}
          currentTab={currentTab}
        />
      )}
    </AppProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;