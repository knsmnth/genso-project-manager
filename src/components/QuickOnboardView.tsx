import React, { useState } from 'react';
import { Person } from '../types';

interface QuickOnboardViewProps {
  onComplete: (data: Person) => void;
  onCancel: () => void;
}

export const QuickOnboardView: React.FC<QuickOnboardViewProps> = ({
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [manpowerCode, setManpowerCode] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [workGroup, setWorkGroup] = useState('');

  // Form errors visual tracking
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleNextStep = () => {
    const newErrors: Record<string, boolean> = {};

    if (currentStep === 1) {
      if (!fullName.trim()) newErrors.fullName = true;
      if (!manpowerCode.trim()) newErrors.manpowerCode = true;

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!specialization) newErrors.specialization = true;
      if (!workGroup) newErrors.workGroup = true;

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new Person object to insert into database
    const newPerson: Person = {
      name: fullName,
      role: specialization,
      code: manpowerCode,
      status: 'Available',
      id: manpowerCode,
      attendanceStatus: 'Absent', // default when onboarding
      activeOrder: '—'
    };

    onComplete(newPerson);
  };

  return (
    <section id="view-quick-onboard" className="view-section active" style={{ display: 'flex' }}>
      {/* Header / Breadcrumbs */}
      <div className="breadcrumbs-container">
        <nav className="breadcrumbs" aria-label="Breadcrumbs">
          <span className="breadcrumb-link" onClick={onCancel} style={{ cursor: 'pointer' }}>
            Personnel
          </span>
          <svg className="breadcrumb-arrow" viewBox="0 0 24 24" width="12" height="12">
            <polyline points="9 18 15 12 9 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="breadcrumb-current">Onboard Wizard</span>
        </nav>

        <div className="header-action-row">
          <h2 className="form-title">Quick Onboard</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '-8px' }}>
            Add new operational personnel to the Facility Management System.
          </p>
        </div>
      </div>

      {/* Onboard Wizard Grid */}
      <div className="form-layout" style={{ marginTop: '16px' }}>
        {/* Left Column: Step indicators */}
        <div className="form-right-col" style={{ gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Step 1 Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: currentStep >= 1 ? '#006C49' : '#E2E8F0',
                    color: currentStep >= 1 ? '#FFFFFF' : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}
                >
                  1
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: currentStep === 1 ? '#006C49' : 'var(--color-navy-header)' }}>
                    Identity
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Personal info & photo</span>
                </div>
              </div>

              {/* Step 2 Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: currentStep >= 2 ? '#006C49' : '#E2E8F0',
                    color: currentStep >= 2 ? '#FFFFFF' : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}
                >
                  2
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: currentStep === 2 ? '#006C49' : 'var(--color-navy-header)' }}>
                    Specialization
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Role & group selection</span>
                </div>
              </div>

              {/* Step 3 Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: currentStep >= 3 ? '#006C49' : '#E2E8F0',
                    color: currentStep >= 3 ? '#FFFFFF' : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}
                >
                  3
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: currentStep === 3 ? '#006C49' : 'var(--color-navy-header)' }}>
                    Confirmation
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Review and finalize</span>
                </div>
              </div>
            </div>
          </div>

          {/* Onboard Tips */}
          <div className="card" style={{ padding: '20px', borderLeft: '4px solid #006C49' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#006C49" strokeWidth="2" style={{ flexShrop: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-navy-header)' }}>Onboarding Tip</span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-dark)', lineHeight: '1.4' }}>
                  Uploading a clear profile photo helps in real-time tracking and security verification.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Step Forms */}
        <div className="form-left-col">
          <div className="card" style={{ padding: '24px' }}>
            {currentStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Photo Upload */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '12px',
                      border: '2px dashed var(--color-border-dark)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#F8FAFC',
                      cursor: 'pointer',
                      gap: '4px'
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--color-text-placeholder)" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-placeholder)', fontWeight: 600 }}>Upload</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-navy-header)', marginBottom: '4px' }}>
                      Personnel Photo
                    </h4>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      Accepts JPG, PNG. Max file size 2MB.
                    </p>
                  </div>
                </div>

                {/* Name */}
                <div className={`form-field-group ${errors.fullName ? 'has-error' : ''}`}>
                  <label htmlFor="onboard-name">Full Name</label>
                  <input
                    type="text"
                    id="onboard-name"
                    placeholder="e.g. Robert J. Sterling"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <span className="error-msg">Full name is required.</span>
                </div>

                {/* ID Code */}
                <div className={`form-field-group ${errors.manpowerCode ? 'has-error' : ''}`}>
                  <label htmlFor="onboard-code">Manpower Code (ID)</label>
                  <input
                    type="text"
                    id="onboard-code"
                    placeholder="e.g. EMP-1035"
                    value={manpowerCode}
                    onChange={(e) => setManpowerCode(e.target.value)}
                  />
                  <span className="error-msg">Manpower code identifier is required.</span>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Specialization Selection */}
                <div className={`form-field-group ${errors.specialization ? 'has-error' : ''}`}>
                  <label htmlFor="onboard-specialization">Work Specialization</label>
                  <div className="select-wrapper">
                    <select
                      id="onboard-specialization"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                    >
                      <option value="" disabled>Select Role...</option>
                      <option value="Carpentry Specialist">Carpentry Specialist</option>
                      <option value="Senior Electrician">Senior Electrician</option>
                      <option value="HVAC Specialist">HVAC Specialist</option>
                      <option value="Safety Officer">Safety Officer</option>
                      <option value="Site Manager">Site Manager</option>
                      <option value="Office Admin">Office Admin</option>
                      <option value="General Laborer">General Laborer</option>
                    </select>
                  </div>
                  <span className="error-msg">Please select a specialization role.</span>
                </div>

                {/* Group Assignment Selection */}
                <div className={`form-field-group ${errors.workGroup ? 'has-error' : ''}`}>
                  <label htmlFor="onboard-workgroup">Work Group Assignment</label>
                  <div className="select-wrapper">
                    <select
                      id="onboard-workgroup"
                      value={workGroup}
                      onChange={(e) => setWorkGroup(e.target.value)}
                    >
                      <option value="" disabled>Select Work Group...</option>
                      <option value="Building Repair & Maintenance">Building Repair & Maintenance</option>
                      <option value="Student Housing Repair & Maintenance">Student Housing Repair & Maintenance</option>
                      <option value="Fabrication Workshop">Fabrication Workshop</option>
                    </select>
                  </div>
                  <span className="error-msg">Please assign a primary work group.</span>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-navy-header)' }}>Confirm Registration</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-dark)', marginBottom: '8px' }}>
                  Please review the staff registry summary details before submitting.
                </p>

                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    padding: '16px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>FULL NAME</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-navy-header)' }}>{fullName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>MANPOWER ID</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-navy-header)', fontFamily: 'monospace' }}>
                      {manpowerCode}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>SPECIALIZATION</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-navy-header)' }}>{specialization}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>WORK GROUP</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{workGroup}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons control footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '32px',
                borderTop: '1px solid var(--color-border)',
                paddingTop: '20px',
                gap: '16px'
              }}
            >
              {currentStep > 1 ? (
                <button type="button" className="btn btn-outline" onClick={handlePrevStep} style={{ padding: '10px 20px' }}>
                  Back
                </button>
              ) : (
                <button type="button" className="btn btn-outline" onClick={onCancel} style={{ padding: '10px 20px' }}>
                  Discard Changes
                </button>
              )}

              {currentStep < 3 ? (
                <button type="button" className="btn btn-primary" onClick={handleNextStep} style={{ padding: '10px 24px' }}>
                  Next Step
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={handleComplete} style={{ padding: '10px 24px' }}>
                  Complete Onboarding
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
