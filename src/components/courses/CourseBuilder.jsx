import React, { useEffect, useMemo, useState } from 'react';
import { useLMS } from '../../context/LMSContext.jsx';

const defaultCourse = (generateId, instructorId) => ({
  id: generateId('course'),
  title: 'Untitled course',
  description: '',
  category: 'General',
  level: 'Beginner',
  language: 'English',
  duration: 7,
  previewVideo: {
    type: 'youtube',
    url: '',
  },
  coverImage: '',
  password: '',
  prerequisites: [],
  drip: {
    startDate: new Date().toISOString().slice(0, 10),
    intervalDays: 3,
  },
  modules: [],
  instructors: instructorId ? [instructorId] : [],
  tags: [],
  visibility: 'public',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const CourseBuilder = () => {
  const {
    state: { courses, users, activeUserId },
    createCourse,
    updateCourse,
    deleteCourse,
    importCourse,
    generateId,
  } = useLMS();

  const instructorOptions = useMemo(() => users.filter((user) => user.role === 'instructor'), [users]);
  const prerequisiteOptions = useMemo(() => courses.map((course) => ({ id: course.id, title: course.title })), [courses]);

  const [activeCourseId, setActiveCourseId] = useState('new');
  const [formState, setFormState] = useState(() => defaultCourse(generateId, activeUserId));
  const [importValue, setImportValue] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (activeCourseId === 'new') {
      setFormState(defaultCourse(generateId, activeUserId));
      return;
    }
    const existing = courses.find((course) => course.id === activeCourseId);
    if (existing) {
      setFormState({ ...existing });
    }
  }, [activeCourseId, courses, generateId, activeUserId]);

  const handleGeneralChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value, updatedAt: new Date().toISOString() }));
  };

  const handleVideoChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      previewVideo: {
        ...prev.previewVideo,
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleDripChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      drip: {
        ...prev.drip,
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleInstructorToggle = (instructorId) => {
    setFormState((prev) => {
      const isSelected = prev.instructors.includes(instructorId);
      return {
        ...prev,
        instructors: isSelected
          ? prev.instructors.filter((id) => id !== instructorId)
          : [...prev.instructors, instructorId],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handlePrerequisiteToggle = (courseId) => {
    setFormState((prev) => {
      const isSelected = prev.prerequisites.includes(courseId);
      return {
        ...prev,
        prerequisites: isSelected
          ? prev.prerequisites.filter((id) => id !== courseId)
          : [...prev.prerequisites, courseId],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const addModule = () => {
    setFormState((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          id: generateId('module'),
          title: `Module ${prev.modules.length + 1}`,
          releaseOffset: prev.modules.length * (prev.drip?.intervalDays ?? 3),
          lessons: [],
        },
      ],
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateModule = (moduleId, field, value) => {
    setFormState((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              [field]: value,
            }
          : module
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const removeModule = (moduleId) => {
    setFormState((prev) => ({
      ...prev,
      modules: prev.modules.filter((module) => module.id !== moduleId),
      updatedAt: new Date().toISOString(),
    }));
  };

  const addLesson = (moduleId) => {
    setFormState((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: [
                ...(module.lessons ?? []),
                {
                  id: generateId('lesson'),
                  title: 'New lesson',
                  type: 'video',
                  provider: prev.previewVideo?.type ?? 'youtube',
                  url: '',
                  duration: 5,
                  releaseDate: prev.drip?.startDate ?? new Date().toISOString().slice(0, 10),
                },
              ],
            }
          : module
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateLesson = (moduleId, lessonId, field, value) => {
    setFormState((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.map((lesson) =>
                lesson.id === lessonId
                  ? {
                      ...lesson,
                      [field]: value,
                    }
                  : lesson
              ),
            }
          : module
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const removeLesson = (moduleId, lessonId) => {
    setFormState((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.filter((lesson) => lesson.id !== lessonId),
            }
          : module
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...formState,
      updatedAt: new Date().toISOString(),
    };

    if (activeCourseId === 'new') {
      const courseId = generateId('course');
      const created = { ...payload, id: courseId, createdAt: new Date().toISOString() };
      createCourse(created);
      setFormState(created);
      setActiveCourseId(courseId);
      setMessage('Course created and ready for preview.');
    } else {
      updateCourse(payload);
      setMessage('Course updated successfully.');
    }
  };

  const handleDuplicate = () => {
    const cloneId = generateId('course');
    const duplicate = {
      ...formState,
      id: cloneId,
      title: `${formState.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    createCourse(duplicate);
    setFormState(duplicate);
    setActiveCourseId(cloneId);
    setMessage('Course duplicated. Update details before publishing.');
  };

  const handleDelete = () => {
    if (activeCourseId === 'new') return;
    deleteCourse(activeCourseId);
    setActiveCourseId('new');
    setMessage('Course removed from library.');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(formState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formState.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importValue);
      const hydrated = {
        ...parsed,
        id: parsed.id ?? generateId('course'),
        createdAt: parsed.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      importCourse(hydrated);
      setActiveCourseId(hydrated.id);
      setFormState(hydrated);
      setMessage('Course imported and added to the library.');
      setImportValue('');
    } catch (error) {
      setMessage('Import failed. Ensure the JSON structure is valid.');
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Course builder</h2>
          <p className="text-sm text-neutral-600">Craft modular courses with prerequisites, drip schedules, and multi-instructor delivery.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="course-selector" className="text-sm text-neutral-500">
            Manage existing
          </label>
          <select
            id="course-selector"
            value={activeCourseId}
            onChange={(event) => setActiveCourseId(event.target.value)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="new">Create new course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </header>

      {message && <p className="rounded-md bg-primary-50 px-4 py-3 text-sm text-primary-700">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900">General details</h3>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span>Visibility</span>
              <select
                value={formState.visibility}
                onChange={(event) => handleGeneralChange('visibility', event.target.value)}
                className="rounded-md border border-neutral-300 px-2 py-1"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="password">Password protected</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              <span className="text-neutral-600">Course title</span>
              <input
                value={formState.title}
                onChange={(event) => handleGeneralChange('title', event.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </label>
            <label className="text-sm">
              <span className="text-neutral-600">Category</span>
              <input
                value={formState.category}
                onChange={(event) => handleGeneralChange('category', event.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </label>
            <label className="text-sm">
              <span className="text-neutral-600">Level</span>
              <select
                value={formState.level}
                onChange={(event) => handleGeneralChange('level', event.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="text-neutral-600">Language</span>
              <input
                value={formState.language}
                onChange={(event) => handleGeneralChange('language', event.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </label>
          </div>
          <label className="text-sm block">
            <span className="text-neutral-600">Course description</span>
            <textarea
              value={formState.description}
              onChange={(event) => handleGeneralChange('description', event.target.value)}
              rows={4}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </label>
          {formState.visibility === 'password' && (
            <label className="text-sm block">
              <span className="text-neutral-600">Course password</span>
              <input
                value={formState.password ?? ''}
                onChange={(event) => handleGeneralChange('password', event.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </label>
          )}
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900">Media & preview</h3>
            <button
              type="button"
              onClick={() => handleVideoChange('url', '')}
              className="text-xs font-medium text-primary-600 hover:text-primary-500"
            >
              Clear URL
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              <span className="text-neutral-600">Video provider</span>
              <select
                value={formState.previewVideo?.type ?? 'youtube'}
                onChange={(event) => handleVideoChange('type', event.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="native">Native upload</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="text-neutral-600">Preview URL</span>
              <input
                value={formState.previewVideo?.url ?? ''}
                onChange={(event) => handleVideoChange('url', event.target.value)}
                placeholder="https://"
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </label>
          </div>
          {formState.previewVideo?.url && (
            <div className="overflow-hidden rounded-xl border border-neutral-200">
              <iframe
                title="Course preview"
                src={formState.previewVideo.url}
                className="h-64 w-full"
                allowFullScreen
              />
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900">Release strategy</h3>
            <p className="text-xs text-neutral-500">Manage prerequisites and drip cadence</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm">
              <span className="text-neutral-600">Drip start date</span>
              <input
                type="date"
                value={formState.drip?.startDate ?? ''}
                onChange={(event) => handleDripChange('startDate', event.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </label>
            <label className="text-sm">
              <span className="text-neutral-600">Interval (days)</span>
              <input
                type="number"
                min="1"
                value={formState.drip?.intervalDays ?? 3}
                onChange={(event) => handleDripChange('intervalDays', Number(event.target.value) || 1)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </label>
            <label className="text-sm">
              <span className="text-neutral-600">Estimated duration (days)</span>
              <input
                type="number"
                min="1"
                value={formState.duration ?? 7}
                onChange={(event) => handleGeneralChange('duration', Number(event.target.value) || 1)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-neutral-700">Prerequisites</p>
              <div className="mt-2 space-y-2 rounded-lg border border-neutral-200 p-3 max-h-40 overflow-y-auto">
                {prerequisiteOptions.length === 0 && <p className="text-xs text-neutral-500">No other courses yet.</p>}
                {prerequisiteOptions
                  .filter((course) => course.id !== formState.id)
                  .map((course) => (
                  <label key={course.id} className="flex items-center justify-between text-sm">
                    <span>{course.title}</span>
                    <input
                      type="checkbox"
                      checked={formState.prerequisites.includes(course.id)}
                      onChange={() => handlePrerequisiteToggle(course.id)}
                    />
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-700">Instructor team</p>
              <div className="mt-2 space-y-2 rounded-lg border border-neutral-200 p-3 max-h-40 overflow-y-auto">
                {instructorOptions.map((instructor) => (
                  <label key={instructor.id} className="flex items-center justify-between text-sm">
                    <span>{instructor.name}</span>
                    <input
                      type="checkbox"
                      checked={formState.instructors.includes(instructor.id)}
                      onChange={() => handleInstructorToggle(instructor.id)}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900">Modules & lessons</h3>
            <button
              type="button"
              onClick={addModule}
              className="rounded-md border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100"
            >
              Add module
            </button>
          </div>
          {formState.modules.length === 0 && <p className="text-sm text-neutral-500">Add modules to define your course structure.</p>}
          <div className="space-y-4">
            {formState.modules.map((module) => (
              <div key={module.id} className="rounded-xl border border-neutral-200 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm block">
                      <span className="text-neutral-600">Module title</span>
                      <input
                        value={module.title}
                        onChange={(event) => updateModule(module.id, 'title', event.target.value)}
                        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </label>
                    <label className="text-sm block">
                      <span className="text-neutral-600">Release offset (days)</span>
                      <input
                        type="number"
                        min="0"
                        value={module.releaseOffset ?? 0}
                        onChange={(event) => updateModule(module.id, 'releaseOffset', Number(event.target.value) || 0)}
                        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeModule(module.id)}
                    className="text-xs font-medium text-red-600 hover:text-red-500"
                  >
                    Remove module
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-neutral-700">Lessons</h4>
                    <button
                      type="button"
                      onClick={() => addLesson(module.id)}
                      className="text-xs font-medium text-primary-600 hover:text-primary-500"
                    >
                      Add lesson
                    </button>
                  </div>
                  {(module.lessons ?? []).length === 0 && (
                    <p className="text-sm text-neutral-500">No lessons yet. Add the first one to kick things off.</p>
                  )}
                  <div className="space-y-3">
                    {(module.lessons ?? []).map((lesson) => (
                      <div key={lesson.id} className="rounded-lg border border-neutral-200 p-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="text-xs">
                            <span className="text-neutral-500">Title</span>
                            <input
                              value={lesson.title}
                              onChange={(event) => updateLesson(module.id, lesson.id, 'title', event.target.value)}
                              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </label>
                          <label className="text-xs">
                            <span className="text-neutral-500">Content type</span>
                            <select
                              value={lesson.type}
                              onChange={(event) => updateLesson(module.id, lesson.id, 'type', event.target.value)}
                              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="video">Video</option>
                              <option value="document">Document</option>
                              <option value="quiz">Quiz</option>
                            </select>
                          </label>
                          <label className="text-xs">
                            <span className="text-neutral-500">Provider</span>
                            <select
                              value={lesson.provider}
                              onChange={(event) => updateLesson(module.id, lesson.id, 'provider', event.target.value)}
                              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="youtube">YouTube</option>
                              <option value="vimeo">Vimeo</option>
                              <option value="native">Native</option>
                            </select>
                          </label>
                          <label className="text-xs">
                            <span className="text-neutral-500">Duration (min)</span>
                            <input
                              type="number"
                              min="1"
                              value={lesson.duration ?? 5}
                              onChange={(event) => updateLesson(module.id, lesson.id, 'duration', Number(event.target.value) || 1)}
                              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </label>
                          <label className="text-xs md:col-span-2">
                            <span className="text-neutral-500">Resource URL</span>
                            <input
                              value={lesson.url ?? ''}
                              onChange={(event) => updateLesson(module.id, lesson.id, 'url', event.target.value)}
                              placeholder="https://"
                              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </label>
                          <label className="text-xs">
                            <span className="text-neutral-500">Release date</span>
                            <input
                              type="date"
                              value={lesson.releaseDate?.slice(0, 10) ?? ''}
                              onChange={(event) => updateLesson(module.id, lesson.id, 'releaseDate', event.target.value)}
                              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </label>
                        </div>
                        <div className="mt-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeLesson(module.id, lesson.id)}
                            className="text-xs font-medium text-red-600 hover:text-red-500"
                          >
                            Remove lesson
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Automation</h3>
              <p className="text-xs text-neutral-500">Export JSON snapshots or import course packs.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                onClick={handleExport}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2 font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Export course
              </button>
              {activeCourseId !== 'new' && (
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="rounded-md border border-primary-200 bg-primary-50 px-4 py-2 font-medium text-primary-700 hover:bg-primary-100"
                >
                  Duplicate
                </button>
              )}
              {activeCourseId !== 'new' && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-md border border-red-200 bg-red-50 px-4 py-2 font-medium text-red-600 hover:bg-red-100"
                >
                  Delete course
                </button>
              )}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm block">
              <span className="text-neutral-600">Import course JSON</span>
              <textarea
                value={importValue}
                onChange={(event) => setImportValue(event.target.value)}
                rows={5}
                className="mt-1 w-full rounded-md border border-dashed border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder='{"title":"New course"}'
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleImport}
                className="w-full rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600"
              >
                Import to library
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-neutral-500">
            Last updated {new Date(formState.updatedAt ?? Date.now()).toLocaleString()}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFormState(defaultCourse(generateId, activeUserId))}
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Reset
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
            >
              {activeCourseId === 'new' ? 'Create course' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default CourseBuilder;
