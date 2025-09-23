import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { initialState, STORAGE_KEY } from '../data/initialData.js';
import { generateId } from '../utils/id.js';

const LMSContext = createContext(undefined);

const loadState = () => {
  if (typeof window === 'undefined') {
    return initialState;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return initialState;
    }

    const parsed = JSON.parse(stored);
    return {
      ...initialState,
      ...parsed,
      users: parsed.users ?? initialState.users,
      courses: parsed.courses ?? initialState.courses,
      enrollments: parsed.enrollments ?? initialState.enrollments,
      bundles: parsed.bundles ?? initialState.bundles,
      quizzes: parsed.quizzes ?? initialState.quizzes,
      quizResults: parsed.quizResults ?? initialState.quizResults,
      certificates: parsed.certificates ?? initialState.certificates,
      communications: parsed.communications ?? initialState.communications,
      activeUserId: parsed.activeUserId ?? initialState.activeUserId,
    };
  } catch (error) {
    console.warn('Failed to parse LMS state from storage', error);
    return initialState;
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_ACTIVE_USER':
      return { ...state, activeUserId: action.payload };
    case 'CREATE_COURSE':
      return { ...state, courses: [...state.courses, action.payload] };
    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map((course) => (course.id === action.payload.id ? action.payload : course)),
      };
    case 'DELETE_COURSE': {
      const courseId = action.payload;
      const remainingQuizzes = state.quizzes.filter((quiz) => quiz.courseId !== courseId);
      const remainingQuizIds = new Set(remainingQuizzes.map((quiz) => quiz.id));
      return {
        ...state,
        courses: state.courses.filter((course) => course.id !== courseId),
        enrollments: state.enrollments.filter((enrollment) => enrollment.courseId !== courseId),
        bundles: state.bundles.map((bundle) => ({
          ...bundle,
          courseIds: bundle.courseIds.filter((id) => id !== courseId),
        })),
        quizzes: remainingQuizzes,
        quizResults: state.quizResults.filter((result) => remainingQuizIds.has(result.quizId)),
        certificates: state.certificates.filter((certificate) => certificate.courseId !== courseId),
        communications: state.communications.filter((message) => message.courseId !== courseId),
      };
    }
    case 'IMPORT_COURSE':
      return { ...state, courses: [...state.courses, action.payload] };
    case 'ADD_ENROLLMENT': {
      const existing = state.enrollments.find((item) => item.courseId === action.payload.courseId && item.userId === action.payload.userId);
      if (existing) {
        return {
          ...state,
          enrollments: state.enrollments.map((enrollment) =>
            enrollment.id === existing.id ? { ...existing, ...action.payload } : enrollment
          ),
        };
      }
      return {
        ...state,
        enrollments: [...state.enrollments, action.payload],
      };
    }
    case 'UPDATE_ENROLLMENT':
      return {
        ...state,
        enrollments: state.enrollments.map((enrollment) =>
          enrollment.id === action.payload.id ? { ...enrollment, ...action.payload } : enrollment
        ),
      };
    case 'CREATE_BUNDLE':
      return { ...state, bundles: [...state.bundles, action.payload] };
    case 'UPDATE_BUNDLE':
      return {
        ...state,
        bundles: state.bundles.map((bundle) => (bundle.id === action.payload.id ? action.payload : bundle)),
      };
    case 'DELETE_BUNDLE':
      return { ...state, bundles: state.bundles.filter((bundle) => bundle.id !== action.payload) };
    case 'CREATE_QUIZ':
      return { ...state, quizzes: [...state.quizzes, action.payload] };
    case 'UPDATE_QUIZ':
      return {
        ...state,
        quizzes: state.quizzes.map((quiz) => (quiz.id === action.payload.id ? action.payload : quiz)),
      };
    case 'DELETE_QUIZ':
      return {
        ...state,
        quizzes: state.quizzes.filter((quiz) => quiz.id !== action.payload),
        quizResults: state.quizResults.filter((result) => result.quizId !== action.payload),
      };
    case 'SUBMIT_QUIZ': {
      const existingResultIndex = state.quizResults.findIndex(
        (result) => result.quizId === action.payload.quizId && result.studentId === action.payload.studentId
      );
      if (existingResultIndex >= 0) {
        const nextResults = [...state.quizResults];
        nextResults[existingResultIndex] = action.payload;
        return { ...state, quizResults: nextResults };
      }
      return { ...state, quizResults: [...state.quizResults, action.payload] };
    }
    case 'SAVE_CERTIFICATE': {
      const existingIndex = state.certificates.findIndex(
        (certificate) =>
          certificate.courseId === action.payload.courseId && certificate.studentId === action.payload.studentId
      );
      if (existingIndex >= 0) {
        const nextCertificates = [...state.certificates];
        nextCertificates[existingIndex] = action.payload;
        return { ...state, certificates: nextCertificates };
      }
      return { ...state, certificates: [...state.certificates, action.payload] };
    }
    case 'DELETE_CERTIFICATE':
      return {
        ...state,
        certificates: state.certificates.filter((certificate) => certificate.id !== action.payload),
      };
    case 'ADD_COMMUNICATION':
      return { ...state, communications: [...state.communications, action.payload] };
    case 'DELETE_COMMUNICATION':
      return {
        ...state,
        communications: state.communications.filter((communication) => communication.id !== action.payload),
      };
    default:
      return state;
  }
};

