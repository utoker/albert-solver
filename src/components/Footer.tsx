import { Container, Link, Row, Spacer, Text } from '@nextui-org/react';
import React from 'react';

const Footer = () => {
  return (
    <Container lg>
      <Spacer y={2} />
      <Row
        align="center"
        css={{
          '@xsMax': {
            flexDirection: 'column',
            alignItems: 'center',
          },
        }}
      >
        <Row
          align="center"
          css={{
            '@xsMax': {
              justifyContent: 'center',
            },
          }}
        >
          <Text>HomeworkAI &copy; 2023</Text>
        </Row>

        <Row
          align="center"
          css={{
            '@xsMin': {
              justifyContent: 'flex-end',
            },
            '@xsMax': {
              justifyContent: 'center',
            },
            '.dot-divider': {
              marginLeft: '6px',
              marginRight: '6px',
            },
          }}
        >
          <Text>
            <Link
              target="_blank"
              href="https://app.termly.io/document/terms-of-use-for-online-marketplace/"
              color="text"
            >
              Terms of Service
            </Link>
          </Text>

          <Text className="dot-divider"> • </Text>

          <Text>
            <Link
              target="_blank"
              href="https://app.termly.io/document/privacy-policy/"
              color="text"
            >
              Privacy Policy
            </Link>
          </Text>
        </Row>
      </Row>
      <Spacer y={2} />
    </Container>
  );
};

export default Footer;
