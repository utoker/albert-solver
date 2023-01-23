import { Container, Row, Text, User } from '@nextui-org/react';
import React, { type FC } from 'react';

// type SlowTextProps = {
//   speed: number;
//   text: string;
// };

// const SlowText: FC<SlowTextProps> = ({ speed, text }) => {
//   const [placeholder, setPlaceholder] = useState(text[0] || '');

//   const index = useRef(0);

//   useEffect(() => {
//     const tick = () => {
//       index.current++;
//       setPlaceholder((prev) => prev + text[index.current]);
//     };
//     if (index.current < text.length - 1) {
//       const addChar = setInterval(tick, speed);
//       return () => clearInterval(addChar);
//     }
//   }, [placeholder, speed, text]);

//   return <pre>{placeholder}</pre>;
// };

type ChatMessageProps = {
  message: { user: string; message: string };
};
const ChatMessage: FC<ChatMessageProps> = ({ message }) => {
  // const { data: AuthSession } = useSession();
  const textToRender = message.message.trimStart();

  return (
    <Container
      css={
        message.user === 'AI'
          ? {
              backgroundColor: '#f1f3f5',
              pl: '$0',
            }
          : {
              pl: '$0',
            }
      }
    >
      <Row css={{ py: '$8' }}>
        {message.user === 'AI' ? (
          <User size="md" squared src="../logo.png" name={undefined} />
        ) : (
          <User squared size="md" src={'../userLogo.png'} name={undefined} />
        )}
        {message.user === 'AI' ? (
          <pre
            style={{
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
