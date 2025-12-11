'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AddSongModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const AddSongModalContext = createContext<AddSongModalContextType | undefined>(undefined);

export function AddSongModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <AddSongModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </AddSongModalContext.Provider>
  );
}

export function useAddSongModal() {
  const context = useContext(AddSongModalContext);
  if (context === undefined) {
    throw new Error('useAddSongModal must be used within an AddSongModalProvider');
  }
  return context;
}

