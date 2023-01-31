import { Row } from '@nextui-org/react';
import React, { type FC } from 'react';
import { useTheme } from '@nextui-org/react';

const Video: FC = () => {
  const { isDark } = useTheme();
  return (
    <Row justify="center">
      <video
        key={isDark ? '/video-dark.mp4' : '/video.mp4'}
        loop
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          maxWidth: '960px',
          height: 'auto',
          border: '1px solid #7a28c7',
          borderRadius: '20px',
        }}
      >
        <source
          src={isDark ? '/video-dark.mp4' : '/video.mp4'}
          type="video/mp4"
        />
      </video>
    </Row>
  );
};

export default Video;
