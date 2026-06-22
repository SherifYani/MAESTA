/**
 * @file AdminLogs.jsx
 * @description Admin activity and system log viewer.
 * @author OpenCode
 * @date 2026-06-22
 * @last-modified-by OpenCode
 * @last-modified-date 2026-06-22
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPageHeader from './components/shared/AdminPageHeader/AdminPageHeader';
import AdminToolbar from './components/shared/AdminToolbar/AdminToolbar';
import AdminDataTable from './components/shared/AdminDataTable';
import * as adminService from '../../../../services/adminService';
import styles from './AdminOperations.module.css';

const PAGE_SIZE = 20;

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [type, setType] = useState('all');
  const [level, setLevel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadLogs = useCallback(async () => {
    const result = await adminService.getLogs({ type: type === 'all' ? undefined : type, level: level || undefined, page: currentPage, pageSize: PAGE_SIZE });
    setLogs((result.data?.items || []).map((log) => ({
      ...log,
      user: log.userName || log.userEmail || (log.userId ? `User #${log.userId}` : 'System'),
      createdAt: log.createdAt || log.timestamp,
    })));
    setTotalItems(result.data?.totalItems || 0);
  }, [currentPage, level, type]);

  useEffect(() => { loadLogs().catch(() => setLogs([])); }, [loadLogs]);

  const filteredLogs = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return logs.filter((log) => !term || JSON.stringify(log).toLowerCase().includes(term));
  }, [logs, searchTerm]);

  const columns = [
    { header: 'Type', accessor: 'type' },
    { header: 'Level / Action', accessor: 'levelOrAction', render: (row) => <span className={styles.badge}>{row.levelOrAction}</span> },
    { header: 'Message', accessor: 'message' },
    { header: 'User', accessor: 'user', render: (row) => row.user },
    { header: 'Created', accessor: 'createdAt', render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleString() : '-' },
  ];

  return (
    <div className={styles.adminOperationsPage}>
      <AdminPageHeader title="Audit Logs" description="Track admin actions, system events, and operational history." />
      <AdminToolbar searchPlaceholder="Search logs..." searchValue={searchTerm} onSearchChange={(event) => setSearchTerm(event.target.value)} filters={<div className={styles.toolbarActions}><select className={styles.select} value={type} onChange={(event) => { setType(event.target.value); setCurrentPage(1); }}><option value="all">All Logs</option><option value="activity">Activity</option><option value="system">System</option></select><select className={styles.select} value={level} onChange={(event) => { setLevel(event.target.value); setCurrentPage(1); }}><option value="">All Levels</option><option value="Info">Info</option><option value="Warning">Warning</option><option value="Error">Error</option><option value="Critical">Critical</option><option value="AdminModeration">Admin Moderation</option></select></div>} />
      <AdminDataTable columns={columns} data={filteredLogs} searchable={false} filterable={false} currentPage={currentPage} totalPages={Math.max(1, Math.ceil(totalItems / PAGE_SIZE))} totalItems={totalItems} onPageChange={setCurrentPage} pageSize={PAGE_SIZE} />
    </div>
  );
};

export default AdminLogs;
