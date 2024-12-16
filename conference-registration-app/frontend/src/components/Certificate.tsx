import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';

interface CertificateProps {
  participantName: string;
  conferenceName: string;
  date: string;
  registrationId: string;
  memberType: string;
  isVerified?: boolean;
  onDownload?: () => void;
}

const CertificateContainer = styled(motion.div)`
  background: linear-gradient(to bottom right, #ffffff, #f0f0f0);
  border: 2px solid #gold;
  border-radius: 10px;
  padding: 40px;
  width: 800px;
  margin: 20px auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
`;

const Logo = styled.img`
  width: 120px;
  position: absolute;
  top: 20px;
  right: 20px;
`;

const Title = styled.h1`
  color: #2c3e50;
  font-size: 2.5em;
  margin-bottom: 30px;
  font-family: 'Playfair Display', serif;
`;

const ParticipantName = styled.h2`
  color: #34495e;
  font-size: 2em;
  border-bottom: 2px solid #gold;
  padding-bottom: 10px;
  margin: 20px 0;
`;

const Text = styled.p`
  color: #7f8c8d;
  font-size: 1.2em;
  margin: 10px 0;
`;

const VerificationBadge = styled.div<{ isVerified: boolean }>`
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 8px 16px;
  border-radius: 20px;
  background-color: ${props => props.isVerified ? '#2ecc71' : '#e74c3c'};
  color: white;
  font-size: 0.9em;
`;

const DownloadButton = styled(motion.button)`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  font-size: 1.1em;
  transition: all 0.3s ease;

  &:hover {
    background-color: #2980b9;
    transform: scale(1.05);
  }
`;

const Certificate: React.FC<CertificateProps> = ({
  participantName,
  conferenceName,
  date,
  registrationId,
  memberType,
  isVerified = true,
  onDownload
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  return (
    <CertificateContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <VerificationBadge isVerified={isVerified}>
        {isVerified ? 'Verified' : 'Unverified'}
      </VerificationBadge>
      
      <Logo src="/auximm-logo.png" alt="AusIMM Logo" />
      
      <Title>Certificate of Participation</Title>
      
      <Text>This is to certify that</Text>
      
      <ParticipantName>{participantName}</ParticipantName>
      
      <Text>has successfully participated in</Text>
      
      <motion.h3
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {conferenceName}
      </motion.h3>
      
      <Text>as a {memberType} member</Text>
      <Text>on {date}</Text>

      <div style={{ margin: '20px 0' }}>
        <QRCode value={registrationId} size={128} />
        <Text style={{ fontSize: '0.8em' }}>Registration ID: {registrationId}</Text>
      </div>

      <DownloadButton
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDownload}
      >
        Download Certificate
      </DownloadButton>
    </CertificateContainer>
  );
};

export default Certificate;