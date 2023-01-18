import { Card, Text } from '@nextui-org/react';
import React, { type FC } from 'react';
import styles from '../pages/study-room/study-room.module.css';

type ExamplesProps = {
  examplePress: (input: React.SetStateAction<string>) => void;
};
const Examples: FC<ExamplesProps> = ({ examplePress }) => {
  const inputs = [
    'What type of protests did Martin Luther King Jr organize?',
    'What is the philosophy of Epictetus?',
    'What is the string theory in physics?',
  ];
  return (
    <div
      className={styles.mdChatLog}
      style={{
        padding: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        overflowY: 'auto',
      }}
    >
      <div>
        <Text h1 css={{ textAlign: 'center' }}>
          Albert Solver
        </Text>
        <div
          className={styles.mdFlexColumn}
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '240px',
              display: 'flex',
              gap: '12px',
              flexDirection: 'column',
            }}
          >
            <Text h3 css={{ margin: '0', textAlign: 'center' }}>
              Examples
            </Text>
            {inputs.map((input) => {
              return (
                <Card
                  key={input}
                  isPressable
                  onPress={() => {
                    examplePress(input);
                  }}
                >
                  <Card.Body>
                    <Text css={{ textAlign: 'center' }}>
                      &quot;{input}&quot;
                    </Text>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
          <div
            style={{
              width: '240px',
              display: 'flex',
              gap: '12px',
              flexDirection: 'column',
            }}
          >
            <Text h3 css={{ margin: '0', textAlign: 'center' }}>
              Capabilities
            </Text>

            <Card>
              <Card.Body>
                <Text css={{ textAlign: 'center' }}>
                  Remembers what user said earlier in the conversation
                </Text>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <Text css={{ textAlign: 'center' }}>
                  Allows user to provide follow-up corrections
                </Text>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <Text css={{ textAlign: 'center' }}>
                  Trained to decline inappropriate requests
                </Text>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Examples;
