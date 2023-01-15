import { Container, Row, Text, User } from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import React, { type FC } from 'react';

type ChatMessageProps = {
  message: { user: string; message: string };
};
const ChatMessage: FC<ChatMessageProps> = ({ message }) => {
  const { data: AuthSession } = useSession();
  return (
    <Container
      css={
        message.user === 'AI'
          ? {
              backgroundColor: '#f1f3f5',
            }
          : undefined
      }
    >
      <Row css={{ py: '$8' }}>
        {message.user === 'AI' ? (
          <User size="md" squared src="../logo.png" name={undefined} />
        ) : (
          <User
            squared
            size="md"
            src={
              AuthSession?.user?.image
                ? AuthSession?.user?.image
                : '../userLogo.png'
            }
            name={undefined}
          />
        )}
        <Text>{message.message}</Text>
      </Row>
    </Container>
  );
};

export default ChatMessage;
