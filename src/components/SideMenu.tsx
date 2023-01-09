import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import {
  faCheck,
  faPlus,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Container, Spacer } from '@nextui-org/react';
import { type Assessment } from '@prisma/client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { type FC, useState } from 'react';
import styles from '../pages/study-room/study-room.module.css';
import AssessmentButton from './AssessmentButton';

type chatLog = {
  user: string;
  message: string;
}[];
type SideMenuProps = {
  assessments: Assessment[];
  setAssessments: React.Dispatch<React.SetStateAction<Assessment[]>>;
  chatLogs: { [key: string]: chatLog };
  setChatLog: React.Dispatch<React.SetStateAction<chatLog>>;
};
const SideMenu: FC<SideMenuProps> = ({
  assessments,
  setAssessments,
  chatLogs,
  setChatLog,
}) => {
  const router = useRouter();

  const handleNewAssessment = async () => {
    router.push('/study-room');
  };
  const handleChangeAssessment = (assessmentId: string) => {
    router.push(`/study-room/${assessmentId}`);
    setChatLog(chatLogs[assessmentId] || []);
  };
  const handleDeleteAssessment = async (assessmentId: string) => {
    await axios.post('/api/assessment-delete', {
      assessmentId,
    });
    setAssessments((prev) =>
      prev.filter((assessment) => assessment.id !== assessmentId)
    );
    if (router.query.assessmentId === assessmentId) router.push('/study-room');
  };
  const { data: authSession } = useSession();
  const [isDeleteAll, setIsDeleteAll] = useState(false);
  const handleDeleteAllAssessments = async () => {
    await axios.post('/api/assessment-delete-all', {
      userId: authSession?.user?.id,
    });
    setAssessments([]);
    router.push('/study-room');
  };
  return (
    <Container className={styles.sidemenu}>
      <div>
        <Button
          onPress={handleNewAssessment}
          ghost
          css={{ width: '100%' }}
          icon={<FontAwesomeIcon icon={faPlus} />}
        >
          New Assessment
        </Button>
        {assessments.map((assessment) => (
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
      <div className={styles.sidemenuBottom}>
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
          HomeworkAI Discord
        </Button>
      </div>
    </Container>
  );
};

export default SideMenu;
