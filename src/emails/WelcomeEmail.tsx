import {
  Section,
  Text,
  Heading,
  Button,
  Hr,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './Layout';

interface WelcomeEmailProps {
  fullName: string;
  magicLink: string;
  email: string;
  ritualName?: string;
  ritualDate?: string;
  ritualTime?: string;
  sessionLink?: string;
  sessionFormat?: string;
}

export const WelcomeEmail = ({
  fullName,
  magicLink,
  email,
  ritualName,
  ritualDate,
  ritualTime,
  sessionLink,
  sessionFormat = 'Virtual',
}: WelcomeEmailProps) => (
  <EmailLayout previewTextText="Your client sanctuary is ready ✨">
    {/* SECTION 1: Welcome Banner */}
    <Section style={bannerSection}>
      <Heading style={h1}>Welcome to Lumaflow</Heading>
      <Text style={subtext}>
        Your sanctuary is ready, {fullName || email}.
      </Text>
    </Section>

    <Hr style={hrThin} />

    {/* SECTION 2: Access Card */}
    <Section style={card}>
      <Text style={bodyText}>
        A secure client account has been automatically created for you. Access your portal to manage your integration journals, view packages, or join scheduled sessions.
      </Text>

      <Section style={{ textAlign: 'center', marginTop: '24px', marginBottom: '24px' }}>
        <Button style={goldButton} href={magicLink}>
          Continue Your Journey
        </Button>
      </Section>

      <Text style={smallText}>
        This is a secure passwordless login button. Clicking it will sign you in instantly.
      </Text>
    </Section>

    {/* SECTION 3: Upcoming Session Details (Optional) */}
    {ritualName && (
      <>
        <Hr style={hrThin} />
        <Section style={sessionCard}>
          <Heading style={cardTitle}>Your Upcoming Ritual</Heading>
          
          <Row style={row}>
            <Column style={column}>
              <Text style={label}>Ritual</Text>
              <Text style={value}>{ritualName}</Text>
            </Column>
            <Column style={column}>
              <Text style={label}>Date & Time</Text>
              <Text style={value}>{ritualDate} at {ritualTime}</Text>
            </Column>
          </Row>

          <Row style={{ ...row, marginBottom: '0px' }}>
            <Column style={column}>
              <Text style={label}>Format</Text>
              <Text style={value}>{sessionFormat}</Text>
            </Column>
            <Column style={column}>
              {sessionFormat.toLowerCase() === 'virtual' ? (
                <>
                  <Text style={label}>Sanctuary Link</Text>
                  {sessionLink ? (
                    <a href={sessionLink} style={link}>Join Session</a>
                  ) : (
                    <Text style={value}>Available in Dashboard</Text>
                  )}
                </>
              ) : (
                <>
                  <Text style={label}>Location</Text>
                  <Text style={value}>Soho, Manhattan, NY</Text>
                </>
              )}
            </Column>
          </Row>
        </Section>
      </>
    )}

    <Hr style={hrThin} />

    {/* SECTION 4: Support Footer */}
    <Section style={supportSection}>
      <Text style={supportText}>
        If you have any questions as you settle in, simply reply to this email or reach us at <a href="mailto:support@thelumaflow.com" style={link}>support@thelumaflow.com</a>.
      </Text>
    </Section>
  </EmailLayout>
);

// --- STYLES ---

const bannerSection = {
  textAlign: 'center' as const,
  padding: '40px 0',
};

const h1 = {
  color: '#3A3A3A',
  fontSize: '32px',
  fontWeight: '300',
  letterSpacing: '0.05em',
  margin: '0 0 16px',
  fontFamily: 'serif',
};

const subtext = {
  color: '#3A3A3A',
  fontSize: '16px',
  fontWeight: '300',
  margin: 0,
  opacity: 0.7,
};

const hrThin = {
  borderColor: '#E8E1D5',
  margin: '0',
  opacity: 0.5,
};

const card = {
  backgroundColor: '#FFFFFF',
  padding: '40px',
  borderRadius: '4px',
  border: '1px solid #E8E1D5',
  margin: '40px 0',
};

const sessionCard = {
  backgroundColor: '#FAF9F6',
  padding: '40px',
  borderRadius: '4px',
  border: '1px solid #E8E1D5',
  margin: '40px 0',
};

const cardTitle = {
  color: '#3A3A3A',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  margin: '0 0 30px',
  textAlign: 'center' as const,
};

const bodyText = {
  color: '#3A3A3A',
  fontSize: '14px',
  lineHeight: '1.6',
  fontWeight: '300',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const row = {
  marginBottom: '24px',
};

const column = {
  width: '50%',
};

const label = {
  color: '#CBAE73',
  fontSize: '9px',
  fontWeight: '700',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px',
};

const value = {
  color: '#3A3A3A',
  fontSize: '14px',
  fontWeight: '400',
  margin: 0,
};

const smallText = {
  color: '#8A8A8A',
  fontSize: '11px',
  lineHeight: '1.5',
  fontWeight: '300',
  textAlign: 'center' as const,
  marginTop: '20px',
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

const supportSection = {
  textAlign: 'center' as const,
  padding: '40px 20px',
};

const supportText = {
  color: '#3A3A3A',
  fontSize: '13px',
  fontWeight: '300',
  lineHeight: '1.6',
  opacity: 0.6,
  margin: 0,
};

const link = {
  color: '#CBAE73',
  textDecoration: 'underline',
};

export default WelcomeEmail;
