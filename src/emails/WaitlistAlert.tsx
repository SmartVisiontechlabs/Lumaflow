import {
  Section,
  Text,
  Heading,
  Button,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './Layout';

interface WaitlistAlertProps {
  fullName: string;
  preferredDate: string;
  preferredTime: string;
  bookUrl?: string;
}

export const WaitlistAlertEmail = ({
  fullName,
  preferredDate,
  preferredTime,
  bookUrl = 'https://thelumaflow.com/book',
}: WaitlistAlertProps) => (
  <EmailLayout previewTextText="A ritual container has opened ✨">
    <Section style={contentSection}>
      <Heading style={h1}>Sanctuary Space Available</Heading>
      <Text style={bodyText}>
        Hello {fullName},
      </Text>
      <Text style={bodyText}>
        A ritual space has become available for your preferred date: <strong>{preferredDate}</strong> ({preferredTime}).
      </Text>
    </Section>

    <Section style={noteSection}>
      <Text style={label}>Opening Details</Text>
      <Text style={noteText}>
        Date: {preferredDate}<br />
        Resonance: {preferredTime}
      </Text>
    </Section>

    <Section style={ctaSection}>
      <Text style={bodyText}>
        Spaces are claimed on a first-resonance basis. We invite you to claim your container.
      </Text>
      <Section style={{ textAlign: 'center', marginTop: '24px' }}>
        <Button style={goldButton} href={bookUrl}>
          Book Now
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

const label = {
  color: '#CBAE73',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '0.3em',
  textTransform: 'uppercase' as const,
  marginBottom: '16px',
  textAlign: 'center' as const,
};

const noteSection = {
  backgroundColor: '#F8F5F0',
  padding: '32px',
  borderRadius: '4px',
  marginBottom: '40px',
  border: '1px solid #E8E1D5',
};

const noteText = {
  color: '#3A3A3A',
  fontSize: '16px',
  lineHeight: '1.6',
  textAlign: 'center' as const,
  margin: 0,
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

export default WaitlistAlertEmail;
