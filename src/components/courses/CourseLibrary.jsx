import React, { useMemo, useState } from 'react';
import { useLMS } from '../../context/LMSContext.jsx';

const CourseLibrary = () => {
  const {
    state: { courses, users, enrollments, communications, activeUserId },
    addEnrollment,
    updateEnrollment,
    addCommunication,
    generateId,
  } = useLMS();

  const activeUser = users.find((user) => user.id === activeUserId) ?? users[0];
  const [query, setQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? null);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) =>
      course.title.toLowerCase().includes(query.toLowerCase()) ||
      course.category?.toLowerCase().includes(query.toLowerCase())
    );
  }, [courses, query]);

  const handleEnroll = (courseId) => {
    addEnrollment({
      id: generateId('enroll'),
      courseId,
      userId: activeUser.id,
      progress: 0,
      enrolledOn: new Date().toISOString(),
    });
  };

  const handleProgressUpdate = (courseId, value) => {
    const enrollment = enrollments.find(
      (item) => item.courseId === courseId && item.userId === activeUser.id
    );
    if (enrollment) {
      updateEnrollment({ ...enrollment, progress: value });
    }
  };

  const selectedCourse = courses.find((course) => course.id === selectedCourseId);
  const selectedInstructors = (selectedCourse?.instructors ?? []).map((id) =>
    users.find((user) => user.id === id)
  );

  const courseCommunications = communications
    .filter((item) => item.courseId === selectedCourseId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const enrollmentForActiveUser = enrollments.find(
    (item) => item.courseId === selectedCourseId && item.userId === activeUser?.id
  );

  const handleSendMessage = (message) => {
    if (!selectedCourseId || !message.trim()) return;
    addCommunication({
      id: generateId('comm'),
      courseId: selectedCourseId,
      type: activeUser.role === 'instructor' ? 'announcement' : 'message',
      title: `${activeUser.role === 'instructor' ? 'Instructor update' : 'Learner question'}`,
      message,
      audience: activeUser.role === 'instructor' ? 'students' : 'instructors',
      createdBy: activeUser.id,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[2fr,3fr]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-neutral-900">Course library</h2>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search catalog"
              className="w-40 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <ul className="mt-4 space-y-3 max-h-[28rem] overflow-y-auto">
            {filteredCourses.map((course) => {
              const enrollment = enrollments.find(
                (item) => item.courseId === course.id && item.userId === activeUser.id
              );
              return (
                <li key={course.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`flex w-full flex-col gap-2 rounded-xl border px-4 py-3 text-left transition ${
                      selectedCourseId === course.id
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-neutral-200 bg-white hover:border-primary-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{course.title}</p>
                        <p className="text-xs text-neutral-500">{course.category} · {course.level}</p>
                      </div>
                      <span className="text-xs font-medium text-neutral-500">
                        {course.modules?.length ?? 0} module{(course.modules?.length ?? 0) === 1 ? '' : 's'}
                      </span>
                    </div>
                    {enrollment && (
                      <div className="h-2 rounded-full bg-neutral-200">
                        <div
                          className="h-full rounded-full bg-primary-500"
                          style={{ width: `${enrollment.progress ?? 0}%` }}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>{course.visibility === 'private' ? 'Private' : 'Available'}</span>
                      {enrollment ? <span>{enrollment.progress}% complete</span> : <span>Not enrolled</span>}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        {selectedCourse ? (
          <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <header className="flex flex-col gap-2 border-b border-neutral-200 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">{selectedCourse.title}</h3>
                  <p className="text-sm text-neutral-600">{selectedCourse.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {activeUser.role === 'student' && !enrollmentForActiveUser && (
                    <button
                      type="button"
                      onClick={() => handleEnroll(selectedCourse.id)}
                      className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
                    >
                      Enroll now
                    </button>
                  )}
                  {activeUser.role === 'student' && enrollmentForActiveUser && (
                    <label className="flex items-center gap-2 text-xs text-neutral-600">
                      <span>Mark progress</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={enrollmentForActiveUser.progress ?? 0}
                        onChange={(event) => handleProgressUpdate(selectedCourse.id, Number(event.target.value) || 0)}
                      />
                      <span className="font-semibold text-neutral-800">{enrollmentForActiveUser.progress}%</span>
                    </label>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span>Prerequisites: {selectedCourse.prerequisites?.length ?? 0}</span>
                <span>Drip: every {selectedCourse.drip?.intervalDays ?? 0} days</span>
                <span>Duration: {selectedCourse.duration ?? 0} days</span>
              </div>
            </header>

            {selectedCourse.previewVideo?.url && (
              <div className="overflow-hidden rounded-xl border border-neutral-200">
                <iframe
                  title={`${selectedCourse.title} preview`}
                  src={selectedCourse.previewVideo.url}
                  className="h-64 w-full"
                  allowFullScreen
                />
              </div>
            )}

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-neutral-800">Curriculum overview</h4>
                <span className="text-xs text-neutral-500">
                  {selectedCourse.modules?.reduce((total, module) => total + (module.lessons?.length ?? 0), 0)} lessons
                </span>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {(selectedCourse.modules ?? []).map((module) => (
                  <details key={module.id} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                    <summary className="cursor-pointer text-sm font-semibold text-neutral-800">
                      {module.title}
                    </summary>
                    <ul className="mt-2 space-y-2 text-xs text-neutral-600">
                      {(module.lessons ?? []).map((lesson) => (
                        <li key={lesson.id} className="flex items-center justify-between">
                          <span>{lesson.title}</span>
                          <span className="text-neutral-400">
                            {lesson.type} · {lesson.provider} · {lesson.duration}m
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-semibold text-neutral-800">Instructor team</h4>
              <div className="flex flex-wrap gap-3">
                {selectedInstructors.map((instructor) => (
                  <div key={instructor?.id} className="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2">
                    <div className={`h-9 w-9 rounded-full text-white flex items-center justify-center text-sm font-semibold ${
                      instructor?.avatarColor ?? 'bg-primary-500'
                    }`}
                    >
                      {instructor?.name
                        ?.split(' ')
                        .map((part) => part[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{instructor?.name}</p>
                      <p className="text-xs text-neutral-500">{instructor?.email}</p>
                    </div>
                  </div>
                ))}
                {selectedInstructors.length === 0 && <p className="text-xs text-neutral-500">No instructors assigned yet.</p>}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-neutral-800">Communication thread</h4>
                <span className="text-xs text-neutral-500">{courseCommunications.length} entries</span>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {courseCommunications.length === 0 && (
                  <p className="text-sm text-neutral-500">No course messages yet.</p>
                )}
                {courseCommunications.map((item) => {
                  const author = users.find((user) => user.id === item.createdBy);
                  return (
                    <article key={item.id} className="rounded-lg border border-neutral-200 p-3 bg-neutral-50">
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span className="font-medium text-neutral-700">{author?.name ?? 'Unknown user'}</span>
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="mt-2 text-sm text-neutral-700">{item.message}</p>
                    </article>
                  );
                })}
              </div>
              <MessageComposer onSubmit={handleSendMessage} role={activeUser.role} />
            </section>
          </article>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-center text-sm text-neutral-500">
            Select a course to preview its structure and communications.
          </div>
        )}
      </div>
    </section>
  );
};

const MessageComposer = ({ onSubmit, role }) => {
  const [value, setValue] = useState('');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value);
        setValue('');
      }}
      className="rounded-lg border border-neutral-200 p-3 bg-white"
    >
      <label className="text-xs text-neutral-500">
        {role === 'instructor' ? 'Share an announcement' : 'Ask your instructor'}
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={3}
          className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={role === 'instructor' ? 'Live session scheduled for...' : 'Could you clarify the assignment...' }
        />
      </label>
      <div className="mt-2 text-right">
        <button
          type="submit"
          className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default CourseLibrary;
