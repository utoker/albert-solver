import { Button, Modal, Text } from '@nextui-org/react';
import React, { type FC } from 'react';
type ErrorModalProps = {
  errorMessage: string;
  ModalCloseHandler: () => void;
  visible: boolean;
};
const ErrorModal: FC<ErrorModalProps> = ({
  errorMessage,
  ModalCloseHandler,
  visible,
}) => {
  return (
    <Modal
      closeButton
      aria-labelledby="modal-title"
      open={visible}
      onClose={ModalCloseHandler}
    >
      <Modal.Header>
        <Text id="modal-title" size={18}>
          {errorMessage}
        </Text>
      </Modal.Header>

      <Modal.Footer>
        <Button auto flat color="error" onPress={ModalCloseHandler}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorModal;
