from sqlalchemy import Column, Integer, String, DateTime, Enum, Boolean, Text, ForeignKey, Numeric, Time, Date
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import enum
import uuid

Base = declarative_base()

class MemberType(enum.Enum):
    student = "student"
    professional = "professional"
    corporate = "corporate"
    non_member = "non_member"

class PaymentStatus(enum.Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    refunded = "refunded"

class AttendanceType(enum.Enum):
    in_person = "in_person"
    virtual = "virtual"
    hybrid = "hybrid"

class Participant(Base):
    __tablename__ = 'participants'

    id = Column(Integer, primary_key=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(120), nullable=False, unique=True)
    phone = Column(String(20))
    organization = Column(String(200))
    job_title = Column(String(100))
    membership_number = Column(String(50))
    member_type = Column(Enum(MemberType), nullable=False)
    dietary_requirements = Column(Text)
    attendance_type = Column(Enum(AttendanceType), nullable=False)
    registration_date = Column(DateTime, default=datetime.utcnow)
    unique_registration_id = Column(UUID(as_uuid=True), default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    payments = relationship("Payment", back_populates="participant")
    certificates = relationship("Certificate", back_populates="participant")
    session_registrations = relationship("SessionRegistration", back_populates="participant")
    feedback = relationship("Feedback", back_populates="participant")

class Payment(Base):
    __tablename__ = 'payments'

    id = Column(Integer, primary_key=True)
    participant_id = Column(Integer, ForeignKey('participants.id'))
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(50), nullable=False)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    transaction_id = Column(String(100))
    payment_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    participant = relationship("Participant", back_populates="payments")

class Certificate(Base):
    __tablename__ = 'certificates'

    id = Column(Integer, primary_key=True)
    participant_id = Column(Integer, ForeignKey('participants.id'))
    certificate_code = Column(UUID(as_uuid=True), default=uuid.uuid4)
    template_version = Column(String(20), nullable=False)
    issue_date = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime)
    download_count = Column(Integer, default=0)
    last_downloaded = Column(DateTime)
    revoked = Column(Boolean, default=False)
    revocation_reason = Column(Text)

    participant = relationship("Participant", back_populates="certificates")

class ConferenceSession(Base):
    __tablename__ = 'conference_sessions'

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    speaker = Column(String(100))
    session_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    max_capacity = Column(Integer)
    room_number = Column(String(50))

    registrations = relationship("SessionRegistration", back_populates="session")
    feedback = relationship("Feedback", back_populates="session")

class SessionRegistration(Base):
    __tablename__ = 'session_registrations'

    id = Column(Integer, primary_key=True)
    participant_id = Column(Integer, ForeignKey('participants.id'))
    session_id = Column(Integer, ForeignKey('conference_sessions.id'))
    registration_timestamp = Column(DateTime, default=datetime.utcnow)
    attended = Column(Boolean, default=False)

    participant = relationship("Participant", back_populates="session_registrations")
    session = relationship("ConferenceSession", back_populates="registrations")

class Feedback(Base):
    __tablename__ = 'feedback'

    id = Column(Integer, primary_key=True)
    participant_id = Column(Integer, ForeignKey('participants.id'))
    session_id = Column(Integer, ForeignKey('conference_sessions.id'))
    rating = Column(Integer)
    comments = Column(Text)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    participant = relationship("Participant", back_populates="feedback")
    session = relationship("ConferenceSession", back_populates="feedback")