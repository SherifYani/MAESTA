/**
 * @file UserManagement.jsx
 * @description User Management Interface for Admin Dashboard.
 *   Acts as the data controller for AdminDataTable:
 *   owns all filter → sort → paginate logic and passes
 *   controlled props to the table.
 * @author Sherif Talaat
 * @date 2026-02-06
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    MoreVertical, Trash, CheckCircle, Ban,
    UserPlus, Users, UserCheck, UserX, Shield,
} from 'lucide-react';
import AdminPageHeader from '../shared/AdminPageHeader/AdminPageHeader';
import AdminToolbar from '../shared/AdminToolbar/AdminToolbar';
import AdminStatsGrid from '../shared/AdminStatsGrid/AdminStatsGrid';
import AdminDataTable from '../shared/AdminDataTable';
import GeneralSelect from "../../../../../../components/common/GeneralSelect";
import adminService from '../../../../../../services/adminService';
import styles from './UserManagement.module.css';

const PAGE_SIZE = 10;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [, setLoading] = useState(true);

    useEffect(() => {
        adminService.getUsers({ page: 1, pageSize: 100 }).then(result => {
            const rows = (result.data?.users || []).map((user) => ({
                id: user.userId || user.id,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                email: user.email,
                role: (user.roles && user.roles[0]) || user.userType || 'unknown',
                roles: user.roles || [],
                status: user.isDeleted ? 'banned' : user.isActive ? 'active' : 'inactive',
                lastActive: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never',
                joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-',
            }));
            setUsers(rows);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    // ── Filter state ─────────────────────────────────────────────────────────
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // ── Sort state ───────────────────────────────────────────────────────────
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    // ── Pagination state ─────────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);

    // ── Action dropdown state ──────────────────────────────────────────────────────
    const [selectedUser, setSelectedUser] = useState(null);

    // ── Add User modal ────────────────────────────────────────────────────────
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ email: '', role: 'JobSeeker' });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState('');

    // =========================================================================
    // Data pipeline: filter → sort → paginate
    // =========================================================================

    /** 1. Filter */
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const term = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm
                || user.name.toLowerCase().includes(term)
                || user.email.toLowerCase().includes(term)
                || user.role.toLowerCase().includes(term);

            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchTerm, roleFilter, statusFilter]);

    /** 2. Sort */
    const sortedUsers = useMemo(() => {
        if (!sortConfig.key) return filteredUsers;
        return [...filteredUsers].sort((a, b) => {
            let aVal = a[sortConfig.key] ?? '';
            let bVal = b[sortConfig.key] ?? '';
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredUsers, sortConfig]);

    /** 3. Paginate */
    const totalItems = sortedUsers.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return sortedUsers.slice(start, start + PAGE_SIZE);
    }, [sortedUsers, currentPage]);

    // =========================================================================
    // Handlers
    // =========================================================================

    /** Update search term AND reset to page 1 */
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        setCurrentPage(1);
    }, []);

    /**
     * Toggle sort direction if same key; switch to new key asc if different.
     * Always resets to page 1.
     */
    const handleSort = useCallback((key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
        setCurrentPage(1);
    }, []);

    /** Navigate to a page (guarded) */
    const handlePageChange = useCallback((page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    /** Activate / deactivate a user */
    const handleToggleStatus = useCallback(async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        await adminService.updateUserStatus(id, newStatus);
        setUsers((prev) =>
            prev.map((user) => user.id === id ? { ...user, status: newStatus } : user)
        );
        setSelectedUser(null);
    }, []);

    /** Ban / unban a user */
    const handleToggleBan = useCallback(async (id, currentStatus) => {
        const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
        if (newStatus === 'banned') await adminService.deleteUser(id);
        else await adminService.updateUserStatus(id, 'active');
        setUsers((prev) =>
            prev.map((user) => user.id === id ? { ...user, status: newStatus } : user)
        );
        setSelectedUser(null);
    }, []);

    /** Delete a user after confirmation */
    const handleDeleteUser = useCallback(async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            await adminService.deleteUser(id);
            setUsers((prev) => prev.filter((user) => user.id !== id));
            setSelectedUser(null);
        }
    }, []);

    /** Invite / Add a new user */
    const handleAddUser = useCallback(async (e) => {
        e.preventDefault();
        if (!addForm.email.trim()) { setAddError('Email is required.'); return; }
        setAddLoading(true);
        setAddError('');
        try {
            await adminService.inviteUser(addForm.email.trim(), addForm.role);
            alert(`Invitation sent to ${addForm.email}`);
            setShowAddModal(false);
            setAddForm({ email: '', role: 'JobSeeker' });
        } catch (err) {
            if (err?.response?.status === 404 || err?.response?.status === 405) {
                alert('Add user feature is not yet available on the server. Coming soon!');
                setShowAddModal(false);
            } else {
                setAddError(err?.response?.data?.message || 'Failed to send invitation.');
            }
        } finally {
            setAddLoading(false);
        }
    }, [addForm]);

    // =========================================================================
    // Cell renderers
    // =========================================================================

    /** Avatar colour derived from the first character of the user's name */
    const getAvatarColor = (name) => {
        const colours = [
            'var(--color-chart-1)',
            'var(--color-chart-2)',
            'var(--color-chart-3)',
            'var(--color-chart-4)',
            'var(--color-chart-5)',
        ];
        return colours[name.charCodeAt(0) % colours.length];
    };

    const renderUserInfo = (row) => (
        <div className={styles.userInfo}>
            <div
                className={styles.userInfo__avatar}
                style={{ backgroundColor: getAvatarColor(row.name) }}
            >
                {row.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userInfo__details}>
                <span className={styles.userInfo__name}>{row.name}</span>
                <span className={styles.userInfo__email}>{row.email}</span>
            </div>
        </div>
    );

    const renderRoleBadge = (row) => {
        const normalizedRole = row.role.toLowerCase().replace(/[_ ]/g, '-');
        return (
            <span
                className={`${styles.roleBadge} ${styles[`roleBadge--${normalizedRole}`] || ''}`}
            >
                {row.role.replace('_', ' ')}
            </span>
        );
    };

    const renderStatusBadge = (row) => {
        const normalizedStatus = row.status.toLowerCase().replace(/[_ ]/g, '-');
        return (
            <span className={`${styles.statusBadge} ${styles[`statusBadge--${normalizedStatus}`] || ''}`}>
                <span className={styles.statusBadge__dot} />
                {row.status}
            </span>
        );
    };

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
        </div>
    );

    // =========================================================================
    // Column definitions
    // =========================================================================

    const columns = [
        { header: 'User', accessor: 'name', render: renderUserInfo },
        { header: 'Role', accessor: 'role', render: renderRoleBadge },
        { header: 'Status', accessor: 'status', render: renderStatusBadge },
        { header: 'Last Active', accessor: 'lastActive', render: renderLastActive },
        { header: 'Joined', accessor: 'joinDate' },
        { header: 'Actions', sortable: false, render: renderActions },
    ];

    // =========================================================================
    // Stats grid data (unchanged from original)
    // =========================================================================

    const userStats = useMemo(() => {
        const total = users.length;
        const active = users.filter((u) => u.status === 'active').length;
        const inactive = users.filter((u) => u.status === 'inactive').length;
        const banned = users.filter((u) => u.status === 'banned').length;
        return { total, active, inactive, banned };
    }, [users]);

    const statsData = [
        {
            id: 'total',
            title: 'Total Users',
            value: userStats.total.toLocaleString(),
            icon: Users,
            change: '+12%',
            trend: 'up',
            description: 'All registered users',
        },
        {
            id: 'active',
            title: 'Active Users',
            value: userStats.active.toLocaleString(),
            icon: UserCheck,
            change: '+8%',
            trend: 'up',
            description: 'Currently active',
        },
        {
            id: 'inactive',
            title: 'Inactive',
            value: userStats.inactive.toLocaleString(),
            icon: UserX,
            change: '-3%',
            trend: 'down',
            description: 'Inactive accounts',
        },
        {
            id: 'banned',
            title: 'Banned',
            value: userStats.banned.toLocaleString(),
            icon: Ban,
            change: userStats.banned > 0 ? `+${userStats.banned}` : '0',
            trend: 'neutral',
            description: 'Banned users',
        },
    ];

    // =========================================================================
    // Render
    // =========================================================================

    return (
        <div className={styles.container}>
            <AdminPageHeader
                title="User Management"
                description="Manage user accounts, permissions, and access across the platform."
                actions={
                    <button className={styles.addButton} onClick={() => setShowAddModal(true)}>
                        <UserPlus size={18} />
                        Add User
                    </button>
                }
            />

            {/* ── Add User Modal ── */}
            {showAddModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <form
                        onSubmit={handleAddUser}
                        style={{
                            background: 'var(--color-surface, #1e1e2e)', borderRadius: 12,
                            padding: 32, minWidth: 360, display: 'flex', flexDirection: 'column', gap: 16
                        }}
                    >
                        <h2 style={{ margin: 0, color: 'var(--color-text, #fff)', fontSize: 18 }}>Invite New User</h2>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--color-text-muted, #aaa)', fontSize: 13 }}>
                            Email address
                            <input
                                type="email"
                                required
                                placeholder="user@example.com"
                                value={addForm.email}
                                onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                                style={{
                                    padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border, #333)',
                                    background: 'var(--color-background, #141420)', color: 'var(--color-text, #fff)', fontSize: 14
                                }}
                            />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--color-text-muted, #aaa)', fontSize: 13 }}>
                            Role
                            <select
                                value={addForm.role}
                                onChange={e => setAddForm(f => ({ ...f, role: e.target.value }))}
                                style={{
                                    padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border, #333)',
                                    background: 'var(--color-background, #141420)', color: 'var(--color-text, #fff)', fontSize: 14
                                }}
                            >
                                <option value="JobSeeker">Job Seeker</option>
                                <option value="Employer">Company / Employer</option>
                                <option value="Freelancer">Freelancer</option>
                                <option value="Client">Client</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </label>
                        {addError && <p style={{ color: '#f87171', margin: 0, fontSize: 13 }}>{addError}</p>}
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => { setShowAddModal(false); setAddError(''); }}
                                style={{
                                    padding: '8px 20px', borderRadius: 8, border: '1px solid var(--color-border, #333)',
                                    background: 'transparent', color: 'var(--color-text-muted, #aaa)', cursor: 'pointer'
                                }}
                            >Cancel</button>
                            <button
                                type="submit"
                                disabled={addLoading}
                                style={{
                                    padding: '8px 20px', borderRadius: 8, border: 'none',
                                    background: 'var(--color-primary, #7c3aed)', color: '#fff',
                                    cursor: addLoading ? 'not-allowed' : 'pointer', opacity: addLoading ? 0.7 : 1
                                }}
                            >{addLoading ? 'Sending…' : 'Send Invite'}</button>
                        </div>
                    </form>
                </div>
            )}

            <AdminStatsGrid stats={statsData} columns={4} />

            {/*
             * AdminToolbar: search + role/status <select> filters.
             * onSearchChange receives a string (event.target.value from the toolbar)
             * and we pipe it through handleSearch so that currentPage resets.
             */}
            <AdminToolbar
                searchPlaceholder="Search by name, email, or role..."
                searchValue={searchTerm}
                onSearchChange={(e) => handleSearch(e.target.value)}
                filters={
                    <>
                        <GeneralSelect
                            value={roleFilter}
                            onChange={(val) => { setRoleFilter(val); setCurrentPage(1); }}
                            options={[
                                { value: "all", label: "All Roles" },
                                { value: "job_seeker", label: "Job Seeker" },
                                { value: "company", label: "Company" },
                                { value: "freelancer", label: "Freelancer" },
                                { value: "client", label: "Client" },
                                { value: "admin", label: "Admin" },
                            ]}
                        />

                        <GeneralSelect
                            value={statusFilter}
                            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                            options={[
                                { value: "all", label: "All Status" },
                                { value: "active", label: "Active" },
                                { value: "inactive", label: "Inactive" },
                                { value: "banned", label: "Banned" },
                                { value: "pending", label: "Pending" },
                            ]}
                        />
                    </>
                }
            />

            <main className={styles.content}>
                <AdminDataTable
                    // Data (current page only)
                    columns={columns}
                    data={paginatedUsers}
                    className={styles.dataTable}
                    // Controlled search
                    searchTerm={searchTerm}
                    onSearchChange={handleSearch}
                    // Controlled sort
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    // Controlled pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    pageSize={PAGE_SIZE}
                    /* Feature flags – search is handled by AdminToolbar above the table */
                    searchable={false}
                    filterable={true}
                    pagination={true}
                />
            </main>
        </div>
    );
};

export default UserManagement;
