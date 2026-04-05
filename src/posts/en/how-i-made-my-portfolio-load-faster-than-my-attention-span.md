---
title: How I Made My Portfolio Load Faster Than My Attention Span 🏃‍♂️💨
publishedAt: 2025-09-25
description: I moved my portfolio from Next.js to Astro because a personal site does not need an app framework pretending to be a brochure. The rewrite cut JavaScript, simplified maintenance, and made the site feel immediate.
tags: ['astro', 'nextjs', 'react', 'performance', 'seo']
keywords: 'astro js portfolio, astro vs nextjs, astro performance, nextjs static site, react with astro, astro seo boost, astro islands architecture, astro site speed, astro for portfolio, nextjs alternatives'
readTime: 5
lang: en
key: portfolio-speed
related: ['redesigning-my-portfolio-making-space-for-what-matters']
---

For a long time, I used Next.js for everything. It is a strong framework, I know it well, and it solves real problems. My portfolio was not one of them.

That site is mostly static pages, a few images, and a handful of interactive details. Yet I was still carrying the habits of app development into a place that should have been lighter. More client JavaScript, more moving parts, more things to keep in my head for no real payoff.

So I rebuilt the portfolio in Astro. Not because Astro is trendy, but because it matched the job better.

## The real problem was not speed

People often talk about performance like it starts with Lighthouse scores. Mine started with judgment.

I looked at the site and asked a simple question: why am I shipping an application-shaped solution for something that behaves like a document?

That question changed the whole rewrite. The goal was no longer "optimize the existing setup." The goal was "stop doing unnecessary work."

Once I framed it that way, the solution became obvious:

- Render as much as possible to static HTML.
- Keep JavaScript for the places that genuinely need interaction.
- Stop treating every page like a mini app.

That is the part I care about most. Good performance usually begins with subtraction.

## Why Astro made sense

Astro's model is honest. Static by default. Hydrate only what deserves it.

For a portfolio, that is exactly the right bias.

I still get to use React where it helps. I do not have to drag React through every paragraph, image, and heading just because the project started that way. The result is a site that feels faster because the browser has less to do, not because I played games with clever optimizations after the fact.

That distinction matters. I prefer architecture that removes problems early over architecture that creates them and then offers tools to manage the fallout.

## What changed in practice

The rewrite was not dramatic. It was a series of boring decisions, which is usually where good engineering lives.

- I moved content-heavy pages to Astro.
- I kept interactive pieces isolated and small.
- I lazy-loaded assets that were not needed immediately.
- I removed a few client-side flourishes that looked nice in code but added little for visitors.
- I kept the maintenance surface smaller on purpose.

Nothing here is exotic. That is exactly why it works.

## What I learned from the move

The main lesson had nothing to do with Astro or Next.js. It was about tool discipline.

A lot of engineers, me included, stick with a familiar stack long after the problem has changed. We call it consistency. Sometimes it is just inertia wearing a respectable outfit.

Next.js still makes sense when I need routing complexity, server-side logic, authenticated flows, or rich client state. I am not interested in framework tribalism. I am interested in fit.

For this portfolio, Astro was the better call because it let the site be what it actually is.

## What improved

- Pages feel immediate.
- Search and social previews benefit from simpler HTML output.
- There is less JavaScript to ship, debug, and accidentally regress.
- The codebase is easier to reason about because the architecture matches the content.

The best part is not the number on a report. It is that the site feels calmer, and the code does too.

## What I would recommend to other developers

If you are building a portfolio, docs site, or content-heavy site, ask yourself a question before you reach for your default stack: what does this project actually need, and what are you adding out of habit?

Frameworks are easy to justify when you know them well. Restraint takes a little more honesty.

This rewrite was a reminder that engineering maturity is not only about knowing more tools. It is also about knowing when not to use them.
