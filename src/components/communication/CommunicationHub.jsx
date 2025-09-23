import React, { useMemo, useState } from 'react';
import { useLMS } from '../../context/LMSContext.jsx';

const CommunicationHub = () => {
  const {
    state: { communications, courses, users, activeUserId },
    addCommunication,
    deleteCommunication,
    generateId,
  } = useLMS();

  const activeUser = users.find((user) => user.id === activeUserId) ?? users[0];
  const [courseFilter, setCourseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [form, setForm] = useState({ courseId: courses[0]?.id ?? '', type: 'announcement', title: '', message: '' });
  const [status, setStatus] = useState('');

  const filteredCommunications = useMemo(() => {
    return communications
      .filter((item) => (courseFilter === 'all' ? true : item.courseId === courseFilter))
      .filter((item) => (typeFilter === 'all' ? true : item.type === typeFilter))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [communications, courseFilter, typeFilter]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.courseId || !form.message.trim()) {
      setStatus('Select a course and add a message.');
      return;
    }

    addCommunication({
      id: generateId('comm'),
      courseId: form.courseId,
      type: form.type,
      title: form.title || (form.type === 'announcement' ? 'Course announcement' : 'Direct message'),
      message: form.message,
      audience: form.type === 'announcement' ? 'students' : 'instructors',
      createdBy: activeUser.id,
      createdAt: new Date().toISOString(),
    });
    setStatus('Message published.');
    setForm({ ...form, title: '', message: '' });
  };

  const handleDelete = (communicationId) => {
    deleteCommunication(communicationId);
    setStatus('Message removed from the feed.');
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[2fr,3fr]">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Communication hub</h2>
          <p className="text-sm text-neutral-600">Broadcast announcements or send instructor-student messages in one place.</p>
        </div>
        <label className="text-sm block">
          <span className="text-neutral-600">Course</span>
          <select
            value={form.courseId}
            onChange={(event) => setForm((prev) => ({ ...prev, courseId: event.target.value }))}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm block">
          <span className="text-neutral-600">Communication type</span>
          <select
            value={form.type}
            onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="announcement">Announcement</option>
            <option value="message">Message</option>
            <option value="event">Event</option>
          </select>
        </label>
        <label className="text-sm block">
          <span className="text-neutral-600">Title</span>
          <input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Optional headline"
          />
        </label>
        <label className="text-sm block">
          <span className="text-neutral-600">Message</span>
          <textarea
            value={form.message}
            onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            rows={4}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Share updates, reminders, or call-to-actions"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
        >
          Publish message
        </button>
        {status && <p className="text-xs text-primary-600">{status}</p>}
      </form>

      <section className="space-y-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <select
              value={courseFilter}
              onChange={(event) => setCourseFilter(event.target.value)}
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All types</option>
              <option value="announcement">Announcements</option>
              <option value="message">Messages</option>
              <option value="event">Events</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredCommunications.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
              No communications yet. Start by sharing an announcement.
            </p>
          )}
          {filteredCommunications.map((item) => {
            const author = users.find((user) => user.id === item.createdBy);
            const course = courses.find((courseItem) => courseItem.id === item.courseId);
            return (
              <article key={item.id} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">{item.type}</p>
                    <h3 className="text-base font-semibold text-neutral-900">{item.title}</h3>
                    <p className="mt-2 text-sm text-neutral-700 whitespace-pre-line">{item.message}</p>
                  </div>
                  <div className="text-right text-xs text-neutral-500">
                    <p>{author?.name ?? 'Unknown author'}</p>
                    <p>{course?.title ?? 'General'}</p>
                    <p>{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                  <span>Audience: {item.audience}</span>
                  {author?.id === activeUser.id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-xs font-medium text-red-600 hover:text-red-500"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
};

export default CommunicationHub;
