import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
    Button, 
    Input, 
    DatePicker, 
    Modal, 
    Badge, 
    SuccessMessage, 
    ErrorMessage,
    LoadingSpinner
} from '../../../../components/common';
import GeneralSelect from '../../../../components/common/GeneralSelect';
import * as interviewService from '../../../../services/interviewService';
import jobService from '../../../../services/jobService';
import { format } from 'date-fns';
import styles from './InterviewScheduling.module.css';

const EmptyIcon = () => null;

const InterviewScheduling = () => {
    const [searchParams] = useSearchParams();
    const applicationId = searchParams.get('applicationId') || searchParams.get('applicantId');
    const navigate = useNavigate();

    // State
    const [applicant, setApplicant] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);
    const [interviewType, setInterviewType] = useState('video');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    
    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [isScheduling, setIsScheduling] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const loadApplicantData = async () => {
            if (!applicationId) {
                setErrorMsg("No application specified.");
                setIsLoading(false);
                return;
            }

            try {
                const data = await jobService.getCompanyApplicants();
                const applicants = Array.isArray(data) ? data : (data?.items || data?.data || []);
                const selectedApplication = applicants.find((item) => String(item.applicationId || item.id) === String(applicationId));

                if (!selectedApplication) {
                    setErrorMsg("Application not found.");
                    return;
                }

                setApplicant({
                    id: selectedApplication.applicationId,
                    name: selectedApplication.applicantName || 'Applicant',
                    email: selectedApplication.applicantEmail || 'N/A',
                    phone: selectedApplication.applicantPhone || 'N/A',
                    appliedJobs: [{
                        jobId: selectedApplication.jobId,
                        jobTitle: selectedApplication.jobTitle,
                        status: selectedApplication.status,
                    }],
                });
                setJobs([{ jobId: selectedApplication.jobId, jobTitle: selectedApplication.jobTitle, status: selectedApplication.status }]);
                setSelectedJob(selectedApplication.jobId);
            } catch (error) {
                setErrorMsg("Error loading applicant data.");
            } finally {
                setIsLoading(false);
            }
        };

        loadApplicantData();
    }, [applicationId]);

    const handleDateChange = async (date) => {
        setSelectedDate(date);
        setSelectedTime(null);
        if (!date) {
            setSlots([]);
            return;
        }
        try {
            const formattedDate = format(date, 'yyyy-MM-dd');
            const res = await interviewService.getAvailableSlots(formattedDate);
            if (res.success && res.data?.slots?.length > 0) {
                setSlots(res.data.slots);
            } else {
                // Fallback: generate time slots locally
                const now = new Date();
                const targetDate = new Date(date);
                const isToday = targetDate.toDateString() === now.toDateString();
                const currentHour = now.getHours();
                const generatedSlots = [
                    { time: "09:00" }, { time: "10:00" }, { time: "11:00" },
                    { time: "12:00" }, { time: "13:00" }, { time: "14:00" },
                    { time: "15:00" }, { time: "16:00" }, { time: "17:00" },
                ].map(slot => {
                    const slotHour = parseInt(slot.time.split(':')[0]);
                    return {
                        ...slot,
                        available: !(isToday && slotHour <= currentHour)
                    };
                });
                setSlots(generatedSlots);
            }
        } catch (error) {
            // Fallback on error
            const now = new Date();
            const isToday = date.toDateString() === now.toDateString();
            const currentHour = now.getHours();
            const fallbackSlots = [
                { time: "09:00" }, { time: "10:00" }, { time: "11:00" },
                { time: "12:00" }, { time: "13:00" }, { time: "14:00" },
                { time: "15:00" }, { time: "16:00" }, { time: "17:00" },
            ].map(slot => {
                const slotHour = parseInt(slot.time.split(':')[0]);
                return { ...slot, available: !(isToday && slotHour <= currentHour) };
            });
            setSlots(fallbackSlots);
        }
    };

    const handleScheduleClick = () => {
        if (!selectedJob || !selectedDate || !selectedTime || !location) {
            setErrorMsg("Please fill in all required fields (Job, Date, Time, Location).");
            return;
        }
        setIsConfirmOpen(true);
    };

    const handleConfirmSchedule = async () => {
        setIsConfirmOpen(false);
        setIsScheduling(true);
        try {
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');
            const scheduledAt = new Date(`${formattedDate}T${selectedTime}`).toISOString();
            const res = await interviewService.scheduleInterview({
                jobApplicationId: Number(applicationId),
                title: jobs.find(j => j.jobId === selectedJob)?.jobTitle || 'Interview',
                description: notes,
                scheduledAt,
                durationMinutes: 60,
                meetingLink: interviewType === 'video' ? location : null,
                location: interviewType === 'video' ? null : location,
            });

            if (res.success) {
                setSuccessMsg("Interview scheduled successfully!");
                setTimeout(() => {
                    navigate('/dashboard/interviews');
                }, 2000);
            } else {
                setErrorMsg("Failed to schedule interview.");
            }
        } catch (error) {
            setErrorMsg("Error scheduling interview.");
        } finally {
            setIsScheduling(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <LoadingSpinner />
                <p>Loading applicant details...</p>
            </div>
        );
    }

    if (!applicant) {
        return (
            <div className={styles.errorContainer}>
                <ErrorMessage message={errorMsg || "Applicant not found."} />
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    const jobOptions = jobs.map(j => ({ value: j.jobId, label: j.jobTitle }));
    const typeOptions = [
        { value: 'video', label: 'Video Call' },
        { value: 'phone', label: 'Phone Call' },
        { value: 'in-person', label: 'In Person' },
    ];

    return (
        <div className={styles.container}>
            <SuccessMessage message={successMsg} onDismiss={() => setSuccessMsg('')} />
            <ErrorMessage message={errorMsg} onDismiss={() => setErrorMsg('')} />

            <div className={styles.header}>
                <h1>Schedule Interview</h1>
                <p>Select date, time and format for the interview.</p>
            </div>

            <div className={styles.contentGrid}>
                {/* Left Column: Applicant Profile */}
                <div className={styles.applicantCol}>
                    <div className={styles.card}>
                        <div className={styles.profileHeader}>
                            <div className={styles.avatar}>
                                {applicant.name.charAt(0)}
                            </div>
                            <div>
                                <h3>{applicant.name}</h3>
                                <p>{applicant.email}</p>
                                <p>{applicant.phone}</p>
                            </div>
                        </div>
                        <div className={styles.appliedJobs}>
                            <h4>Applied For:</h4>
                            {jobs.map(job => (
                                <div key={job.jobId} className={styles.jobItem}>
                                    <span>{job.jobTitle}</span>
                                    <Badge variant="info">{job.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Scheduling Form */}
                <div className={styles.formCol}>
                    <div className={styles.card}>
                        <h3>Interview Details</h3>
                        
                        <div className={styles.formGroup}>
                            <label>Select Job</label>
                            <GeneralSelect 
                                value={selectedJob || ''}
                                onChange={setSelectedJob}
                                options={jobOptions}
                                placeholder="Select a job"
                                icon={EmptyIcon}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Interview Date</label>
                            <DatePicker 
                                selectedDate={selectedDate}
                                onChange={handleDateChange}
                                placeholder="Select a date"
                                minDate={new Date()}
                            />
                        </div>

                        {selectedDate && (
                            <div className={styles.formGroup}>
                                <label>Available Time Slots</label>
                                {slots.length === 0 ? (
                                    <p className={styles.noSlots}>No available slots for selected date.</p>
                                ) : (
                                    <div className={styles.slotsGrid}>
                                        {slots.map((slot, idx) => (
                                            <button
                                                key={idx}
                                                disabled={!slot.available}
                                                className={`${styles.slotBtn} ${selectedTime === slot.time ? styles.selectedSlot : ''} ${!slot.available ? styles.disabledSlot : ''}`}
                                                onClick={() => setSelectedTime(slot.time)}
                                            >
                                                {slot.time}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Interview Type</label>
                                <GeneralSelect 
                                    value={interviewType}
                                    onChange={setInterviewType}
                                    options={typeOptions}
                                    icon={EmptyIcon}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Location / Link</label>
                                <Input 
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder={interviewType === 'video' ? 'https://zoom.us/...' : (interviewType === 'phone' ? 'Phone Number' : 'Office Address')}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Additional Notes</label>
                            <textarea 
                                className={styles.textarea}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Instructions for the applicant..."
                                rows={4}
                            />
                        </div>

                        <div className={styles.actions}>
                            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                            <Button variant="primary" onClick={handleScheduleClick} disabled={isScheduling}>
                                Schedule Interview
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <Modal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title="Confirm Interview"
                actions={
                    <>
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Back</Button>
                        <Button variant="primary" onClick={handleConfirmSchedule} loading={isScheduling}>Confirm</Button>
                    </>
                }
            >
                <div className={styles.confirmContent}>
                    <p>You are about to schedule an interview with <strong>{applicant.name}</strong>.</p>
                    <ul>
                        <li><strong>Job:</strong> {jobs.find(j => j.jobId === selectedJob)?.jobTitle}</li>
                        <li><strong>Date:</strong> {selectedDate && format(selectedDate, 'MMM do, yyyy')}</li>
                        <li><strong>Time:</strong> {selectedTime}</li>
                        <li><strong>Type:</strong> {interviewType}</li>
                        <li><strong>Location:</strong> {location}</li>
                    </ul>
                    <p>An email notification will be sent to the applicant.</p>
                </div>
            </Modal>
        </div>
    );
};

export default InterviewScheduling;
