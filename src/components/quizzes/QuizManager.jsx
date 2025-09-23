import React, { useEffect, useMemo, useState } from 'react';
import { useLMS } from '../../context/LMSContext.jsx';

const emptyQuiz = (generateId, courseId) => ({
  id: generateId('quiz'),
  courseId: courseId ?? '',
  title: 'Untitled quiz',
  availability: {
    opensAt: new Date().toISOString().slice(0, 16),
    closesAt: '',
  },
  settings: {
    timeLimit: 20,
    attemptsAllowed: 1,
    shuffleQuestions: false,
  },
  questions: [],
});

const defaultQuestion = (generateId) => ({
  id: generateId('question'),
  type: 'multiple-choice',
  prompt: '',
  options: ['', '', '', ''],
  answer: '',
  points: 1,
});

const QuizManager = () => {
  const {
    state: { quizzes, courses, quizResults, users, activeUserId, enrollments },
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitQuiz,
    generateId,
  } = useLMS();

  const activeUser = users.find((user) => user.id === activeUserId) ?? users[0];
  const [activeTab, setActiveTab] = useState('builder');
  const [selectedQuizId, setSelectedQuizId] = useState(quizzes[0]?.id ?? 'new');
  const [quizForm, setQuizForm] = useState(() => emptyQuiz(generateId));
  const [status, setStatus] = useState('');
  const [playerQuizId, setPlayerQuizId] = useState(quizzes[0]?.id ?? '');
  const [responses, setResponses] = useState({});
  const [playerStatus, setPlayerStatus] = useState('');

  useEffect(() => {
    if (selectedQuizId === 'new') {
      setQuizForm(emptyQuiz(generateId, courses[0]?.id));
    } else {
      const existing = quizzes.find((quiz) => quiz.id === selectedQuizId);
      if (existing) {
        setQuizForm({ ...existing });
      }
    }
  }, [selectedQuizId, quizzes, courses, generateId]);

  useEffect(() => {
    setResponses({});
    setPlayerStatus('');
  }, [playerQuizId, activeTab]);

  const handleQuizField = (field, value) => {
    setQuizForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvailability = (field, value) => {
    setQuizForm((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [field]: value,
      },
    }));
  };

  const handleSettings = (field, value) => {
    setQuizForm((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value,
      },
    }));
  };

  const addQuestion = () => {
    setQuizForm((prev) => ({
      ...prev,
      questions: [...prev.questions, defaultQuestion(generateId)],
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question) => {
        if (question.id !== questionId) return question;
        if (field === 'type') {
          return {
            ...question,
            type: value,
            options: value === 'multiple-choice' ? question.options ?? ['', '', '', ''] : [],
            answer: '',
          };
        }
        if (field === 'options') {
          return { ...question, options: value };
        }
        return { ...question, [field]: value };
      }),
    }));
  };

  const removeQuestion = (questionId) => {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((question) => question.id !== questionId),
    }));
  };

  const handleQuizSubmit = (event) => {
    event.preventDefault();
    if (!quizForm.courseId) {
      setStatus('Select a course before saving.');
      return;
    }

    if (selectedQuizId === 'new') {
      const quizId = generateId('quiz');
      createQuiz({ ...quizForm, id: quizId });
      setSelectedQuizId(quizId);
      setStatus('Quiz created successfully.');
    } else {
      updateQuiz({ ...quizForm });
      setStatus('Quiz updated successfully.');
    }
  };

  const handleQuizDelete = () => {
    if (selectedQuizId === 'new') return;
    deleteQuiz(selectedQuizId);
    setSelectedQuizId('new');
    setStatus('Quiz deleted.');
  };

  const availableQuizzesForUser = useMemo(() => {
    if (activeUser.role === 'instructor') {
      return quizzes.filter((quiz) => {
        const course = courses.find((item) => item.id === quiz.courseId);
        return course?.instructors.includes(activeUser.id);
      });
    }
    const enrolledCourseIds = enrollments.filter((item) => item.userId === activeUser.id).map((item) => item.courseId);
    return quizzes.filter((quiz) => enrolledCourseIds.includes(quiz.courseId));
  }, [quizzes, courses, activeUser, enrollments]);

  const currentPlayerQuiz = quizzes.find((quiz) => quiz.id === playerQuizId);

  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const evaluateQuiz = (quiz) => {
    let score = 0;
    let totalPoints = 0;
    const detailed = [];

    quiz.questions.forEach((question) => {
      const answer = responses[question.id];
      const normalizedCorrect = typeof question.answer === 'string' ? question.answer.trim().toLowerCase() : question.answer;
      const normalizedResponse = typeof answer === 'string' ? answer.trim().toLowerCase() : answer;
      const isCorrect = (() => {
        if (question.type === 'short-answer') {
          return normalizedResponse && normalizedCorrect && normalizedResponse === normalizedCorrect;
        }
        return normalizedResponse === normalizedCorrect;
      })();
      if (isCorrect) {
        score += question.points ?? 1;
      }
      totalPoints += question.points ?? 1;
      detailed.push({
        questionId: question.id,
        response: answer ?? '',
        correct: isCorrect,
      });
    });

    return { score, totalPoints, detailed };
  };

  const handleQuizPlay = (event) => {
    event.preventDefault();
    if (!currentPlayerQuiz) return;
    const { score, totalPoints, detailed } = evaluateQuiz(currentPlayerQuiz);
    const existing = quizResults.find(
      (result) => result.quizId === currentPlayerQuiz.id && result.studentId === activeUser.id
    );
    submitQuiz({
      id: existing?.id ?? generateId('result'),
      quizId: currentPlayerQuiz.id,
      studentId: activeUser.id,
      score,
      totalPoints,
      submittedAt: new Date().toISOString(),
      responses: detailed,
    });
    setPlayerStatus(`Quiz submitted. Score ${score}/${totalPoints}.`);
  };

  const quizAnalytics = useMemo(() => {
    return quizzes.map((quiz) => {
      const results = quizResults.filter((result) => result.quizId === quiz.id);
      const averageScore = results.length
        ? Math.round(
            results.reduce((total, result) => total + (result.score / result.totalPoints) * 100, 0) / results.length
          )
        : 0;
      return {
        quiz,
        attempts: results.length,
        averageScore,
        bestScore: results.reduce((best, result) => Math.max(best, Math.round((result.score / result.totalPoints) * 100)), 0),
      };
    });
  }, [quizzes, quizResults]);

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center gap-3">
        {['builder', 'player', 'reports'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === tab ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-neutral-600 border border-neutral-200'
            }`}
          >
            {tab === 'builder' && 'Quiz builder'}
            {tab === 'player' && 'Take quiz'}
            {tab === 'reports' && 'Auto-grading reports'}
          </button>
        ))}
      </header>

      {activeTab === 'builder' && (
        <form onSubmit={handleQuizSubmit} className="grid gap-6 lg:grid-cols-[2fr,3fr]">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col gap-3">
              <label className="text-sm">
                <span className="text-neutral-600">Linked course</span>
                <select
                  value={quizForm.courseId}
                  onChange={(event) => handleQuizField('courseId', event.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="text-neutral-600">Quiz title</span>
                <input
                  value={quizForm.title}
                  onChange={(event) => handleQuizField('title', event.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm">
                  <span className="text-neutral-600">Opens at</span>
                  <input
                    type="datetime-local"
                    value={quizForm.availability?.opensAt ?? ''}
                    onChange={(event) => handleAvailability('opensAt', event.target.value)}
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </label>
                <label className="text-sm">
                  <span className="text-neutral-600">Closes at</span>
                  <input
                    type="datetime-local"
                    value={quizForm.availability?.closesAt ?? ''}
                    onChange={(event) => handleAvailability('closesAt', event.target.value)}
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </label>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <label className="text-sm">
                  <span className="text-neutral-600">Time limit (min)</span>
                  <input
                    type="number"
                    min="1"
                    value={quizForm.settings?.timeLimit ?? 20}
                    onChange={(event) => handleSettings('timeLimit', Number(event.target.value) || 1)}
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </label>
                <label className="text-sm">
                  <span className="text-neutral-600">Attempts allowed</span>
                  <input
                    type="number"
                    min="1"
                    value={quizForm.settings?.attemptsAllowed ?? 1}
                    onChange={(event) => handleSettings('attemptsAllowed', Number(event.target.value) || 1)}
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-600">
                  <input
                    type="checkbox"
                    checked={quizForm.settings?.shuffleQuestions ?? false}
                    onChange={(event) => handleSettings('shuffleQuestions', event.target.checked)}
                  />
                  Shuffle questions
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
              >
                {selectedQuizId === 'new' ? 'Save quiz' : 'Update quiz'}
              </button>
              {selectedQuizId !== 'new' && (
                <button
                  type="button"
                  onClick={handleQuizDelete}
                  className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                >
                  Delete quiz
                </button>
              )}
              <select
                value={selectedQuizId}
                onChange={(event) => setSelectedQuizId(event.target.value)}
                className="ml-auto rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="new">New quiz</option>
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </option>
                ))}
              </select>
            </div>
            {status && <p className="text-xs text-primary-600">{status}</p>}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-800">Questions</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="rounded-md border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100"
              >
                Add question
              </button>
            </div>
            {quizForm.questions.length === 0 && (
              <p className="text-sm text-neutral-500">Start building by adding your first question.</p>
            )}
            <div className="space-y-4">
              {quizForm.questions.map((question) => (
                <article key={question.id} className="rounded-xl border border-neutral-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex-1 text-sm">
                      <span className="text-neutral-600">Prompt</span>
                      <textarea
                        value={question.prompt}
                        onChange={(event) => updateQuestion(question.id, 'prompt', event.target.value)}
                        rows={3}
                        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </label>
                    <label className="w-40 text-sm">
                      <span className="text-neutral-600">Type</span>
                      <select
                        value={question.type}
                        onChange={(event) => updateQuestion(question.id, 'type', event.target.value)}
                        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="multiple-choice">Multiple choice</option>
                        <option value="true-false">True / False</option>
                        <option value="short-answer">Short answer</option>
                      </select>
                    </label>
                  </div>

                  {question.type === 'multiple-choice' && (
                    <div className="mt-3 space-y-2">
                      {(question.options ?? []).map((option, index) => (
                        <label key={index} className="flex items-center gap-2 text-sm">
                          <span className="w-6 text-xs text-neutral-500">{String.fromCharCode(65 + index)}</span>
                          <input
                            value={option}
                            onChange={(event) => {
                              const nextOptions = [...(question.options ?? [])];
                              nextOptions[index] = event.target.value;
                              updateQuestion(question.id, 'options', nextOptions);
                            }}
                            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                      <span className="text-neutral-600">Answer</span>
                      <input
                        value={question.answer}
                        onChange={(event) => updateQuestion(question.id, 'answer', event.target.value)}
                        placeholder={question.type === 'multiple-choice' ? 'Paste the correct option text' : 'Correct response'}
                        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </label>
                    <label className="text-sm">
                      <span className="text-neutral-600">Points</span>
                      <input
                        type="number"
                        min="1"
                        value={question.points ?? 1}
                        onChange={(event) => updateQuestion(question.id, 'points', Number(event.target.value) || 1)}
                        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </label>
                  </div>

                  <div className="mt-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="text-xs font-medium text-red-600 hover:text-red-500"
                    >
                      Remove question
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </form>
      )}

      {activeTab === 'player' && (
        <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-neutral-800">Available quizzes</h3>
            <select
              value={playerQuizId}
              onChange={(event) => setPlayerQuizId(event.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a quiz</option>
              {availableQuizzesForUser.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </option>
              ))}
            </select>
            {playerStatus && <p className="text-xs text-primary-600">{playerStatus}</p>}
            <p className="text-xs text-neutral-500">
              Auto grading compares your responses with instructor-provided answers instantly.
            </p>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            {!currentPlayerQuiz && <p className="text-sm text-neutral-500">Choose a quiz to begin.</p>}
            {currentPlayerQuiz && (
              <form onSubmit={handleQuizPlay} className="space-y-4">
                <header>
                  <h4 className="text-lg font-semibold text-neutral-900">{currentPlayerQuiz.title}</h4>
                  <p className="text-xs text-neutral-500">
                    Time limit {currentPlayerQuiz.settings?.timeLimit ?? 0} minutes · Attempts allowed {currentPlayerQuiz.settings?.attemptsAllowed ?? 1}
                  </p>
                </header>
                {currentPlayerQuiz.questions.map((question) => (
                  <article key={question.id} className="rounded-xl border border-neutral-200 p-4">
                    <p className="text-sm font-semibold text-neutral-800">{question.prompt}</p>
                    {question.type === 'multiple-choice' && (
                      <div className="mt-3 space-y-2">
                        {(question.options ?? []).map((option, index) => (
                          <label key={index} className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              name={question.id}
                              value={option}
                              checked={responses[question.id] === option}
                              onChange={(event) => handleResponseChange(question.id, event.target.value)}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {question.type === 'true-false' && (
                      <div className="mt-3 space-x-4 text-sm">
                        {['True', 'False'].map((option) => (
                          <label key={option} className="inline-flex items-center gap-2">
                            <input
                              type="radio"
                              name={question.id}
                              value={option}
                              checked={responses[question.id] === option}
                              onChange={(event) => handleResponseChange(question.id, event.target.value)}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {question.type === 'short-answer' && (
                      <textarea
                        value={responses[question.id] ?? ''}
                        onChange={(event) => handleResponseChange(question.id, event.target.value)}
                        rows={3}
                        className="mt-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Type your response"
                      />
                    )}
                  </article>
                ))}
                <button
                  type="submit"
                  className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
                >
                  Submit for grading
                </button>
              </form>
            )}
          </section>
        </div>
      )}

      {activeTab === 'reports' && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Quiz analytics</h3>
              <p className="text-xs text-neutral-500">Monitor learner performance and automate certificate triggers.</p>
            </div>
          </header>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-4 py-2">Quiz</th>
                  <th className="px-4 py-2">Course</th>
                  <th className="px-4 py-2">Attempts</th>
                  <th className="px-4 py-2">Average score</th>
                  <th className="px-4 py-2">Best score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {quizAnalytics.map(({ quiz, attempts, averageScore, bestScore }) => {
                  const course = courses.find((item) => item.id === quiz.courseId);
                  return (
                    <tr key={quiz.id}>
                      <td className="px-4 py-3 font-medium text-neutral-800">{quiz.title}</td>
                      <td className="px-4 py-3 text-neutral-600">{course?.title ?? '—'}</td>
                      <td className="px-4 py-3 text-neutral-600">{attempts}</td>
                      <td className="px-4 py-3 text-neutral-600">{averageScore}%</td>
                      <td className="px-4 py-3 text-neutral-600">{bestScore}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {quizResults.slice(0, 4).map((result) => {
              const quiz = quizzes.find((item) => item.id === result.quizId);
              const learner = users.find((user) => user.id === result.studentId);
              return (
                <article key={result.id} className="rounded-xl border border-neutral-200 p-4">
                  <h4 className="text-sm font-semibold text-neutral-800">{quiz?.title}</h4>
                  <p className="text-xs text-neutral-500">
                    {learner?.name} · {new Date(result.submittedAt).toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm text-neutral-700">
                    Score {result.score}/{result.totalPoints} ({Math.round((result.score / result.totalPoints) * 100)}%)
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-neutral-500">
                    {result.responses.map((response) => (
                      <li key={response.questionId}>
                        Q{response.questionId.split('-').pop()} · {response.correct ? 'Correct' : 'Review'}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
            {quizResults.length === 0 && (
              <p className="text-sm text-neutral-500">No quiz submissions yet. Encourage learners to complete assessments.</p>
            )}
          </div>
        </section>
      )}
    </section>
  );
};

export default QuizManager;
