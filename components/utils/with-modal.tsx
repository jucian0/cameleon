import React from "react";
import { useNavigate } from "react-router";

// usage example
//
// const ModalPage = withModal((isOpen)=>{
//
// retrun (...)
//})

export function withModal(WrappedComponent: React.ComponentType<any>) {
  return function WithModal(props: any) {
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
