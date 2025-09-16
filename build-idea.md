<idea>
Minimal Viable Product (MVP) for a Learning Management System (LMS) inspired by Tutor LMS. The MVP will focus on essential features for course management, user roles, and quizzes/certificates using plain React.js, HTML, and Tailwind CSS. All data will be stored temporarily using the browser's local storage.
</idea>

<problem>
Most LMS platforms are either too complex or tightly integrated with specific ecosystems. For rapid development and customization, a lightweight MVP is needed that delivers core LMS functionality without backend complexity or third-party integrations.
</problem>

<approach>
Break the LMS MVP into three core modules:
1. **Course Management**: Course builder, video support, drip content, prerequisites, and course bundles.
2. **User Roles**: Dashboards for students and instructors, multi-instructor support, and basic communication tools.
3. **Quizzes & Certificates**: Quiz builder, grading system, and certificate designer.

Use plain React.js for the frontend, HTML for structure, and Tailwind CSS for styling. Store all data in browser local storage to avoid backend dependencies.
</approach>

<research>
To build this MVP, research will focus on:
- UI/UX patterns for course builders and dashboards
- React component architecture for modular LMS features
- Tailwind CSS best practices for responsive design
- Using browser local storage for temporary data persistence
- Simple state management (e.g., React Context API)

Checklist:
- [ ] Define feature scope and UI wireframes
- [ ] Set up React project with Tailwind CSS
- [ ] Build course management components
- [ ] Build user role dashboards and communication tools
- [ ] Build quiz and certificate components
- [ ] Implement local storage for data persistence
- [ ] Test and refine UI/UX
</research>

Six-step implementation plan:
1. **Chunk**: Break LMS MVP into feature modules (course, user, quiz); assign priorities.
2. **Rate**: Score each module’s importance to MVP; prioritize course builder and dashboards.
3. **Target**: Define MVP scope and timeline; set UI/UX goals.
4. **Build Loop**: Develop each module iteratively using React and Tailwind CSS.
5. **Test & Refine**: Validate each module; gather feedback; optimize performance.
6. **Output**: Deploy MVP frontend; prepare for backend or integration phase.