export const LMSProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState, loadState);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const actions = useMemo(
    () => ({
      setActiveUser: (userId) => dispatch({ type: 'SET_ACTIVE_USER', payload: userId }),
      createCourse: (payload) => dispatch({ type: 'CREATE_COURSE', payload }),
      updateCourse: (payload) => dispatch({ type: 'UPDATE_COURSE', payload }),
      deleteCourse: (courseId) => dispatch({ type: 'DELETE_COURSE', payload: courseId }),
      importCourse: (payload) => dispatch({ type: 'IMPORT_COURSE', payload }),
      addEnrollment: (payload) => dispatch({ type: 'ADD_ENROLLMENT', payload }),
      updateEnrollment: (payload) => dispatch({ type: 'UPDATE_ENROLLMENT', payload }),
      createBundle: (payload) => dispatch({ type: 'CREATE_BUNDLE', payload }),
      updateBundle: (payload) => dispatch({ type: 'UPDATE_BUNDLE', payload }),
      deleteBundle: (bundleId) => dispatch({ type: 'DELETE_BUNDLE', payload: bundleId }),
      createQuiz: (payload) => dispatch({ type: 'CREATE_QUIZ', payload }),
      updateQuiz: (payload) => dispatch({ type: 'UPDATE_QUIZ', payload }),
      deleteQuiz: (quizId) => dispatch({ type: 'DELETE_QUIZ', payload: quizId }),
      submitQuiz: (payload) => dispatch({ type: 'SUBMIT_QUIZ', payload }),
      saveCertificate: (payload) => dispatch({ type: 'SAVE_CERTIFICATE', payload }),
      deleteCertificate: (certificateId) => dispatch({ type: 'DELETE_CERTIFICATE', payload: certificateId }),
      addCommunication: (payload) => dispatch({ type: 'ADD_COMMUNICATION', payload }),
      deleteCommunication: (communicationId) => dispatch({ type: 'DELETE_COMMUNICATION', payload: communicationId }),
      generateId,
    }),
    []
  );

  const value = useMemo(() => ({ state, ...actions }), [state, actions]);

  return <LMSContext.Provider value={value}>{children}</LMSContext.Provider>;
};

export const useLMS = () => {
  const context = useContext(LMSContext);
  if (!context) {
    throw new Error('useLMS must be used within an LMSProvider');
  }
  return context;
};
