import { faCheck, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input } from '@nextui-org/react';
import { type Assessment } from '@prisma/client';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useState, type FC } from 'react';

const AssessmentButton: FC<{
  changeAssessment: (id: string) => void;
  deleteAssessment: (id: string) => void;
  assessmentName: Assessment['assessmentName'];
  assessmentId: Assessment['id'];
}> = ({ changeAssessment, deleteAssessment, assessmentName, assessmentId }) => {
  const router = useRouter();
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newAssessmentName, setNewAssessmentName] = useState(
    assessmentName || ''
  );
  const isActive = router.query.assessmentId === assessmentId;
  const changeAssessmentName = (e: string) => {
    if (e.length <= 19) {
      setNewAssessmentName(e);
    }
  };

  const handleDeleteAssessment = () => {
    if (isDeleteMode) {
      deleteAssessment(assessmentId);
    }
    setIsDeleteMode((prev) => !prev);
  };

  const handleEditAssessmentName = async () => {
    if (isEditMode) {
      await axios.post('/api/assessment-name', {
        assessmentName: newAssessmentName,
        assessmentId,
      });
    }
    setIsEditMode((prev) => !prev);
  };

  const onChangeAssessment = () => {
    setIsDeleteMode(false);
    changeAssessment(assessmentId);
  };

  return (
    <Button.Group
      ghost
      color="secondary"
      css={{ maxWidth: '220px', margin: '0' }}
    >
      <Button onPress={handleEditAssessmentName} css={{ padding: '8px' }}>
        <FontAwesomeIcon icon={isEditMode ? faCheck : faPen} />
      </Button>
      {isEditMode ? (
        <Input
          initialValue={newAssessmentName}
          onChange={(e) => changeAssessmentName(e.target.value)}
          autoFocus
          aria-label="edit"
          id="edit"
          underlined
          color="secondary"
          size="md"
          css={{
            h: '40px',
            border: '2px solid $primary',
            borderRadius: '0px',
            minWidth: '156px',
          }}
        />
      ) : (
        <Button
          onPress={onChangeAssessment}
          css={
            isActive
              ? {
                  backgroundColor: '$secondary',
                  color: 'White',
                  minWidth: '156px',
                }
              : { minWidth: '156px' }
          }
        >
          {newAssessmentName}
        </Button>
      )}
      <Button onPress={handleDeleteAssessment} css={{ padding: '8px' }}>
        <FontAwesomeIcon icon={isDeleteMode ? faCheck : faTrash} />
      </Button>
    </Button.Group>
  );
};

export default AssessmentButton;
