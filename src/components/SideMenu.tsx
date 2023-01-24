import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import {
  faCheck,
  faPlus,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Container, Spacer } from '@nextui-org/react';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { type FC, useState } from 'react';
import styles from '../pages/study-room/study-room.module.css';
import AssessmentButton from './AssessmentButton';
import { mutate } from 'swr';
import { type Assessment } from '@prisma/client';

type Props = {
  assessments: Assessment[];
};

const SideMenu: FC<Props> = ({ assessments }) => {
  const router = useRouter();

  const handleNewAssessment = async () => {
    router.push('/study-room');
  };
  const handleChangeAssessment = (assessmentId: string) => {
    router.push(`/study-room/${assessmentId}`);
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    await axios.post('/api/assessment/delete', {
      assessmentId,
    });
    mutate('/api/assessment/get-all');
    if (router.query.assessmentId === assessmentId) router.push('/study-room');
  };

  const [isDeleteAll, setIsDeleteAll] = useState(false);

  const handleDeleteAllAssessments = async () => {
    await axios.get('/api/assessment/delete-all');
    mutate('/api/assessment/get-all');
    router.push('/study-room');
  };

  return (
    <Container className={styles.sidemenu} css={{ bc: '$accents0' }}>
      <div style={{ width: '220px' }}>
        <Button
          onPress={handleNewAssessment}
          ghost
          css={{ width: '100%' }}
          icon={<FontAwesomeIcon icon={faPlus} />}
        >
          New Assessment
        </Button>
        {assessments &&
          assessments.map((assessment) => (
            <div key={assessment.id}>
              <Spacer y={0.5} />
              <AssessmentButton
                assessmentName={assessment.assessmentName}
                assessmentId={assessment.id}
                changeAssessment={(id) => handleChangeAssessment(id)}
                deleteAssessment={(id) => handleDeleteAssessment(id)}
              />
            </div>
          ))}
      </div>
      <Container
        css={{ m: '$0', p: '$0', borderTop: '1px solid $neutral' }}
        className={styles.sidemenuBottom}
      >
        {isDeleteAll ? (
          <Button.Group light css={{ m: '$0' }}>
            <Button onPress={() => setIsDeleteAll(false)}>
              <FontAwesomeIcon icon={faXmark} />
            </Button>
            <Button>Are you sure?</Button>
            <Button onPress={handleDeleteAllAssessments}>
              <FontAwesomeIcon icon={faCheck} />
            </Button>
          </Button.Group>
        ) : (
          <Button
            light
            css={{ width: '100%' }}
            icon={<FontAwesomeIcon icon={faTrash} />}
            onPress={() => setIsDeleteAll(true)}
          >
            Delete All Assessments
          </Button>
        )}

        <Button
          light
          css={{ width: '100%' }}
          icon={<FontAwesomeIcon icon={faDiscord} />}
        >
          Albert Solver Discord
        </Button>
      </Container>
    </Container>
  );
};

export default SideMenu;
