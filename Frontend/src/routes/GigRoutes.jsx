import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { GigProvider } from '../context/GigContext';
import MainLayout from '../components/layout/MainLayout';

const GigListingPage = lazy(() => import("../pages/gigs/GigListingPage"));
const GigDetailsPage = lazy(() => import("../pages/gigs/GigDetailsPage"));
const GigPostingPage = lazy(() => import("../pages/gigs/GigPostingPage"));
const GigBiddingPage = lazy(() => import("../pages/gigs/GigBiddingPage"));
const GigManagementPage = lazy(() => import("../pages/gigs/GigManagementPage"));
const WorkspacePage = lazy(() => import("../pages/gigs/WorkspacePage"));

const GigRoutes = () => (
  <Suspense fallback={<div>Loading Gigs...</div>}>
    <GigProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<GigListingPage />} />
          <Route path=":id" element={<GigDetailsPage />} />
          <Route path="new" element={<GigPostingPage />} />
          <Route path=":id/bid" element={<GigBiddingPage />} />
          <Route path="manage" element={<GigManagementPage />} />
          <Route path=":id/workspace" element={<WorkspacePage />} />
        </Route>
      </Routes>
    </GigProvider>
  </Suspense>
);

export default GigRoutes;
