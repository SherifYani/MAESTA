import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

const CVBuilderPage = lazy(() => import("../pages/ai-assistant/CVBuilderPage.jsx"));
const CandidateAnalysisPage = lazy(() => import("../pages/ai-assistant/CandidateAnalysisPage.jsx"));
const SmartSearchPage = lazy(() => import("../pages/ai-assistant/SmartSearchPage.jsx"));
const AIPostingPage = lazy(() => import("../pages/ai-assistant/AIPostingPage.jsx"));

const AiRoutes = () => (
    <Suspense fallback={<div>Loading AI AI Assistant...</div>}>
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="cv-builder" element={<CVBuilderPage />} />
                <Route path="candidate-analysis" element={<CandidateAnalysisPage />} />
                <Route path="smart-search" element={<SmartSearchPage />} />
                <Route path="post-job" element={<AIPostingPage />} />
            </Route>
        </Routes>
    </Suspense>
);

export default AiRoutes;
