import {
  Section,
  Text,
  Heading,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './Layout';

interface PrepProps {
  fullName: string;
  timeLocal: string;
}

export const Prep2hEmail = ({
  fullName,
  timeLocal,
}: PrepProps) => (
  <EmailLayout previewTextText="A gentle preparation for your session">
    <Section style={contentSection}>
      <Heading style={h1}>Soft Arrival</Heading>
      <Text style={bodyText}>
        The time for your ritual is nearing. We invite you to begin your soft arrival now.
      </Text>
    </Section>

    <Section style={card}>
      <Section style={checklistItem}>
        <Text style={label}>Environment</Text>
        <Text style={bodyText}>Create a quiet, undisturbed space. Dim the lights if possible.</Text>
      </Section>
      
      <Section style={checklistItem}>
        <Text style={label}>Vessel</Text>
        <Text style={bodyText}>Have a glass of water nearby. Small sips only.</Text>
      </Section>

      <Section style={checklistItem}>
        <Text style={label}>Attire</Text>
        <Text style={bodyText}>Comfortable, loose clothing. Remove any constricting items.</Text>
      </Section>

      <Section style={checklistItem}>
        <Text style={label}>Optional</Text>
        <Text style={bodyText}>A journal and pen to capture any post-ritual expansions.</Text>
      </Section>
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
  borderRadius: '24px',
  border: '1px solid #E8E1D5',
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

const bodyText = {
  color: '#3A3A3A',
  fontSize: '16px',
  lineHeight: '1.6',
  fontWeight: '300',
  margin: '0',
};

const closingSection = {
  marginTop: '40px',
  textAlign: 'center' as const,
};

export default Prep2hEmail;
