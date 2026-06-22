/**
 * @file AdminUsersManagement.jsx
 * @description Admin users management page – view, filter, manage user accounts.
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
import styles from './AdminUsersManagement.module.css';

const mapUser = (user) => ({
  ...user,
  id: user.userId || user.id,
  name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown',
  role: user.role || user.roles?.[0] || user.userType || 'unknown',
  roles: user.roles || [],
  status: user.status || (user.isDeleted ? 'deleted' : user.isActive ? 'active' : 'inactive'),
  lastLogin: user.lastLogin || user.lastLoginAt || null,
});

const AdminUsersManagement = () => {
  // State
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newRole, setNewRole] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Load users
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 20,
        role: filters.role !== 'all' ? filters.role : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        search: searchTerm,
        sort: sortConfig.key,
        order: sortConfig.direction,
      };
      const response = await adminService.getUsers(params);
      if (response.success) {
        setUsers((response.data.users || []).map(mapUser));
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.totalItems || 0);
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      console.error(err);
      setError('Error loading users');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters, searchTerm, sortConfig]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (user, status) => {
    setSelectedUser(user);
    setNewStatus(status);
    setStatusReason('');
    setIsStatusModalOpen(true);
  };

  const handleUpdateRole = (user, role) => {
    setSelectedUser(user);
    setNewRole(role);
    setIsRoleModalOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedUser) return;
    try {
      const response = newStatus === 'deleted'
        ? await adminService.deleteUser(selectedUser.id)
        : await adminService.updateUserStatus(selectedUser.id, newStatus);
      if (response.success) {
        setSuccess(`User ${selectedUser.name} status updated to ${newStatus}`);
        loadUsers();
      } else {
        setError('Failed to update status');
      }
    } catch (err) {
      setError('Error updating status');
    } finally {
      setIsStatusModalOpen(false);
      setSelectedUser(null);
    }
  };

  const confirmRoleUpdate = async () => {
    if (!selectedUser) return;
    try {
      const response = await adminService.updateUserRole(selectedUser.id, newRole);
      if (response.success) {
        setSuccess(`User ${selectedUser.name} role updated to ${newRole}`);
        loadUsers();
      } else {
        setError('Failed to update role');
      }
    } catch (err) {
      setError('Error updating role');
    } finally {
      setIsRoleModalOpen(false);
      setSelectedUser(null);
    }
  };

  // Filter configuration
  const filterConfig = {
    role: {
      label: 'Role',
      type: 'select',
      options: [
        { value: 'all', label: 'All Roles' },
        { value: 'Admin', label: 'Admin' },
        { value: 'Employer', label: 'Employer' },
        { value: 'jobseeker', label: 'Job Seeker' },
        { value: 'Freelancer', label: 'Freelancer' },
        { value: 'Client', label: 'Client' },
      ],
    },
    status: {
      label: 'Status',
      type: 'select',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'deleted', label: 'Deleted' },
      ],
    },
  };

  // Table columns
  const getColumns = () => {
    return [
      {
        header: 'User',
        accessor: 'name',
        sortable: true,
        render: (row) => (
          <div>
            <div className={styles.userName}>{row.name}</div>
            <div className={styles.userEmail}>{row.email}</div>
          </div>
        ),
      },
      {
        header: 'Role',
        accessor: 'role',
        sortable: true,
        render: (row) => {
          let variant = 'default';
          const normalizedRole = String(row.role || '').toLowerCase();
          if (normalizedRole === 'admin') variant = 'info';
          else if (normalizedRole === 'employer') variant = 'success';
          else if (normalizedRole === 'jobseeker') variant = 'warning';
          return <Badge variant={variant}>{row.role}</Badge>;
        },
      },
      {
        header: 'Status',
        accessor: 'status',
        sortable: true,
        render: (row) => {
          let variant = 'success';
          if (row.status === 'inactive') variant = 'warning';
          if (row.status === 'deleted') variant = 'error';
          return <Badge variant={variant}>{row.status}</Badge>;
        },
      },
      {
        header: 'Joined',
        accessor: 'createdAt',
        sortable: true,
        render: (row) => new Date(row.createdAt).toLocaleDateString(),
      },
      {
        header: 'Last Login',
        accessor: 'lastLogin',
        sortable: true,
        render: (row) => row.lastLogin ? new Date(row.lastLogin).toLocaleString() : 'Never',
      },
      {
        header: 'Actions',
        accessor: 'actions',
        sortable: false,
        render: (row) => (
          <div className={styles.actionButtons}>
            <Button size="small" variant="outline" onClick={() => handleUserClick(row)}>View</Button>
            <select
              value=""
              onChange={(e) => handleUpdateStatus(row, e.target.value)}
              className={styles.statusSelect}
            >
              <option value="">Change Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deleted">Delete</option>
            </select>
            <select
              value=""
              onChange={(e) => handleUpdateRole(row, e.target.value)}
              className={styles.roleSelect}
            >
              <option value="">Change Role</option>
              <option value="admin">Admin</option>
              <option value="employer">Employer</option>
              <option value="jobseeker">Job Seeker</option>
              <option value="freelancer">Freelancer</option>
              <option value="client">Client</option>
            </select>
          </div>
        ),
      },
    ];
  };

  if (isLoading && users.length === 0) {
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
        title="Users Management"
        description="Manage platform users – view, update roles, and manage account status"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard/admin' },
          { label: 'Users', href: '#' },
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
        data={users}
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
        onRowClick={handleUserClick}
        sortConfig={sortConfig}
        onSort={(key) => {
          setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
          }));
          setCurrentPage(1);
        }}
      />

      {/* User Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="User Details"
        size="lg"
        actions={
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
        }
      >
        {selectedUser && (
          <div className={styles.modalContent}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>ID:</span>
              <span>{selectedUser.id}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Name:</span>
              <span>{selectedUser.name}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Email:</span>
              <span>{selectedUser.email}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Role:</span>
              <Badge variant={
                String(selectedUser.role || '').toLowerCase() === 'admin' ? 'info' :
                String(selectedUser.role || '').toLowerCase() === 'employer' ? 'success' : 'warning'
              }>{selectedUser.role}</Badge>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status:</span>
              <Badge variant={
                selectedUser.status === 'active' ? 'success' :
                selectedUser.status === 'inactive' ? 'warning' : 'error'
              }>{selectedUser.status}</Badge>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Joined:</span>
              <span>{new Date(selectedUser.createdAt).toLocaleString()}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Last Login:</span>
              <span>{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Profile Completeness:</span>
              <span>{selectedUser.profileCompleteness}%</span>
            </div>
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
        <p>Are you sure you want to change <strong>{selectedUser?.name}</strong>'s status to <strong>{newStatus}</strong>?</p>
        <div className={styles.modalField}>
          <label className={styles.formLabel}>Reason (optional):</label>
          <Input
            type="text"
            value={statusReason}
            onChange={(e) => setStatusReason(e.target.value)}
            placeholder="Why is this status being changed?"
          />
        </div>
      </Modal>

      {/* Update Role Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title={`Update Role to ${newRole}`}
        size="md"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={confirmRoleUpdate}>Confirm</Button>
          </>
        }
      >
        <p>Are you sure you want to change <strong>{selectedUser?.name}</strong>'s role to <strong>{newRole}</strong>?</p>
        <p className={styles.warning}>This will affect the user's dashboard access and permissions.</p>
      </Modal>
    </div>
  );
};

export default AdminUsersManagement;
