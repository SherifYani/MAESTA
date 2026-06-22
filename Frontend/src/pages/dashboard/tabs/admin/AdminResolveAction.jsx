/**
 * @file AdminResolveAction.jsx
 * @description Admin resolve action page – resolve a single pending item with approve/reject.
 * @author Sherif Talaat
 * @date 2026-05-04
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-05-04
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { Button } from '../../../../components/common/Button';
import { Input } from '../../../../components/common/Input';
import { Badge } from '../../../../components/common/Badge';
import { Modal } from '../../../../components/common/Modal';
import { SuccessMessage, ErrorMessage } from '../../../../components/common/Message';
import AdminPageHeader from './components/shared/AdminPageHeader/AdminPageHeader';
import * as adminService from '../../../../services/adminService';
import styles from './AdminResolveAction.module.css';

const AdminResolveAction = () => {
  const { actionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const itemId = queryParams.get('itemId');

  // State
  const [item, setItem] = useState(null);
  const [resolutionAction, setResolutionAction] = useState('approve');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Load item details
  useEffect(() => {
    const loadItem = async () => {
      if (!itemId) {
        setError('No item specified');
        return;
      }
      setIsLoading(true);
      try {
        const response = await adminService.getPendingItemDetail(actionId, itemId);
        if (response.success) {
          setItem(response.data);
        } else {
          setError('Failed to load item details');
        }
      } catch (err) {
        console.error(err);
        setError('Error loading item details');
      } finally {
        setIsLoading(false);
      }
    };
    loadItem();
  }, [actionId, itemId]);

  const handleSubmit = () => {
    if (!resolutionAction) {
      setError('Please select an action (Approve or Reject)');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setShowConfirm(false);
    try {
      const response = await adminService.resolvePendingItem(actionId, itemId, {
        action: resolutionAction,
        reason,
        notes,
      });
      if (response.success) {
        setSuccess(`Item ${resolutionAction}d successfully`);
        setTimeout(() => {
          navigate(`/dashboard/admin/pending/${actionId}`);
        }, 2000);
      } else {
        setError('Failed to resolve item');
      }
    } catch (err) {
      console.error(err);
      setError('Error during resolution');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (!item && !isLoading) {
    return (
      <div className={styles.container}>
        <ErrorMessage message="Item not found" />
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title={`Resolve: ${item?.title || 'Item'}`}
        description="Review the details below and choose an action."
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard/admin' },
          { label: 'Pending Actions', href: `/dashboard/admin/pending/${actionId}` },
          { label: 'Resolve', href: '#' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      {success && <SuccessMessage message={success} onDismiss={() => setSuccess(null)} autoDismiss={3000} />}
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} autoDismiss={5000} />}

      <div className={styles.contentGrid}>
        {/* Item Details Card */}
        <div className={styles.detailsCard}>
          <h2 className={styles.cardTitle}>Item Details</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>ID:</span>
              <span className={styles.detailValue}>{item?.id}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Title:</span>
              <span className={styles.detailValue}>{item?.title}</span>
            </div>
            {item?.email && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Email:</span>
                <span className={styles.detailValue}>{item?.email}</span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Submitted:</span>
              <span className={styles.detailValue}>{new Date(item?.submittedAt).toLocaleString()}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Priority:</span>
              <span className={styles.detailValue}>
                <Badge variant={item?.priority === 'high' ? 'high' : item?.priority === 'medium' ? 'medium' : 'low'}>
                  {item?.priority || 'medium'}
                </Badge>
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status:</span>
              <span className={styles.detailValue}>
                <Badge variant="pending">{item?.status}</Badge>
              </span>
            </div>
          </div>
          {item?.details && (
            <div className={styles.extraDetails}>
              <h3 className={styles.subtitle}>Additional Information</h3>
              <pre className={styles.jsonPreview}>{JSON.stringify(item.details, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Resolution Form Card */}
        <div className={styles.formCard}>
          <h2 className={styles.cardTitle}>Resolution</h2>

          <div className={styles.actionSelector}>
            <label className={styles.formLabel}>Action:</label>
            <div className={styles.actionOptions}>
              <button
                className={`${styles.actionOption} ${resolutionAction === 'approve' ? styles.selectedApprove : ''}`}
                onClick={() => setResolutionAction('approve')}
                type="button"
              >
                ✅ Approve
              </button>
              <button
                className={`${styles.actionOption} ${resolutionAction === 'reject' ? styles.selectedReject : ''}`}
                onClick={() => setResolutionAction('reject')}
                type="button"
              >
                ❌ Reject
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="reason" className={styles.formLabel}>Reason (required for rejection):</label>
            <Input
              id="reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you taking this action?"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="notes" className={styles.formLabel}>Notes (optional):</label>
            <textarea
              id="notes"
              className={styles.textarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes for future reference..."
              rows={4}
            />
          </div>

          <div className={styles.formActions}>
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Resolution'}
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={`Confirm ${resolutionAction === 'approve' ? 'Approval' : 'Rejection'}`}
        size="md"
        actions={
          <>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button
              variant={resolutionAction === 'approve' ? 'success' : 'danger'}
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              Confirm {resolutionAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </>
        }
      >
        <p>You are about to <strong>{resolutionAction}</strong> this item.</p>
        {reason && <p>Reason: {reason}</p>}
        {!reason && resolutionAction === 'reject' && (
          <p className={styles.warning}>No reason provided. It's recommended to add a reason.</p>
        )}
      </Modal>
    </div>
  );
};

export default AdminResolveAction;