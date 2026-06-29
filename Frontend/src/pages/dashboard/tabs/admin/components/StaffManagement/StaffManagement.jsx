/**
 * @file StaffManagement.jsx
 * @description Staff Management Interface for Admin Dashboard
 * @author Sherif Talaat
 * @date 2026-02-06
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */

import React, { useState, useMemo, useCallback } from 'react';
import { UserPlus, Shield, MoreVertical, Mail, Key, Users, UserCheck, UserX } from 'lucide-react';
import AdminPageHeader from '../shared/AdminPageHeader/AdminPageHeader';
import AdminToolbar from '../shared/AdminToolbar/AdminToolbar';
import AdminStatsGrid from '../shared/AdminStatsGrid/AdminStatsGrid';
import AdminDataTable from '../shared/AdminDataTable';
import GeneralSelect from "../../../../../../components/common/GeneralSelect";
<<<<<<< HEAD
import { staffData as initialStaffData } from '../../config/adminMockData';
=======
import * as adminService from '../../../../../../services/adminService';
>>>>>>> a16752cd97e84085e9ff7455f54f0b4148464a6a
import styles from './StaffManagement.module.css';

const PAGE_SIZE = 10;

/**
 * Staff Management component — fully controlled parent for AdminDataTable.
 * @returns {JSX.Element}
 */
const StaffManagement = () => {
    const [staffData, setStaffData] = useState(initialStaffData);

    // ── Filter state ─────────────────────────────────────────────────────────
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // ── Sort state ───────────────────────────────────────────────────────────
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    // ── Pagination state ─────────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);

    // ── Action dropdown ───────────────────────────────────────────────────────
    const [selectedStaff, setSelectedStaff] = useState(null);

    // ── Add Staff modal ───────────────────────────────────────────────────────
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ email: '', role: 'Admin' });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState('');

    // =========================================================================
    // Stats (on full dataset)
    // =========================================================================
    const staffStats = useMemo(() => {
        const total = staffData.length;
        const active = staffData.filter(s => s.status === 'active').length;
        const inactive = staffData.filter(s => s.status === 'inactive').length;
        const roleCounts = staffData.reduce((acc, s) => {
            acc[s.role] = (acc[s.role] || 0) + 1;
            return acc;
        }, {});
        return {
            total,
            active,
            inactive,
            admins: roleCounts['Admin'] || 0,
        };
    }, [staffData]);

    // =========================================================================
    // Data pipeline: filter → sort → paginate
    // =========================================================================

    const filteredStaff = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return staffData.filter(staff => {
            const matchesSearch = !searchTerm
                || staff.name.toLowerCase().includes(term)
                || staff.email.toLowerCase().includes(term)
                || staff.role.toLowerCase().includes(term);
            const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [staffData, searchTerm, roleFilter]);

    const sortedStaff = useMemo(() => {
        if (!sortConfig.key) return filteredStaff;
        return [...filteredStaff].sort((a, b) => {
            let aVal = a[sortConfig.key] ?? '';
            let bVal = b[sortConfig.key] ?? '';
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredStaff, sortConfig]);

    const totalItems = sortedStaff.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

    const paginatedStaff = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return sortedStaff.slice(start, start + PAGE_SIZE);
    }, [sortedStaff, currentPage]);

    // =========================================================================
    // Handlers
    // =========================================================================
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        setCurrentPage(1);
    }, []);

    const handleSort = useCallback((key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    }, [totalPages]);

    const handleResendInvite = useCallback(async (staff) => {
        try {
            await adminService.resendInvite(staff.id);
            alert(`Invitation resent to ${staff.email}`);
        } catch (err) {
            console.error('Failed to resend invite', err);
            alert('Failed to resend invitation');
        }
        setSelectedStaff(null);
    }, []);

    const handleResetPassword = useCallback(async (staff) => {
        try {
            await adminService.resetPassword(staff.id);
            alert(`Password reset instructions sent to ${staff.email}`);
        } catch (err) {
            console.error('Failed to reset password', err);
            alert('Failed to reset password');
        }
        setSelectedStaff(null);
    }, []);

<<<<<<< HEAD
=======
    const handleRevokeAdmin = useCallback(async (staff) => {
        if (!window.confirm(`Remove admin access from ${staff.email}?`)) return;
        await adminService.revokeAdmin(staff.id);
        setStaffData((prev) => prev.filter((item) => item.id !== staff.id));
        setSelectedStaff(null);
    }, []);

    const handleAddStaff = useCallback(async (e) => {
        e.preventDefault();
        if (!addForm.email.trim()) { setAddError('Email is required.'); return; }
        setAddLoading(true);
        setAddError('');
        try {
            await adminService.inviteUser(addForm.email.trim(), addForm.role);
            alert(`Invitation sent to ${addForm.email}`);
            setShowAddModal(false);
            setAddForm({ email: '', role: 'Admin' });
        } catch (err) {
            // 404 = endpoint not yet deployed — show friendly message
            if (err?.response?.status === 404 || err?.response?.status === 405) {
                alert('Invite feature is not yet available on the server. Coming soon!');
                setShowAddModal(false);
            } else {
                setAddError(err?.response?.data?.message || 'Failed to send invitation.');
            }
        } finally {
            setAddLoading(false);
        }
    }, [addForm]);

