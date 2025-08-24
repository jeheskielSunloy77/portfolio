---
title: How I Made My Portfolio Load Faster Than My Attention Span 🏃‍♂️💨
publishedAt: 2025-05-24
description: I rebuilt my portfolio website from Next.js to Astro.js and got a massive performance boost. Next.js is amazing for web applications, but for a static site like my portfolio, Astro delivers blazing-fast load times, better SEO, and a leaner codebase—while still letting me use React for interactive components.
tags: ['astro', 'nextjs', 'react', 'performance', 'seo']
keywords: 'astro js portfolio, astro vs nextjs, astro performance, nextjs static site, react with astro, astro seo boost, astro islands architecture, astro site speed, astro for portfolio, nextjs alternatives'
readTime: 5
lang: en
related: ['redesigning-my-portfolio-making-space-for-what-matters']
---

If you’ve ever built a portfolio as a developer, you probably know the cycle: you want it to look cool, show off your skills, and maybe sneak in some fancy animations ✨. For the past couple of years, I’ve always reached for **Next.js** whenever I needed to build something—portfolio, dashboard, app, you name it.

But here’s the thing… **Next.js is amazing for building web applications** (think dashboards, SaaS products, etc.), but my portfolio? It’s basically a bunch of static pages that _almost never change_. Using a full-blown web app framework for a mostly-static site was kinda like bringing a rocket launcher to a pillow fight. 🚀🪶

So I decided to rebuild my portfolio using **Astro.js**—and wow. The performance boost was massive. Pages are now _blazing fast_, my Lighthouse scores are glowing green, and SEO finally stopped yelling at me.

---

## Why Astro.js?

Astro has this cool idea called **“Islands Architecture”**. Basically, it ships _almost no JavaScript_ by default. Everything is static HTML until you explicitly tell Astro, “Hey, this part should be interactive.”

That means:

- **Super lightweight pages** 🪶
- **Better SEO** because Google crawlers love static HTML 🕷️
- **Faster loads** because your browser isn’t choking on unnecessary JavaScript

For a portfolio site (which is 95% static content), this is _perfect_.

---

## But I Still Love Next.js ❤️

Don’t get me wrong—Next.js is still one of my favorite tools. I use it for actual apps where I need routing, server-side rendering, API routes, etc. In fact, even on my new Astro portfolio, I’m still using **React components** for client-side interactivity. Astro makes it super easy to sprinkle React (or even Vue/Svelte/Solid) wherever you need it.

So it’s not about “Astro vs Next.js” — it’s more about **picking the right tool for the job**. My portfolio just didn’t need all the heavyweight app features that Next.js brings.

---

## The Results 🚀

- Page load is almost instant (seriously, blink and you’ll miss it).
- My SEO score went way up (Google finally likes me 👀).
- My Lighthouse performance score hit 💯 (chef’s kiss 👨‍🍳💋).
- I feel better knowing my site isn’t over-engineered for what it needs to do.

---

## Final Thoughts

As devs, it’s easy to default to the frameworks we’re most comfortable with. For me, that was always Next.js. But sometimes, stepping back and asking _“What does this project really need?”_ can give you better results—and teach you something new along the way.

👉 So if you’re building something mostly static, give **Astro.js** a try. Your users (and your Lighthouse scores) will thank you.
