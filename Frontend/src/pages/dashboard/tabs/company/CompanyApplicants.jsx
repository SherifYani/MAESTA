/**
 * @file CompanyApplicants.jsx
 * @description Company applicants management page – view, filter, rate, update status.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-05-04
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { Button } from '../../../../components/common/Button';
import { Badge } from '../../../../components/common/Badge';
import { FilterPanel } from '../../../../components/common/FilterPanel';
import { Modal } from '../../../../components/common/Modal';
import { SuccessMessage, ErrorMessage } from '../../../../components/common/Message';
import AdminPageHeader from '../admin/components/shared/AdminPageHeader/AdminPageHeader';
import AdminDataTable from '../admin/components/shared/AdminDataTable';
import jobService from '../../../../services/jobService';
import styles from './CompanyApplicants.module.css';

const CompanyApplicants = () => {
  const navigate = useNavigate();
  // State
  const [applicants, setApplicants] = useState([]);
  const [, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'appliedAt', direction: 'desc' });

  // Load applicants
  const loadApplicants = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await jobService.getCompanyApplicants();
      const items = Array.isArray(data) ? data : (data?.items || data?.data || []);
      if (items) {
        const mappedApplicants = items.map(app => ({
            id: app.applicationId || app.id,
            applicantId: app.applicantId,
            name: app.applicantName || 'Applicant',
            email: app.applicantEmail || 'N/A',
            phone: app.applicantPhone || 'N/A',
            jobId: app.jobId,
            jobTitle: app.jobTitle,
            appliedAt: app.appliedAt,
            status: app.status?.toLowerCase() || 'pending',
            matchScore: Math.round(app.matchScore || 0),
            cvUrl: app.cvUrl || '',
            notes: app.coverLetter || ''
        }));

        setApplicants(mappedApplicants);
        setTotalPages(1); // No backend pagination yet
        setTotalItems(mappedApplicants.length);
      } else {
        setError('Failed to load applicants');
      }
    } catch (err) {
      console.error(err);
      setError('Error loading applicants');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplicants();
  }, [loadApplicants]);

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

  const handleApplicantClick = (applicant) => {
    setSelectedApplicant(applicant);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (applicant, status) => {
    setSelectedApplicant(applicant);
    setNewStatus(status);
    setIsStatusModalOpen(true);
  };

  const handleScheduleInterview = (applicant) => {
    navigate(`/dashboard/interviews/schedule?applicationId=${applicant.id}`);
  };

  const handleViewResume = (applicant) => {
    if (applicant.cvUrl) {
      window.open(applicant.cvUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setError('This applicant has no resume URL.');
  };

  const confirmStatusUpdate = async () => {
    if (!selectedApplicant) return;
    try {
      await jobService.updateApplicationStatus(selectedApplicant.id, newStatus);
      setSuccess(`Applicant status updated to ${newStatus}`);
      loadApplicants();
    } catch (err) {
      setError('Error updating status');
    } finally {
      setIsStatusModalOpen(false);
      setSelectedApplicant(null);
    }
  };

  // Filter config
  const filterConfig = {
    jobId: {
      label: 'Job',
      type: 'select',
      options: [
        { value: 'all', label: 'All Jobs' },
        { value: 'job_1', label: 'Senior Developer' },
        { value: 'job_2', label: 'Product Manager' },
      ],
    },
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
  };

  // Table columns
  const getColumns = () => {
    return [
      {
        header: 'Applicant',
        accessor: 'name',
        sortable: true,
        render: (row) => (
          <div>
            <div className={styles.applicantName}>{row.name}</div>
            <div className={styles.applicantEmail}>{row.email}</div>
          </div>
        ),
      },
      {
        header: 'Job Applied',
        accessor: 'jobTitle',
        sortable: true,
      },
      {
        header: 'Applied Date',
        accessor: 'appliedAt',
        sortable: true,
        render: (row) => new Date(row.appliedAt).toLocaleDateString(),
      },
      {
        header: 'Status',
        accessor: 'status',
        sortable: true,
        render: (row) => {
          let variant = 'default';
          if (row.status === 'shortlisted') variant = 'success';
          if (row.status === 'interviewed') variant = 'info';
          if (row.status === 'hired') variant = 'success';
          if (row.status === 'rejected') variant = 'error';
          return <Badge variant={variant}>{row.status}</Badge>;
        },
      },
      {
        header: 'Match',
        accessor: 'matchScore',
        sortable: true,
        render: (row) => `${row.matchScore || 0}%`,
      },
      {
        header: 'Actions',
        accessor: 'actions',
        sortable: false,
        render: (row) => (
          <div className={styles.actionButtons}>
            <Button size="small" variant="outline" onClick={() => handleApplicantClick(row)}>View</Button>
            <select
              value=""
              onChange={(e) => handleUpdateStatus(row, e.target.value)}
              className={styles.statusSelect}
            >
              <option value="">Update Status</option>
              <option value="shortlisted">Shortlist</option>
              <option value="interviewed">Mark Interviewed</option>
              <option value="hired">Hire</option>
              <option value="rejected">Reject</option>
            </select>
            <Button size="small" variant="outline" onClick={() => handleViewResume(row)}>Resume</Button>
            <Button size="small" variant="primary" onClick={() => handleScheduleInterview(row)}>Schedule</Button>
          </div>
        ),
      },
    ];
  };

  // Header actions
  const headerActions = (
    <Button variant="primary" onClick={() => navigate('/dashboard/export?type=applicants')}>
      Export Applicants
    </Button>
  );

  if (isLoading && applicants.length === 0) {
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
        title="Applicants Management"
        description="View, rate, and manage all job applicants"
        actions={headerActions}
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard/company' },
          { label: 'Applicants', href: '#' },
        ]}
      />

      {success && <SuccessMessage message={success} onDismiss={() => setSuccess(null)} autoDismiss={5000} />}
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} autoDismiss={5000} />}

      <FilterPanel
        filters={filterConfig}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
        showReset
      />

      <AdminDataTable
        title=""
        columns={getColumns()}
        data={applicants}
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
        onRowClick={handleApplicantClick}
        sortConfig={sortConfig}
        onSort={(key) => {
          setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
          }));
          setCurrentPage(1);
        }}
      />

      {/* Applicant Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Applicant Details"
        size="lg"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
            {selectedApplicant && selectedApplicant.status !== 'hired' && (
              <Button variant="primary" onClick={() => handleScheduleInterview(selectedApplicant)}>
                Schedule Interview
              </Button>
            )}
          </>
        }
      >
        {selectedApplicant && (
          <div className={styles.modalContent}>
            <div className={styles.profileHeader}>
              {selectedApplicant.profilePicture ? (
                <img src={selectedApplicant.profilePicture} alt={selectedApplicant.name} className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>{selectedApplicant.name.charAt(0)}</div>
              )}
              <div>
                <h3>{selectedApplicant.name}</h3>
                <p>{selectedApplicant.email} • {selectedApplicant.phone}</p>
              </div>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Applied for:</span>
              <span>{selectedApplicant.jobTitle}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Applied on:</span>
              <span>{new Date(selectedApplicant.appliedAt).toLocaleString()}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status:</span>
              <Badge variant={
                selectedApplicant.status === 'shortlisted' ? 'success' :
                selectedApplicant.status === 'interviewed' ? 'info' :
                selectedApplicant.status === 'hired' ? 'success' :
                selectedApplicant.status === 'rejected' ? 'error' : 'default'
              }>{selectedApplicant.status}</Badge>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Match Score:</span>
              <span>{selectedApplicant.matchScore || 0}%</span>
            </div>
            {selectedApplicant.notes && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Notes:</span>
                <span>{selectedApplicant.notes}</span>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Update Status to ${newStatus}`}
        size="md"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={confirmStatusUpdate}>Confirm</Button>
          </>
        }
      >
        <p>Change <strong>{selectedApplicant?.name}</strong>'s status to <strong>{newStatus}</strong>?</p>
      </Modal>

    </div>
  );
};

export default CompanyApplicants;