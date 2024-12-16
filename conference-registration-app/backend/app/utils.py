from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import smtplib
import os
from datetime import datetime
from typing import Dict, Tuple, Any

def generate_certificate(participant) -> str:
    """Generate PDF certificate for participant"""
    certificate_path = f'certificates/{participant.unique_registration_id}.pdf'
    os.makedirs('certificates', exist_ok=True)
    
    c = canvas.Canvas(certificate_path, pagesize=letter)
    width, height = letter
    
    # Certificate design
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(width/2, height-100, "AusIMM Conference Certificate")
    
    c.setFont("Helvetica", 20)
    c.drawCentredString(width/2, height-200, 
        f"{participant.first_name} {participant.last_name}")
    
    c.setFont("Helvetica", 16)
    c.drawCentredString(width/2, height-250, 
        f"Member Type: {participant.member_type.value}")
    
    c.drawCentredString(width/2, height-300, 
        f"Date: {datetime.now().strftime('%B %d, %Y')}")
    
    c.save()
    return certificate_path

def validate_registration_data(data: Dict[str, Any]) -> Tuple[bool, str]:
    """Validate registration form data"""
    required_fields = [
        'first_name', 'last_name', 'email',
        'member_type', 'attendance_type'
    ]
    
    for field in required_fields:
        if field not in data or not data[field]:
            return False, f"{field} is required"
    
    if not is_valid_email(data['email']):
        return False, "Invalid email format"
        
    return True, "Validation successful"

def send_confirmation_email(participant, certificate_path: str = None):
    """Send confirmation email with optional certificate"""
    msg = MIMEMultipart()
    msg['Subject'] = 'AusIMM Conference Registration Confirmation'
    msg['From'] = 'noreply@auximm.org'
    msg['To'] = participant.email
    
    body = f"""
    Dear {participant.first_name},
    
    Thank you for registering for the AusIMM Conference.
    Your registration ID is: {participant.unique_registration_id}
    
    Conference Details:
    Attendance Type: {participant.attendance_type.value}
    Member Type: {participant.member_type.value}
    
    Best regards,
    AusIMM Team
    """
    
    msg.attach(MIMEText(body))
    
    if certificate_path and os.path.exists(certificate_path):
        with open(certificate_path, 'rb') as f:
            pdf = MIMEApplication(f.read(), _subtype='pdf')
            pdf.add_header('Content-Disposition', 'attachment', 
                         filename='certificate.pdf')
            msg.attach(pdf)
    
    # TODO: Implement actual email sending
    return True

def is_valid_email(email: str) -> bool:
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def format_datetime(dt: datetime) -> str:
    """Format datetime for display"""
    return dt.strftime("%B %d, %Y %I:%M %p")

def generate_qr_code(registration_id: str) -> str:
    """Generate QR code for registration"""
    import qrcode
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(registration_id)
    qr.make(fit=True)
    
    qr_path = f'qrcodes/{registration_id}.png'
    os.makedirs('qrcodes', exist_ok=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(qr_path)
    return qr_path

def cleanup_old_files(days: int = 30):
    """Clean up old certificates and QR codes"""
    import shutil
    from datetime import timedelta
    
    cutoff = datetime.now() - timedelta(days=days)
    
    for directory in ['certificates', 'qrcodes']:
        if os.path.exists(directory):
            for filename in os.listdir(directory):
                filepath = os.path.join(directory, filename)
                if os.path.getctime(filepath) < cutoff.timestamp():
                    os.remove(filepath)