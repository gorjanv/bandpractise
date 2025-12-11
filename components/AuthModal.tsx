'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styled from 'styled-components';
import { ModalOverlay, GlassCard, Input, PrimaryButton, SecondaryButton, Heading2 } from '@/styles/styledComponents';
import { theme } from '@/styles/theme';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

const ModalContent = styled(GlassCard)`
  max-width: 28rem;
  width: 100%;
  padding: 2rem;
  box-shadow: ${theme.shadows.glow};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const Icon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: ${theme.borderRadius.xl};
  background: linear-gradient(to bottom right, ${theme.colors.purple[500]}, ${theme.colors.pink[500]}, ${theme.colors.cyan[500]});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${theme.colors.slate[300]};
  margin-bottom: 0.5rem;
`;

const HelpText = styled.p`
  font-size: 0.75rem;
  color: ${theme.colors.slate[500]};
  margin: 0.5rem 0 0 0;
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: ${theme.colors.red[300]};
  padding: 0.75rem 1rem;
  border-radius: ${theme.borderRadius.xl};
`;

const SuccessMessage = styled.div`
  background: rgba(34, 211, 238, 0.1);
  border: 1px solid rgba(34, 211, 238, 0.3);
  color: ${theme.colors.cyan[300]};
  padding: 0.75rem 1rem;
  border-radius: ${theme.borderRadius.xl};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  
  button {
    flex: 1;
  }
`;

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (isSignUp && !name) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, name);
        if (error) {
          setError(error.message);
        } else {
          setMessage('Account created! Please check your email to verify your account.');
          setEmail('');
          setPassword('');
          setName('');
          setTimeout(() => {
            setIsSignUp(false);
            setMessage('');
          }, 3000);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          setEmail('');
          setPassword('');
          if (onClose) onClose();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <Header>
          <Icon>🎵</Icon>
          <Heading2>{isSignUp ? 'Create Account' : 'Sign In'}</Heading2>
        </Header>

        <Form onSubmit={handleSubmit}>
          {isSignUp && (
            <FormGroup>
              <Label>Name</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </FormGroup>
          )}

          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </FormGroup>

          <FormGroup>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            {isSignUp && (
              <HelpText>Password must be at least 6 characters</HelpText>
            )}
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {message && <SuccessMessage>{message}</SuccessMessage>}

          <ButtonGroup>
            <SecondaryButton
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setMessage('');
                setEmail('');
                setPassword('');
                setName('');
              }}
            >
              {isSignUp ? 'Sign In Instead' : 'Create Account'}
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={isLoading}>
              {isLoading
                ? 'Loading...'
                : isSignUp
                ? 'Sign Up'
                : 'Sign In'}
            </PrimaryButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
}
