import {
  Section,
  Text,
  Heading,
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
}: BookingConfirmationProps) => (
  <EmailLayout previewTextText="✨ Your sanctuary has been reserved">
    <Section style={contentSection}>
      <Heading style={h1}>Welcome Home, {fullName}</Heading>
      <Text style={bodyText}>
        A space has been held for you. Your ritual journey is now scheduled at the Lumaflow Sanctuary.
      </Text>
    </Section>

    <Section style={card}>
      <Text style={label}>Appointment Reference</Text>
      <Text style={referenceText}>{reference}</Text>
      
      <Section style={detailGrid}>
        <Section style={detailColumn}>
          <Text style={label}>Ritual</Text>
          <Text style={value}>{ritual}</Text>
        </Section>
        <Section style={detailColumn}>
          <Text style={label}>Duration</Text>
          <Text style={value}>{duration} Minutes</Text>
        </Section>
      </Section>

      <Section style={detailGrid}>
        <Section style={detailColumn}>
          <Text style={label}>Sanctuary Time (EST)</Text>
          <Text style={value}>{timeEST}</Text>
        </Section>
        <Section style={detailColumn}>
          <Text style={label}>Your Local Time</Text>
          <Text style={value}>{timeLocal}</Text>
        </Section>
      </Section>

      <Section style={detailColumn}>
        <Text style={label}>Date</Text>
        <Text style={value}>{date}</Text>
      </Section>
    </Section>

    {intentions && (
      <Section style={intentionsSection}>
        <Text style={label}>Your Intention</Text>
        <Text style={italicText}>“{intentions}”</Text>
      </Section>
    )}

    <Section style={guidanceSection}>
      <Heading style={h2}>Preparation</Heading>
      <Text style={bodyText}>
        Before your arrival, we invite you to hydrate gently and find a moment of stillness. 
        Wear comfortable clothing that allows for deep, uninhibited breath.
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

const bodyText = {
  color: '#3A3A3A',
  fontSize: '16px',
  lineHeight: '1.6',
  fontWeight: '300',
};

const card = {
  backgroundColor: '#FFFFFF',
  padding: '40px',
  borderRadius: '24px',
  border: '1px solid #E8E1D5',
};

const label = {
  color: '#CBAE73',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '0.3em',
  textTransform: 'uppercase' as const,
  marginBottom: '8px',
};

const value = {
  color: '#3A3A3A',
  fontSize: '18px',
  fontWeight: '400',
  margin: '0 0 24px',
};

const referenceText = {
  color: '#3A3A3A',
  fontSize: '24px',
  fontWeight: '400',
  letterSpacing: '0.1em',
  margin: '0 0 32px',
};

const detailGrid = {
  display: 'table',
  width: '100%',
};

const detailColumn = {
  display: 'table-cell',
  width: '50%',
  verticalAlign: 'top',
};

const intentionsSection = {
  marginTop: '32px',
  padding: '0 20px',
};

const italicText = {
  color: '#3A3A3A',
  fontSize: '16px',
  fontStyle: 'italic',
  lineHeight: '1.6',
  opacity: '0.7',
};

const guidanceSection = {
  marginTop: '40px',
};

export default BookingConfirmationEmail;
