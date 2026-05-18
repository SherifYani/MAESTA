import React, { useState, useEffect } from 'react';
import { 
    FilterPanel, 
    DataTable, 
    Pagination, 
    Badge, 
    Modal, 
    Button,
    LoadingSpinner,
    SuccessMessage,
    ErrorMessage
} from '../../../../components/common';
import * as adminService from '../../../../services/adminService';
import styles from './AdminReports.module.css';

const AdminReports = () => {
    // State
    const [reportTypes, setReportTypes] = useState([]);
    const [selectedReportType, setSelectedReportType] = useState(null);
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [filters, setFilters] = useState({});
    
    // Data state
    const [reportData, setReportData] = useState(null);
    const [reportHistory, setReportHistory] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    
    // UI state
    const [historyPage, setHistoryPage] = useState(1);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState('csv');
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        loadReportTypes();
        loadReportHistory();
    }, []);

    const loadReportTypes = async () => {
        try {
            const res = await adminService.getReportTypes();
            if (res.success) {
                setReportTypes(res.data);
                if (res.data.length > 0) setSelectedReportType(res.data[0].id);
            }
        } catch (error) {
            setErrorMsg("Failed to load report types.");
        }
    };

    const loadReportHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const res = await adminService.getReportHistory();
            if (res.success) {
                setReportHistory(res.data || []);
            }
        } catch (error) {
            console.error("Failed to load history", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedReportType) {
            setErrorMsg("Please select a report type first.");
            return;
        }
        setIsGenerating(true);
        try {
            const data = await adminService.generateReport(
                selectedReportType,
                dateRange,
                filters
            );
            if (data.success) {
                setReportData(data.data);
                setSuccessMsg("Report generated successfully!");
            } else {
                setErrorMsg("Failed to generate report.");
            }
        } catch (error) {
            setErrorMsg("Error generating report.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExport = async () => {
        if (!reportData) return;
        try {
            const res = await adminService.downloadReport(reportData.reportId, exportFormat);
            if (res.success) {
                setSuccessMsg(`Report exported as ${exportFormat.toUpperCase()}`);
                setIsExportModalOpen(false);
            }
        } catch (error) {
            setErrorMsg("Failed to export report.");
        }
    };

    const reportFilters = {
        dateRange: {
            label: "Date Range",
            type: "dateRange",
        }
    };

    const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Metric Name" },
        { key: "value", label: "Value", sortable: true },
    ];

    const historyColumns = [
        { key: "reportId", label: "Report ID" },
        { key: "reportType", label: "Type" },
        { key: "generatedAt", label: "Generated Date" },
        { 
            key: "status", 
            label: "Status",
            render: (val) => <Badge variant="success">Completed</Badge>
        },
        {
            key: "actions",
            label: "Actions",
            render: (val, row) => (
                <Button size="small" variant="outline" onClick={() => adminService.downloadReport(row.reportId, 'pdf')}>
                    Download
                </Button>
            )
        }
    ];

    // Pagination logic for history
    const historyPageSize = 5;
    const historyTotalPages = Math.ceil(reportHistory.length / historyPageSize);
    const paginatedHistory = reportHistory.slice(
        (historyPage - 1) * historyPageSize,
        historyPage * historyPageSize
    );

    return (
        <div className={styles.container}>
            <SuccessMessage message={successMsg} onDismiss={() => setSuccessMsg('')} />
            <ErrorMessage message={errorMsg} onDismiss={() => setErrorMsg('')} />

            <div className={styles.header}>
                <h1>Reports & Analytics</h1>
                <p>Generate, view, and export platform metrics and data.</p>
            </div>

            {/* Top section: Report type cards */}
            <div className={styles.typeCards}>
                {reportTypes.map((type) => (
                    <div 
                        key={type.id} 
                        className={`${styles.card} ${selectedReportType === type.id ? styles.selected : ''}`}
                        onClick={() => setSelectedReportType(type.id)}
                    >
                        <h3>{type.name}</h3>
                        <p>{type.description}</p>
                    </div>
                ))}
            </div>

            {/* Middle section: Filter panel */}
            <div className={styles.filterSection}>
                <h3>Configuration</h3>
                <FilterPanel 
                    filters={reportFilters}
                    onApply={(newFilters) => {
                        if (newFilters.dateRange) {
                            setDateRange(newFilters.dateRange);
                        }
                        setFilters(newFilters);
                    }}
                    onReset={() => {
                        setDateRange({ start: null, end: null });
                        setFilters({});
                    }}
                />
                <div className={styles.generateAction}>
                    <Button 
                        variant="primary" 
                        onClick={handleGenerate} 
                        disabled={isGenerating || !selectedReportType}
                        loading={isGenerating}
                    >
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* Bottom section: Report preview table + export options */}
            {reportData && (
                <div className={styles.previewSection}>
                    <div className={styles.previewHeader}>
                        <h3>Report Preview: {reportTypes.find(t => t.id === reportData.reportType)?.name}</h3>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(true)}>
                            Export Report
                        </Button>
                    </div>
                    
                    <div className={styles.summaryStats}>
                        {Object.entries(reportData.summary || {}).map(([key, value]) => (
                            <div key={key} className={styles.statBox}>
                                <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                <strong>{value}</strong>
                            </div>
                        ))}
                    </div>

                    <DataTable 
                        data={reportData.data || []}
                        columns={columns}
                        keyField="id"
                        emptyMessage="No data available for this report."
                    />
                </div>
            )}

            {/* Footer: Report history */}
            <div className={styles.historySection}>
                <h3>Report Generation History</h3>
                {isLoadingHistory ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        <DataTable 
                            data={paginatedHistory}
                            columns={historyColumns}
                            keyField="reportId"
                            emptyMessage="No reports generated yet."
                        />
                        {reportHistory.length > 0 && (
                            <Pagination 
                                currentPage={historyPage}
                                totalPages={historyTotalPages}
                                onPageChange={setHistoryPage}
                                showTotal={true}
                                totalItems={reportHistory.length}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Export Modal */}
            <Modal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                title="Export Report"
                actions={
                    <>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleExport}>Download</Button>
                    </>
                }
            >
                <div className={styles.exportModalContent}>
                    <p>Select export format for the generated report:</p>
                    <div className={styles.formatOptions}>
                        <label>
                            <input 
                                type="radio" 
                                name="format" 
                                value="csv" 
                                checked={exportFormat === 'csv'}
                                onChange={(e) => setExportFormat(e.target.value)}
                            />
                            CSV Document (.csv)
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                name="format" 
                                value="pdf" 
                                checked={exportFormat === 'pdf'}
                                onChange={(e) => setExportFormat(e.target.value)}
                            />
                            PDF Document (.pdf)
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                name="format" 
                                value="xlsx" 
                                checked={exportFormat === 'xlsx'}
                                onChange={(e) => setExportFormat(e.target.value)}
                            />
                            Excel Spreadsheet (.xlsx)
                        </label>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminReports;