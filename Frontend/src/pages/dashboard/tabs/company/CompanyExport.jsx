/**
 * @file CompanyExport.jsx
 * @description Company export page – export applicants, jobs, analytics, applications.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-05-04
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-05-04
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { Button } from '../../../../components/common/Button';
import { DatePicker } from '../../../../components/common/DatePicker';
import { FilterPanel } from '../../../../components/common/FilterPanel';
import { DataTable, SuccessMessage, ErrorMessage } from '../../../../components/common';
import AdminPageHeader from '../admin/components/shared/AdminPageHeader/AdminPageHeader';
import * as exportService from '../../../../services/exportService';
import styles from './CompanyExport.module.css';

// Export type card component
const ExportTypeCard = ({ type, selected, onClick }) => (
    <div
        className={`${styles.exportTypeCard} ${selected ? styles.selected : ''}`}
        onClick={() => onClick(type.id)}
    >
        <div className={styles.exportTypeIcon}>
            {type.id === 'applicants' && '👥'}
            {type.id === 'jobs' && '💼'}
            {type.id === 'analytics' && '📊'}
            {type.id === 'applications' && '📝'}
        </div>
        <h3 className={styles.exportTypeName}>{type.name}</h3>
        <p className={styles.exportTypeDesc}>{type.description}</p>
    </div>
);

const CompanyExport = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialType = queryParams.get('type');

    // State
    const [exportTypes, setExportTypes] = useState([]);
    const [selectedExportType, setSelectedExportType] = useState(initialType || null);
    const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
    const [filters, setFilters] = useState({});
    const [exportFormat, setExportFormat] = useState('csv');
    const [exportData, setExportData] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [exportHistory, setExportHistory] = useState([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Load export types on mount
    useEffect(() => {
        const loadExportTypes = async () => {
            try {
                setIsLoadingTypes(true);
                const response = await exportService.getExportTypes();
                if (response.success) {
                    setExportTypes(response.data);
                } else {
                    setError('Failed to load export types');
                }
            } catch (err) {
                console.error(err);
                setError('Error loading export types');
            } finally {
                setIsLoadingTypes(false);
            }
        };
        loadExportTypes();
    }, []);

    // Dynamic filter configuration based on export type
    const getFilterConfig = () => {
        if (!selectedExportType) return {};
        if (selectedExportType === 'applicants') {
            return {
                status: {
                    label: 'Status',
                    type: 'select',
                    options: [
                        { value: 'all', label: 'All' },
                        { value: 'applied', label: 'Applied' },
                        { value: 'shortlisted', label: 'Shortlisted' },
                        { value: 'interviewed', label: 'Interviewed' },
                        { value: 'hired', label: 'Hired' },
                        { value: 'rejected', label: 'Rejected' },
                    ],
                },
                jobId: {
                    label: 'Job',
                    type: 'select',
                    options: [
                        { value: 'all', label: 'All Jobs' },
                        // In real app, fetch jobs from API
                        { value: 'job_1', label: 'Senior Developer' },
                        { value: 'job_2', label: 'Product Manager' },
                    ],
                },
            };
        } else if (selectedExportType === 'jobs') {
            return {
                status: {
                    label: 'Status',
                    type: 'select',
                    options: [
                        { value: 'all', label: 'All' },
                        { value: 'published', label: 'Published' },
                        { value: 'draft', label: 'Draft' },
                        { value: 'closed', label: 'Closed' },
                    ],
                },
            };
        } else if (selectedExportType === 'applications') {
            return {
                status: {
                    label: 'Status',
                    type: 'select',
                    options: [
                        { value: 'all', label: 'All' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'reviewed', label: 'Reviewed' },
                        { value: 'shortlisted', label: 'Shortlisted' },
                        { value: 'rejected', label: 'Rejected' },
                    ],
                },
            };
        }
        return {};
    };

    const handleExportTypeSelect = (typeId) => {
        setSelectedExportType(typeId);
        setExportData(null);
        setPreviewData([]);
        setFilters({});
    };

    const handleDateRangeChange = (start, end) => {
        setDateRange({ startDate: start, endDate: end });
    };

    const handleFiltersApply = (appliedFilters) => {
        setFilters(appliedFilters);
    };

    const handleGenerateExport = async () => {
        if (!selectedExportType) {
            setError('Please select an export type');
            return;
        }
        if (!dateRange.startDate || !dateRange.endDate) {
            setError('Please select a date range');
            return;
        }

        setIsGenerating(true);
        setError(null);
        try {
            const response = await exportService.generateExport(
                selectedExportType,
                dateRange,
                filters,
                exportFormat
            );
            if (response.success) {
                const exportedRows = Array.isArray(response.data?.data)
                    ? response.data.data
                    : Array.isArray(response.data?.data?.items)
                        ? response.data.data.items
                        : response.data?.data
                            ? [response.data.data]
                            : [];

                setExportData(response.data);
                setPreviewData(exportedRows.slice(0, 10));
                setSuccess('Export generated successfully');
                // Add to history
                setExportHistory(prev => [{
                    exportId: response.data.exportId,
                    exportType: selectedExportType,
                    format: exportFormat,
                    generatedAt: new Date().toISOString(),
                    recordCount: response.data.recordCount,
                    status: 'completed',
                }, ...prev.slice(0, 4)]);
            } else {
                setError('Failed to generate export');
            }
        } catch (err) {
            console.error(err);
            setError('Error generating export');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        if (!exportData) return;
        try {
            await exportService.downloadExport(exportData.exportId);
            setSuccess('Download started');
        } catch (err) {
            setError('Download failed');
        }
    };

    const handleRegenerate = (exportId) => {
        setSuccess('Regenerating export...');
        handleGenerateExport();
    };

    // Preview table columns (dynamic based on export type)
    const getPreviewColumns = () => {
        if (previewData.length === 0) return [];
        const firstItem = previewData[0];
        return Object.keys(firstItem).map(key => ({
            key,
            label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            sortable: true,
        }));
    };

    // History columns
    const historyColumns = [
        { key: 'generatedAt', label: 'Date', sortable: true },
        { key: 'exportType', label: 'Type', sortable: true },
        { key: 'format', label: 'Format', sortable: true },
        { key: 'recordCount', label: 'Records', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'actions', label: 'Actions', sortable: false },
    ];

    const renderHistoryCell = (key, value, row) => {
        if (key === 'status') {
            return <span className={`${styles.statusBadge} ${styles[value]}`}>{value}</span>;
        }
        if (key === 'actions') {
            return (
                <Button size="small" variant="outline" onClick={() => handleRegenerate(row.exportId)}>
                    Regenerate
                </Button>
            );
        }
        if (key === 'generatedAt') {
            return new Date(value).toLocaleString();
        }
        if (key === 'exportType') {
            const type = exportTypes.find(t => t.id === value);
            return type ? type.name : value;
        }
        return value;
    };

    if (isLoadingTypes) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <LoadingSpinner size="large" />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <AdminPageHeader
                title="Export Data"
                description="Export company data in various formats"
                breadcrumb={[
                    { label: 'Dashboard', href: '/dashboard/company' },
                    { label: 'Export', href: '#' },
                ]}
                actions={
                    <Button
                        variant="primary"
                        onClick={handleGenerateExport}
                        disabled={isGenerating || !selectedExportType}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Export'}
                    </Button>
                }
            />

            {success && <SuccessMessage message={success} onDismiss={() => setSuccess(null)} autoDismiss={5000} />}
            {error && <ErrorMessage message={error} onDismiss={() => setError(null)} autoDismiss={5000} />}

            {/* Export Type Selector */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Export Type</h2>
                <div className={styles.exportTypeGrid}>
                    {exportTypes.map(type => (
                        <ExportTypeCard
                            key={type.id}
                            type={type}
                            selected={selectedExportType === type.id}
                            onClick={handleExportTypeSelect}
                        />
                    ))}
                </div>
            </div>

            {/* Date Range */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Date Range</h2>
                <div className={styles.dateRangeContainer}>
                    <DatePicker
                        selectedDate={dateRange.startDate ? new Date(dateRange.startDate) : null}
                        onChange={(date) => handleDateRangeChange(date, dateRange.endDate)}
                        placeholder="Start Date"
                    />
                    <span className={styles.dateSeparator}>to</span>
                    <DatePicker
                        selectedDate={dateRange.endDate ? new Date(dateRange.endDate) : null}
                        onChange={(date) => handleDateRangeChange(dateRange.startDate, date)}
                        placeholder="End Date"
                    />
                </div>
            </div>

            {/* Dynamic Filters */}
            {selectedExportType && Object.keys(getFilterConfig()).length > 0 && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Filters</h2>
                    <FilterPanel
                        filters={getFilterConfig()}
                        onApply={handleFiltersApply}
                        onReset={() => setFilters({})}
                        showReset
                    />
                </div>
            )}

            {/* Format Selector & Download */}
            {exportData && previewData.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.previewHeader}>
                        <h2 className={styles.sectionTitle}>Preview & Export</h2>
                        <div className={styles.exportControls}>
                            <select
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value)}
                                className={styles.formatSelect}
                            >
                                <option value="csv">CSV</option>
                                <option value="excel">Excel</option>
                                <option value="pdf">PDF</option>
                            </select>
                            <Button variant="primary" onClick={handleDownload}>
                                Download {exportFormat.toUpperCase()}
                            </Button>
                        </div>
                    </div>
                    <div className={styles.previewTable}>
                        <DataTable
                            data={previewData}
                            columns={getPreviewColumns()}
                            keyField="id"
                            emptyMessage="No preview data available"
                        />
                        <div className={styles.previewNote}>
                            Showing first {previewData.length} records. Full export will include all matching records.
                        </div>
                    </div>
                </div>
            )}

            {/* Export History */}
            {exportHistory.length > 0 && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Recent Exports</h2>
                    <DataTable
                        data={exportHistory}
                        columns={historyColumns}
                        keyField="exportId"
                        renderCell={renderHistoryCell}
                        emptyMessage="No export history"
                    />
                </div>
            )}
        </div>
    );
};

export default CompanyExport;