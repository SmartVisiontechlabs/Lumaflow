import {
  Section,
  Text,
  Heading,
  Button,
  Link,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './Layout';

interface AdminNotificationProps {
  fullName: string;
  email: string;
  emotion: string;
  ritual: string;
  duration: number;
  intentions: string;
  date: string;
  timeEST: string;
  reference: string;
  timeLocal?: string;
  googleCalendarUrl?: string;
  icsDataUri?: string;
  sessionFormat?: string;
  zoomJoinUrl?: string | null;
  zoomStartUrl?: string | null;
  zoomMeetingId?: string | null;
  meetingPassword?: string | null;
}

export const AdminNotificationEmail = ({
  fullName,
  email,
  emotion,
  ritual,
  duration,
  intentions,
  date,
  timeEST,
  reference,
  timeLocal,
  googleCalendarUrl,
  icsDataUri,
  sessionFormat = 'Virtual',
  zoomJoinUrl,
  zoomStartUrl,
  zoomMeetingId,
  meetingPassword,
}: AdminNotificationProps) => (
  <EmailLayout previewTextText={`Admin Ops: New Booking - ${fullName}`}>
    <Section style={contentSection}>
      <Heading style={h1}>🌙 New Sanctuary Reserved</Heading>
      <Text style={subheading}>
        A new sacred booking has entered the sanctuary.
      </Text>
    </Section>

    {/* Section 1: Client Summary Card */}
    <Section style={card}>
      <Text style={cardTitle}>Client Summary</Text>
      
      <Row style={detailRow}>
        <Column>
          <Text style={label}>Client Name</Text>
          <Text style={value}>{fullName}</Text>
        </Column>
        <Column>
          <Text style={label}>Email</Text>
          <Text style={value}>{email}</Text>
        </Column>
      </Row>

      <Row style={detailRow}>
        <Column>
          <Text style={label}>Selected Ritual</Text>
          <Text style={value}>{ritual}</Text>
        </Column>
        <Column>
          <Text style={label}>Duration</Text>
          <Text style={value}>{duration} minutes</Text>
        </Column>
      </Row>

      <Row style={detailRow}>
        <Column>
          <Text style={label}>Emotion / State</Text>
          <Text style={value}>{emotion}</Text>
        </Column>
        <Column>
          <Text style={label}>Format</Text>
          <Text style={value}>{sessionFormat}</Text>
        </Column>
      </Row>

      <Row style={detailRow}>
        <Column>
          <Text style={label}>Booking Reference</Text>
          <Text style={value}>{reference}</Text>
        </Column>
        <Column>
          <Text style={label}>Selected Date</Text>
          <Text style={value}>{date}</Text>
        </Column>
      </Row>

      <Row style={detailRow}>
        <Column>
          <Text style={label}>EST Time</Text>
          <Text style={value}>{timeEST}</Text>
        </Column>
        {timeLocal && (
          <Column>
            <Text style={label}>Local Time</Text>
            <Text style={value}>{timeLocal}</Text>
          </Column>
        )}
      </Row>

      <Section style={{ marginTop: '20px' }}>
        <Text style={label}>Intentions</Text>
        <Text style={intentionsText}>“{intentions}”</Text>
      </Section>
    </Section>

    {/* Section 1.5: Zoom Credentials (for Virtual sessions) */}
    {sessionFormat.toLowerCase() === 'virtual' && (zoomJoinUrl || zoomStartUrl || zoomMeetingId) && (
      <Section style={card}>
        <Text style={cardTitle}>Zoom Meeting Details</Text>
        <Text style={{ ...value, marginBottom: '20px', fontStyle: 'italic', opacity: 0.8 }}>
          This is a virtual session. You can start the meeting as host or join as client.
        </Text>
        
        {zoomStartUrl && (
          <Section style={{ textAlign: 'center' as const, marginTop: '20px', marginBottom: '20px' }}>
            <Button style={goldButton} href={zoomStartUrl}>
              Start Zoom Meeting (Host)
            </Button>
          </Section>
        )}

        <Row style={detailRow}>
          {zoomMeetingId && (
            <Column style={{ width: '50%' }}>
              <Text style={label}>Meeting ID</Text>
              <Text style={{ ...value, fontFamily: 'monospace' }}>{zoomMeetingId}</Text>
            </Column>
          )}
          {meetingPassword && (
            <Column style={{ width: '50%' }}>
              <Text style={label}>Passcode</Text>
              <Text style={{ ...value, fontFamily: 'monospace' }}>{meetingPassword}</Text>
            </Column>
          )}
        </Row>

        {zoomJoinUrl && (
          <Section style={{ marginTop: '10px' }}>
            <Text style={label}>Client Join Link</Text>
            <Link href={zoomJoinUrl} style={{ color: '#CBAE73', fontSize: '13px', textDecoration: 'underline' }}>
              {zoomJoinUrl}
            </Link>
          </Section>
        )}
      </Section>
    )}

    {/* Section 2: Calendar Actions */}
    {(googleCalendarUrl || icsDataUri) && (
      <Section style={actionSection}>
        <Text style={sectionHeading}>Calendar Actions</Text>
        <Row style={{ marginTop: '16px' }}>
          {googleCalendarUrl && (
            <Column style={{ paddingRight: '8px' }}>
              <Button href={googleCalendarUrl} style={goldButton}>
                Add to Google Calendar
              </Button>
            </Column>
          )}
          {icsDataUri && (
            <Column style={{ paddingLeft: '8px' }}>
              <Button href={icsDataUri} style={goldButton}>
                Add to Apple Calendar
              </Button>
            </Column>
          )}
        </Row>
      </Section>
    )}

    {/* Section 3: Sanctuary Ops Checklist */}
    <Section style={checklistSection}>
      <Text style={sectionHeading}>Sanctuary Ops Checklist</Text>
      <Section style={checklistCard}>
        <Text style={checklistItem}>✓ Session reserved</Text>
        <Text style={checklistItem}>✓ Reminder automation active</Text>
        <Text style={checklistItem}>✓ Follow-up ritual available</Text>
        <Text style={checklistItem}>✓ Sanctuary prepared</Text>
      </Section>
    </Section>

    {/* Section 4: Quick Actions */}
    <Section style={quickActionSection}>
      <Text style={quickActionText}>
        “Open Sanctuary Ops to review and prepare for the client’s journey.”
      </Text>
    </Section>
  </EmailLayout>
);

const h1 = {
  color: '#3A3A3A',
  fontSize: '28px',
  fontWeight: '300',
  textAlign: 'center' as const,
  margin: '0 0 10px 0',
  fontFamily: '"Cormorant Garamond", serif',
};

const subheading = {
  color: '#3A3A3A',
  fontSize: '16px',
  fontWeight: '300',
  textAlign: 'center' as const,
  margin: '0',
  opacity: 0.7,
};

const contentSection = {
  marginBottom: '40px',
};

const card = {
  backgroundColor: '#FFFFFF',
  padding: '32px',
  borderRadius: '16px',
  border: '1px solid #E8E1D5',
  marginBottom: '32px',
};

const cardTitle = {
  color: '#3A3A3A',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  marginBottom: '24px',
  opacity: 0.5,
};

const detailRow = {
  marginBottom: '20px',
};

const label = {
  color: '#CBAE73',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  marginBottom: '4px',
};

const value = {
  color: '#3A3A3A',
  fontSize: '14px',
  fontWeight: '400',
  margin: '0',
};

const intentionsText = {
  color: '#3A3A3A',
  fontSize: '14px',
  lineHeight: '1.6',
  fontWeight: '300',
  fontStyle: 'italic',
  margin: '0',
};

const actionSection = {
  marginBottom: '32px',
  textAlign: 'center' as const,
};

const sectionHeading = {
  color: '#3A3A3A',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  marginBottom: '16px',
  opacity: 0.5,
};

const goldButton = {
  backgroundColor: '#CBAE73',
  borderRadius: '8px',
  color: '#FFFFFF',
  fontSize: '12px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 0',
  width: '100%',
};

const checklistSection = {
  marginBottom: '32px',
};

const checklistCard = {
  backgroundColor: 'rgba(203, 174, 115, 0.05)',
  padding: '24px',
  borderRadius: '12px',
  border: '1px dashed #CBAE73',
};

const checklistItem = {
  color: '#3A3A3A',
  fontSize: '13px',
  fontWeight: '400',
  margin: '8px 0',
};

const quickActionSection = {
  textAlign: 'center' as const,
  marginTop: '40px',
  padding: '0 20px',
};

const quickActionText = {
  color: '#3A3A3A',
  fontSize: '14px',
  fontWeight: '300',
  fontStyle: 'italic',
  lineHeight: '1.6',
};

export default AdminNotificationEmail;
