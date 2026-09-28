import React from 'react';
import { Question, UserAnswer } from '@types/index';
interface QuestionScreenProps {
    questions: Question[];
    mode: 'training' | 'tryout';
    onComplete: (answers: UserAnswer[]) => void;
}
export declare const QuestionScreen: React.FC<QuestionScreenProps>;
export {};
//# sourceMappingURL=QuestionScreen.d.ts.map