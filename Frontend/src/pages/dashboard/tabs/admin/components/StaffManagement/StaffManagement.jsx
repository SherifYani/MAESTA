/**
 * @file StaffManagement.jsx
 * @description Staff Management Interface for Admin Dashboard
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */

import React, { useState, useMemo, useCallback } from 'react';
import { UserPlus, Shield, MoreVertical, Mail, Key, Users, UserCheck, UserX } from 'lucide-react';
import AdminPageHeader from '../shared/AdminPageHeader/AdminPageHeader';
import AdminToolbar from '../shared/AdminToolbar/AdminToolbar';
import AdminStatsGrid from '../shared/AdminStatsGrid/AdminStatsGrid';
import AdminDataTable from '../shared/AdminDataTable';
import { staffData as initialStaffData } from '../../config/adminMockData';
import styles from './StaffManagement.module.css';

/**
 * Staff Management component for managing admin users and permissions.
 * Follows data-intensive page pattern with staff metrics.
 * @returns {JSX.Element} The rendered staff management interface.
 */
const StaffManagement = () => {
    const [staffData, setStaffData] = useState(initialStaffData);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedStaff, setSelectedStaff] = useState(null);

    /**
     * Calculate staff statistics
     */
    const staffStats = useMemo(() => {
        const total = staffData.length;
        const active = staffData.filter(s => s.status === 'active').length;
        const inactive = staffData.filter(s => s.status === 'inactive').length;

        const roleCounts = staffData.reduce((acc, staff) => {
            acc[staff.role] = (acc[staff.role] || 0) + 1;
            return acc;
        }, {});

        return {
            total,
            active,
            inactive,
            admins: roleCounts['Admin'] || 0,
            moderators: roleCounts['Moderator'] || 0,
            support: roleCounts['Support'] || 0
        };
    }, [staffData]);

    /**
     * Filter staff members
     */
    const filteredStaff = useMemo(() => {
        return staffData.filter(staff => {
            const matchesSearch =
                staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                staff.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [staffData, searchTerm, roleFilter]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleEditRole = useCallback((id, newRole) => {
        setStaffData(prev => prev.map(staff =>
            staff.id === id ? { ...staff, role: newRole } : staff
        ));
        setSelectedStaff(null);
    }, []);

    const handleResendInvite = useCallback((staff) => {
        console.log(`Resending invitation to ${staff.email}`);
        alert(`Invitation resent to ${staff.email}`);
        setSelectedStaff(null);
    }, []);

    const handleResetPassword = useCallback((staff) => {
        console.log(`Resetting password for ${staff.email}`);
        alert(`Password reset instructions sent to ${staff.email}`);
        setSelectedStaff(null);
    }, []);

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

    const columns = [
        {
            header: 'Name',
            accessor: 'name'
        },
        {
            header: 'Email',
            accessor: 'email'
        },
        {
            header: 'Role',
            accessor: 'role',
            render: renderRoleBadge
        },
        {
            header: 'Status',
            accessor: 'status',
            render: renderStatus
        },
        {
            header: 'Last Login',
            accessor: 'lastLogin'
        },
        {
            header: 'Actions',
            render: renderActions
        }
    ];

    const statsData = [
        {
            id: 'total',
            title: 'Total Staff',
            value: staffStats.total.toString(),
            icon: Users,
            change: '+2',
            trend: 'up',
            description: 'All staff members'
        },
        {
            id: 'active',
            title: 'Active',
            value: staffStats.active.toString(),
            icon: UserCheck,
            change: '+1',
            trend: 'up',
            description: 'Currently active'
        },
        {
            id: 'inactive',
            title: 'Inactive',
            value: staffStats.inactive.toString(),
            icon: UserX,
            change: '0',
            trend: 'neutral',
            description: 'Inactive accounts'
        },
        {
            id: 'admins',
            title: 'Administrators',
            value: staffStats.admins.toString(),
            icon: Shield,
            change: '0',
            trend: 'neutral',
            description: 'Admin permissions'
        }
    ];

    return (
        <div className={styles.container}>
            <AdminPageHeader
                title="Staff Management"
                description="Manage administrative staff, roles, and permissions across the platform."
                actions={
                    <button className={styles.addButton}>
                        <UserPlus size={18} />
                        Add Staff
                    </button>
                }
            />

            <AdminStatsGrid stats={statsData} columns={4} />

            <AdminToolbar
                searchPlaceholder="Search by name or email..."
                searchValue={searchTerm}
                onSearchChange={handleSearchChange}
                filters={
                    <select
                        className={styles.filterSelect}
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        aria-label="Filter by role"
                    >
                        <option value="all">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="Moderator">Moderator</option>
                        <option value="Support">Support</option>
                    </select>
                }
            />

            <main className={styles.content}>
                <AdminDataTable
                    columns={columns}
                    data={filteredStaff}
                    className={styles.dataTable}
                />
            </main>
        </div>
    );
};

export default StaffManagement;