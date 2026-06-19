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

interface ReminderProps {
  fullName: string;
  ritual: string;
  date: string;
  timeEST: string;
  timeLocal: string;
  sessionFormat: string;
  zoomJoinUrl?: string | null;
  zoomMeetingId?: string | null;
  meetingPassword?: string | null;
}

export const Reminder24hEmail = ({
  fullName,
  ritual,
  date,
  timeEST,
  timeLocal,
  sessionFormat = 'Virtual',
  zoomJoinUrl,
  zoomMeetingId,
  meetingPassword,
}: ReminderProps) => (
  <EmailLayout previewTextText="Your sanctuary awaits tomorrow ✨">
    <Section style={contentSection}>
      <Heading style={h1}>The Portal Opens Soon</Heading>
      <Text style={bodyText}>
        Greetings {fullName}, your <strong>{ritual}</strong> session is approaching. We are preparing the sanctuary for your arrival tomorrow.
      </Text>
    </Section>

    {/* MOMENT DETAILS */}
    <Section style={card}>
      <Heading style={cardTitle}>Session Details</Heading>
      <Row style={{ marginBottom: '16px' }}>
        <Column style={{ width: '50%' }}>
          <Text style={label}>Ritual Name</Text>
          <Text style={value}>{ritual}</Text>
        </Column>
        <Column style={{ width: '50%' }}>
          <Text style={label}>Date</Text>
          <Text style={value}>{date}</Text>
        </Column>
      </Row>
      <Row>
        <Column style={{ width: '50%' }}>
          <Text style={label}>Time (EST)</Text>
          <Text style={value}>{timeEST}</Text>
        </Column>
        <Column style={{ width: '50%' }}>
          <Text style={label}>Local Time</Text>
          <Text style={value}>{timeLocal}</Text>
        </Column>
      </Row>
    </Section>

    {/* ACCESS / LOCATION DETAILS */}
    {sessionFormat.toLowerCase() === 'virtual' ? (
      <Section style={card}>
        <Heading style={cardTitle}>Virtual Sanctuary Access</Heading>
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

    <Section style={anticipationSection}>
      <Text style={italicText}>
        “The anticipation of healing is where the healing begins.”
      </Text>
    </Section>

    <Section style={guidanceSection}>
      <Heading style={h2}>Final Preparation</Heading>
      <Text style={bodyText}>
        We recommend a light meal and minimal digital engagement in the hours leading up to your session. 
        Allow yourself the luxury of a slow transition into our shared space.
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

const h2 = {
  color: '#CBAE73',
  fontSize: '18px',
  fontWeight: '400',
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  margin: '40px 0 20px',
};

const contentSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const anticipationSection = {
  textAlign: 'center' as const,
  padding: '40px 0',
  borderTop: '1px solid #E8E1D5',
  borderBottom: '1px solid #E8E1D5',
  margin: '32px 0',
};

const bodyText = {
  color: '#3A3A3A',
  fontSize: '16px',
  lineHeight: '1.6',
  fontWeight: '300',
  margin: 0,
};

const italicText = {
  color: '#3A3A3A',
  fontSize: '20px',
  fontStyle: 'italic',
  lineHeight: '1.4',
  opacity: '0.8',
  fontFamily: 'serif',
};

const guidanceSection = {
  marginTop: '40px',
};

const card = {
  backgroundColor: '#FFFFFF',
  padding: '32px',
  borderRadius: '4px',
  border: '1px solid #E8E1D5',
  marginBottom: '24px',
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

export default Reminder24hEmail;
