/**
 * @file AdminActivities.jsx
 * @description Admin activities page – view system activity log with filtering, search, and export.
 * @author Sherif Talaat
 * @date 2026-05-04
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-05-04
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { Button } from '../../../../components/common/Button';
import { Badge } from '../../../../components/common/Badge';
import { FilterPanel } from '../../../../components/common/FilterPanel';
import { Modal } from '../../../../components/common/Modal';
import { SuccessMessage, ErrorMessage } from '../../../../components/common/Message';
import AdminPageHeader from './components/shared/AdminPageHeader/AdminPageHeader';
import AdminDataTable from './components/shared/AdminDataTable';
import * as adminService from '../../../../services/adminService';
import styles from './AdminActivities.module.css';

const AdminActivities = () => {
    // State
    const [activities, setActivities] = useState([]);
    const [activityTypes, setActivityTypes] = useState([]);
    const [filters, setFilters] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState('csv');
    const [showExportConfirm, setShowExportConfirm] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });

    // Load activity types on mount
    useEffect(() => {
        const loadActivityTypes = async () => {
            try {
                const response = await adminService.getActivityTypes();
                if (response.success) {
                    setActivityTypes(response.data);
                }
            } catch (err) {
                console.error('Failed to load activity types', err);
            }
        };
        loadActivityTypes();
    }, []);

    // Load activities
    const loadActivities = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                limit: 20,
                type: filters.type !== 'all' ? filters.type : undefined,
                userId: filters.userId,
                startDate: filters.startDate,
                endDate: filters.endDate,
                search: searchTerm,
                sort: sortConfig.key,
                order: sortConfig.direction,
            };
            const response = await adminService.getActivities(params);
            if (response.success) {
                setActivities(response.data.activities || []);
                setTotalPages(response.data.pagination?.totalPages || 1);
                setTotalItems(response.data.pagination?.totalItems || 0);
            } else {
                setError('Failed to load activities');
            }
        } catch (err) {
            console.error(err);
            setError('Error loading activities');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, filters, searchTerm, sortConfig]);

    useEffect(() => {
        loadActivities();
    }, [loadActivities]);

    const handleFilterApply = (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleFilterReset = () => {
        setFilters({});
        setSearchTerm('');
        setCurrentPage(1);
    };

    const handleSearchChange = (term) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    const handleActivityClick = (activity) => {
        setSelectedActivity(activity);
        setIsModalOpen(true);
    };

    const handleExport = () => {
        setShowExportConfirm(true);
    };

    const handleExportConfirm = async () => {
        setIsExporting(true);
        setShowExportConfirm(false);
        try {
            const exportFilters = { ...filters, search: searchTerm };
            await adminService.exportActivities(exportFormat, exportFilters);
            setSuccess(`Activities exported as ${exportFormat.toUpperCase()}`);
        } catch (err) {
            setError('Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    // Filter configuration for FilterPanel
    const getFilterConfig = () => {
        const baseFilters = {
            type: {
                label: 'Activity Type',
                type: 'select',
                options: [
                    { value: 'all', label: 'All Types' },
                    ...activityTypes.map(t => ({ value: t.id, label: t.name })),
                ],
            },
            userId: {
                label: 'User ID',
                type: 'search',
                placeholder: 'Filter by user ID...',
            },
            startDate: {
                label: 'Start Date',
                type: 'date',
                placeholder: 'From',
            },
            endDate: {
                label: 'End Date',
                type: 'date',
                placeholder: 'To',
            },
        };
        return baseFilters;
    };

    // Define columns for AdminDataTable
    const getColumns = () => {
        return [
            {
                header: 'Timestamp',
                accessor: 'timestamp',
                sortable: true,
                render: (row) => new Date(row.timestamp).toLocaleString(),
            },
            {
                header: 'User',
                accessor: 'user',
                sortable: true,
                render: (row) => (
                    <div>
                        <div className={styles.userName}>{row.user}</div>
                        <div className={styles.userId}>{row.userId}</div>
                    </div>
                ),
            },
            {
                header: 'Action',
                accessor: 'action',
                sortable: true,
            },
            {
                header: 'Type',
                accessor: 'type',
                sortable: true,
                render: (row) => {
                    const type = activityTypes.find(t => t.id === row.type);
                    return <Badge variant="info">{type?.name || row.type}</Badge>;
                },
            },
            {
                header: 'Details',
                accessor: 'details',
                sortable: false,
                render: (row) => (
                    <Button size="small" variant="outline" onClick={(e) => { e.stopPropagation(); handleActivityClick(row); }}>
                        View
                    </Button>
                ),
            },
        ];
    };

    // Header actions (Export button and format selector)
    const headerActions = (
        <div className={styles.headerActions}>
            <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className={styles.formatSelect}
            >
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
            </select>
            <Button variant="primary" onClick={handleExport} disabled={isExporting}>
                {isExporting ? 'Exporting...' : 'Export Log'}
            </Button>
        </div>
    );

    if (isLoading && activities.length === 0) {
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
                title="Activity Log"
                description="View and export system activity history"
                actions={headerActions}
                breadcrumb={[
                    { label: 'Dashboard', href: '/dashboard/admin' },
                    { label: 'Activities', href: '#' },
                ]}
            />

            {success && <SuccessMessage message={success} onDismiss={() => setSuccess(null)} autoDismiss={5000} />}
            {error && <ErrorMessage message={error} onDismiss={() => setError(null)} autoDismiss={5000} />}

            <FilterPanel
                filters={getFilterConfig()}
                onApply={handleFilterApply}
                onReset={handleFilterReset}
                showReset
            />

            <AdminDataTable
                title=""
                columns={getColumns()}
                data={activities}
                searchable={true}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                filterable={false}
                pagination={true}
                pageSize={20}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                onRowClick={handleActivityClick}
                sortConfig={sortConfig}
                onSort={(key) => {
                    setSortConfig(prev => ({
                        key,
                        direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
                    }));
                    setCurrentPage(1);
                }}
            />

            {/* Activity Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Activity Details"
                size="lg"
                actions={
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                        Close
                    </Button>
                }
            >
                {selectedActivity && (
                    <div className={styles.modalContent}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Activity ID:</span>
                            <span>{selectedActivity.id}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Timestamp:</span>
                            <span>{new Date(selectedActivity.timestamp).toLocaleString()}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>User:</span>
                            <span>{selectedActivity.user} ({selectedActivity.userId})</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Action:</span>
                            <span>{selectedActivity.action}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>IP Address:</span>
                            <span>{selectedActivity.ipAddress || 'N/A'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>User Agent:</span>
                            <span className={styles.userAgent}>{selectedActivity.userAgent || 'N/A'}</span>
                        </div>
                        {selectedActivity.details && (
                            <div className={styles.detailsSection}>
                                <span className={styles.detailLabel}>Additional Details:</span>
                                <pre className={styles.jsonPreview}>{JSON.stringify(selectedActivity.details, null, 2)}</pre>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Export Confirmation Modal */}
            <Modal
                isOpen={showExportConfirm}
                onClose={() => setShowExportConfirm(false)}
                title="Confirm Export"
                size="sm"
                actions={
                    <>
                        <Button variant="outline" onClick={() => setShowExportConfirm(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleExportConfirm}>Export</Button>
                    </>
                }
            >
                <p>Export activity log as <strong>{exportFormat.toUpperCase()}</strong>?</p>
                <p className={styles.exportNote}>This may take a moment for large datasets.</p>
            </Modal>
        </div>
    );
};

export default AdminActivities;