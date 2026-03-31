import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

const JobSearchPage = lazy(() => import("../pages/jobs/JobSearchPage.jsx"));
const JobDetailsPage = lazy(() => import("../pages/jobs/JobDetailsPage.jsx"));
const JobApplicationPage = lazy(() => import("../pages/jobs/JobApplicationPage.jsx"));
const JobPostingPage = lazy(() => import("../pages/jobs/JobPostingPage.jsx"));
const SavedJobsPage = lazy(() => import("../pages/jobs/SavedJobsPage.jsx"));

const JobRoutes = () => (
    <Suspense fallback={<div>Loading Jobs...</div>}>
        <Routes>
            <Route element={<MainLayout />}>
                <Route index element={<JobSearchPage />} />
                <Route path=":jobId" element={<JobDetailsPage />} />
                <Route path=":jobId/apply" element={<JobApplicationPage />} />
                <Route path="post" element={<JobPostingPage />} />
                <Route path="saved" element={<SavedJobsPage />} />
            </Route>
        </Routes>
    </Suspense>
);

export default JobRoutes;
