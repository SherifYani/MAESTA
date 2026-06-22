/**
 * @file AdminSettings.jsx
 * @description Platform settings and feature flag management for admins.
 * @author OpenCode
 * @date 2026-06-22
 * @last-modified-by OpenCode
 * @last-modified-date 2026-06-22
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Save, ToggleLeft, ToggleRight } from 'lucide-react';
import AdminPageHeader from './components/shared/AdminPageHeader/AdminPageHeader';
import AdminDataTable from './components/shared/AdminDataTable';
import * as adminService from '../../../../services/adminService';
import styles from './AdminOperations.module.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState([]);
  const [form, setForm] = useState({ settingKey: '', settingValue: '', category: 'system' });
  const [message, setMessage] = useState('');

  const loadSettings = useCallback(async () => {
    const result = await adminService.getSettings();
    setSettings(result.data || []);
  }, []);

  useEffect(() => { loadSettings().catch(() => setMessage('Failed to load settings')); }, [loadSettings]);

  const saveSetting = async (event) => {
    event.preventDefault();
    await adminService.upsertSetting(form);
    setMessage(`${form.settingKey} saved`);
    setForm({ settingKey: '', settingValue: '', category: 'system' });
    loadSettings();
  };

  const quickToggle = async (preset) => {
    const current = settings.find((setting) => setting.settingKey === preset.settingKey)?.settingValue ?? preset.settingValue;
    const nextValue = String(current).toLowerCase() === 'true' ? 'false' : 'true';
    await adminService.upsertSetting({ ...preset, settingValue: nextValue });
    setMessage(`${preset.label} set to ${nextValue}`);
    loadSettings();
  };

  const columns = [
    { header: 'Setting', accessor: 'settingKey', render: (row) => getSettingLabel(row.settingKey) },
    { header: 'Current Value', accessor: 'settingValue', render: (row) => String(row.settingValue) },
    { header: 'Group', accessor: 'category', render: (row) => row.category || 'general' },
    { header: 'Updated', accessor: 'updatedAt', render: (row) => row.updatedAt ? new Date(row.updatedAt).toLocaleString() : '-' },
    { header: 'Actions', sortable: false, render: (row) => <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={() => setForm({ settingKey: row.settingKey, settingValue: row.settingValue, category: row.category || 'system' })}>Edit</button> },
  ];

  return (
    <div className={styles.adminOperationsPage}>
      <AdminPageHeader title="Platform Settings" description="Control common platform switches without editing the database manually." />
      <section className={styles.operationsGrid}>
        {settingPresets.map((preset) => (
          <button
            key={preset.settingKey}
            type="button"
            className={styles.settingPreset}
            onClick={() => setForm(preset)}
          >
            {preset.type === 'boolean' && (
              <span className={styles.settingToggle} onClick={(event) => { event.stopPropagation(); quickToggle(preset); }}>
                {String(settings.find((setting) => setting.settingKey === preset.settingKey)?.settingValue ?? preset.settingValue).toLowerCase() === 'true' ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                {String(settings.find((setting) => setting.settingKey === preset.settingKey)?.settingValue ?? preset.settingValue)}
              </span>
            )}
            <strong>{preset.label}</strong>
            <span>{preset.help}</span>
            <small>{preset.settingKey} = {preset.settingValue}</small>
          </button>
        ))}
      </section>
      <form className={styles.glassCard} onSubmit={saveSetting}>
        <p className={styles.metricLabel}>Edit setting</p>
        <div className={styles.formGrid}>
          <input className={styles.input} placeholder="Setting key" value={form.settingKey} onChange={(event) => setForm((prev) => ({ ...prev, settingKey: event.target.value }))} required />
          <input className={styles.input} placeholder="Setting value" value={form.settingValue} onChange={(event) => setForm((prev) => ({ ...prev, settingValue: event.target.value }))} required />
          <input className={styles.input} placeholder="Category" value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} />
          <button className={styles.button} type="submit"><Save size={16} /> Save Setting</button>
        </div>
        {message && <p className={styles.statusMessage}>{message}</p>}
      </form>
      <AdminDataTable columns={columns} data={settings} searchable={true} filterable={false} pagination={false} title="Settings" />
    </div>
  );
};

const settingPresets = [
  { label: 'Maintenance Mode', help: 'When true, most API actions are blocked for non-admin users.', settingKey: 'maintenanceMode', settingValue: 'false', category: 'system', type: 'boolean' },
  { label: 'New Registrations', help: 'When false, /register/step1 rejects new accounts.', settingKey: 'allowRegistrations', settingValue: 'true', category: 'auth', type: 'boolean' },
  { label: 'Job Posting', help: 'When false, employers cannot create new job posts.', settingKey: 'allowJobPosting', settingValue: 'true', category: 'jobs', type: 'boolean' },
  { label: 'Manual Approval', help: 'When true, new users stay PendingApproval after onboarding.', settingKey: 'requireUserApproval', settingValue: 'true', category: 'auth', type: 'boolean' },
  { label: 'Platform Commission', help: 'Default commission percent.', settingKey: 'commissionPercent', settingValue: '10', category: 'finance' },
  { label: 'Support Email', help: 'Public support contact address.', settingKey: 'supportEmail', settingValue: 'support@maesta.com', category: 'support' },
];

const getSettingLabel = (key) => settingPresets.find((preset) => preset.settingKey === key)?.label || key;

export default AdminSettings;
