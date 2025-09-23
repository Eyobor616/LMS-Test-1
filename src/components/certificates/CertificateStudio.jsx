import React, { useEffect, useMemo, useState } from 'react';
import { useLMS } from '../../context/LMSContext.jsx';

const defaultTemplate = {
  accentColor: '#4f46e5',
  backgroundColor: '#eef2ff',
  signature: '',
  message: 'has successfully completed this course.',
  badge: 'Certificate of Achievement',
};

const CertificateStudio = () => {
  const {
    state: { certificates, courses, users, enrollments, activeUserId },
    saveCertificate,
    deleteCertificate,
    generateId,
  } = useLMS();

  const activeUser = users.find((user) => user.id === activeUserId) ?? users[0];
  const students = useMemo(() => users.filter((user) => user.role === 'student'), [users]);
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? '');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id ?? '');
  const [template, setTemplate] = useState(() => ({ ...defaultTemplate }));
  const [status, setStatus] = useState('');

  const enrollmentEligibleStudents = useMemo(() => {
    if (!selectedCourseId) return [];
    return enrollments.filter((item) => item.courseId === selectedCourseId).map((item) => item.userId);
  }, [enrollments, selectedCourseId]);

  useEffect(() => {
    const existing = certificates.find(
      (certificate) => certificate.courseId === selectedCourseId && certificate.studentId === selectedStudentId
    );
    if (existing) {
      setTemplate({ ...defaultTemplate, ...existing.template });
    } else {
      setTemplate({ ...defaultTemplate });
    }
  }, [certificates, selectedCourseId, selectedStudentId]);

  const handleSave = () => {
    if (!selectedCourseId || !selectedStudentId) {
      setStatus('Select both course and learner.');
      return;
    }

    const existing = certificates.find(
      (certificate) => certificate.courseId === selectedCourseId && certificate.studentId === selectedStudentId
    );

    saveCertificate({
      id: existing?.id ?? generateId('cert'),
      courseId: selectedCourseId,
      studentId: selectedStudentId,
      issuedOn: existing?.issuedOn ?? new Date().toISOString(),
      template,
    });
    setStatus('Certificate saved. Ready for distribution.');
  };

  const handleDelete = () => {
    const existing = certificates.find(
      (certificate) => certificate.courseId === selectedCourseId && certificate.studentId === selectedStudentId
    );
    if (existing) {
      deleteCertificate(existing.id);
      setStatus('Certificate removed.');
    }
  };

  const selectedCourse = courses.find((course) => course.id === selectedCourseId);
  const selectedStudent = users.find((user) => user.id === selectedStudentId);

  return (
    <section className="grid gap-6 lg:grid-cols-[2fr,3fr]">
      <div className="space-y-4">
        <header className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Certificate studio</h2>
            <p className="text-sm text-neutral-600">Celebrate milestones with branded certificates and tailored copy.</p>
          </div>
          <label className="text-sm block">
            <span className="text-neutral-600">Course</span>
            <select
              value={selectedCourseId}
              onChange={(event) => setSelectedCourseId(event.target.value)}
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
            <span className="text-neutral-600">Learner</span>
            <select
              value={selectedStudentId}
              onChange={(event) => setSelectedStudentId(event.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select learner</option>
              {students.map((student) => (
                <option
                  key={student.id}
                  value={student.id}
                  disabled={selectedCourseId ? !enrollmentEligibleStudents.includes(student.id) : false}
                >
                  {student.name} {selectedCourseId && !enrollmentEligibleStudents.includes(student.id) ? '· Not enrolled' : ''}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="text-neutral-600">Accent color</span>
              <input
                value={template.accentColor}
                onChange={(event) => setTemplate((prev) => ({ ...prev, accentColor: event.target.value }))}
                type="color"
                className="mt-1 h-10 w-full rounded-md border border-neutral-300"
              />
            </label>
            <label className="text-sm">
              <span className="text-neutral-600">Background color</span>
              <input
                value={template.backgroundColor}
                onChange={(event) => setTemplate((prev) => ({ ...prev, backgroundColor: event.target.value }))}
                type="color"
                className="mt-1 h-10 w-full rounded-md border border-neutral-300"
              />
            </label>
          </div>
          <label className="text-sm block">
            <span className="text-neutral-600">Badge text</span>
            <input
              value={template.badge}
              onChange={(event) => setTemplate((prev) => ({ ...prev, badge: event.target.value }))}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </label>
          <label className="text-sm block">
            <span className="text-neutral-600">Message</span>
            <textarea
              value={template.message}
              onChange={(event) => setTemplate((prev) => ({ ...prev, message: event.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </label>
          <label className="text-sm block">
            <span className="text-neutral-600">Signature</span>
            <input
              value={template.signature}
              onChange={(event) => setTemplate((prev) => ({ ...prev, signature: event.target.value }))}
              placeholder={activeUser.role === 'instructor' ? activeUser.name : 'Program director'}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
            >
              Save certificate
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Delete
            </button>
          </div>
          {status && <p className="text-xs text-primary-600">{status}</p>}
        </header>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        {selectedCourse && selectedStudent ? (
          <div
            className="relative overflow-hidden rounded-2xl border border-neutral-200 p-8"
            style={{ backgroundColor: template.backgroundColor }}
          >
            <div className="flex justify-between text-sm text-neutral-600">
              <span>{selectedCourse.title}</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="mt-8 text-center">
              <span
                className="rounded-full px-4 py-2 text-xs font-semibold text-white"
                style={{ backgroundColor: template.accentColor }}
              >
                {template.badge}
              </span>
              <h3 className="mt-6 text-3xl font-semibold text-neutral-900">{selectedStudent.name}</h3>
              <p className="mt-3 text-lg text-neutral-700">
                {selectedStudent.name} {template.message}
              </p>
            </div>
            <div className="mt-12 flex items-center justify-between text-sm text-neutral-600">
              <div>
                <p className="font-semibold text-neutral-800">{template.signature || activeUser.name}</p>
                <p>Program Lead</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-neutral-800">{selectedCourse.title}</p>
                <p>Issued {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">Select a course and learner to preview the certificate.</p>
        )}
      </div>
    </section>
  );
};

export default CertificateStudio;
