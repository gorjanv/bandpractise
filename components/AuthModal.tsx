'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ModalOverlay, Input, PrimaryButton, SecondaryButton } from '@/styles/styledComponents';
import * as S from './shared/Modal.styled';
import { ErrorMessage } from './shared/ErrorBanner.styled';
import { theme } from '@/styles/theme';
import styled from 'styled-components';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

const SuccessMessage = styled.div`
  background: rgba(34, 211, 238, 0.1);
  border: 1px solid rgba(34, 211, 238, 0.3);
  color: ${theme.colors.cyan[400]};
  padding: 0.75rem 1rem;
  border-radius: ${theme.borderRadius.xl};
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
      <S.ModalContent>
        <S.ModalHeader>
          <S.ModalIcon>🎵</S.ModalIcon>
          <S.Heading2>{isSignUp ? 'Create Account' : 'Sign In'}</S.Heading2>
        </S.ModalHeader>

        <S.ModalForm onSubmit={handleSubmit}>
          {isSignUp && (
            <S.FormGroup>
              <S.FormLabel>Name</S.FormLabel>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </S.FormGroup>
          )}

          <S.FormGroup>
            <S.FormLabel>Email</S.FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.FormLabel>Password</S.FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            {isSignUp && (
              <S.HelpText>Password must be at least 6 characters</S.HelpText>
            )}
          </S.FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {message && <SuccessMessage>{message}</SuccessMessage>}

          <S.ButtonGroup>
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
          </S.ButtonGroup>
        </S.ModalForm>
      </S.ModalContent>
    </ModalOverlay>
  );
}
