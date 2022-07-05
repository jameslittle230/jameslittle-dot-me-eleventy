---
title: "Some angst around modern JS frameworks"
date: 2022-07-04
layout: post
tags: post
blurb: "I don't think I really get the new wave JS frameworks. I think they produce build artifacts that are optimized for the wrong thing."
---

I don't think I really _get_ the new wave JS frameworks (namely Remix.run and Next.js, but Gatsby might fit there too, if it's still relevant).

I'm trying to balance my thoughts against being all "old man yells at cloud" here, but either these frameworks are way overcomplicating things, or they're skating to where the puck is going to be, and I'm not there yet.

What wigs me out about these frameworks is that they don't really let you see what's going on with the server side of things. You write some React code, then deploy it to some third party service that's built on top of Lambda functions + a CDN, and then... you have a website. Good luck peeking under the hood to see what code is running where, because these cloud services won't show you the actual service it's hosting for you, and it's all minified Javascript anyway.

I wish that these frameworks would build a client bundle and a server bundle locally, and I could decide what to do with them. Like, maybe I could upload them both to some sort of VPS, set up nginx in the right way, and have myself a mostly-static site and a backend type thing, both derived from the same React-ish source code. Or I could upload both to Netlify or Vercel and get all the global distribution and caching that their infrastructure handles. But as it stands, none of these frameworks want you to think too hard about what happens between pushing to your Git remote and when they deploy your stuff, because they're doing a ton of optimization in between in the name of speed.

I think when I first started using them I was surprised that there needed to be any server deployments at all? I shouldn't need any Lambda functions to run a static site, and I don't think the feature that replaces all links with Javascript that replaces one page's DOM with another page's DOM is worth needing a whole backend. I know it makes the website faster, but still.

These frameworks have powerful enough marketing arms (and sparse enough documentation) that I also can't figure out if either one is _meant for me_ or not. When I run into rough edges, nothing is there to tell me that I'm doing something wrong or that they just haven't put enough work into that part of the framework or that I'm just not the type of website builder that they're trying to capture in their potential market, because nothing incentivizes the people building these frameworks to write documentation discouraging people from using them.

I've been spending some time working on a redesign of this site, and I'm happy with the visual language I've put together, but I'm not really excited about building it out in any of the [templating languages available to me in Eleventy](https://www.11ty.dev/docs/languages/)—I like the idea of building out my UI in React/JSX, and having the framework know what can be server-side-rendered and what it should hydrate on the client. But it seems like once you want that, you have to deal with the server-side mystery meat of the new wave JS frameworks.
