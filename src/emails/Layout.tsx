import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  previewTextText: string;
  children: React.ReactNode;
}

export const EmailLayout = ({
  previewTextText,
  children,
}: EmailLayoutProps) => (
  <Html>
    <Head />
    <Preview>{previewTextText}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logo}>LUMAFLOW</Text>
        </Section>
        
        {children}

        <Hr style={hr} />
        
        <Section style={footer}>
          <Text style={footerText}>
            Lumaflow Sanctuary • Sacred Light Architecture
          </Text>
          <Text style={footerText}>
            “Expansion is the only direction.”
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#F8F5F0', // Cream background
  fontFamily: '"Cormorant Garamond", serif, -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px 60px',
  maxWidth: '600px',
};

const header = {
  textAlign: 'center' as const,
  marginBottom: '40px',
};

const logo = {
  color: '#CBAE73', // Gold
  fontSize: '24px',
  fontWeight: '300',
  letterSpacing: '0.4em',
  margin: '0',
  textTransform: 'uppercase' as const,
};

const hr = {
  borderColor: '#E8E1D5',
  margin: '40px 0',
};

const footer = {
  textAlign: 'center' as const,
};

const footerText = {
  color: '#3A3A3A',
  fontSize: '12px',
  fontWeight: '300',
  letterSpacing: '0.1em',
  lineHeight: '1.5',
  opacity: '0.5',
  margin: '4px 0',
};
