import React from 'react';
import { useLMS } from '../../context/LMSContext.jsx';

const AppLayout = ({ title, subtitle, views, activeView, onNavigate, children }) => {
  const { state, setActiveUser } = useLMS();
  const { users, activeUserId, courses, enrollments, bundles } = state;

  const activeUser = users.find((user) => user.id === activeUserId) ?? users[0];
  const instructorCount = users.filter((user) => user.role === 'instructor').length;
  const studentCount = users.filter((user) => user.role === 'student').length;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex">
      <aside className="hidden lg:flex lg:w-72 flex-col bg-white border-r border-neutral-200">
        <div className="px-6 py-5 border-b border-neutral-200">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Navigation</p>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="py-4 space-y-1">
            {views.map((view) => (
              <li key={view.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(view.id)}
                  className={`flex w-full items-center justify-between px-6 py-3 text-left text-sm font-medium transition rounded-r-full ${
                    activeView === view.id
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span>{view.label}</span>
                  {activeView === view.id && <span className="text-xs font-semibold">Live</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-6 py-6 border-t border-neutral-200 space-y-3 text-sm">
          <div>
            <p className="text-neutral-500">Instructors</p>
            <p className="font-semibold">{instructorCount}</p>
          </div>
          <div>
            <p className="text-neutral-500">Students</p>
            <p className="font-semibold">{studentCount}</p>
          </div>
          <div>
            <p className="text-neutral-500">Bundles</p>
            <p className="font-semibold">{bundles.length}</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-neutral-200">
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
                <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-600">
                  {activeUser?.role === 'instructor' ? 'Instructor cockpit' : 'Student portal'}
                </span>
              </div>
              <p className="text-sm text-neutral-600 mt-1 max-w-2xl">{subtitle}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ${
                activeUser?.avatarColor ?? 'bg-primary-500'
              }`}
              >
                {activeUser?.name
                  ?.split(' ')
                  .map((part) => part[0])
                  .join('') ?? 'NA'}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{activeUser?.name}</p>
                <p className="text-xs text-neutral-500">{activeUser?.email}</p>
              </div>
              <div>
                <label className="sr-only" htmlFor="active-user-select">
                  Switch workspace profile
                </label>
                <select
                  id="active-user-select"
                  value={activeUserId}
                  onChange={(event) => setActiveUser(event.target.value)}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} · {user.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-200 bg-neutral-50">
            <div className="max-w-6xl mx-auto px-6 py-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatBlock label="Active Courses" value={courses.length} />
              <StatBlock label="Enrollments" value={enrollments.length} />
              <StatBlock
                label="Average Progress"
                value={`${Math.round(
                  enrollments.length
                    ? enrollments.reduce((total, item) => total + (item.progress ?? 0), 0) / enrollments.length
                    : 0
                )}%`}
              />
              <StatBlock label="Bundles Curated" value={bundles.length} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

const StatBlock = ({ label, value }) => (
  <div className="rounded-xl bg-white border border-neutral-200 px-4 py-3 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-neutral-900">{value}</p>
  </div>
);

export default AppLayout;
