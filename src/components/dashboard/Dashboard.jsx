import React, { useMemo } from 'react';
import { useLMS } from '../../context/LMSContext.jsx';

const Dashboard = () => {
  const { state } = useLMS();
  const { users, activeUserId, courses, enrollments, quizzes, quizResults, communications } = state;

  const activeUser = users.find((user) => user.id === activeUserId) ?? users[0];

  const roleInsights = useMemo(() => {
    if (!activeUser) return { headline: '', highlights: [] };
    if (activeUser.role === 'instructor') {
      const ownedCourses = courses.filter((course) => course.instructors.includes(activeUser.id));
      const ownedCourseIds = new Set(ownedCourses.map((course) => course.id));
      const unreadMessages = communications.filter(
        (item) => item.courseId && ownedCourseIds.has(item.courseId) && item.createdBy !== activeUser.id
      ).length;
      return {
        headline: `You are orchestrating ${ownedCourses.length} course${ownedCourses.length === 1 ? '' : 's'} this sprint.`,
        highlights: [
          `${ownedCourses.reduce((total, course) => total + (course.modules?.length ?? 0), 0)} modules ready`,
          `${unreadMessages} learner communication${unreadMessages === 1 ? '' : 's'} awaiting review`,
        ],
      };
    }

    const enrolledCourses = enrollments
      .filter((enrollment) => enrollment.userId === activeUser.id)
      .map((enrollment) => courses.find((course) => course.id === enrollment.courseId))
      .filter(Boolean);
    const completedQuizzes = quizResults.filter((result) => result.studentId === activeUser.id).length;
    return {
      headline: `You are progressing through ${enrolledCourses.length} course${
        enrolledCourses.length === 1 ? '' : 's'
      }. Keep the streak going!`,
      highlights: [
        `${completedQuizzes} quiz submissions logged`,
        `${Math.round(
          enrollments
            .filter((enrollment) => enrollment.userId === activeUser.id)
            .reduce((total, enrollment) => total + (enrollment.progress ?? 0), 0) /
            Math.max(1, enrolledCourses.length)
        )}% average progress`,
      ],
    };
  }, [activeUser, courses, enrollments, quizResults, communications]);

  const upcomingReleases = useMemo(() => {
    const now = new Date();
    return courses
      .flatMap((course) =>
        course.modules?.flatMap((module) =>
          module.lessons?.map((lesson) => ({
            ...lesson,
            courseTitle: course.title,
            courseId: course.id,
          })) ?? []
        ) ?? []
      )
      .filter((lesson) => lesson.releaseDate && new Date(lesson.releaseDate) >= now)
      .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate))
      .slice(0, 4);
  }, [courses]);

  const quizPerformance = useMemo(() => {
    return quizzes.map((quiz) => {
      const results = quizResults.filter((result) => result.quizId === quiz.id);
      const averageScore = results.length
        ? results.reduce((total, result) => total + (result.score / result.totalPoints) * 100, 0) / results.length
        : 0;
      return {
        quiz,
        attempts: results.length,
        averageScore: Math.round(averageScore),
      };
    });
  }, [quizzes, quizResults]);

  const latestMessages = communications
    .filter((item) => !item.courseId || courses.some((course) => course.id === item.courseId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Welcome back, {activeUser?.name?.split(' ')[0]}!</h2>
            <p className="mt-1 text-sm text-neutral-600 max-w-2xl">{roleInsights.headline}</p>
          </div>
          <ul className="flex flex-wrap gap-2 text-sm text-primary-600 font-medium">
            {roleInsights.highlights.map((highlight) => (
              <li key={highlight} className="rounded-full bg-primary-50 px-4 py-2">
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900">Drip schedule</h3>
            <span className="text-xs uppercase tracking-wide text-neutral-500">Next releases</span>
          </div>
          <ul className="mt-4 space-y-3">
            {upcomingReleases.length === 0 && (
              <li className="text-sm text-neutral-500">No upcoming lessons scheduled.</li>
            )}
            {upcomingReleases.map((lesson) => (
              <li key={lesson.id} className="rounded-xl border border-neutral-100 p-3">
                <p className="text-sm font-semibold text-neutral-800">{lesson.title}</p>
                <p className="text-xs text-neutral-500">{lesson.courseTitle}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Releases on {new Date(lesson.releaseDate).toLocaleDateString()} · {lesson.type} ({lesson.provider})
                </p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900">Assessment performance</h3>
            <span className="text-xs uppercase tracking-wide text-neutral-500">Auto-graded</span>
          </div>
          <ul className="mt-4 space-y-3">
            {quizPerformance.map(({ quiz, attempts, averageScore }) => (
              <li key={quiz.id} className="rounded-xl border border-neutral-100 p-3">
                <p className="text-sm font-semibold text-neutral-800">{quiz.title}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {attempts} attempt{attempts === 1 ? '' : 's'} · Avg score {averageScore}%
                </p>
              </li>
            ))}
            {quizPerformance.length === 0 && <li className="text-sm text-neutral-500">No quizzes configured yet.</li>}
          </ul>
        </article>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-neutral-900">Latest communications</h3>
          <span className="text-xs uppercase tracking-wide text-neutral-500">Course wide</span>
        </div>
        <ul className="mt-4 space-y-4">
          {latestMessages.length === 0 && <li className="text-sm text-neutral-500">No announcements or messages yet.</li>}
          {latestMessages.map((item) => (
            <li key={item.id} className="rounded-xl border border-neutral-100 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{item.title}</p>
                  <p className="mt-1 text-sm text-neutral-600">{item.message}</p>
                </div>
                <div className="text-xs text-neutral-500 text-right">
                  <p className="capitalize">{item.type}</p>
                  <p>{new Date(item.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Dashboard;
