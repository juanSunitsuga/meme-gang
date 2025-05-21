import React, { createContext, useState, useContext } from 'react';

interface ModalContextType {
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  isForgotPasswordModalOpen: boolean;
  isResetPasswordModalOpen: boolean;
  isCreatePostModalOpen: boolean;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  openForgotPasswordModal: () => void;
  openResetPasswordModal: () => void;
  openCreatePostModal: () => void; 
  closeLoginModal: () => void;
  closeRegisterModal: () => void;
  closeForgotPasswordModal: () => void;
  closeResetPasswordModal: () => void;
  closeCreatePostModal: () => void;
  switchToRegister: () => void;
  switchToLogin: () => void;
  switchToForgotPassword: () => void;
  switchToResetPassword: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false); 

  // Open modals
  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
    setIsForgotPasswordModalOpen(false);
    setIsResetPasswordModalOpen(false);
    setIsCreatePostModalOpen(false); 
  };

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
    setIsForgotPasswordModalOpen(false);
    setIsResetPasswordModalOpen(false);
    setIsCreatePostModalOpen(false);
  };

  const openForgotPasswordModal = () => {
    setIsForgotPasswordModalOpen(true);
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
    setIsResetPasswordModalOpen(false);
    setIsCreatePostModalOpen(false);
  };

  const openResetPasswordModal = () => {
    setIsResetPasswordModalOpen(true);
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
    setIsForgotPasswordModalOpen(false);
    setIsCreatePostModalOpen(false);
  };

  const openCreatePostModal = () => {
    setIsCreatePostModalOpen(true);
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
    setIsForgotPasswordModalOpen(false);
    setIsResetPasswordModalOpen(false);
  };

  // Close modals
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  const closeForgotPasswordModal = () => {
    setIsForgotPasswordModalOpen(false);
  };

  const closeResetPasswordModal = () => {
    setIsResetPasswordModalOpen(false);
  };

  const closeCreatePostModal = () => {
    setIsCreatePostModalOpen(false);
  };

  // Switch between modals
  const switchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
    setIsForgotPasswordModalOpen(false);
    setIsResetPasswordModalOpen(false);
    setIsCreatePostModalOpen(false);
  };

  const switchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
    setIsForgotPasswordModalOpen(false);
    setIsResetPasswordModalOpen(false);
    setIsCreatePostModalOpen(false);
  };

  const switchToForgotPassword = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
    setIsForgotPasswordModalOpen(true);
    setIsResetPasswordModalOpen(false);
    setIsCreatePostModalOpen(false);
  };

  const switchToResetPassword = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
    setIsForgotPasswordModalOpen(false);
    setIsResetPasswordModalOpen(true);
    setIsCreatePostModalOpen(false);
  };

  return (
    <ModalContext.Provider
      value={{
        isLoginModalOpen,
        isRegisterModalOpen,
        isForgotPasswordModalOpen,
        isResetPasswordModalOpen,
        isCreatePostModalOpen,
        openLoginModal,
        openRegisterModal,
        openForgotPasswordModal,
        openResetPasswordModal,
        openCreatePostModal,
        closeLoginModal,
        closeRegisterModal,
        closeForgotPasswordModal,
        closeResetPasswordModal,
        closeCreatePostModal,
        switchToRegister,
        switchToLogin,
        switchToForgotPassword,
        switchToResetPassword
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};