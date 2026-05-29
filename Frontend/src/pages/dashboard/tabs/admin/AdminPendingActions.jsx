/**
 * @file AdminPendingActions.jsx
 * @description Admin pending actions detail page – view, filter, and bulk approve/reject pending items.
 * @author Sherif Talaat
 * @date 2026-05-04
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-05-04
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import styles from './AdminPendingActions.module.css';

const AdminPendingActions = () => {
  const { actionId } = useParams();
  const navigate = useNavigate();

  // State
  const [items, setItems] = useState([]);
  const [actionName, setActionName] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [filters, setFilters] = useState({ status: 'pending', priority: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bulkAction, setBulkAction] = useState(null);
  const [bulkReason, setBulkReason] = useState('');

  // Sort config for AdminDataTable
  const [sortConfig, setSortConfig] = useState({ key: 'submittedAt', direction: 'desc' });

  // Load pending items
  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 20,
        status: filters.status !== 'all' ? filters.status : undefined,
        priority: filters.priority !== 'all' ? filters.priority : undefined,
        startDate: filters.startDate,
        endDate: filters.endDate,
        sort: sortConfig.key,
        order: sortConfig.direction,
      };
      const response = await adminService.getPendingActions(actionId, params);
      if (response.success) {
        setItems(response.data.items || []);
        setActionName(response.data.actionName || 'Pending Items');
        setTotalPages(Math.ceil((response.data.totalCount || 0) / 20));
        setTotalItems(response.data.totalCount || 0);
      } else {
        setError('Failed to load pending items');
      }
    } catch (err) {
      console.error(err);
      setError('Error loading pending items');
    } finally {
      setIsLoading(false);
    }
  }, [actionId, currentPage, filters, sortConfig]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Handle filter apply
  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setSelectedItems([]);
  };

  const handleFilterReset = () => {
    setFilters({ status: 'pending', priority: 'all' });
    setCurrentPage(1);
    setSelectedItems([]);
  };

  // Handle row selection (via AdminDataTable)
  const handleSelectionChange = (selectedKeys) => {
    setSelectedItems(selectedKeys);
  };

  // Bulk action handlers
  const openBulkModal = (actionType) => {
    if (selectedItems.length === 0) {
      setError('Please select at least one item');
      return;
    }
    setBulkAction(actionType);
    setBulkReason('');
    setShowConfirmModal(true);
  };

  const handleBulkActionConfirm = async () => {
    setActionLoading(true);
    setShowConfirmModal(false);
    try {
      let response;
      if (bulkAction === 'approve') {
        response = await adminService.bulkApprove(actionId, selectedItems, bulkReason);
      } else {
        response = await adminService.bulkReject(actionId, selectedItems, bulkReason);
      }
      if (response.success) {
        setSuccess(`${response.data.approvedCount || response.data.rejectedCount || selectedItems.length} items ${bulkAction}d successfully`);
        setSelectedItems([]);
        loadItems(); // Refresh list
      } else {
        setError(`Failed to ${bulkAction} items`);
      }
    } catch (err) {
      console.error(err);
      setError(`Error during bulk ${bulkAction}`);
    } finally {
      setActionLoading(false);
      setBulkAction(null);
    }
  };

  // Navigate to resolve page for individual item
  const handleViewItem = (item) => {
    navigate(`/dashboard/resolve/${actionId}?itemId=${item.id}`);
  };

  // Handle individual approve/reject (if needed – can also redirect to resolve page)
  const handleIndividualAction = async (item, actionType) => {
    setActionLoading(true);
    try {
      let response;
      if (actionType === 'approve') {
        response = await adminService.bulkApprove(actionId, [item.id], '');
      } else {
        response = await adminService.bulkReject(actionId, [item.id], '');
      }
      if (response.success) {
        setSuccess(`Item ${actionType}d successfully`);
        loadItems();
        setSelectedItems([]);
      } else {
        setError(`Failed to ${actionType} item`);
      }
    } catch (err) {
      console.error(err);
      setError(`Error during ${actionType}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Define columns for AdminDataTable
  const getColumns = () => {
    const baseColumns = [
      {
        header: 'ID',
        accessor: 'id',
        sortable: true,
        render: (row) => <span className={styles.idCell}>{row.id.substring(0, 8)}...</span>,
      },
      {
        header: 'Title / Name',
        accessor: 'title',
        sortable: true,
        render: (row) => (
          <div>
            <div className={styles.itemTitle}>{row.title}</div>
            {row.email && <div className={styles.itemSubtitle}>{row.email}</div>}
          </div>
        ),
      },
      {
        header: 'Submitted',
        accessor: 'submittedAt',
        sortable: true,
        render: (row) => new Date(row.submittedAt).toLocaleString(),
      },
      {
        header: 'Priority',
        accessor: 'priority',
        sortable: true,
        render: (row) => {
          let variant = 'low';
          if (row.priority === 'high') variant = 'high';
          else if (row.priority === 'medium') variant = 'medium';
          return <Badge variant={variant}>{row.priority || 'medium'}</Badge>;
        },
      },
      {
        header: 'Status',
        accessor: 'status',
        sortable: true,
        render: (row) => <Badge variant="pending">{row.status}</Badge>,
      },
      {
        header: 'Actions',
        accessor: 'actions',
        sortable: false,
        render: (row) => (
          <div className={styles.actionButtons}>
            <Button size="small" variant="outline" onClick={() => handleViewItem(row)}>
              View
            </Button>
            <Button size="small" variant="success" onClick={() => handleIndividualAction(row, 'approve')}>
              Approve
            </Button>
            <Button size="small" variant="danger" onClick={() => handleIndividualAction(row, 'reject')}>
              Reject
            </Button>
          </div>
        ),
      },
    ];
    return baseColumns;
  };

  // Filter configuration for FilterPanel
  const filterConfig = {
    status: {
      label: 'Status',
      type: 'select',
      options: [
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'resolved', label: 'Resolved' },
      ],
    },
    priority: {
      label: 'Priority',
      type: 'select',
      options: [
        { value: 'all', label: 'All' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ],
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

  // Bulk actions bar (sticky)
  const BulkActionsBar = () => {
    if (selectedItems.length === 0) return null;
    return (
      <div className={styles.bulkActionsBar}>
        <span className={styles.selectedCount}>{selectedItems.length} item(s) selected</span>
        <div className={styles.bulkButtons}>
          <Button
            variant="success"
            size="small"
            onClick={() => openBulkModal('approve')}
            disabled={actionLoading}
          >
            Approve Selected
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={() => openBulkModal('reject')}
            disabled={actionLoading}
          >
            Reject Selected
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading && items.length === 0) {
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
        title={actionName}
        description={`Manage ${actionName.toLowerCase()} – approve, reject, or review each item.`}
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard/admin' },
          { label: 'Pending Actions', href: '/dashboard/admin/pending' },
          { label: actionName, href: '#' },
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

      <BulkActionsBar />

      <AdminDataTable
        title=""
        columns={getColumns()}
        data={items}
        searchable={false}
        filterable={false}
        pagination
        pageSize={20}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onSelectionChange={handleSelectionChange}
        selectedKeys={selectedItems}
        selectable
        keyField="id"
        sortConfig={sortConfig}
        onSort={(key) => {
          setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
          }));
          setCurrentPage(1);
        }}
        searchTerm=""
        onSearchChange={() => {}}
      />

      {/* Confirmation Modal for Bulk Action */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={`Confirm Bulk ${bulkAction === 'approve' ? 'Approval' : 'Rejection'}`}
        size="md"
        actions={
          <>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
            <Button
              variant={bulkAction === 'approve' ? 'success' : 'danger'}
              onClick={handleBulkActionConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : `Confirm ${bulkAction === 'approve' ? 'Approve' : 'Reject'}`}
            </Button>
          </>
        }
      >
        <p>You are about to {bulkAction} <strong>{selectedItems.length}</strong> item(s).</p>
        <div className={styles.modalField}>
          <label htmlFor="reason">Reason (optional):</label>
          <Input
            id="reason"
            type="text"
            value={bulkReason}
            onChange={(e) => setBulkReason(e.target.value)}
            placeholder="Add a reason for this action..."
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminPendingActions;