# 🚀 Developer Portfolio & Blog

A modern, high-performance developer portfolio and blog built with **Astro 5**, **React 19**, **Tailwind CSS v4**, **Motion**, **Spline 3D**, and an **AI Chatbot** powered by Google Gemini.

Designed to be clean, fast, fully responsive, and **extremely easy for developers to fork, customize, and call their own**.

---

## ✨ Features

- ⚡ **Astro 5 + SSR & Prerendering**: Instant page loads with optimized static generation and server-side routes.
- 🤖 **Embedded AI Assistant**: Interactive chatbot that answers questions about your experience, projects, skills, and availability using facts from your configuration.
- 🎨 **Interactive 3D Robot**: Smooth cursor-following and eye-tracking Spline 3D robot model on the hero section.
- 📝 **Visitor Doodle & Sketch Wall**: Real-time canvas wall where visitors can draw and leave custom messages (backed by PostgreSQL, SQLite, MySQL, or MongoDB).
- ✍️ **Bilingual Blog (EN + ID)**: Type-safe MDX/Markdown content collections with syntax highlighting and read time estimation.
- 📬 **Contact Form**: Email submission via Nodemailer with local development simulation mode.
- 🌓 **Dark & Light Mode**: Accessible theme switching with local storage persistence and system preference detection.
- 📱 **Smooth Scrolling**: Lenis smooth scrolling with motion-reduced accessibility fallbacks.

---

## ⚡ Quickstart (Run in 30 Seconds)

You do **not** need any external API keys or databases to run and test this project locally. Everything runs with zero-config fallbacks out of the box!

```bash
# 1. Clone the repository
git clone https://github.com/your-username/portfolio.git
cd portfolio

# 2. Install dependencies (Node >= 22.12 required)
pnpm install

# 3. Create your local environment file
cp .env.example .env

# 4. Start the dev server
pnpm dev
```

Visit [`http://localhost:4321`](http://localhost:4321) to see your site live!

---

## 🛠️ Personalizing Your Portfolio

Everything you need to change to make this portfolio your own is organized cleanly:

### 1. Update Profile & Content (`src/site.config.ts`)
The single source of truth for all your personal information is [`src/site.config.ts`](./src/site.config.ts):
- **Identity**: Full name, nickname, email, domain, location, country, tagline.
- **Resume Links**: Add your English and translated resume download links.
- **Career & Education**: Add your work history, companies, and degrees.
- **Projects**: Add your own apps, tools, and SaaS products with tags and live URLs.
- **Skills**: Add your favorite technologies with descriptions and icon assets.
- **AI Knowledge Base**: Summarize your background so the AI chatbot accurately speaks on your behalf.

> **Note:** Adding new projects or careers does *not* require modifying translation files. If a custom string is not in the translation dictionary, it automatically renders seamlessly!

### 2. Replace Photos & Logos
- **Profile Picture**: Replace [`src/assets/me/me.webp`](./src/assets/me/) with your photo.
- **Company & Education Logos**: Add your employer or school logos under [`src/assets/companies/`](./src/assets/companies/) and [`src/assets/me/`](./src/assets/me/).
- **Project Screenshots**: Place project comp images under [`src/assets/projects/`](./src/assets/projects/).
- **Favicon & Social Card**: Update [`public/favicon.svg`](./public/favicon.svg) and [`public/og-card.svg`](./public/og-card.svg) with your brand and domain.

### 3. Add Your Blog Posts
Blog articles are standard Markdown files stored in:
- English: `src/posts/en/*.md`
- Indonesian (or other languages): `src/posts/id/*.md`

Each post has a frontmatter schema:
```yaml
---
title: "Your Post Title"
description: "A short summary of the post"
publishedAt: 2026-01-15
readTime: 5
tags: ["react", "typescript", "architecture"]
key: "your-post-slug"
lang: "en"
keywords: "react, web development"
---
```

### 4. 3D Spline Robot Scene (Optional)
The hero section loads [`public/bot.splinecode`](./public/bot.splinecode). You can export your own scene from [Spline](https://spline.design) and replace the file, or customize [`src/components/hero-robot.tsx`](./src/components/hero-robot.tsx).

---

## 🔑 Environment Variables

All external services are **optional** during local development. When ready to go to production, fill these in `.env`:

| Variable | Description | Default / Required |
| :--- | :--- | :--- |
| `APP_URL` | Canonical URL of your live site | `http://localhost:4321` |
| `AI_PROVIDER` | AI provider (`google`, `openai`, `anthropic`) | `google` |
| `AI_API_KEY` | API key for your chosen provider | *Optional (chatbot shows offline note if omitted)* |
| `AI_MODEL` | Custom model name | *Optional (defaults to `gemini-2.5-flash` / `gpt-4o-mini` / `claude-3-5-haiku-latest`)* |
| `AI_BASE_URL` | Custom endpoint URL (e.g. `http://localhost:11434/v1` for Ollama or proxy) | *Optional (defaults to official API endpoint)* |
| `DB_PROVIDER` | Database provider (`postgres`, `sqlite`, `mysql`, `mongodb`) | *Auto-detected from URL* |
| `DATABASE_URL` | Connection string or SQLite file path (e.g. `postgres://...`, `file:./local.db`, `libsql://...`) | *Optional (wall shows empty state if omitted)* |
| `SMTP_URL` | Single connection string (e.g. `smtps://user%40gmail.com:pass@smtp.gmail.com:465`) | *Optional (contact form logs to console if omitted)* |

---

## 🚢 Scripts & Commands

| Command | Action |
| :--- | :--- |
| `pnpm dev` | Starts local dev server at `http://localhost:4321` |
| `pnpm build` | Type-checks with `astro check` and builds the production bundle |
| `pnpm preview` | Locally preview the production build |
| `pnpm test` | Runs the test suite with Vitest |
| `pnpm coverage` | Runs tests and generates code coverage report |

---

## 🌐 Deployment

### Vercel (Recommended)
This template includes the `@astrojs/vercel` serverless adapter out of the box.
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set your environment variables in the Vercel dashboard.
4. Deploy!

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE). Feel free to use it, personalize it, and make it your own!
