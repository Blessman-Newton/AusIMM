import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import Certificate from './Certificate';

interface DashboardProps {
  userId: string;
}

interface SessionData {
  id: string;
  title: string;
  date: string;
  time: string;
  speaker: string;
  registered: boolean;
}

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const StatusCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const SessionCard = styled(motion.div)`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Button = styled(motion.button)`
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
`;

const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [registrationStatus, setRegistrationStatus] = useState<string>('');
  const [certificateData, setCertificateData] = useState(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statusRes, sessionsRes, certificateRes] = await Promise.all([
          fetch(`/api/registration-status/${userId}`),
          fetch(`/api/sessions/${userId}`),
          fetch(`/api/certificate/${userId}`)
        ]);

        const status = await statusRes.json();
        const sessionsData = await sessionsRes.json();
        const certificate = await certificateRes.json();

        setRegistrationStatus(status.status);
        setSessions(sessionsData);
        setCertificateData(certificate);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  const handleSessionRegistration = async (sessionId: string) => {
    try {
      const response = await fetch('/api/register-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionId })
      });
      
      if (response.ok) {
        setSessions(sessions.map(session => 
          session.id === sessionId 
            ? { ...session, registered: true }
            : session
        ));
      }
    } catch (error) {
      console.error('Error registering for session:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardContainer>
      <StatusCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>Registration Status</h2>
        <p>{registrationStatus}</p>
      </StatusCard>

      {certificateData && (
        <Certificate
          participantName={certificateData.name}
          conferenceName="AusIMM Annual Conference 2024"
          date={certificateData.date}
          registrationId={certificateData.registrationId}
          memberType={certificateData.memberType}
        />
      )}

      <h2>Available Sessions</h2>
      <Grid>
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
          >
            <h3>{session.title}</h3>
            <p>Speaker: {session.speaker}</p>
            <p>Date: {session.date}</p>
            <p>Time: {session.time}</p>
            <Button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSessionRegistration(session.id)}
              disabled={session.registered}
            >
              {session.registered ? 'Registered' : 'Register'}
            </Button>
          </SessionCard>
        ))}
      </Grid>
    </DashboardContainer>
  );
};

export default Dashboard;