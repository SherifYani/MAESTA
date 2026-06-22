import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CommunityProvider } from '../context/CommunityContext';
import MainLayout from '../components/layout/MainLayout';

const CommunityFeedPage = lazy(() => import("../pages/community/CommunityFeedPage"));
const CommunityPostDetailPage = lazy(() => import("../pages/community/CommunityPostDetailPage"));
const CommunityCreatePostPage = lazy(() => import("../pages/community/CommunityCreatePostPage"));

const CommunityRoutes = () => (
  <Suspense fallback={<div>Loading Community...</div>}>
    <CommunityProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<CommunityFeedPage />} />
          <Route path=":postId" element={<CommunityPostDetailPage />} />
          <Route path="new" element={<CommunityCreatePostPage />} />
        </Route>
      </Routes>
    </CommunityProvider>
  </Suspense>
);

export default CommunityRoutes;
