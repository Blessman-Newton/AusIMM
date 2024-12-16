-- Create enum types for common fields
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE attendance_type AS ENUM ('in_person', 'virtual', 'hybrid');
CREATE TYPE member_type AS ENUM ('student', 'professional', 'corporate', 'non_member');

-- Main participants table
CREATE TABLE participants (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(20),
    organization VARCHAR(200),
    job_title VARCHAR(100),
    membership_number VARCHAR(50),
    member_type member_type NOT NULL,
    dietary_requirements TEXT,
    attendance_type attendance_type NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unique_registration_id UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment information
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    participant_id INT REFERENCES participants(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions/Events tracking
CREATE TABLE conference_sessions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    speaker VARCHAR(100),
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_capacity INT,
    room_number VARCHAR(50)
);

-- Session registrations for participants
CREATE TABLE session_registrations (
    id SERIAL PRIMARY KEY,
    participant_id INT REFERENCES participants(id),
    session_id INT REFERENCES conference_sessions(id),
    registration_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attended BOOLEAN DEFAULT FALSE,
    UNIQUE(participant_id, session_id)
);

-- Certificates table with enhanced tracking
CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    participant_id INT REFERENCES participants(id),
    certificate_code UUID DEFAULT gen_random_uuid(),
    template_version VARCHAR(20) NOT NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP,
    download_count INT DEFAULT 0,
    last_downloaded TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE,
    revocation_reason TEXT
);

-- Feedback and ratings
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    participant_id INT REFERENCES participants(id),
    session_id INT REFERENCES conference_sessions(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_participant_email ON participants(email);
CREATE INDEX idx_participant_registration ON participants(unique_registration_id);
CREATE INDEX idx_session_date ON conference_sessions(session_date);
CREATE INDEX idx_certificate_code ON certificates(certificate_code);

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_participant_updated_at
    BEFORE UPDATE ON participants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to check session capacity
CREATE OR REPLACE FUNCTION check_session_capacity()
RETURNS TRIGGER AS $$
BEGIN
    IF (
        SELECT COUNT(*)
        FROM session_registrations
        WHERE session_id = NEW.session_id
    ) >= (
        SELECT max_capacity
        FROM conference_sessions
        WHERE id = NEW.session_id
    ) THEN
        RAISE EXCEPTION 'Session is at maximum capacity';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';