>>>>>>> a16752cd97e84085e9ff7455f54f0b4148464a6a
    // =========================================================================
    // Cell renderers
    // =========================================================================
    const renderRoleBadge = (row) => {
        const roleClass = row.role.toLowerCase().replace(' ', '-');
        return (
            <span className={`${styles.roleBadge} ${styles[`roleBadge--${roleClass}`]}`}>
                <Shield size={12} className={styles.roleBadge__icon} />
                {row.role}
            </span>
        );
    };

    const renderStatus = (row) => (
        <span className={`${styles.statusIndicator} ${styles[`statusIndicator--${row.status}`]}`}>
            <span className={styles.statusIndicator__dot} />
            {row.status}
        </span>
    );

    const renderActions = (row) => (
        <div className={styles.actions__dropdown}>
            <button
                className={styles.actions__toggle}
                onClick={() => setSelectedStaff(selectedStaff === row.id ? null : row.id)}
                aria-label={`Actions for ${row.name}`}
                aria-expanded={selectedStaff === row.id}
            >
                <MoreVertical size={16} />
            </button>

            {selectedStaff === row.id && (
                <div className={styles.actions__menu} role="menu">
                    <button
                        className={styles.actions__item}
                        onClick={() => handleResendInvite(row)}
                        role="menuitem"
                    >
                        <Mail size={14} />
                        Resend Invite
                    </button>
                    <button
                        className={styles.actions__item}
                        onClick={() => handleResetPassword(row)}
                        role="menuitem"
                    >
                        <Key size={14} />
                        Reset Password
                    </button>
                </div>
            )}
        </div>
    );

    // =========================================================================
    // Column definitions
    // =========================================================================
    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Role', accessor: 'role', render: renderRoleBadge },
        { header: 'Status', accessor: 'status', render: renderStatus },
        { header: 'Last Login', accessor: 'lastLogin' },
        { header: 'Actions', sortable: false, render: renderActions },
    ];

    // =========================================================================
    // Stats grid
    // =========================================================================
    const statsData = [
        {
            id: 'total',
            title: 'Total Staff',
            value: staffStats.total.toString(),
            icon: Users,
            change: '+2',
            trend: 'up',
            description: 'All staff members',
        },
        {
            id: 'active',
            title: 'Active',
            value: staffStats.active.toString(),
            icon: UserCheck,
            change: '+1',
            trend: 'up',
            description: 'Currently active',
        },
        {
            id: 'inactive',
            title: 'Inactive',
            value: staffStats.inactive.toString(),
            icon: UserX,
            change: '0',
            trend: 'neutral',
            description: 'Inactive accounts',
        },
        {
            id: 'admins',
            title: 'Administrators',
            value: staffStats.admins.toString(),
            icon: Shield,
            change: '0',
            trend: 'neutral',
            description: 'Admin permissions',
        },
    ];

    // =========================================================================
    // Render
    // =========================================================================
    return (
        <div className={styles.container}>
            <AdminPageHeader
                title="Staff Management"
                description="Manage administrative staff, roles, and permissions across the platform."
                actions={
                    <button className={styles.addButton} onClick={() => setShowAddModal(true)}>
                        <UserPlus size={18} />
                        Add Staff
                    </button>
                }
            />

            {/* ── Add Staff Modal ── */}
            {showAddModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <form
                        onSubmit={handleAddStaff}
                        style={{
                            background: 'var(--color-surface, #1e1e2e)', borderRadius: 12,
                            padding: 32, minWidth: 360, display: 'flex', flexDirection: 'column', gap: 16
                        }}
                    >
                        <h2 style={{ margin: 0, color: 'var(--color-text, #fff)', fontSize: 18 }}>Invite Staff Member</h2>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--color-text-muted, #aaa)', fontSize: 13 }}>
                            Email address
                            <input
                                type="email"
                                required
                                placeholder="staff@example.com"
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
                                <option value="Admin">Admin</option>
                                <option value="Moderator">Moderator</option>
                                <option value="Analyst">Analyst</option>
                                <option value="Support">Support</option>
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

            <AdminToolbar
                searchPlaceholder="Search by name, email, or role..."
                searchValue={searchTerm}
                onSearchChange={(e) => handleSearch(e.target.value)}
                filters={
                    <GeneralSelect
                        value={roleFilter}
                        onChange={(val) => { setRoleFilter(val); setCurrentPage(1); }}
                        options={[
                            { value: "all", label: "All Roles" },
                            { value: "Super Admin", label: "Super Admin" },
                            { value: "Admin", label: "Admin" },
                            { value: "Moderator", label: "Moderator" },
                            { value: "Analyst", label: "Analyst" },
                            { value: "Support", label: "Support" },
                        ]}
                    />
                }
            />

            <main className={styles.content}>
                <AdminDataTable
                    columns={columns}
                    data={paginatedStaff}
                    className={styles.dataTable}
                    searchable={false}
                    filterable={true}
                    pagination={true}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    pageSize={PAGE_SIZE}
                />
            </main>
        </div>
    );
};

export default StaffManagement;