/**
 * @file ProfileSummaryCard.jsx
 * @description Profile summary widget for the Jobseeker Dashboard overview
 */
import React from 'react';
import { MapPin, Edit3, ShieldCheck, Mail, Briefcase } from 'lucide-react';
import Button from '../../../components/ui/Button';

const ProfileSummaryCard = ({ profile = {}, onEdit = () => {} }) => {
  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'JS';

  return (
    <div style={{ padding: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

      {/* Avatar + Name Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {/* Avatar Circle with Initials */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: 'var(--radius-2xl)',
          background: 'linear-gradient(135deg, var(--color-accent-pink), var(--color-vivid-pink))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'white',
          border: '3px solid var(--color-accent-pink)',
          boxShadow: '0 8px 24px var(--color-shadow-pink)',
          letterSpacing: '1px',
        }}>
          {initials}
        </div>

        {/* Name & Role */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            margin: '0 0 var(--space-1) 0',
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-foreground)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {profile.name || 'Anonymous User'}
          </h4>

          <div style={{
            color: 'var(--color-accent-pink)',
            fontWeight: 'var(--font-weight-semibold)',
            fontSize: 'var(--font-size-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
          }}>
            <Briefcase size={13} />
            {profile.title || profile.role || 'Job Seeker'}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--color-border)' }} />

      {/* Contact Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {profile.email && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-muted-foreground)',
          }}>
            <Mail size={13} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.email}
            </span>
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-muted-foreground)',
        }}>
          <MapPin size={13} />
          <span>{profile.location || 'Location not set'}</span>
        </div>
      </div>

      {profile.isVerified && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-3)',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          borderRadius: 'var(--radius-full)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-success)',
          width: 'fit-content',
        }}>
          <ShieldCheck size={13} />
          Verified Profile
        </div>
      )}

      {/* Edit Button */}
      <Button
        variant="outline"
        size="small"
        onClick={onEdit}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        <Edit3 size={14} />
        Edit Profile
      </Button>
    </div>
  );
};

export default ProfileSummaryCard;
