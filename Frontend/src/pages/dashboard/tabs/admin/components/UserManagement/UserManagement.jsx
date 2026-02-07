/**
 * @file UserManagement.jsx
 * @description User Management Interface for Admin Dashboard
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */

import React, { useState, useMemo, useCallback } from 'react';
import { MoreVertical, Edit, Trash, CheckCircle, Ban, UserPlus, Users, UserCheck, UserX, Shield } from 'lucide-react';
import AdminPageHeader from '../shared/AdminPageHeader/AdminPageHeader';
import AdminToolbar from '../shared/AdminToolbar/AdminToolbar';
import AdminStatsGrid from '../shared/AdminStatsGrid/AdminStatsGrid';
import AdminDataTable from '../shared/AdminDataTable';
import { usersData } from '../../config/adminMockData';
import styles from './UserManagement.module.css';

/**
 * User Management Component for administering platform users.
 * Follows data-intensive page pattern with stats grid.
 * @returns {JSX.Element} Rendered user management interface.
 */
const UserManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [users, setUsers] = useState(usersData);
    const [selectedUser, setSelectedUser] = useState(null);

    /**
     * Filters users based on search term, role, and status filters.
     */
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [searchTerm, roleFilter, statusFilter, users]);

    /**
     * Calculates user statistics.
     */
    const userStats = useMemo(() => {
        const total = users.length;
        const active = users.filter(user => user.status === 'active').length;
        const inactive = users.filter(user => user.status === 'inactive').length;
        const banned = users.filter(user => user.status === 'banned').length;

        const roleCounts = users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {});

        return {
            total,
            active,
            inactive,
            banned,
            jobseekers: roleCounts['jobseeker'] || 0,
            employers: roleCounts['employer'] || 0,
            freelancers: roleCounts['freelancer'] || 0,
        };
    }, [users]);

    const handleToggleStatus = useCallback((id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        setUsers(prev => prev.map(user =>
            user.id === id ? { ...user, status: newStatus } : user
        ));
        setSelectedUser(null);
    }, []);

    const handleToggleBan = useCallback((id, currentStatus) => {
        const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
        setUsers(prev => prev.map(user =>
            user.id === id ? { ...user, status: newStatus } : user
        ));
        setSelectedUser(null);
    }, []);

    const handleDeleteUser = useCallback((id, name) => {
        if (window.confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
            setUsers(prev => prev.filter(user => user.id !== id));
            setSelectedUser(null);
        }
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    /**
     * Generates a consistent color for avatar based on user name.
     */
    const getAvatarColor = (name) => {
        const colors = [
            'var(--color-chart-1)',
            'var(--color-chart-2)',
            'var(--color-chart-3)',
            'var(--color-chart-4)',
            'var(--color-chart-5)'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const renderUserInfo = (row) => (
        <div className={styles.userInfo}>
            <div className={styles.userInfo__avatar} style={{ backgroundColor: getAvatarColor(row.name) }}>
                {row.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userInfo__details}>
                <span className={styles.userInfo__name}>{row.name}</span>
                <span className={styles.userInfo__email}>{row.email}</span>
            </div>
        </div>
    );

    const renderRoleBadge = (row) => (
        <span className={`${styles.roleBadge} ${styles[`roleBadge--${row.role.replace('_', '-')}`]}`}>
            {row.role.replace('_', ' ')}
        </span>
    );

    const renderStatusBadge = (row) => (
        <span className={`${styles.statusBadge} ${styles[`statusBadge--${row.status}`]}`}>
            <span className={styles.statusBadge__dot} />
            {row.status}
        </span>
    );

    const renderLastActive = (row) => (
        <div className={styles.lastActive}>
            <time dateTime={row.lastActive}>{row.lastActive}</time>
            {row.status === 'active' && (
                <span className={styles.lastActive__indicator} title="Currently online" />
            )}
        </div>
    );

    const renderActions = (row) => (
        <div className={styles.actions}>
            <div className={styles.actions__dropdown}>
                <button
                    className={styles.actions__toggle}
                    onClick={() => setSelectedUser(selectedUser === row.id ? null : row.id)}
                    aria-label={`Manage ${row.name}`}
                    aria-expanded={selectedUser === row.id}
                >
                    <MoreVertical size={16} aria-hidden="true" />
                </button>

                {selectedUser === row.id && (
                    <div className={styles.actions__menu} role="menu">
                        <button
                            className={styles.actions__item}
                            onClick={() => handleToggleStatus(row.id, row.status)}
                            role="menuitem"
                        >
                            {row.status === 'active' ? <Ban size={14} /> : <CheckCircle size={14} />}
                            {row.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                            className={styles.actions__item}
                            onClick={() => handleToggleBan(row.id, row.status)}
                            role="menuitem"
                        >
                            <Shield size={14} />
                            {row.status === 'banned' ? 'Unban' : 'Ban User'}
                        </button>
                        <button
                            className={`${styles.actions__item} ${styles['actions__item--danger']}`}
                            onClick={() => handleDeleteUser(row.id, row.name)}
                            role="menuitem"
                        >
                            <Trash size={14} />
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div >
    );

    const columns = [
        {
            header: 'User',
            accessor: 'name',
            render: renderUserInfo
        },
        {
            header: 'Role',
            accessor: 'role',
            render: renderRoleBadge
        },
        {
            header: 'Status',
            accessor: 'status',
            render: renderStatusBadge
        },
        {
            header: 'Last Active',
            accessor: 'lastActive',
            render: renderLastActive
        },
        {
            header: 'Joined',
            accessor: 'joinedDate'
        },
        {
            header: 'Actions',
            render: renderActions
        }
    ];

    // Stats for the grid
    const statsData = [
        {
            id: 'total',
            title: 'Total Users',
            value: userStats.total.toLocaleString(),
            icon: Users,
            change: '+12%',
            trend: 'up',
            description: 'All registered users'
        },
        {
            id: 'active',
            title: 'Active Users',
            value: userStats.active.toLocaleString(),
            icon: UserCheck,
            change: '+8%',
            trend: 'up',
            description: 'Currently active'
        },
        {
            id: 'inactive',
            title: 'Inactive',
            value: userStats.inactive.toLocaleString(),
            icon: UserX,
            change: '-3%',
            trend: 'down',
            description: 'Inactive accounts'
        },
        {
            id: 'banned',
            title: 'Banned',
            value: userStats.banned.toLocaleString(),
            icon: Ban,
            change: userStats.banned > 0 ? `+${userStats.banned}` : '0',
            trend: 'neutral',
            description: 'Banned users'
        }
    ];

    return (
        <div className={styles.container}>
            <AdminPageHeader
                title="User Management"
                description="Manage user accounts, permissions, and access across the platform."
                actions={
                    <button className={styles.addButton}>
                        <UserPlus size={18} />
                        Add User
                    </button>
                }
            />

            <AdminStatsGrid stats={statsData} columns={4} />

            <AdminToolbar
                searchPlaceholder="Search by name or email..."
                searchValue={searchTerm}
                onSearchChange={handleSearchChange}
                filters={
                    <>
                        <select
                            className={styles.filterSelect}
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            aria-label="Filter by role"
                        >
                            <option value="all">All Roles</option>
                            <option value="jobseeker">Jobseeker</option>
                            <option value="employer">Employer</option>
                            <option value="freelancer">Freelancer</option>
                        </select>
                        <select
                            className={styles.filterSelect}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            aria-label="Filter by status"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="banned">Banned</option>
                        </select>
                    </>
                }
            />

            <main className={styles.content}>
                <AdminDataTable
                    columns={columns}
                    data={filteredUsers}
                    className={styles.dataTable}
                />
            </main>
        </div>
    );
};

export default UserManagement;