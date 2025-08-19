import React from "react";
import { useNavigate } from "react-router";

export type WithModalProps<E> = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
} & E;

export function withModal<P>(
  WrappedComponent: React.ComponentType<WithModalProps<P>>,
) {
  return function ModalPage(props: any) {
    const [isModalOpen, setIsModalOpen] = React.useState(true);
    const navigate = useNavigate();

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
      setIsModalOpen(false);
    };

    React.useEffect(() => {
      if (!isModalOpen) navigate(-1);
    }, [isModalOpen]);

    return (
      <>
        <WrappedComponent
          {...props}
          isOpen={isModalOpen}
          openModal={openModal}
          closeModal={closeModal}
        />
      </>
    );
  };
}
