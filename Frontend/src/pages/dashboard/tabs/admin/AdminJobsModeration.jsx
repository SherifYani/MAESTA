/**
 * @file AdminJobsModeration.jsx
 * @description Admin jobs moderation page – review, approve, reject, edit job postings.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-05-04
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { Button } from '../../../../components/common/Button';
import { Badge } from '../../../../components/common/Badge';
import { FilterPanel } from '../../../../components/common/FilterPanel';
import { Modal } from '../../../../components/common/Modal';
import { Input } from '../../../../components/common/Input';
import { SuccessMessage, ErrorMessage } from '../../../../components/common/Message';
import AdminPageHeader from './components/shared/AdminPageHeader/AdminPageHeader';
import AdminDataTable from './components/shared/AdminDataTable';
import * as adminService from '../../../../services/adminService';
import styles from './AdminJobsModeration.module.css';

const AdminJobsModeration = () => {
  // State
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ status: 'pending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [actionReason, setActionReason] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [editData, setEditData] = useState({ title: '', description: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'postedAt', direction: 'desc' });

  // Load jobs
  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 20,
        status: filters.status !== 'all' ? filters.status : undefined,
        search: searchTerm,
        sort: sortConfig.key,
        order: sortConfig.direction,
      };
      const response = await adminService.getJobsForModeration(params);
      if (response.success) {
        setJobs(response.data.jobs || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.totalItems || 0);
      } else {
        setError('Failed to load jobs');
      }
    } catch (err) {
      console.error(err);
      setError('Error loading jobs');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters, searchTerm, sortConfig]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleFilterReset = () => {
    setFilters({ status: 'pending' });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleApprove = (job) => {
    setSelectedJob(job);
    setActionType('approve');
    setActionReason('');
    setActionNotes('');
    setIsActionModalOpen(true);
  };

  const handleReject = (job) => {
    setSelectedJob(job);
    setActionType('reject');
    setActionReason('');
    setActionNotes('');
    setIsActionModalOpen(true);
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setEditData({
      title: job.title,
      description: job.description,
    });
    setIsEditModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedJob) return;
    try {
      let response;
      if (actionType === 'approve') {
        response = await adminService.approveJob(selectedJob.id, actionNotes);
      } else {
        response = await adminService.rejectJob(selectedJob.id, actionReason, actionNotes);
      }
      if (response.success) {
        setSuccess(`Job ${actionType}d successfully`);
        loadJobs();
      } else {
        setError(`Failed to ${actionType} job`);
      }
    } catch (err) {
      setError(`Error during ${actionType}`);
    } finally {
      setIsActionModalOpen(false);
      setSelectedJob(null);
    }
  };

  const confirmEdit = async () => {
    if (!selectedJob) return;
    try {
      const response = await adminService.editJob(selectedJob.id, editData);
      if (response.success) {
        setSuccess('Job updated successfully');
        loadJobs();
      } else {
        setError('Failed to update job');
      }
    } catch (err) {
      setError('Error updating job');
    } finally {
      setIsEditModalOpen(false);
      setSelectedJob(null);
    }
  };

  // Filter configuration
  const filterConfig = {
    status: {
      label: 'Status',
      type: 'select',
      options: [
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'flagged', label: 'Flagged' },
      ],
    },
  };

  // Table columns
  const getColumns = () => {
    return [
      {
        header: 'Title',
        accessor: 'title',
        sortable: true,
        render: (row) => (
          <div>
            <div className={styles.jobTitle}>{row.title}</div>
            <div className={styles.companyName}>{row.company}</div>
          </div>
        ),
      },
      {
        header: 'Posted By',
        accessor: 'postedBy',
        sortable: true,
      },
      {
        header: 'Posted Date',
        accessor: 'postedAt',
        sortable: true,
        render: (row) => new Date(row.postedAt).toLocaleDateString(),
      },
      {
        header: 'Location',
        accessor: 'location',
        sortable: true,
      },
      {
        header: 'Salary',
        accessor: 'salary',
        sortable: true,
      },
      {
        header: 'Status',
        accessor: 'status',
        sortable: true,
        render: (row) => {
          let variant = 'pending';
          if (row.status === 'approved') variant = 'success';
          if (row.status === 'rejected') variant = 'error';
          if (row.status === 'flagged') variant = 'warning';
          return <Badge variant={variant}>{row.status}</Badge>;
        },
      },
      {
        header: 'Actions',
        accessor: 'actions',
        sortable: false,
        render: (row) => (
          <div className={styles.actionButtons}>
            <Button size="small" variant="outline" onClick={() => handleJobClick(row)}>View</Button>
            {row.status === 'pending' && (
              <>
                <Button size="small" variant="success" onClick={() => handleApprove(row)}>Approve</Button>
                <Button size="small" variant="danger" onClick={() => handleReject(row)}>Reject</Button>
                <Button size="small" variant="outline" onClick={() => handleEdit(row)}>Edit</Button>
              </>
            )}
          </div>
        ),
      },
    ];
  };

  if (isLoading && jobs.length === 0) {
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
        title="Jobs Moderation"
        description="Review, approve, or reject job postings"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard/admin' },
          { label: 'Jobs Moderation', href: '#' },
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
        data={jobs}
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
        onRowClick={handleJobClick}
        sortConfig={sortConfig}
        onSort={(key) => {
          setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
          }));
          setCurrentPage(1);
        }}
      />

      {/* Job Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Job Details"
        size="lg"
        actions={
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
        }
      >
        {selectedJob && (
          <div className={styles.modalContent}>
            <div className={styles.detailSection}>
              <h3>{selectedJob.title}</h3>
              <p className={styles.companyInfo}>{selectedJob.company} • {selectedJob.location}</p>
              <p><strong>Salary:</strong> {selectedJob.salary}</p>
              <p><strong>Type:</strong> {selectedJob.jobType || 'Full-time'}</p>
              <p><strong>Posted:</strong> {new Date(selectedJob.postedAt).toLocaleString()}</p>
              <p><strong>Status:</strong> <Badge variant={selectedJob.status === 'pending' ? 'pending' : selectedJob.status}>{selectedJob.status}</Badge></p>
            </div>
            <div className={styles.detailSection}>
              <h4>Description</h4>
              <p>{selectedJob.description}</p>
            </div>
            {selectedJob.requirements && (
              <div className={styles.detailSection}>
                <h4>Requirements</h4>
                <ul>
                  {selectedJob.requirements.map((req, i) => <li key={i}>{req}</li>)}
                </ul>
              </div>
            )}
            {selectedJob.benefits && (
              <div className={styles.detailSection}>
                <h4>Benefits</h4>
                <ul>
                  {selectedJob.benefits.map((ben, i) => <li key={i}>{ben}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Approve/Reject Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Job`}
        size="md"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>Cancel</Button>
            <Button variant={actionType === 'approve' ? 'success' : 'danger'} onClick={confirmAction}>
              Confirm {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to <strong>{actionType}</strong> the job <strong>{selectedJob?.title}</strong>?</p>
        {actionType === 'reject' && (
          <div className={styles.modalField}>
            <label className={styles.formLabel}>Reason *</label>
            <Input
              type="text"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Why is this job being rejected?"
            />
          </div>
        )}
        <div className={styles.modalField}>
          <label className={styles.formLabel}>Notes (optional)</label>
          <textarea
            value={actionNotes}
            onChange={(e) => setActionNotes(e.target.value)}
            className={styles.textarea}
            placeholder="Internal notes..."
            rows={3}
          />
        </div>
      </Modal>

      {/* Edit Job Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Job"
        size="lg"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={confirmEdit}>Save Changes</Button>
          </>
        }
      >
        <div className={styles.editForm}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Title</label>
            <Input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Description</label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              className={styles.textarea}
              rows={6}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminJobsModeration;