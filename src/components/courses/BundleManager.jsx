import React, { useEffect, useState } from 'react';
import { useLMS } from '../../context/LMSContext.jsx';

const emptyBundle = (generateId) => ({
  id: generateId('bundle'),
  name: 'New bundle',
  description: '',
  courseIds: [],
  visibility: 'public',
  badgeColor: 'bg-primary-500',
  createdAt: new Date().toISOString(),
});

const BundleManager = () => {
  const {
    state: { bundles, courses },
    createBundle,
    updateBundle,
    deleteBundle,
    generateId,
  } = useLMS();

  const [selectedId, setSelectedId] = useState(bundles[0]?.id ?? 'new');
  const [form, setForm] = useState(() => emptyBundle(generateId));
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (selectedId === 'new') {
      setForm(emptyBundle(generateId));
    } else {
      const existing = bundles.find((bundle) => bundle.id === selectedId);
      if (existing) {
        setForm({ ...existing });
      }
    }
  }, [selectedId, bundles, generateId]);

  const toggleCourse = (courseId) => {
    setForm((prev) => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter((id) => id !== courseId)
        : [...prev.courseIds, courseId],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedId === 'new') {
      const bundleId = generateId('bundle');
      const created = { ...form, id: bundleId, createdAt: new Date().toISOString() };
      createBundle(created);
      setForm(created);
      setSelectedId(bundleId);
      setStatus('Bundle curated and published.');
    } else {
      updateBundle({ ...form });
      setStatus('Bundle updated successfully.');
    }
  };

  const handleDelete = () => {
    if (selectedId === 'new') return;
    deleteBundle(selectedId);
    setSelectedId('new');
    setStatus('Bundle removed.');
  };

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Bundle studio</h2>
          <p className="text-sm text-neutral-600">Group courses into thematic pathways to accelerate discovery.</p>
        </div>
        <select
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          className="w-56 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="new">Create new bundle</option>
          {bundles.map((bundle) => (
            <option key={bundle.id} value={bundle.id}>
              {bundle.name}
            </option>
          ))}
        </select>
      </header>

      {status && <p className="rounded-md bg-primary-50 px-4 py-2 text-sm text-primary-700">{status}</p>}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <label className="text-sm block">
              <span className="text-neutral-600">Bundle name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </label>
          </div>
          <label className="text-sm block">
            <span className="text-neutral-600">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={4}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </label>
          <label className="text-sm block">
            <span className="text-neutral-600">Visibility</span>
            <select
              value={form.visibility}
              onChange={(event) => setForm((prev) => ({ ...prev, visibility: event.target.value }))}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>
          <label className="text-sm block">
            <span className="text-neutral-600">Badge color token</span>
            <input
              value={form.badgeColor}
              onChange={(event) => setForm((prev) => ({ ...prev, badgeColor: event.target.value }))}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="bg-primary-500"
            />
          </label>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
            >
              {selectedId === 'new' ? 'Publish bundle' : 'Save bundle'}
            </button>
            {selectedId !== 'new' && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
              >
                Delete
              </button>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-800">Select courses</h3>
            <span className="text-xs text-neutral-500">{form.courseIds.length} selected</span>
          </div>
          <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {courses.map((course) => {
              const isIncluded = form.courseIds.includes(course.id);
              return (
                <li key={course.id}>
                  <label className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                    isIncluded ? 'border-primary-300 bg-primary-50' : 'border-neutral-200 hover:border-primary-200'
                  }`}
                  >
                    <div>
                      <p className="font-semibold text-neutral-900">{course.title}</p>
                      <p className="text-xs text-neutral-500">{course.category} · {course.level}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isIncluded}
                      onChange={() => toggleCourse(course.id)}
                    />
                  </label>
                </li>
              );
            })}
          </ul>

          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">
            <p className="font-semibold text-neutral-800">Bundle narrative</p>
            <p className="mt-1 text-xs text-neutral-500">
              Highlight how these courses connect to create a cohesive learning journey. Learners see this description before purchasing.
            </p>
            <ul className="mt-3 space-y-2 text-xs text-neutral-500">
              {form.courseIds.map((courseId) => {
                const course = courses.find((item) => item.id === courseId);
                return (
                  <li key={courseId} className="rounded-md bg-white px-3 py-2 shadow-sm">
                    <p className="font-medium text-neutral-800">{course?.title}</p>
                    <p className="text-[11px] text-neutral-500">
                      {course?.modules?.length ?? 0} modules · Prerequisites {course?.prerequisites?.length ?? 0}
                    </p>
                  </li>
                );
              })}
              {form.courseIds.length === 0 && <li>Add courses to auto-generate talking points.</li>}
            </ul>
          </div>
        </section>
      </form>
    </section>
  );
};

export default BundleManager;
