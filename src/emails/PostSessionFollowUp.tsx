import {
  Section,
  Text,
  Heading,
  Button,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './Layout';

interface PostSessionFollowUpProps {
  fullName: string;
  ritual: string;
  rebookUrl?: string;
}

export const PostSessionFollowUpEmail = ({
  fullName,
  ritual,
  rebookUrl = 'https://thelumaflow.com/book',
}: PostSessionFollowUpProps) => (
  <EmailLayout previewTextText="Integration & Gratitude ✨">
    <Section style={contentSection}>
      <Heading style={h1}>Gratitude for Your Journey</Heading>
      <Text style={bodyText}>
        Hello {fullName}, thank you for joining us for your <strong>{ritual}</strong> session. Settle gently into the integration period.
      </Text>
    </Section>

    <Section style={noteSection}>
      <Text style={label}>Somatic Reflection Prompt</Text>
      <Text style={noteText}>
        “Take a moment to notice: How does your body feel now compared to before the session? What came up during your breathwork that you would like to carry forward?”
      </Text>
    </Section>

    <Section style={ctaSection}>
      <Text style={bodyText}>
        When you are ready to continue your somatic path, your sanctuary is open.
      </Text>
      <Section style={{ textAlign: 'center', marginTop: '24px' }}>
        <Button style={goldButton} href={rebookUrl}>
          Book Next Session
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
  fontStyle: 'italic',
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

export default PostSessionFollowUpEmail;
