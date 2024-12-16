import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';

const FormContainer = styled(motion.div)`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const Step = styled.div<{ active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${props => props.active ? '#3498db' : '#eee'};
  color: ${props => props.active ? 'white' : 'black'};
  border-radius: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled(motion.button)`
  background: #3498db;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
`;

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 0.8rem;
`;

interface RegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization: string;
  memberType: string;
  attendanceType: string;
  dietaryRequirements: string;
  paymentMethod: string;
}

const Registration: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { register, handleSubmit, formState: { errors } } = useForm<RegistrationForm>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: RegistrationForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        // Handle successful registration
        setCurrentStep(4); // Move to confirmation step
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2>Personal Information</h2>
            <Input 
              {...register('firstName', { required: true })}
              placeholder="First Name"
            />
            {errors.firstName && <ErrorMessage>First name is required</ErrorMessage>}
            
            <Input 
              {...register('lastName', { required: true })}
              placeholder="Last Name"
            />
            {errors.lastName && <ErrorMessage>Last name is required</ErrorMessage>}
            
            <Input 
              {...register('email', { 
                required: true,
                pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
              })}
              placeholder="Email"
              type="email"
            />
            {errors.email && <ErrorMessage>Valid email is required</ErrorMessage>}
            
            <Input 
              {...register('phone')}
              placeholder="Phone Number"
            />
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2>Conference Details</h2>
            <Select {...register('memberType', { required: true })}>
              <option value="">Select Member Type</option>
              <option value="student">Student</option>
              <option value="professional">Professional</option>
              <option value="corporate">Corporate</option>
            </Select>
            {errors.memberType && <ErrorMessage>Member type is required</ErrorMessage>}
            
            <Select {...register('attendanceType', { required: true })}>
              <option value="">Select Attendance Type</option>
              <option value="in_person">In Person</option>
              <option value="virtual">Virtual</option>
              <option value="hybrid">Hybrid</option>
            </Select>
            {errors.attendanceType && <ErrorMessage>Attendance type is required</ErrorMessage>}
            
            <Input 
              {...register('dietaryRequirements')}
              placeholder="Dietary Requirements"
            />
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2>Payment Information</h2>
            <Select {...register('paymentMethod', { required: true })}>
              <option value="">Select Payment Method</option>
              <option value="credit_card">Credit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="paypal">PayPal</option>
            </Select>
            {errors.paymentMethod && <ErrorMessage>Payment method is required</ErrorMessage>}
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2>Registration Complete!</h2>
            <p>Thank you for registering for the AusIMM Conference.</p>
            <p>You will receive a confirmation email shortly.</p>
          </motion.div>
        );
    }
  };

  return (
    <FormContainer>
      <StepIndicator>
        <Step active={currentStep === 1}>Personal Details</Step>
        <Step active={currentStep === 2}>Conference Details</Step>
        <Step active={currentStep === 3}>Payment</Step>
        <Step active={currentStep === 4}>Confirmation</Step>
      </StepIndicator>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {currentStep < 4 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            {currentStep > 1 && (
              <Button
                type="button"
                onClick={() => setCurrentStep(curr => curr - 1)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Previous
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(curr => curr + 1)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSubmitting ? 'Submitting...' : 'Complete Registration'}
              </Button>
            )}
          </div>
        )}
      </form>
    </FormContainer>
  );
};

export default Registration;