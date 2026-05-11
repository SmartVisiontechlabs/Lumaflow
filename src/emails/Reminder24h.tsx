import {
  Section,
  Text,
  Heading,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './Layout';

interface ReminderProps {
  fullName: string;
  ritual: string;
  timeEST: string;
}

export const Reminder24hEmail = ({
  fullName,
  ritual,
  timeEST,
}: ReminderProps) => (
  <EmailLayout previewTextText="Your sanctuary awaits tomorrow ✨">
    <Section style={contentSection}>
      <Heading style={h1}>The Portal Opens Soon</Heading>
      <Text style={bodyText}>
        Greetings {fullName}, your {ritual} ritual is approaching. We are preparing the sanctuary for your arrival tomorrow at {timeEST}.
      </Text>
    </Section>

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
};

const bodyText = {
  color: '#3A3A3A',
  fontSize: '16px',
  lineHeight: '1.6',
  fontWeight: '300',
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

export default Reminder24hEmail;
