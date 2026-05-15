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

interface BookingConfirmationProps {
  fullName: string;
  ritual: string;
  date: string;
  timeEST: string;
  timeLocal: string;
  duration: number;
  reference: string;
  intentions: string;
  googleCalendarUrl?: string;
  icsDataUri?: string;
}

export const BookingConfirmationEmail = ({
  fullName,
  ritual,
  date,
  timeEST,
  timeLocal,
  duration,
  reference,
  intentions,
  googleCalendarUrl,
  icsDataUri,
}: BookingConfirmationProps) => (
  <EmailLayout previewTextText="Your sanctuary has been reserved ✨">
    {/* SECTION 1: Luxury Banner */}
    <Section style={bannerSection}>
      <Heading style={h1}>Your Sanctuary Has Been Reserved</Heading>
      <Text style={subtext}>
        We look forward to supporting your healing journey, {fullName}.
      </Text>
    </Section>

    <Hr style={hrThin} />

    {/* SECTION 2: Booking Summary Card */}
    <Section style={card}>
      <Heading style={cardTitle}>Ritual Summary</Heading>
      
      <Row style={row}>
        <Column style={column}>
          <Text style={label}>Session</Text>
          <Text style={value}>{ritual}</Text>
        </Column>
        <Column style={column}>
          <Text style={label}>Duration</Text>
          <Text style={value}>{duration} Minutes</Text>
        </Column>
      </Row>

      <Row style={row}>
        <Column style={column}>
          <Text style={label}>Date</Text>
          <Text style={value}>{date}</Text>
        </Column>
        <Column style={column}>
          <Text style={label}>Time (EST)</Text>
          <Text style={value}>{timeEST}</Text>
        </Column>
      </Row>

      <Row style={row}>
        <Column style={column}>
          <Text style={label}>Local Time</Text>
          <Text style={value}>{timeLocal}</Text>
        </Column>
        <Column style={column}>
          <Text style={label}>Reference</Text>
          <Text style={value}>{reference}</Text>
        </Column>
      </Row>
    </Section>

    {/* SECTION: Calendar CTA */}
    <Section style={calendarCtaSection}>
      <Text style={calendarTitle}>Reserve This Sacred Moment</Text>
      <Button
        style={goldButton}
        href={googleCalendarUrl}
      >
        Add to Google Calendar
      </Button>
    </Section>

    {/* SECTION 3: Preparation Checklist */}
    <Section style={prepSection}>
      <Heading style={h2}>Preparing For Your Session</Heading>
      <Section style={checklistContainer}>
        <Text style={checkItem}>✓ &nbsp; Quiet private space</Text>
        <Text style={checkItem}>✓ &nbsp; Water nearby</Text>
        <Text style={checkItem}>✓ &nbsp; Comfortable clothing</Text>
        <Text style={checkItem}>✓ &nbsp; Headphones recommended</Text>
        <Text style={checkItem}>✓ &nbsp; Arrive 5 minutes early</Text>
      </Section>
    </Section>

    <Hr style={hrThin} />

    {/* SECTION 5: Support Section */}
    <Section style={supportSection}>
      <Text style={supportText}>
        If you need support before your session, simply reply to this email or contact us at <a href="mailto:support@thelumaflow.com" style={link}>support@thelumaflow.com</a>.
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
  fontSize: '28px',
  fontWeight: '300',
  letterSpacing: '0.05em',
  margin: '0 0 16px',
  fontFamily: 'serif',
};

const h2 = {
  color: '#CBAE73',
  fontSize: '14px',
  fontWeight: '700',
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  margin: '40px 0 20px',
  textAlign: 'center' as const,
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

const cardTitle = {
  color: '#3A3A3A',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  margin: '0 0 30px',
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

const prepSection = {
  padding: '0 20px',
};

const checklistContainer = {
  backgroundColor: '#FAF9F6',
  padding: '30px',
  borderRadius: '4px',
};

const checkItem = {
  color: '#3A3A3A',
  fontSize: '14px',
  fontWeight: '300',
  margin: '0 0 12px',
};

const calendarCtaSection = {
  textAlign: 'center' as const,
  padding: '0 0 40px',
};

const calendarTitle = {
  color: '#CBAE73',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  margin: '0 0 16px',
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

export default BookingConfirmationEmail;

