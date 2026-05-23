import {
  Section,
  Text,
  Heading,
  Button,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './Layout';

interface Prep1hProps {
  fullName: string;
  ritual: string;
  timeLocal: string;
  sessionFormat: string;
  zoomJoinUrl?: string | null;
  zoomMeetingId?: string | null;
  meetingPassword?: string | null;
}

export const Prep1hEmail = ({
  fullName,
  ritual,
  timeLocal,
  sessionFormat = 'Virtual',
  zoomJoinUrl,
  zoomMeetingId,
  meetingPassword,
}: Prep1hProps) => (
  <EmailLayout previewTextText="Your sanctuary ritual begins in 1 hour ✨">
    <Section style={contentSection}>
      <Heading style={h1}>Soft Arrival</Heading>
      <Text style={bodyText}>
        Hello {fullName}, the time for your ritual journey, <strong>{ritual}</strong>, is nearing. Your session begins in 1 hour (at {timeLocal}).
      </Text>
      <Text style={{ ...bodyText, marginTop: '12px' }}>
        We invite you to begin your soft arrival now: disengage from screens, hydrate, and settle your breathing.
      </Text>
    </Section>

    {/* Format Specific Details */}
    {sessionFormat.toLowerCase() === 'virtual' ? (
      <Section style={card}>
        <Heading style={cardTitle}>Virtual Sanctuary Credentials</Heading>
        <Text style={bodyText}>
          Your live session will take place via Zoom. Click below to join when it is time.
        </Text>
        {zoomJoinUrl && (
          <Section style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
            <Button style={goldButton} href={zoomJoinUrl}>
              Enter Virtual Sanctuary
            </Button>
          </Section>
        )}
        {zoomMeetingId && (
          <Row style={{ marginTop: '15px' }}>
            <Column style={{ width: '50%' }}>
              <Text style={label}>Meeting ID</Text>
              <Text style={{ ...value, fontFamily: 'monospace' }}>{zoomMeetingId}</Text>
            </Column>
            {meetingPassword && (
              <Column style={{ width: '50%' }}>
                <Text style={label}>Password</Text>
                <Text style={{ ...value, fontFamily: 'monospace' }}>{meetingPassword}</Text>
              </Column>
            )}
          </Row>
        )}
      </Section>
    ) : (
      <Section style={card}>
        <Heading style={cardTitle}>Sanctuary Location</Heading>
        <Text style={bodyText}>
          Your in-person session is held at:
        </Text>
        <Text style={{ ...value, fontWeight: '500', marginTop: '10px', fontSize: '15px' }}>
          LumaFlow Sanctuary • Soho, Manhattan, NY
        </Text>
        <Text style={{ ...bodyText, fontSize: '13px', marginTop: '5px', opacity: 0.7 }}>
          Please arrive 10 minutes early to check-in and settle in. Press the LumaFlow buzzer at the entrance.
        </Text>
      </Section>
    )}

    {/* Preparation Checklist */}
    <Section style={{ ...card, marginTop: '24px' }}>
      <Heading style={cardTitle}>Preparation Guidance</Heading>
      
      {sessionFormat.toLowerCase() === 'virtual' ? (
        <>
          <Section style={checklistItem}>
            <Text style={label}>Environment</Text>
            <Text style={bodyText}>Create a quiet, undisturbed space. Dim the lights and close other apps.</Text>
          </Section>
          
          <Section style={checklistItem}>
            <Text style={label}>Audio Setup</Text>
            <Text style={bodyText}>Use high-quality headphones. Settle your device so your camera is stable.</Text>
          </Section>

          <Section style={checklistItem}>
            <Text style={label}>Hydration</Text>
            <Text style={bodyText}>Have a glass of water nearby. Small sips only.</Text>
          </Section>

          <Section style={checklistItem}>
            <Text style={label}>Attire</Text>
            <Text style={bodyText}>Comfortable, loose clothing. Remove any constricting items.</Text>
          </Section>
        </>
      ) : (
        <>
          <Section style={checklistItem}>
            <Text style={label}>Sanctuary Arrival</Text>
            <Text style={bodyText}>Aim to arrive at Soho 10 minutes early. Take a moment to breathe before entering.</Text>
          </Section>
          
          <Section style={checklistItem}>
            <Text style={label}>Digestion</Text>
            <Text style={bodyText}>Refrain from eating any heavy meals or caffeinated drinks in this final hour.</Text>
          </Section>

          <Section style={checklistItem}>
            <Text style={label}>Attire</Text>
            <Text style={bodyText}>Wear comfortable, loose clothing suitable for breathwork and lying down.</Text>
          </Section>
        </>
      )}
    </Section>

    <Section style={closingSection}>
      <Text style={bodyText}>
        We await you in the stillness.
      </Text>
    </Section>
  </EmailLayout>
);

const h1 = {
  color: '#3A3A3A',
  fontSize: '32px',
  fontWeight: '300',
  textAlign: 'center' as const,
  margin: '30px 0',
  fontFamily: 'serif',
};

const contentSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const card = {
  backgroundColor: '#FFFFFF',
  padding: '40px',
  borderRadius: '4px',
  border: '1px solid #E8E1D5',
};

const cardTitle = {
  color: '#3A3A3A',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const checklistItem = {
  marginBottom: '24px',
};

const label = {
  color: '#CBAE73',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '0.3em',
  textTransform: 'uppercase' as const,
  marginBottom: '4px',
};

const value = {
  color: '#3A3A3A',
  fontSize: '14px',
  fontWeight: '400',
  margin: 0,
};

const bodyText = {
  color: '#3A3A3A',
  fontSize: '16px',
  lineHeight: '1.6',
  fontWeight: '300',
  margin: '0',
};

const goldButton = {
  backgroundColor: '#CBAE73',
  borderRadius: '2px',
  color: '#FFFFFF',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  padding: '16px 32px',
  textDecoration: 'none',
  display: 'inline-block',
};

const closingSection = {
  marginTop: '40px',
  textAlign: 'center' as const,
};

export default Prep1hEmail;
