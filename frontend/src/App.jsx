import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import SellersPage from './pages/SellersPage';
import SellerDetailPage from './pages/SellerDetailPage';
import CategoryAnalysisPage from './pages/CategoryAnalysisPage';
import CustomerSatisfactionPage from './pages/CustomerSatisfactionPage';
import DeliveryPerformancePage from './pages/DeliveryPerformancePage';
import PredictiveAnalyticsPage from './pages/PredictiveAnalyticsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="sellers" element={<SellersPage />} />
          <Route path="sellers/:sellerId" element={<SellerDetailPage />} />
          <Route path="categories" element={<CategoryAnalysisPage />} />
          <Route path="satisfaction" element={<CustomerSatisfactionPage />} />
          <Route path="delivery" element={<DeliveryPerformancePage />} />
          <Route path="predictive" element={<PredictiveAnalyticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
