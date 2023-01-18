import { Card, Text } from '@nextui-org/react';
import React, { type FC } from 'react';
import styles from '../pages/study-room/study-room.module.css';

const Examples: FC = () => {
  return (
    <div
      className={styles.mdChatLog}
      style={{
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
            <Card>
              <Card.Body>
                <Text css={{ textAlign: 'center' }}>
                  &quot;What type of protests did Martin Luther King Jr
                  organize?&quot;
                </Text>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <Text css={{ textAlign: 'center' }}>
                  &quot;What is the philosophy of Epictetus?&quot;
                </Text>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <Text css={{ textAlign: 'center' }}>
                  &quot;What is the string theory in physics?&quot;
                </Text>
              </Card.Body>
            </Card>
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
