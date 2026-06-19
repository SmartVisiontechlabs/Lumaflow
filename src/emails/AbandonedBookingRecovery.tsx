import {
  Section,
  Text,
  Heading,
  Button,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './Layout';

interface AbandonedBookingRecoveryProps {
  fullName: string;
  ritual?: string | null;
  date?: string | null;
  timeEST?: string | null;
  resumeUrl?: string;
}

export const AbandonedBookingRecoveryEmail = ({
  fullName,
  ritual,
  date,
  timeEST,
  resumeUrl = 'https://thelumaflow.com/book',
}: AbandonedBookingRecoveryProps) => (
  <EmailLayout previewTextText="Return to Your Sanctuary Space ✨">
    <Section style={contentSection}>
      <Heading style={h1}>Your Sanctuary Awaits</Heading>
      <Text style={bodyText}>
        Hello {fullName}, we noticed you started booking a session but didn't finish. Your selected ritual options have been gently saved.
      </Text>
    </Section>

    {ritual && (
      <Section style={card}>
        <Heading style={cardTitle}>Saved Preferences</Heading>
        <Text style={bodyText}>
          <strong>Ritual:</strong> {ritual}
        </Text>
        {date && (
          <Text style={{ ...bodyText, marginTop: '8px' }}>
            <strong>Moment:</strong> {date} {timeEST ? `at ${timeEST}` : ''}
          </Text>
        )}
      </Section>
    )}

    <Section style={ctaSection}>
      <Text style={bodyText}>
        We invite you to resume your path and finalize your booking.
      </Text>
      <Section style={{ textAlign: 'center', marginTop: '24px' }}>
        <Button style={goldButton} href={resumeUrl}>
          Resume Booking
        </Button>
      </Section>
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

const bodyText = {
  color: '#3A3A3A',
  fontSize: '16px',
  lineHeight: '1.6',
  fontWeight: '300',
  textAlign: 'center' as const,
};

const card = {
  backgroundColor: '#FFFFFF',
  padding: '32px',
  borderRadius: '4px',
  border: '1px solid #E8E1D5',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const cardTitle = {
  color: '#3A3A3A',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  margin: '0 0 20px',
};

const ctaSection = {
  textAlign: 'center' as const,
  marginTop: '40px',
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

export default AbandonedBookingRecoveryEmail;
