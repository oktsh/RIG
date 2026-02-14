"use client";

import { createContext, useContext, useState, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import PromptModal from "./PromptModal";
import JoinModal from "./JoinModal";
import SuccessModal from "./SuccessModal";
import { prompts } from "@/data/prompts";

type ModalType = "prompt" | "join" | "success" | null;

interface ModalState {
  type: ModalType;
  data?: number; // promptId for prompt modal
}

interface ModalContextType {
  openPromptModal: (id: number) => void;
  openJoinModal: () => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType>({
  openPromptModal: () => {},
  openJoinModal: () => {},
  closeModal: () => {},
});

export const useModal = () => useContext(ModalContext);

export default function ModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [modalState, setModalState] = useState<ModalState>({ type: null });

  const openPromptModal = useCallback((id: number) => {
    setModalState({ type: "prompt", data: id });
  }, []);

  const openJoinModal = useCallback(() => {
    setModalState({ type: "join" });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ type: null });
  }, []);

  const handleJoinSuccess = useCallback(() => {
    setModalState({ type: "success" });
  }, []);

  const prompt = modalState.data
    ? prompts.find((p) => p.id === modalState.data)
    : null;

  return (
    <ModalContext.Provider value={{ openPromptModal, openJoinModal, closeModal }}>
      {children}
      <Modal isOpen={modalState.type === "prompt"} onClose={closeModal}>
        {prompt && <PromptModal prompt={prompt} onClose={closeModal} />}
      </Modal>
      <Modal isOpen={modalState.type === "join"} onClose={closeModal}>
        <JoinModal onClose={closeModal} onSuccess={handleJoinSuccess} />
      </Modal>
      <Modal isOpen={modalState.type === "success"} onClose={closeModal}>
        <SuccessModal onClose={closeModal} />
      </Modal>
    </ModalContext.Provider>
  );
}
