/**
 * Question Type Registry
 *
 * This module provides a centralized configuration for all question types.
 * To add a new question type:
 *
 * 1. Add the type to the QuestionType type union
 * 2. Create the content interface in @/lib/api/questions.ts
 * 3. Create a form component in @/app/admin/questions/components/
 * 4. Add the configuration to QUESTION_TYPE_CONFIG
 */

import { ComponentType } from 'react';

// All supported question types
export type QuestionType =
    | 'ANALOGY'
    | 'COMPARISON'
    | 'MATH_CALCULATION'
    | 'SENTENCE_COMPLETION'
    | 'READING_COMPREHENSION';

// Configuration for each question type
export interface QuestionTypeConfig {
    type: QuestionType;
    label: string;
    description: string;
    defaultOptionsCount: number;
    supportsImage: boolean;
    formComponent: string; // Dynamic import key
}

// Registry of all question types and their configurations
export const QUESTION_TYPE_CONFIG: Record<QuestionType, QuestionTypeConfig> = {
    ANALOGY: {
        type: 'ANALOGY',
        label: 'Analogy',
        description: 'Word pair relationship questions',
        defaultOptionsCount: 4,
        supportsImage: false,
        formComponent: 'AnalogyForm',
    },
    COMPARISON: {
        type: 'COMPARISON',
        label: 'Comparison',
        description: 'Compare two mathematical expressions',
        defaultOptionsCount: 4,
        supportsImage: true,
        formComponent: 'ComparisonForm',
    },
    MATH_CALCULATION: {
        type: 'MATH_CALCULATION',
        label: 'Math Calculation',
        description: 'Solve mathematical problems',
        defaultOptionsCount: 5,
        supportsImage: true,
        formComponent: 'MathForm',
    },
    SENTENCE_COMPLETION: {
        type: 'SENTENCE_COMPLETION',
        label: 'Sentence Completion',
        description: 'Fill in the blank in a sentence',
        defaultOptionsCount: 4,
        supportsImage: false,
        formComponent: 'SentenceForm',
    },
    READING_COMPREHENSION: {
        type: 'READING_COMPREHENSION',
        label: 'Reading Comprehension',
        description: 'Questions based on reading passages',
        defaultOptionsCount: 4,
        supportsImage: false,
        formComponent: 'ReadingComprehensionForm',
    },
};

// Get all question types as an array for dropdowns
export function getQuestionTypes(): QuestionTypeConfig[] {
    return Object.values(QUESTION_TYPE_CONFIG);
}

// Get configuration for a specific type
export function getQuestionTypeConfig(type: QuestionType): QuestionTypeConfig {
    return QUESTION_TYPE_CONFIG[type];
}

// Check if a type is valid
export function isValidQuestionType(type: string): type is QuestionType {
    return type in QUESTION_TYPE_CONFIG;
}

// Get default options for a question type
export function createDefaultOptions(type: QuestionType): { id: number; text?: string; textLatex?: string }[] {
    const config = QUESTION_TYPE_CONFIG[type];
    return Array.from({ length: config.defaultOptionsCount }, (_, i) => ({
        id: i + 1,
        text: '',
        textLatex: '',
    }));
}
