// Question types matching backend QuestionType enum exactly
export type QuestionType =
    | 'ANALOGY'
    | 'ALGEBRAIC_EXPRESSION'
    | 'MATH_COMPARISON'
    | 'SENTENCE_COMPLETION'
    | 'READING_COMPREHENSION';

export interface QuestionTypeConfig {
    type: QuestionType;
    label: string;
}

export const QUESTION_TYPE_CONFIG: Record<QuestionType, QuestionTypeConfig> = {
    ANALOGY: {
        type: 'ANALOGY',
        label: 'Analogy',
    },
    ALGEBRAIC_EXPRESSION: {
        type: 'ALGEBRAIC_EXPRESSION',
        label: 'Algebraic Expression',
    },
    MATH_COMPARISON: {
        type: 'MATH_COMPARISON',
        label: 'Math Comparison',
    },
    SENTENCE_COMPLETION: {
        type: 'SENTENCE_COMPLETION',
        label: 'Sentence Completion',
    },
    READING_COMPREHENSION: {
        type: 'READING_COMPREHENSION',
        label: 'Reading Comprehension',
    },
};

export function getQuestionTypes(): QuestionTypeConfig[] {
    return Object.values(QUESTION_TYPE_CONFIG);
}
