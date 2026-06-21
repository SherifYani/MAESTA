/**
 * @file PaymentCheckout.jsx
 * @description Secure payment checkout form for subscription plans with validation and responsive design
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */



import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    CreditCard,
    Lock,
    CheckCircle,
    AlertCircle,
    Shield,
    Calendar,
    User,
    MapPin,
    Loader,
} from 'lucide-react';
import styles from './PaymentCheckout.module.css';

/**
 * Secure payment checkout form component for processing subscription payments.
 * Includes card validation, order summary, and security features.
 * @param {Object} props - Component props
 * @param {Object} props.plan - Selected subscription plan details
 * @param {string} props.billingPeriod - Billing period ('monthly' or 'yearly')
 * @param {Function} props.onSubmit - Callback function when form is submitted
 * @param {Function} props.onCancel - Callback function to cancel payment
 * @param {boolean} props.loading - Loading state for form submission
 * @param {string} props.currency - Currency for display (default: USD)
 * @returns {JSX.Element} Rendered payment checkout form
 */
const PaymentCheckout = ({
    plan,
    billingPeriod,
    onSubmit,
    onCancel,
    loading = false,
    currency = 'USD',
}) => {
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        billingZip: '',
        rememberCard: false,
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [cardType, setCardType] = useState('unknown');
    const [isValidating, setIsValidating] = useState(false);

    /**
     * Get price based on billing period
     */
    const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

    /**
     * Detect credit card type based on number
     * @param {string} cardNumber - Credit card number
     * @returns {string} Card type identifier
     */
    const detectCardType = useCallback((cardNumber) => {
        const cleanedNumber = cardNumber.replace(/\s/g, '');

        const cardPatterns = {
            visa: /^4/,
            mastercard: /^5[1-5]/,
            amex: /^3[47]/,
            discover: /^6(?:011|5)/,
            diners: /^3(?:0[0-5]|[68])/,
            jcb: /^35/,
        };

        for (const [type, pattern] of Object.entries(cardPatterns)) {
            if (pattern.test(cleanedNumber)) {
                return type;
            }
        }

        return 'unknown';
    }, []);

    /**
     * Format card number with spaces every 4 digits
     * @param {string} value - Raw card number
     * @returns {string} Formatted card number
     */
    const formatCardNumber = useCallback((value) => {
        return value
            .replace(/\s/g, '')
            .replace(/(\d{4})/g, '$1 ')
            .trim()
            .slice(0, 19);
    }, []);

    /**
     * Format expiry date as MM/YY
     * @param {string} value - Raw expiry date
     * @returns {string} Formatted expiry date
     */
    const formatExpiryDate = useCallback((value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '$1/$2')
            .slice(0, 5);
    }, []);

    /**
     * Format currency amount
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    const formatCurrency = useCallback((amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    }, [currency]);

    /**
     * Update card type when card number changes
     */
    useEffect(() => {
        const cleanedNumber = formData.cardNumber.replace(/\s/g, '');
        if (cleanedNumber.length >= 4) {
            setCardType(detectCardType(cleanedNumber));
        } else {
            setCardType('unknown');
        }
    }, [formData.cardNumber, detectCardType]);

    /**
     * Handle input changes with formatting
     * @param {React.ChangeEvent<HTMLInputElement>} event - Input change event
     */
    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        const inputValue = type === 'checkbox' ? checked : value;

        let formattedValue = inputValue;

        if (name === 'cardNumber') {
            formattedValue = formatCardNumber(inputValue);
        } else if (name === 'expiryDate') {
            formattedValue = formatExpiryDate(inputValue);
        } else if (name === 'cvv') {
            formattedValue = inputValue.replace(/\D/g, '').slice(0, 4);
        } else if (name === 'billingZip') {
            formattedValue = inputValue.replace(/\D/g, '').slice(0, 5);
        }

        setFormData((prev) => ({ ...prev, [name]: formattedValue }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    /**
     * Handle input blur for validation
     * @param {React.FocusEvent<HTMLInputElement>} event - Blur event
     */
    const handleBlur = (event) => {
        const { name } = event.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        validateField(name, formData[name]);
    };

    /**
     * Validate individual field
     * @param {string} fieldName - Field name to validate
     * @param {string} value - Field value
     */
    const validateField = (fieldName, value) => {
        let error = '';

        switch (fieldName) {
            case 'cardNumber': {
                const cardDigits = value.replace(/\s/g, '');
                if (!cardDigits) {
                    error = 'Card number is required';
                } else if (cardDigits.length !== 16) {
                    error = 'Card number must be 16 digits';
                } else if (!/^\d+$/.test(cardDigits)) {
                    error = 'Card number must contain only digits';
                }
                break;
            }

            case 'cardName': {
                if (!value.trim()) {
                    error = 'Cardholder name is required';
                } else if (value.trim().length < 2) {
                    error = 'Name must be at least 2 characters';
                }
                break;
            }

            case 'expiryDate': {
                if (!value) {
                    error = 'Expiry date is required';
                } else if (!/^\d{2}\/\d{2}$/.test(value)) {
                    error = 'Invalid date format (MM/YY)';
                } else {
                    const [month, year] = value.split('/');
                    const currentYear = new Date().getFullYear() % 100;
                    const currentMonth = new Date().getMonth() + 1;

                    if (parseInt(month, 10) > 12 || parseInt(month, 10) < 1) {
                        error = 'Invalid month';
                    } else if (
                        parseInt(year, 10) < currentYear ||
                        (parseInt(year, 10) === currentYear &&
                            parseInt(month, 10) < currentMonth)
                    ) {
                        error = 'Card has expired';
                    }
                }
                break;
            }

            case 'cvv': {
                if (!value) {
                    error = 'CVV is required';
                } else if (value.length < 3 || value.length > 4) {
                    error = 'CVV must be 3-4 digits';
                } else if (!/^\d+$/.test(value)) {
                    error = 'CVV must contain only digits';
                }
                break;
            }

            case 'billingZip': {
                if (!value.trim()) {
                    error = 'ZIP code is required';
                } else if (value.length !== 5) {
                    error = 'ZIP code must be 5 digits';
                } else if (!/^\d+$/.test(value)) {
                    error = 'ZIP code must contain only digits';
                }
                break;
            }

            default:
                break;
        }

        setErrors((prev) => ({
            ...prev,
            [fieldName]: error,
        }));
    };

    /**
     * Validate entire form
     * @returns {boolean} True if form is valid
     */
    const validateForm = () => {
        const fieldsToValidate = [
            'cardNumber',
            'cardName',
            'expiryDate',
            'cvv',
            'billingZip',
        ];

        fieldsToValidate.forEach((field) => {
            validateField(field, formData[field]);
        });

        return !fieldsToValidate.some((field) => errors[field]);
    };

    /**
     * Handle form submission
     * @param {React.FormEvent<HTMLFormElement>} event - Form submit event
     */
    const handleSubmit = async (event) => {
        event.preventDefault();

        setIsValidating(true);

        // Mark all fields as touched
        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);

        if (validateForm()) {
            const paymentData = {
                ...formData,
                cardNumber: formData.cardNumber.replace(/\s/g, ''),
                plan: plan.id,
                billingPeriod,
                amount: price,
                currency,
                cardType,
            };

            await onSubmit(paymentData);
        }

        setIsValidating(false);
    };

    /**
     * Get card type display name
     * @returns {string} Card type display name
     */
    const getCardTypeName = () => {
        const typeNames = {
            visa: 'Visa',
            mastercard: 'Mastercard',
            amex: 'American Express',
            discover: 'Discover',
            diners: 'Diners Club',
            jcb: 'JCB',
            unknown: 'Credit Card',
        };

        return typeNames[cardType] || typeNames.unknown;
    };

    /**
     * Get card icon based on type
     * @returns {React.ElementType} Icon component
     */
    /**
     * Handle cancel button click
     */
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    /**
     * Test card numbers for development
     */
    const handleUseTestCard = (type) => {
        const testCards = {
            visa: '4242 4242 4242 4242',
            mastercard: '5555 5555 5555 4444',
            amex: '3782 822463 10005',
            discover: '6011 1111 1111 1117',
        };

        const testCard = testCards[type];
        if (testCard) {
            setFormData((prev) => ({
                ...prev,
                cardNumber: testCard,
                cardName: 'Test User',
                expiryDate: '12/30',
                cvv: '123',
                billingZip: '12345',
            }));
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerIcon}>
                        <Lock size={24} aria-hidden="true" />
                    </div>
                    <div>
                        <h1 className={styles.title}>Secure Payment</h1>
                        <p className={styles.subtitle}>
                            Your payment information is encrypted and secure
                        </p>
                    </div>
                </div>
            </header>

            {/* Order Summary */}
            <section className={styles.orderSummary} aria-label="Order summary">
                <h2 className={styles.orderSummaryTitle}>Order Summary</h2>
                <div className={styles.orderSummaryContent}>
                    <div className={styles.orderSummaryRow}>
                        <span className={styles.orderSummaryLabel}>{plan.name} Plan</span>
                        <span className={styles.orderSummaryValue}>{formatCurrency(price)}</span>
                    </div>
                    <div className={styles.orderSummaryRow}>
                        <span className={styles.orderSummaryLabel}>Billing Period</span>
                        <span className={styles.orderSummaryValue}>
                            {billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'}
                        </span>
                    </div>
                    {plan.features && plan.features.length > 0 && (
                        <div className={styles.orderSummaryFeatures}>
                            <span className={styles.featuresLabel}>Includes:</span>
                            <ul className={styles.featuresList}>
                                {plan.features.slice(0, 3).map((feature, index) => (
                                    <li key={`feature-${index}`} className={styles.featureItem}>
                                        <CheckCircle size={12} className={styles.featureIcon} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className={styles.orderSummaryTotal}>
                        <span className={styles.totalLabel}>Total</span>
                        <span className={styles.totalAmount}>{formatCurrency(price)}</span>
                    </div>
                </div>
            </section>

            {/* Payment Form */}
            <form
                className={styles.form}
                onSubmit={handleSubmit}
                noValidate
                aria-label="Payment form"
            >
                {/* Card Number */}
                <div className={styles.formGroup}>
                    <label htmlFor="cardNumber" className={styles.label}>
                        Card Number
                    </label>
                    <div className={styles.inputContainer}>
                        <div className={styles.inputPrefix}>
                            <CreditCard
                                size={20}
                                className={styles.inputIcon}
                                aria-hidden="true"
                            />
                        </div>
                        <input
                            id="cardNumber"
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="4242 4242 4242 4242"
                            className={`${styles.input} ${styles.inputWithIcon} ${errors.cardNumber && touched.cardNumber ? styles.inputError : ''
                                }`}
                            aria-label="Enter credit card number"
                            aria-invalid={!!(errors.cardNumber && touched.cardNumber)}
                            aria-describedby={
                                errors.cardNumber && touched.cardNumber
                                    ? 'card-number-error'
                                    : 'card-number-help'
                            }
                            autoComplete="cc-number"
                            maxLength="19"
                        />
                        {cardType !== 'unknown' && (
                            <div className={styles.cardTypeIndicator} aria-hidden="true">
                                {getCardTypeName()}
                            </div>
                        )}
                    </div>
                    {errors.cardNumber && touched.cardNumber && (
                        <div
                            id="card-number-error"
                            className={styles.errorMessage}
                            role="alert"
                            aria-live="polite"
                        >
                            <AlertCircle size={16} className={styles.errorIcon} />
                            <span>{errors.cardNumber}</span>
                        </div>
                    )}
                    <div id="card-number-help" className={styles.helpText}>
                        Use test card: 4242 4242 4242 4242
                    </div>
                </div>

                {/* Cardholder Name */}
                <div className={styles.formGroup}>
                    <label htmlFor="cardName" className={styles.label}>
                        Cardholder Name
                    </label>
                    <div className={styles.inputContainer}>
                        <div className={styles.inputPrefix}>
                            <User size={20} className={styles.inputIcon} aria-hidden="true" />
                        </div>
                        <input
                            id="cardName"
                            type="text"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="John Doe"
                            className={`${styles.input} ${styles.inputWithIcon} ${errors.cardName && touched.cardName ? styles.inputError : ''
                                }`}
                            aria-label="Enter cardholder name"
                            aria-invalid={!!(errors.cardName && touched.cardName)}
                            aria-describedby={
                                errors.cardName && touched.cardName ? 'card-name-error' : undefined
                            }
                            autoComplete="cc-name"
                        />
                    </div>
                    {errors.cardName && touched.cardName && (
                        <div
                            id="card-name-error"
                            className={styles.errorMessage}
                            role="alert"
                            aria-live="polite"
                        >
                            <AlertCircle size={16} className={styles.errorIcon} />
                            <span>{errors.cardName}</span>
                        </div>
                    )}
                </div>

                {/* Expiry Date and CVV */}
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="expiryDate" className={styles.label}>
                            Expiry Date
                        </label>
                        <div className={styles.inputContainer}>
                            <div className={styles.inputPrefix}>
                                <Calendar
                                    size={20}
                                    className={styles.inputIcon}
                                    aria-hidden="true"
                                />
                            </div>
                            <input
                                id="expiryDate"
                                type="text"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="MM/YY"
                                className={`${styles.input} ${styles.inputWithIcon} ${errors.expiryDate && touched.expiryDate ? styles.inputError : ''
                                    }`}
                                aria-label="Enter expiry date"
                                aria-invalid={!!(errors.expiryDate && touched.expiryDate)}
                                aria-describedby={
                                    errors.expiryDate && touched.expiryDate
                                        ? 'expiry-date-error'
                                        : undefined
                                }
                                autoComplete="cc-exp"
                                maxLength="5"
                            />
                        </div>
                        {errors.expiryDate && touched.expiryDate && (
                            <div
                                id="expiry-date-error"
                                className={styles.errorMessage}
                                role="alert"
                                aria-live="polite"
                            >
                                <AlertCircle size={16} className={styles.errorIcon} />
                                <span>{errors.expiryDate}</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="cvv" className={styles.label}>
                            CVV
                        </label>
                        <div className={styles.inputContainer}>
                            <div className={styles.inputPrefix}>
                                <Shield size={20} className={styles.inputIcon} aria-hidden="true" />
                            </div>
                            <input
                                id="cvv"
                                type="text"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="123"
                                className={`${styles.input} ${styles.inputWithIcon} ${errors.cvv && touched.cvv ? styles.inputError : ''
                                    }`}
                                aria-label="Enter CVV code"
                                aria-invalid={!!(errors.cvv && touched.cvv)}
                                aria-describedby={
                                    errors.cvv && touched.cvv ? 'cvv-error' : undefined
                                }
                                autoComplete="cc-csc"
                                maxLength="4"
                            />
                        </div>
                        {errors.cvv && touched.cvv && (
                            <div
                                id="cvv-error"
                                className={styles.errorMessage}
                                role="alert"
                                aria-live="polite"
                            >
                                <AlertCircle size={16} className={styles.errorIcon} />
                                <span>{errors.cvv}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Billing ZIP Code */}
                <div className={styles.formGroup}>
                    <label htmlFor="billingZip" className={styles.label}>
                        Billing ZIP Code
                    </label>
                    <div className={styles.inputContainer}>
                        <div className={styles.inputPrefix}>
                            <MapPin size={20} className={styles.inputIcon} aria-hidden="true" />
                        </div>
                        <input
                            id="billingZip"
                            type="text"
                            name="billingZip"
                            value={formData.billingZip}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="12345"
                            className={`${styles.input} ${styles.inputWithIcon} ${errors.billingZip && touched.billingZip ? styles.inputError : ''
                                }`}
                            aria-label="Enter billing ZIP code"
                            aria-invalid={!!(errors.billingZip && touched.billingZip)}
                            aria-describedby={
                                errors.billingZip && touched.billingZip
                                    ? 'billing-zip-error'
                                    : undefined
                            }
                            autoComplete="postal-code"
                            maxLength="5"
                        />
                    </div>
                    {errors.billingZip && touched.billingZip && (
                        <div
                            id="billing-zip-error"
                            className={styles.errorMessage}
                            role="alert"
                            aria-live="polite"
                        >
                            <AlertCircle size={16} className={styles.errorIcon} />
                            <span>{errors.billingZip}</span>
                        </div>
                    )}
                </div>

                {/* Remember Card */}
                <div className={styles.checkboxGroup}>
                    <input
                        id="rememberCard"
                        type="checkbox"
                        name="rememberCard"
                        checked={formData.rememberCard}
                        onChange={handleChange}
                        className={styles.checkbox}
                        aria-label="Remember card for future purchases"
                    />
                    <label htmlFor="rememberCard" className={styles.checkboxLabel}>
                        Save card for future purchases
                    </label>
                </div>

                {/* Form Actions */}
                <div className={styles.formActions}>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={handleCancel}
                        disabled={loading || isValidating}
                        aria-label="Cancel payment"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading || isValidating}
                        aria-label={`Pay ${formatCurrency(price)}`}
                        aria-busy={loading || isValidating}
                    >
                        {(loading || isValidating) && (
                            <Loader size={20} className={styles.submitSpinner} />
                        )}
                        <span>
                            {loading || isValidating
                                ? 'Processing...'
                                : `Pay ${formatCurrency(price)}`}
                        </span>
                    </button>
                </div>
            </form>

            {/* Security Badge */}
            <footer className={styles.securityBadge}>
                <CheckCircle size={20} className={styles.securityIcon} aria-hidden="true" />
                <div className={styles.securityText}>
                    <strong>256-bit SSL Encryption</strong>
                    <span>Your payment is secure and encrypted</span>
                </div>
            </footer>

            {/* Test Cards (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
                <div className={styles.testCards} role="region" aria-label="Test cards">
                    <span className={styles.testCardsLabel}>Test Cards:</span>
                    <div className={styles.testCardsButtons}>
                        {['visa', 'mastercard', 'amex', 'discover'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                className={styles.testCardButton}
                                onClick={() => handleUseTestCard(type)}
                                aria-label={`Use test ${type} card`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

PaymentCheckout.propTypes = {
    /**
     * Selected subscription plan details
     */
    plan: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        monthlyPrice: PropTypes.number.isRequired,
        yearlyPrice: PropTypes.number.isRequired,
        features: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    /**
     * Billing period ('monthly' or 'yearly')
     */
    billingPeriod: PropTypes.oneOf(['monthly', 'yearly']).isRequired,
    /**
     * Callback function when form is submitted
     */
    onSubmit: PropTypes.func.isRequired,
    /**
     * Callback function to cancel payment
     */
    onCancel: PropTypes.func.isRequired,
    /**
     * Loading state for form submission
     */
    loading: PropTypes.bool,
    /**
     * Currency for display
     */
    currency: PropTypes.string,
};

PaymentCheckout.defaultProps = {
    loading: false,
    currency: 'USD',
};

export default PaymentCheckout;