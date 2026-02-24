---
title: How I Made My Portfolio Load Faster Than My Attention Span 🏃‍♂️💨
publishedAt: 2025-09-25
description: I rebuilt my portfolio from Next.js to Astro and cut most of the unnecessary JavaScript. The site feels snappier, easier to maintain, and still runs the tiny interactive bits I care about.
tags: ['astro', 'nextjs', 'react', 'performance', 'seo']
keywords: 'astro js portfolio, astro vs nextjs, astro performance, nextjs static site, react with astro, astro seo boost, astro islands architecture, astro site speed, astro for portfolio, nextjs alternatives'
readTime: 5
lang: en
key: portfolio-speed
related: ['redesigning-my-portfolio-making-space-for-what-matters']
---

I used Next.js for years. It’s comfortable, feature-rich, and great when you need server rendering or APIs. For a portfolio, though, I realized I was carrying a lot of weight for something that doesn’t change much.

One afternoon, while waiting for coffee to finish brewing, I decided to rebuild the site with Astro. I wanted the pages to load instantly, and for small interactive parts to still work without dragging the whole JavaScript runtime along for the ride.

The result felt immediate — not because of some magic optimization, but because I focused on three simple things: ship less JS, lazy-load what’s not visible, and keep interactive pieces isolated. The site now starts fast, the UI feels snappier, and I sleep better knowing there’s less cruft to maintain.

---

## Why Astro?

Astro's selling point is simple: most HTML is static by default, and you only hydrate the components that actually need JavaScript.

That means, practically:

- Pages are lighter by default.
- The HTML is friendly to search engines and social previews.
- The browser does less work up front, so perceived load time drops.

For a portfolio made mostly of static pages, that tradeoff makes sense. I could still use React for the small parts that needed it, without turning every page into a tiny single-page app.

---

## What I actually did

If you’re thinking about a rewrite, here’s the rough checklist I followed — nothing fancy, just practical:

- Audited the site to find big bundles and unused client scripts.
- Converted pages to Astro, keeping components I needed as islands (partial hydration).
- Lazy-loaded images and non-critical assets.
- Replaced a couple of tiny client-side widgets with simpler HTML/CSS where possible.
- Kept the contact form and any UI that needs interaction as small, focused React components.

I’ll admit it wasn’t flawless on the first pass — I broke layout styles once and had to tidy up a few imports — but those were small fixes compared to the perf gains.

---

## Next.js still has a place

Next.js is an excellent tool. I use it for apps where I need routing, server-side logic, or lots of client-side state. This switch wasn’t a knock against Next.js — it was a fit-for-purpose decision.

Astro let me keep the best parts of React where they mattered, and drop the heavy defaults where they didn’t. That’s the key: choose the tool that fits the job.

---

## Results

- Pages feel much faster to me and to visitors.
- Less JavaScript shipped means fewer things to break.
- Lighthouse and search previews improved (I noticed fewer long tasks and faster first contentful paint).
- The codebase is simpler and easier to reason about.

---

## Final thoughts

If your project is mostly static content — a portfolio, docs, a small marketing site — consider whether you actually need a full app framework. Sometimes the fastest path to a better experience is to remove complexity, not add tooling.

If you’re curious about trying Astro, start small: convert one page, move one interactive widget to an island, and measure. You might be surprised how much breathing room you gain by letting the browser do less work up front.
