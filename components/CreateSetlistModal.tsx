'use client';

import { useState } from 'react';
import { ModalOverlay, Input, PrimaryButton, SecondaryButton } from '@/styles/styledComponents';
import * as S from './shared/Modal.styled';
import { ErrorMessage } from './shared/ErrorBanner.styled';

interface CreateSetlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name?: string; rehearsalDate: string }) => Promise<void>;
}

export default function CreateSetlistModal({ isOpen, onClose, onCreate }: CreateSetlistModalProps) {
  const [name, setName] = useState('');
  const [rehearsalDate, setRehearsalDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!rehearsalDate) {
      setError('Rehearsal date is required');
      return;
    }

    setIsLoading(true);

    try {
      await onCreate({
        name: name.trim() || undefined,
        rehearsalDate: rehearsalDate.trim(),
      });
      
      // Reset form
      setName('');
      setRehearsalDate('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create setlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <S.ModalIcon>📋</S.ModalIcon>
          <S.Heading2>Create New Setlist</S.Heading2>
        </S.ModalHeader>

        <S.ModalForm onSubmit={handleSubmit}>
          <S.FormGroup>
            <S.FormLabel>Rehearsal Date *</S.FormLabel>
            <Input
              type="date"
              value={rehearsalDate}
              onChange={(e) => setRehearsalDate(e.target.value)}
              min={today}
              required
            />
            <S.HelpText>Select the date for this rehearsal</S.HelpText>
          </S.FormGroup>

          <S.FormGroup>
            <S.FormLabel>Setlist Name (Optional)</S.FormLabel>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Week 1 Rehearsal"
            />
            <S.HelpText>Give this setlist a name to easily identify it</S.HelpText>
          </S.FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <S.ButtonGroup>
            <SecondaryButton type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Setlist'}
            </PrimaryButton>
          </S.ButtonGroup>
        </S.ModalForm>
      </S.ModalContent>
    </ModalOverlay>
  );
}

