import React, { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

const CVBuilderPage = lazy(() => import("../pages/ai-assistant/CVBuilderPage.jsx"));
const CandidateAnalysisPage = lazy(() => import("../pages/ai-assistant/CandidateAnalysisPage.jsx"));
const SmartSearchPage = lazy(() => import("../pages/ai-assistant/SmartSearchPage.jsx"));
const AIPostingPage = lazy(() => import("../pages/ai-assistant/AIPostingPage.jsx"));

const AiRoutes = () => (
    <Suspense fallback={<div>Loading AI Tools...</div>}>
        <Routes>
            <Route element={<MainLayout />}>
                {/* Default: redirect /ai to /ai/cv-builder */}
                <Route index element={<Navigate to="cv-builder" replace />} />
                <Route path="cv-builder" element={<CVBuilderPage />} />
                <Route path="candidate-analysis" element={<CandidateAnalysisPage />} />
                <Route path="smart-search" element={<SmartSearchPage />} />
                <Route path="post-job" element={<AIPostingPage />} />
            </Route>
        </Routes>
    </Suspense>
);

export default AiRoutes;
