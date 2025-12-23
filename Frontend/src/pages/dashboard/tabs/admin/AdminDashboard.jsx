/**
 * @file AdminDashboard.jsx
 * @description Admin dashboard for system administration and management
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2025-12-22
 */

import StatsGrid from "../../components/StatsGrid";
import RecentActivity from "../../components/RecentActivity";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import {
  Users,
  DollarSign,
  Shield,
  BarChart3,
  Settings,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
} from "lucide-react";
import styles from "./AdminDashboard.module.css";

/**
 * Admin Data Table Component
 */
const AdminDataTable = ({ title, columns, data, actions }) => (
  <div className={styles.dataTable}>
    <div className={styles.tableHeader}>
      <h3>{title}</h3>
      <div className={styles.tableActions}>
        <Button variant="outline" size="small" icon={Filter}>
          Filter
        </Button>
        <Button variant="outline" size="small" icon={Download}>
          Export
        </Button>
      </div>
    </div>
    <div className={styles.tableContainer}>
      <table>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
              <td>
                <div className={styles.actionButtons}>
                  <Button variant="ghost" size="small" icon={Eye} />
                  <Button variant="ghost" size="small" icon={Edit} />
                  <Button variant="ghost" size="small" icon={Trash2} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/**
 * Admin Dashboard Component
 */
const AdminDashboard = ({ data }) => {
  // Get data from props
  const metrics = data.metrics;
  const activities = data.activities;

  // Sample admin data
  const usersData = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Job Seeker",
      status: "active",
      joined: "2024-01-15",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Employer",
      status: "active",
      joined: "2024-01-10",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "Freelancer",
      status: "pending",
      joined: "2024-01-20",
    },
  ];

  const jobsData = [
    {
      id: 1,
      title: "Senior Developer",
      company: "TechCorp",
      status: "active",
      applicants: 42,
      posted: "2024-01-18",
    },
    {
      id: 2,
      title: "UI Designer",
      company: "CreativeLab",
      status: "pending",
      applicants: 28,
      posted: "2024-01-19",
    },
  ];

  const reportsData = [
    {
      id: 1,
      user: "john@example.com",
      type: "Inappropriate Content",
      status: "pending",
      reported: "2024-01-20",
    },
    {
      id: 2,
      user: "jane@example.com",
      type: "Spam",
      status: "resolved",
      reported: "2024-01-19",
    },
  ];

  // Table columns
  const userColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Badge variant={item.status === "active" ? "success" : "warning"}>
          {item.status}
        </Badge>
      ),
    },
  ];

  const jobColumns = [
    { key: "title", label: "Job Title" },
    { key: "company", label: "Company" },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Badge variant={item.status === "active" ? "success" : "warning"}>
          {item.status}
        </Badge>
      ),
    },
    { key: "applicants", label: "Applicants" },
  ];

  const reportColumns = [
    { key: "user", label: "Reported User" },
    { key: "type", label: "Report Type" },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Badge variant={item.status === "resolved" ? "success" : "warning"}>
          {item.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className={styles.adminDashboard}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>
            System administration, moderation, and management
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" icon={Settings}>
            System Settings
          </Button>
          <Button variant="outline" icon={Shield}>
            Security
          </Button>
        </div>
      </header>

      {/* Quick Stats Section */}
      <section className={styles.quickStatsSection}>
        <StatsGrid metrics={metrics} />
      </section>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {/* User Management - FR-703.2 */}
          <Card
            title="User Management"
            subtitle="Manage all user accounts in the system"
            className={styles.userCard}
            action={
              <Button variant="ghost" size="small">
                Manage All Users
              </Button>
            }>
            <AdminDataTable
              title="Recent Users"
              columns={userColumns}
              data={usersData}
            />
          </Card>

          {/* Job/Project Management - FR-703.3 */}
          <Card
            title="Job & Project Management"
            subtitle="Review, moderate, and manage all jobs and projects"
            className={styles.jobCard}
            action={
              <Button variant="ghost" size="small">
                View All Jobs
              </Button>
            }>
            <AdminDataTable
              title="Recent Job Posts"
              columns={jobColumns}
              data={jobsData}
            />
          </Card>
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          {/* Content Moderation - FR-703.4 */}
          <Card
            title="Content Moderation"
            subtitle="Review reported content and user reports"
            className={styles.moderationCard}
            action={<Badge variant="warning">3 pending</Badge>}>
            <AdminDataTable
              title="Recent Reports"
              columns={reportColumns}
              data={reportsData}
            />
          </Card>

          {/* Recent Activity */}
          <Card
            title="Recent Activity"
            subtitle="System and user activities"
            className={styles.activityCard}>
            <RecentActivity activities={activities} limit={5} />
          </Card>

          {/* Quick Actions */}
          <Card
            title="Quick Admin Actions"
            subtitle="Common administrative tasks"
            className={styles.quickActionsCard}>
            <div className={styles.quickActionsList}>
              <Button variant="outline" icon={Users} fullWidth>
                Add New Staff Member
              </Button>
              <Button variant="outline" icon={BarChart3} fullWidth>
                Generate System Report
              </Button>
              <Button variant="outline" icon={DollarSign} fullWidth>
                View Financial Reports
              </Button>
              <Button variant="outline" icon={Settings} fullWidth>
                System Configuration
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
