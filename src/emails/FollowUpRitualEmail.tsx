import {
  Section,
  Text,
  Heading,
  Container,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './Layout';

interface RitualOption {
  ritual: string;
  focus: string;
  duration: number;
  insight: string;
  quote: string;
}

interface FollowUpRitualEmailProps {
  clientName: string;
  rituals: RitualOption[];
  adminNote?: string;
}

export const FollowUpRitualEmail = ({
  clientName,
  rituals,
  adminNote,
}: FollowUpRitualEmailProps) => (
  <EmailLayout previewTextText="✨ The Journey Continues: Your Recommended Integration">
    <Section style={contentSection}>
      <Heading style={h1}>For Your Continued Path, {clientName}</Heading>
      <Text style={bodyText}>
        We hope your recent ritual has brought you closer to your center. To support your integration and continued expansion, we have curated these following rituals for you.
      </Text>
    </Section>

    {adminNote && (
      <Section style={noteSection}>
        <Text style={label}>A Personal Note for Your Sanctuary</Text>
        <Text style={noteText}>“{adminNote}”</Text>
      </Section>
    )}

    <Section style={ritualsContainer}>
      <Text style={label}>Recommended Integration Rituals</Text>
      
      {rituals.map((ritual, index) => (
        <Section key={index} style={ritualCard}>
          <Section style={cardHeader}>
            <Text style={ritualTitle}>{ritual.ritual}</Text>
            <Text style={durationBadge}>{ritual.duration}m</Text>
          </Section>
          
          <Text style={focusText}>{ritual.focus}</Text>
          
          <Section style={insightBox}>
            <Text style={insightLabel}>Somatic Insight</Text>
            <Text style={insightText}>{ritual.insight}</Text>
          </Section>
          
          <Text style={quoteText}>“{ritual.quote}”</Text>
        </Section>
      ))}
    </Section>

    <Section style={footerCallout}>
      <Text style={bodyText}>
        When you feel the call to return, your sanctuary awaits.
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

const bodyText = {
  color: '#3A3A3A',
  fontSize: '16px',
  lineHeight: '1.6',
  fontWeight: '300',
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
  borderRadius: '24px',
  marginBottom: '40px',
  border: '1px solid #E8E1D5',
};

const noteText = {
  color: '#3A3A3A',
  fontSize: '16px',
  fontStyle: 'italic',
  lineHeight: '1.6',
  textAlign: 'center' as const,
  margin: 0,
};

const ritualsContainer = {
  marginBottom: '40px',
};

const ritualCard = {
  backgroundColor: '#FFFFFF',
  padding: '32px',
  borderRadius: '24px',
  border: '1px solid #E8E1D5',
  marginBottom: '20px',
};

const cardHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
};

const ritualTitle = {
  color: '#3A3A3A',
  fontSize: '20px',
  fontWeight: '400',
  margin: 0,
  fontFamily: 'serif',
};

const durationBadge = {
  color: '#CBAE73',
  fontSize: '11px',
  fontWeight: '600',
  backgroundColor: '#F8F5F0',
  padding: '4px 12px',
  borderRadius: '12px',
  margin: 0,
};

const focusText = {
  color: '#CBAE73',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  marginBottom: '20px',
};

const insightBox = {
  backgroundColor: '#FAF9F6',
  padding: '20px',
  borderRadius: '16px',
  marginBottom: '20px',
};

const insightLabel = {
  color: '#CBAE73',
  fontSize: '9px',
  fontWeight: '700',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  marginBottom: '8px',
};

const insightText = {
  color: '#3A3A3A',
  fontSize: '14px',
  lineHeight: '1.5',
  fontWeight: '300',
  margin: 0,
};

const quoteText = {
  color: '#3A3A3A',
  fontSize: '14px',
  fontStyle: 'italic',
  opacity: 0.6,
  margin: 0,
};

const footerCallout = {
  textAlign: 'center' as const,
  marginTop: '40px',
};

export default FollowUpRitualEmail;
