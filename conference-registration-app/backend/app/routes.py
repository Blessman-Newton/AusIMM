from flask import Blueprint, request, jsonify, send_file
from models import (
    Participant, Payment, Certificate, ConferenceSession, 
    SessionRegistration, Feedback, PaymentStatus, MemberType, AttendanceType
)
from utils import generate_certificate, db
from datetime import datetime
import uuid

routes = Blueprint('routes', __name__)

# Registration and Payment Routes
@routes.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # Check for existing email
        if Participant.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
            
        participant = Participant(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            phone=data.get('phone'),
            organization=data.get('organization'),
            job_title=data.get('job_title'),
            membership_number=data.get('membership_number'),
            member_type=MemberType[data['member_type']],
            dietary_requirements=data.get('dietary_requirements'),
            attendance_type=AttendanceType[data['attendance_type']]
        )
        
        db.session.add(participant)
        db.session.flush()
        
        # Create payment record
        payment = Payment(
            participant_id=participant.id,
            amount=data['payment_amount'],
            payment_method=data['payment_method']
        )
        
        db.session.add(payment)
        db.session.commit()
        
        return jsonify({
            'message': 'Registration successful',
            'registration_id': participant.unique_registration_id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@routes.route('/payments/<uuid:registration_id>', methods=['PUT'])
def update_payment_status():
    payment = Payment.query.filter_by(participant_id=registration_id).first()
    if not payment:
        return jsonify({'error': 'Payment not found'}), 404
        
    data = request.json
    payment.payment_status = PaymentStatus[data['status']]
    payment.transaction_id = data.get('transaction_id')
    payment.payment_date = datetime.utcnow()
    
    db.session.commit()
    return jsonify({'message': 'Payment updated successfully'})

# Certificate Routes
@routes.route('/certificates/<uuid:registration_id>', methods=['POST'])
def generate_participant_certificate(registration_id):
    participant = Participant.query.filter_by(unique_registration_id=registration_id).first()
    if not participant:
        return jsonify({'error': 'Participant not found'}), 404
        
    certificate = generate_certificate(participant)
    return jsonify({
        'message': 'Certificate generated',
        'certificate_code': certificate.certificate_code
    })

@routes.route('/certificates/download/<uuid:certificate_code>', methods=['GET'])
def download_certificate(certificate_code):
    certificate = Certificate.query.filter_by(certificate_code=certificate_code).first()
    if not certificate or certificate.revoked:
        return jsonify({'error': 'Certificate not available'}), 404
        
    certificate.download_count += 1
    certificate.last_downloaded = datetime.utcnow()
    db.session.commit()
    
    return send_file(
        f'certificates/{certificate_code}.pdf',
        as_attachment=True,
        download_name=f'certificate_{certificate_code}.pdf'
    )

# Conference Session Routes
@routes.route('/sessions', methods=['GET'])
def list_sessions():
    sessions = ConferenceSession.query.all()
    return jsonify([{
        'id': s.id,
        'title': s.title,
        'speaker': s.speaker,
        'date': s.session_date.isoformat(),
        'start_time': s.start_time.isoformat(),
        'end_time': s.end_time.isoformat(),
        'available_seats': s.max_capacity - len(s.registrations)
    } for s in sessions])

@routes.route('/sessions/<int:session_id>/register', methods=['POST'])
def register_for_session():
    data = request.json
    registration = SessionRegistration(
        participant_id=data['participant_id'],
        session_id=session_id
    )
    
    try:
        db.session.add(registration)
        db.session.commit()
        return jsonify({'message': 'Successfully registered for session'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Feedback Routes
@routes.route('/feedback', methods=['POST'])
def submit_feedback():
    data = request.json
    feedback = Feedback(
        participant_id=data['participant_id'],
        session_id=data['session_id'],
        rating=data['rating'],
        comments=data.get('comments')
    )
    
    db.session.add(feedback)
    db.session.commit()
    return jsonify({'message': 'Feedback submitted successfully'})

# Admin Routes
@routes.route('/admin/participants', methods=['GET'])
def list_participants():
    participants = Participant.query.all()
    return jsonify([{
        'id': p.id,
        'name': f"{p.first_name} {p.last_name}",
        'email': p.email,
        'registration_id': p.unique_registration_id,
        'payment_status': p.payments[0].payment_status.value if p.payments else 'no_payment'
    } for p in participants])

@routes.route('/admin/sessions/<int:session_id>/attendance', methods=['PUT'])
def mark_attendance():
    data = request.json
    registration = SessionRegistration.query.filter_by(
        session_id=session_id,
        participant_id=data['participant_id']
    ).first()
    
    if registration:
        registration.attended = data['attended']
        db.session.commit()
        return jsonify({'message': 'Attendance marked successfully'})
    return jsonify({'error': 'Registration not found'}), 404