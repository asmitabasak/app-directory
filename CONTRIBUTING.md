Contributing

Thank you for taking the time to improve this Next.js App Router playground. This project helps people explore routing patterns, layouts, loading states, error boundaries, MDX examples, cache behavior, and related App Directory concepts.

Getting started

Fork the repository and clone your fork.

Install dependencies with pnpm install.

Start the development server with pnpm dev.

Open http://localhost:3000 in your browser.

Useful commands

pnpm dev starts the local Next.js development server.

pnpm build checks that the project can build successfully.

pnpm prettier formats the repository using the existing Prettier configuration.

Contribution guidelines

Keep examples focused on App Router learning goals.

Prefer small, clear changes over broad rewrites.

When adding a new route example, include the related page.tsx, layout.tsx, loading.tsx, error.tsx, or readme.mdx files where they help explain the pattern.

Keep route examples easy to scan for learners who are new to the App Directory.

Reuse existing UI components from ui where practical.

Follow the existing TypeScript and formatting style.

Avoid adding new dependencies unless the example clearly needs them.

Working with documentation

Many route examples include a nearby readme.mdx. When changing an example, update the matching documentation so the behavior and explanation stay in sync.

Good documentation changes usually explain what the example demonstrates, how the route structure works, any important server or client component behavior, and any caveats around caching, loading states, layouts, or error boundaries.

Before opening a pull request

Run pnpm prettier and pnpm build when dependencies are installed.

Check that the app still builds, the changed route works locally, documentation matches the implementation, and the pull request description explains what changed and why.

Reporting issues

When reporting a bug or documentation problem, include the route or file where you saw the issue, what you expected to happen, what actually happened, steps to reproduce the behavior, and screenshots or logs if they help explain the problem.

Pull request tips

Link the related issue when possible.

Keep the pull request title specific.

Mention any follow-up work that should happen later.

For visual changes, include a screenshot or short note describing what changed.
