/**
 * @file WithdrawForm.jsx
 * @description Modal form for withdrawing freelancer earnings with validation and responsive design
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */



import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    X,
    Landmark,
    CreditCard,
    CheckCircle,
    AlertCircle,
    Wallet,
    Calculator,
    Shield,
} from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import styles from './WithdrawForm.module.css';

/**
 * Modal form component for withdrawing earnings from escrow balance.
 * Includes validation, fee calculation, and multiple withdrawal methods.
 * @param {Object} props - Component props
 * @param {number} props.availableBalance - Available balance for withdrawal
 * @param {Function} props.onClose - Function to close the modal
 * @returns {JSX.Element} Rendered withdrawal form modal
 */
const WithdrawForm = ({ availableBalance, onClose }) => {
    const { withdrawEarnings, loading } = useSubscription();
    const [formData, setFormData] = useState({
        amount: '',
        method: 'bank',
        accountDetails: '',
        currency: 'USD',
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState('');
    const [calculatedFee, setCalculatedFee] = useState(0);
    const [calculatedTotal, setCalculatedTotal] = useState(0);

    /**
     * Withdrawal methods configuration
     */
    const withdrawalMethods = [
        {
            id: 'bank',
            name: 'Bank Transfer',
            icon: Landmark,
            fee: 0.01, // 1%
            processingTime: '2-3 business days',
            description: 'Direct transfer to your bank account',
            placeholder: 'Enter account number and routing number',
        },
        {
            id: 'paypal',
            name: 'PayPal',
            icon: CreditCard,
            fee: 0.02, // 2%
            processingTime: '24-48 hours',
            description: 'Transfer to your PayPal account',
            placeholder: 'Enter PayPal email address',
        },
    ];

    /**
     * Gets selected method details
     */
    const selectedMethod = withdrawalMethods.find((m) => m.id === formData.method);

    /**
     * Calculate fee and total whenever amount changes
     */
    useEffect(() => {
        if (formData.amount && !isNaN(parseFloat(formData.amount))) {
            const amount = parseFloat(formData.amount);
            const fee = amount * selectedMethod.fee;
            const total = amount + fee;

            setCalculatedFee(fee);
            setCalculatedTotal(total);
        } else {
            setCalculatedFee(0);
            setCalculatedTotal(0);
        }
    }, [formData.amount, selectedMethod.fee]);

    /**
     * Handles form input changes with validation
     * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} event - Input change event
     */
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    /**
     * Sets the withdrawal amount to maximum available balance
     */
    const handleSetMaxAmount = () => {
        setFormData((prev) => ({
            ...prev,
            amount: availableBalance.toFixed(2),
        }));
    };

    /**
     * Validates form data
     * @returns {boolean} True if form is valid
     */
    const validateForm = useCallback(() => {
        const newErrors = {};
        const amount = parseFloat(formData.amount);

        // Amount validation
        if (!formData.amount.trim()) {
            newErrors.amount = 'Amount is required';
        } else if (isNaN(amount) || amount <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        } else if (amount < 10) {
            newErrors.amount = 'Minimum withdrawal amount is $10.00';
        } else if (amount > availableBalance) {
            newErrors.amount = `Amount exceeds available balance ($${availableBalance.toFixed(2)})`;
        }

        // Account details validation
        if (!formData.accountDetails.trim()) {
            newErrors.accountDetails = 'Account details are required';
        } else if (formData.method === 'paypal') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.accountDetails)) {
                newErrors.accountDetails = 'Please enter a valid email address';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData.amount, formData.accountDetails, formData.method, availableBalance]);

    /**
     * Handles form submission
     * @param {React.FormEvent<HTMLFormElement>} event - Form submit event
     */
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        const result = await withdrawEarnings(
            parseFloat(formData.amount),
            formData.method,
            formData.accountDetails
        );

        if (result.success) {
            setSuccess(true);
            setMessage(result.message || 'Withdrawal request submitted successfully');

            // Close modal after delay
            setTimeout(() => {
                onClose();
            }, 3000);
        } else {
            setErrors({ submit: result.message || 'Withdrawal failed. Please try again.' });
        }
    };

    /**
     * Formats currency amount
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    /**
     * Handles modal overlay click to close
     * @param {React.MouseEvent<HTMLDivElement>} event - Click event
     */
    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    /**
     * Closes modal on Escape key press
     */
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && !loading && !success) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [loading, success, onClose]);

    /**
     * Renders withdrawal method options
     */
    const renderMethodOptions = () => {
        return withdrawalMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = formData.method === method.id;

            return (
                <label
                    key={method.id}
                    className={`${styles.methodOption} ${isSelected ? styles.methodOptionSelected : ''
                        }`}
                    htmlFor={`method-${method.id}`}
                    aria-label={`Select ${method.name} withdrawal method`}
                >
                    <input
                        id={`method-${method.id}`}
                        type="radio"
                        name="method"
                        value={method.id}
                        checked={isSelected}
                        onChange={handleChange}
                        className={styles.methodRadio}
                        aria-checked={isSelected}
                    />
                    <Icon size={24} className={styles.methodIcon} aria-hidden="true" />
                    <div className={styles.methodContent}>
                        <div className={styles.methodHeader}>
                            <span className={styles.methodName}>{method.name}</span>
                            <span className={styles.methodFee}>
                                Fee: {(method.fee * 100).toFixed(0)}%
                            </span>
                        </div>
                        <p className={styles.methodDescription}>{method.description}</p>
                        <p className={styles.methodProcessing}>
                            Processing: {method.processingTime}
                        </p>
                    </div>
                </label>
            );
        });
    };

    /**
     * Renders fee breakdown
     */
    const renderFeeBreakdown = () => {
        if (!formData.amount || parseFloat(formData.amount) <= 0) return null;

        return (
            <div className={styles.feeBreakdown}>
                <h4 className={styles.feeTitle}>
                    <Calculator size={16} className={styles.feeIcon} />
                    Fee Breakdown
                </h4>
                <div className={styles.feeGrid}>
                    <div className={styles.feeRow}>
                        <span className={styles.feeLabel}>Withdrawal Amount</span>
                        <span className={styles.feeValue}>{formatCurrency(parseFloat(formData.amount))}</span>
                    </div>
                    <div className={styles.feeRow}>
                        <span className={styles.feeLabel}>
                            Fee ({(selectedMethod.fee * 100).toFixed(0)}%)
                        </span>
                        <span className={styles.feeValue}>{formatCurrency(calculatedFee)}</span>
                    </div>
                    <div className={styles.feeDivider} />
                    <div className={styles.feeRow}>
                        <span className={styles.feeTotalLabel}>Total Deduction</span>
                        <span className={styles.feeTotalValue}>{formatCurrency(calculatedTotal)}</span>
                    </div>
                    <div className={styles.feeRow}>
                        <span className={styles.feeLabel}>You Will Receive</span>
                        <span className={styles.feeReceiveValue}>
                            {formatCurrency(parseFloat(formData.amount))}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div
            className={styles.overlay}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-label="Withdraw earnings form"
        >
            <div className={styles.modal} data-testid="withdraw-form-modal">
                {/* Modal Header */}
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <h2 className={styles.title}>
                            <Wallet size={24} className={styles.titleIcon} />
                            Withdraw Earnings
                        </h2>
                        <p className={styles.subtitle}>Transfer funds from your escrow balance</p>
                    </div>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close withdrawal form"
                    >
                        <X size={24} aria-hidden="true" />
                    </button>
                </header>

                {success ? (
                    /* Success State */
                    <div className={styles.successState} role="status" aria-live="polite">
                        <div className={styles.successIcon}>
                            <CheckCircle size={48} className={styles.successIconSvg} aria-hidden="true" />
                        </div>
                        <h3 className={styles.successTitle}>Withdrawal Submitted Successfully!</h3>
                        <p className={styles.successMessage}>{message}</p>
                        <div className={styles.successDetails}>
                            <p className={styles.successDetail}>
                                <strong>Amount:</strong> {formatCurrency(parseFloat(formData.amount))}
                            </p>
                            <p className={styles.successDetail}>
                                <strong>Method:</strong> {selectedMethod.name}
                            </p>
                            <p className={styles.successDetail}>
                                <strong>Processing:</strong> {selectedMethod.processingTime}
                            </p>
                        </div>
                        <div className={styles.successNote}>
                            This window will close automatically in 3 seconds...
                        </div>
                    </div>
                ) : (
                    /* Form Content */
                    <>
                        {/* Available Balance */}
                        <div className={styles.balanceCard}>
                            <div className={styles.balanceHeader}>
                                <Wallet size={20} className={styles.balanceIcon} aria-hidden="true" />
                                <span className={styles.balanceLabel}>Available Balance</span>
                            </div>
                            <div className={styles.balanceAmount}>{formatCurrency(availableBalance)}</div>
                            <div className={styles.balanceNote}>
                                Minimum withdrawal: {formatCurrency(10)}
                            </div>
                        </div>

                        {/* Form */}
                        <form
                            className={styles.form}
                            onSubmit={handleSubmit}
                            noValidate
                            aria-label="Withdrawal form"
                        >
                            {/* Withdrawal Amount */}
                            <div className={styles.formGroup}>
                                <label htmlFor="amount" className={styles.label}>
                                    Withdrawal Amount
                                </label>
                                <div className={styles.amountInputGroup}>
                                    <span className={styles.currencySymbol}>$</span>
                                    <input
                                        id="amount"
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="10"
                                        max={availableBalance}
                                        className={`${styles.input} ${errors.amount ? styles.inputError : ''
                                            }`}
                                        aria-label="Enter withdrawal amount"
                                        aria-invalid={!!errors.amount}
                                        aria-describedby={errors.amount ? 'amount-error' : undefined}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.maxButton}
                                        onClick={handleSetMaxAmount}
                                        aria-label="Set maximum available amount"
                                    >
                                        MAX
                                    </button>
                                </div>
                                {errors.amount && (
                                    <div
                                        id="amount-error"
                                        className={styles.errorMessage}
                                        role="alert"
                                        aria-live="polite"
                                    >
                                        <AlertCircle size={16} className={styles.errorIcon} />
                                        <span>{errors.amount}</span>
                                    </div>
                                )}
                            </div>

                            {/* Withdrawal Method */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Withdrawal Method</label>
                                <div className={styles.methodsContainer}>{renderMethodOptions()}</div>
                            </div>

                            {/* Account Details */}
                            <div className={styles.formGroup}>
                                <label htmlFor="accountDetails" className={styles.label}>
                                    {formData.method === 'bank' ? 'Account Details' : 'PayPal Email'}
                                </label>
                                <input
                                    id="accountDetails"
                                    type={formData.method === 'bank' ? 'text' : 'email'}
                                    name="accountDetails"
                                    value={formData.accountDetails}
                                    onChange={handleChange}
                                    placeholder={selectedMethod.placeholder}
                                    className={`${styles.input} ${errors.accountDetails ? styles.inputError : ''
                                        }`}
                                    aria-label={`Enter ${formData.method === 'bank' ? 'account details' : 'PayPal email'}`}
                                    aria-invalid={!!errors.accountDetails}
                                    aria-describedby={
                                        errors.accountDetails ? 'account-details-error' : undefined
                                    }
                                    required
                                />
                                {errors.accountDetails && (
                                    <div
                                        id="account-details-error"
                                        className={styles.errorMessage}
                                        role="alert"
                                        aria-live="polite"
                                    >
                                        <AlertCircle size={16} className={styles.errorIcon} />
                                        <span>{errors.accountDetails}</span>
                                    </div>
                                )}
                            </div>

                            {/* Fee Breakdown */}
                            {renderFeeBreakdown()}

                            {/* Security Note */}
                            <div className={styles.securityNote}>
                                <Shield size={16} className={styles.securityIcon} />
                                <p>
                                    Your financial information is encrypted and secured. We never store your
                                    full account details.
                                </p>
                            </div>

                            {/* Submit Error */}
                            {errors.submit && (
                                <div
                                    className={styles.submitError}
                                    role="alert"
                                    aria-live="assertive"
                                >
                                    <AlertCircle size={20} className={styles.submitErrorIcon} />
                                    <div>
                                        <p className={styles.submitErrorTitle}>Withdrawal Failed</p>
                                        <p className={styles.submitErrorMessage}>{errors.submit}</p>
                                    </div>
                                </div>
                            )}

                            {/* Form Actions */}
                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={onClose}
                                    disabled={loading}
                                    aria-label="Cancel withdrawal"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={
                                        loading ||
                                        !formData.amount ||
                                        parseFloat(formData.amount) < 10 ||
                                        parseFloat(formData.amount) > availableBalance ||
                                        !formData.accountDetails.trim()
                                    }
                                    aria-label="Confirm withdrawal"
                                    aria-busy={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className={styles.spinner} aria-hidden="true" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Confirm Withdrawal'
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

WithdrawForm.propTypes = {
    /**
     * Available balance for withdrawal
     */
    availableBalance: PropTypes.number.isRequired,
    /**
     * Function to close the modal
     */
    onClose: PropTypes.func.isRequired,
    /**
     * Loading state from context
     */
    loading: PropTypes.bool,
    /**
     * Withdraw function from context
     */
    withdrawEarnings: PropTypes.func,
};

WithdrawForm.defaultProps = {
    loading: false,
    withdrawEarnings: () => Promise.resolve({ success: false, message: '' }),
};

export default WithdrawForm;