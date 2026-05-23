import {
  Section,
  Text,
  Heading,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './Layout';

interface AccessSanctuaryProps {
  fullName: string;
  magicLink: string;
  email: string;
}

export const AccessSanctuaryEmail = ({
  fullName,
  magicLink,
  email,
}: AccessSanctuaryProps) => (
  <EmailLayout previewTextText="Access your private LumaFlow sanctuary portal ✨">
    {/* SECTION 1: Luxury Banner */}
    <Section style={bannerSection}>
      <Heading style={h1}>Access Your Sanctuary</Heading>
      <Text style={subtext}>
        Welcome to your personal space, {fullName || email}.
      </Text>
    </Section>

    <Hr style={hrThin} />

    {/* SECTION 2: Portal Card */}
    <Section style={card}>
      <Heading style={cardTitle}>Welcome to LumaFlow</Heading>
      
      <Text style={bodyText}>
        Your account has been automatically prepared. From your private portal, you can:
      </Text>
      
      <ul style={list}>
        <li style={listItem}>✦ &nbsp; View upcoming ritual details & formats</li>
        <li style={listItem}>✦ &nbsp; Join your live Zoom sessions directly</li>
        <li style={listItem}>✦ &nbsp; Manage your memberships and active packages</li>
        <li style={listItem}>✦ &nbsp; Track your remaining session credits</li>
        <li style={listItem}>✦ &nbsp; Explore your past healing journey history</li>
      </ul>

      <Section style={{ textAlign: 'center', marginTop: '30px', marginBottom: '10px' }}>
        <Button style={goldButton} href={magicLink}>
          Enter Portal Now
        </Button>
      </Section>

      <Text style={smallText}>
        This is a passwordless magic login link. Clicking the button will sign you in instantly and securely.
      </Text>
    </Section>

    <Hr style={hrThin} />

    {/* SECTION 3: Support Section */}
    <Section style={supportSection}>
      <Text style={supportText}>
        For assistance, reach out at <a href="mailto:support@thelumaflow.com" style={link}>support@thelumaflow.com</a>.
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
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const bodyText = {
  color: '#3A3A3A',
  fontSize: '14px',
  lineHeight: '1.6',
  fontWeight: '300',
  margin: '0 0 20px',
};

const list = {
  paddingLeft: '0',
  listStyleType: 'none',
  margin: '0 0 24px',
};

const listItem = {
  color: '#3A3A3A',
  fontSize: '13px',
  fontWeight: '300',
  lineHeight: '1.6',
  margin: '0 0 8px',
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

export default AccessSanctuaryEmail;
