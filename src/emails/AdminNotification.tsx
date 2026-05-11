import {
  Section,
  Text,
  Heading,
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
}: AdminNotificationProps) => (
  <EmailLayout previewTextText={`New Booking: ${fullName} - ${ritual}`}>
    <Section style={contentSection}>
      <Heading style={h1}>New Sanctuary Request</Heading>
      <Text style={bodyText}>
        A new ritual journey has been initiated.
      </Text>
    </Section>

    <Section style={card}>
      <Section style={detailRow}>
        <Text style={label}>Client</Text>
        <Text style={value}>{fullName} ({email})</Text>
      </Section>

      <Section style={detailRow}>
        <Text style={label}>Ritual Path</Text>
        <Text style={value}>{ritual} ({duration}m)</Text>
      </Section>

      <Section style={detailRow}>
        <Text style={label}>Internal State</Text>
        <Text style={value}>{emotion}</Text>
      </Section>

      <Section style={detailRow}>
        <Text style={label}>Appointed Time</Text>
        <Text style={value}>{date} @ {timeEST}</Text>
      </Section>

      <Section style={detailRow}>
        <Text style={label}>Reference</Text>
        <Text style={value}>{reference}</Text>
      </Section>

      <Section style={detailRow}>
        <Text style={label}>Intentions</Text>
        <Text style={bodyText}>“{intentions}”</Text>
      </Section>
    </Section>
  </EmailLayout>
);

const h1 = {
  color: '#3A3A3A',
  fontSize: '24px',
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
  borderRadius: '24px',
  border: '1px solid #E8E1D5',
};

const detailRow = {
  marginBottom: '20px',
  borderBottom: '1px solid #F8F5F0',
  paddingBottom: '10px',
};

const label = {
  color: '#CBAE73',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  marginBottom: '4px',
};

const value = {
  color: '#3A3A3A',
  fontSize: '16px',
  fontWeight: '400',
  margin: '0',
};

const bodyText = {
  color: '#3A3A3A',
  fontSize: '14px',
  lineHeight: '1.5',
  fontWeight: '300',
  margin: '0',
};

export default AdminNotificationEmail;
