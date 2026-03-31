import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

const SubscriptionPlansPage = lazy(() => import("../pages/SubscriptionPlansPage"));
const PaymentPage = lazy(() => import("../pages/PaymentPage"));
const NotificationsCenterPage = lazy(() => import("../pages/notifications").then(module => ({ default: module.NotificationsCenterPage })));
const NotificationSettingsPage = lazy(() => import("../pages/notifications").then(module => ({ default: module.NotificationSettingsPage })));
const ChatPage = lazy(() => import("../pages/chat/ChatPage"));

const CommonRoutes = () => (
    <Routes>
        <Route element={<MainLayout />}>
            {/* Mount-relative paths (App.js mounts at /chat/*, /notifications/*, /subscription/*) */}
            
            {/* Specific paths for each mount point */}
            <Route index element={<ChatPage />} />
            <Route path=":conversationId" element={<ChatPage />} />
            
            <Route index element={<NotificationsCenterPage />} />
            <Route path="settings" element={<NotificationSettingsPage />} />
            
            <Route path="plans" element={<SubscriptionPlansPage />} />
            <Route path="payment/:planId" element={<PaymentPage />} />
        </Route>
    </Routes>
);

export default CommonRoutes;
