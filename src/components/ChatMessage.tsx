import { Container, Row, Text, User } from '@nextui-org/react';
import React, { type FC } from 'react';

type ChatMessageProps = {
  message: { user: string; message: string };
};
const ChatMessage: FC<ChatMessageProps> = ({ message }) => {
  // const textToRender = message.message.trimStart();
  const textToRender = message.message;

  return (
    <Container
      css={
        message.user === 'AI'
          ? {
              bc: '$accents0',
              pl: '$0',
            }
          : {
              pl: '$0',
            }
      }
    >
      <Row css={{ py: '$8' }}>
        {message.user === 'AI' ? (
          <User size="md" squared src="/logo.png" name={undefined} />
        ) : (
          <User name={undefined} squared size="md" src={'/user-avatar.png'} />
        )}
        {message.user === 'AI' ? (
          <pre
            style={{
              borderRadius: '0',
              margin: 0,
              padding: 0,
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}
          >
            {textToRender}
          </pre>
        ) : (
          <Text>{textToRender}</Text>
        )}
      </Row>
    </Container>
  );
};

export default ChatMessage;
