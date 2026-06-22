import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

const SubscriptionPlansPage = lazy(() => import("../pages/SubscriptionPlansPage"));
const PaymentPage = lazy(() => import("../pages/PaymentPage"));
const NotificationsCenterPage = lazy(() => import("../pages/notifications").then(module => ({ default: module.NotificationsCenterPage })));
const NotificationSettingsPage = lazy(() => import("../pages/notifications").then(module => ({ default: module.NotificationSettingsPage })));
const ChatPage = lazy(() => import("../pages/chat/ChatPage"));

export const ChatRoutes = () => (
    <Routes>
        <Route element={<MainLayout />}>
            <Route index element={<ChatPage />} />
            <Route path=":userId" element={<ChatPage />} />
        </Route>
    </Routes>
);

export const NotificationRoutes = () => (
    <Routes>
        <Route element={<MainLayout />}>
            <Route index element={<NotificationsCenterPage />} />
            <Route path="settings" element={<NotificationSettingsPage />} />
        </Route>
    </Routes>
);

export const SubscriptionRoutes = () => (
    <Routes>
        <Route element={<MainLayout />}>
            <Route path="plans" element={<SubscriptionPlansPage />} />
            <Route path="payment/:planId" element={<PaymentPage />} />
        </Route>
    </Routes>
);
