import {
  Button,
  Container,
  Row,
  Spacer,
  Textarea,
  useInput,
} from '@nextui-org/react';
import axios from 'axios';
import React, { useState } from 'react';

const Ai = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const submit = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/generate', { input });
      setResult(res.data.result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const {
    value: input,
    // setValue: setInput,
    reset,
    bindings,
  } = useInput('');
  return (
    <Container xs>
      <Row>
        <Textarea
          minRows={4}
          maxRows={12}
          width="100%"
          aria-label="ask"
          id="ask"
          {...bindings}
          placeholder="Hi there! I'm here to help you with your homework. What do you need help with?"
        />
      </Row>
      <Spacer y={0.5} />
      <Row justify="flex-end">
        <Button auto flat size="sm" onClick={() => reset()}>
          Reset
        </Button>
        <Spacer x={0.5} />
        <Button
          auto
          color="primary"
          size="sm"
          disabled={loading}
          onClick={() => submit()}
        >
          {loading ? 'loading' : 'Ask!'}
        </Button>
      </Row>
      <Spacer y={0.5} />
      <Row>
        <Textarea
          readOnly
          width="100%"
          aria-label="output"
          id="output"
          value={result}
        />
      </Row>
    </Container>
  );
};

export default Ai;
