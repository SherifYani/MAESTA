/**
 * @file CompanyInterviews.jsx
 * @description Company interviews management page – calendar and list views.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-05-04
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { Button } from '../../../../components/common/Button';
import { Badge } from '../../../../components/common/Badge';
import { FilterPanel } from '../../../../components/common/FilterPanel';
import { Modal } from '../../../../components/common/Modal';
import { DatePicker } from '../../../../components/common/DatePicker';
import { SuccessMessage, ErrorMessage } from '../../../../components/common/Message';
import AdminPageHeader from '../admin/components/shared/AdminPageHeader/AdminPageHeader';
import AdminDataTable from '../admin/components/shared/AdminDataTable';
import * as interviewService from '../../../../services/interviewService';
import styles from './CompanyInterviews.module.css';

const CompanyInterviews = () => {
  const navigate = useNavigate();
  // State
  const [interviews, setInterviews] = useState([]);
  const [filters, setFilters] = useState({ status: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [newDate, setNewDate] = useState(null);
  const [newTime, setNewTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'scheduledDate', direction: 'asc' });
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Load interviews
  const loadInterviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 20,
        status: filters.status !== 'all' ? filters.status : undefined,
        startDate: filters.startDate,
        endDate: filters.endDate,
        sort: sortConfig.key,
        order: sortConfig.direction,
      };
      const response = await interviewService.getCompanyInterviews(params);
      if (response.success) {
        setInterviews(response.data.interviews || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.totalItems || 0);
      } else {
        setError('Failed to load interviews');
      }
    } catch (err) {
      console.error(err);
      setError('Error loading interviews');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters, sortConfig]);

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleFilterReset = () => {
    setFilters({ status: 'all' });
    setCurrentPage(1);
  };

  const handleInterviewClick = (interview) => {
    setSelectedInterview(interview);
    setIsDetailsModalOpen(true);
  };

  const handleScheduleNew = () => {
    navigate('/dashboard/interviews/schedule');
  };

  const handleReschedule = (interview) => {
    setSelectedInterview(interview);
    setNewDate(new Date(interview.scheduledDate));
    setNewTime(interview.scheduledTime);
    setRescheduleReason('');
    setIsRescheduleModalOpen(true);
  };

  const handleCancel = (interview) => {
    setSelectedInterview(interview);
    setCancelReason('');
    setIsCancelModalOpen(true);
  };

  const confirmReschedule = async () => {
    if (!selectedInterview || !newDate || !newTime) return;
    try {
      const response = await interviewService.rescheduleInterview(
        selectedInterview.id,
        newDate.toISOString().split('T')[0],
        newTime,
        rescheduleReason
      );
      if (response.success) {
        setSuccess('Interview rescheduled successfully');
        loadInterviews();
      } else {
        setError('Failed to reschedule');
      }
    } catch (err) {
      setError('Error rescheduling');
    } finally {
      setIsRescheduleModalOpen(false);
      setSelectedInterview(null);
    }
  };

  const confirmCancel = async () => {
    if (!selectedInterview) return;
    try {
      const response = await interviewService.cancelInterview(selectedInterview.id, cancelReason);
      if (response.success) {
        setSuccess('Interview cancelled');
        loadInterviews();
      } else {
        setError('Failed to cancel');
      }
    } catch (err) {
      setError('Error cancelling');
    } finally {
      setIsCancelModalOpen(false);
      setSelectedInterview(null);
    }
  };

  // Filter config
  const filterConfig = {
    status: {
      label: 'Status',
      type: 'select',
      options: [
        { value: 'all', label: 'All' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    startDate: {
      label: 'From Date',
      type: 'date',
      placeholder: 'Start date',
    },
    endDate: {
      label: 'To Date',
      type: 'date',
      placeholder: 'End date',
    },
  };

  // Table columns
  const getColumns = () => {
    return [
      {
        header: 'Applicant',
        accessor: 'applicantName',
        sortable: true,
      },
      {
        header: 'Job',
        accessor: 'jobTitle',
        sortable: true,
      },
      {
        header: 'Date',
        accessor: 'scheduledDate',
        sortable: true,
        render: (row) => `${row.scheduledDate} at ${row.scheduledTime}`,
      },
      {
        header: 'Type',
        accessor: 'interviewType',
        sortable: true,
        render: (row) => (
          <Badge variant="info">
            {row.interviewType === 'video' ? '🎥 Video' : row.interviewType === 'phone' ? '📞 Phone' : '🏢 In-person'}
          </Badge>
        ),
      },
      {
        header: 'Status',
        accessor: 'status',
        sortable: true,
        render: (row) => {
          let variant = 'pending';
          if (row.status === 'scheduled') variant = 'info';
          if (row.status === 'completed') variant = 'success';
          if (row.status === 'cancelled') variant = 'error';
          return <Badge variant={variant}>{row.status}</Badge>;
        },
      },
      {
        header: 'Actions',
        accessor: 'actions',
        sortable: false,
        render: (row) => (
          <div className={styles.actionButtons}>
            <Button size="small" variant="outline" onClick={() => handleInterviewClick(row)}>View</Button>
            {row.status === 'scheduled' && (
              <>
                <Button size="small" variant="outline" onClick={() => handleReschedule(row)}>Reschedule</Button>
                <Button size="small" variant="danger" onClick={() => handleCancel(row)}>Cancel</Button>
              </>
            )}
          </div>
        ),
      },
    ];
  };

  // Simple calendar view (month grid)
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getInterviewsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return interviews.filter(i => i.scheduledDate === dateStr);
  };

  const CalendarView = () => {
    const days = getDaysInMonth(currentMonth);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const prevMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };
    const nextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    return (
      <div className={styles.calendarContainer}>
        <div className={styles.calendarHeader}>
          <Button variant="outline" size="small" onClick={prevMonth}>←</Button>
          <h3>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <Button variant="outline" size="small" onClick={nextMonth}>→</Button>
        </div>
        <div className={styles.weekDays}>
          {weekDays.map(day => <div key={day} className={styles.weekDay}>{day}</div>)}
        </div>
        <div className={styles.calendarGrid}>
          {days.map((day, idx) => {
            const dayInterviews = getInterviewsForDate(day);
            const hasInterviews = dayInterviews.length > 0;
            return (
              <div
                key={idx}
                className={`${styles.calendarDay} ${hasInterviews ? styles.hasInterviews : ''}`}
                onClick={() => {
                  if (hasInterviews) {
                    // Filter list view to this date
                    setFilters(prev => ({ ...prev, startDate: day.toISOString().split('T')[0], endDate: day.toISOString().split('T')[0] }));
                    setViewMode('list');
                  }
                }}
              >
                <span className={styles.dayNumber}>{day.getDate()}</span>
                {hasInterviews && (
                  <div className={styles.dayIndicator}>
                    {dayInterviews.length} interview{dayInterviews.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Header actions
  const headerActions = (
    <div className={styles.headerActions}>
      <div className={styles.viewToggle}>
        <Button
          variant={viewMode === 'list' ? 'primary' : 'outline'}
          size="small"
          onClick={() => setViewMode('list')}
        >
          List View
        </Button>
        <Button
          variant={viewMode === 'calendar' ? 'primary' : 'outline'}
          size="small"
          onClick={() => setViewMode('calendar')}
        >
          Calendar View
        </Button>
      </div>
      <Button variant="primary" onClick={handleScheduleNew}>
        + Schedule Interview
      </Button>
    </div>
  );

  if (isLoading && interviews.length === 0) {
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
        title="Interviews Management"
        description="View and manage all scheduled interviews"
        actions={headerActions}
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard/company' },
          { label: 'Interviews', href: '#' },
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

      {viewMode === 'calendar' && <CalendarView />}

      {viewMode === 'list' && (
        <AdminDataTable
          title=""
          columns={getColumns()}
          data={interviews}
          searchable={false}
          filterable={false}
          pagination={true}
          pageSize={20}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onRowClick={handleInterviewClick}
          sortConfig={sortConfig}
          onSort={(key) => {
            setSortConfig(prev => ({
              key,
              direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
            }));
            setCurrentPage(1);
          }}
        />
      )}

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Interview Details"
        size="md"
        actions={
          <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
        }
      >
        {selectedInterview && (
          <div className={styles.modalContent}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Applicant:</span>
              <span>{selectedInterview.applicantName}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Job:</span>
              <span>{selectedInterview.jobTitle}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Date & Time:</span>
              <span>{selectedInterview.scheduledDate} at {selectedInterview.scheduledTime}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Type:</span>
              <span>{selectedInterview.interviewType}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Location/Link:</span>
              <span>{selectedInterview.location}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status:</span>
              <Badge variant={
                selectedInterview.status === 'scheduled' ? 'info' :
                selectedInterview.status === 'completed' ? 'success' : 'error'
              }>{selectedInterview.status}</Badge>
            </div>
            {selectedInterview.notes && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Notes:</span>
                <span>{selectedInterview.notes}</span>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        title="Reschedule Interview"
        size="md"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsRescheduleModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={confirmReschedule}>Confirm Reschedule</Button>
          </>
        }
      >
        <div className={styles.modalField}>
          <label className={styles.formLabel}>New Date</label>
          <DatePicker
            selectedDate={newDate}
            onChange={setNewDate}
            minDate={new Date()}
          />
        </div>
        <div className={styles.modalField}>
          <label className={styles.formLabel}>New Time</label>
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className={styles.timeInput}
          />
        </div>
        <div className={styles.modalField}>
          <label className={styles.formLabel}>Reason (optional)</label>
          <textarea
            value={rescheduleReason}
            onChange={(e) => setRescheduleReason(e.target.value)}
            className={styles.textarea}
            placeholder="Why is this interview being rescheduled?"
            rows={3}
          />
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Interview"
        size="md"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>Keep</Button>
            <Button variant="danger" onClick={confirmCancel}>Confirm Cancel</Button>
          </>
        }
      >
        <p>Are you sure you want to cancel the interview with <strong>{selectedInterview?.applicantName}</strong>?</p>
        <div className={styles.modalField}>
          <label className={styles.formLabel}>Reason (optional)</label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className={styles.textarea}
            placeholder="Why is this interview being cancelled?"
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
};

export default CompanyInterviews;