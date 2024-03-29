---
layout: talk.njk
slides:
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.001.jpeg
    caption: Thanks for coming to my talk!
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.002.jpeg
    caption:
      I work at Stripe, in San Francisco doing client-side engineering. I'm a
      recovering college newspaper designer & web developer; I was on the staff of the
      college newspaper doing graphic design, but ultimately I ended up rebuilding their
      website. As a general rule, I'm pretty obsessed with the web as a document & application
      platform.
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.003.jpeg
    caption:
      When I was on the staff of the college newspaper, I spent a lot of time
      in this room putting together its website. For a few weeks, I ended up thinking
      a lot about the site's search box.
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.004.jpeg
    caption:
      "Search is an essential feature: It was the only way our editors found
      articles about things that happened in the past. I spent a lot of time trying
      to figure out something that worked: Algolia, Wordpress search, or something else.
      I ended up realizing that search is only a solved problem if you’re willing to
      run a server (or have someone else run a server for you) and host a search API
      over HTTP. But running servers is hard. Maintenance is difficult, esp. for a group
      of college students interested in journalism. It's another service whose downtime
      we have to worry about. And farming search off to a third party service is a tough
      sell: it's expensive, and there's still a lot of configuration that we'd have
      to do. Ultimately we stuck a Google Custom search box on the page and shipped
      it, despite the weird UI. Why? Two reasons: first, there's no configuration or
      manual upload-your-articles process - Google indexed everything. Second, it's
      easy to understand: it's an iframe that lives in the frontend."
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.005.jpeg
    caption:
      I came up with some realizations when I was sitting in that room trying
      to build a search bar for our website:<br><ul><li>Content updates about once per
      week</li><li>There’s a finite amount of content, all with similar keywords</li><li>No
      institutional knowledge</li><li>There are lots of sites that fit this description
      - are they struggling with search too?</li></ul>
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.006.jpeg
    caption:
      At the same time I was thinking about search for that website, a few things
      happened. First, WebAssembly became an easier compilation target, so everyone
      started talking about it. Next, Netlify grew in popularity, making a “free tier
      for CDNs” available to the world. Finally, I listened to a podcast episode about
      how someone else implemented full-text search and realized it wasn’t impossible.
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.007.jpeg
    caption:
      "So I had a big idea: I can generate a search index out of band, then load
      it onto a webpage like an image, then use WebAssembly to run the search. And of
      course, like all big ideas, I had this one in the shower."
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.008.jpeg
    caption:
      What does it mean to "load a search index onto a page like an image?" There
      are some similarities between images and the search index files that Stork generates,
      and a search web plugin can be successful if it treats these similarities as principles.
      (There was a fun feigned surprise here, but it doesn't translate well over text).
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.009.jpeg
    caption: ""
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.010.jpeg
    caption:
      I've built <a href="https://stork-search.net">Stork Search</a>. It's the
      open source search product I wish had existed when I started out.<br><br>The cool
      thing about building it myself is that I can run the project the way I think it
      should be run. I publish the project roadmap on the website, so people can quickly
      determine if it's useful for them or not. I inject humanity into the documentation.
      I can develop it at the pace and quality level I think would bring most value
      to the world, and often I spend more time to make it better than other people
      might.
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.011.jpeg
    caption: ""
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.012.jpeg
    caption:
      This is an interactive slide that showed how you build a configuration
      file and generate a search index from a folder of blog posts.
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.013.jpeg
    caption:
      This is part two of the interactive slide, which shows how you can FTP
      that configuration file to your web server and make a little webpage with a search
      interface for those blog posts.
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.014.jpeg
    caption:
      'And there''s a demo of that webpage! I played with it live during the
      talk, but now you can play with it yourself: <a href="https://codepen.io/pen/MWbxagZ">https://codepen.io/pen/MWbxagZ</a>'
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.015.jpeg
    caption: ""
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.016.jpeg
    caption:
      The core is in Rust. The Rust program compiles to both a binary and a WASM
      blob—I actually chose Rust because at the time, Rust and Go were the two languages
      that could easily compile to WASM and I was more eager to learn Rust and join
      the Rust community.<br><br>In addition to the Rust code, there's a smallish Javascript
      shim code layer that web developers actually interact with. It that handles loading
      the WASM, loading the index, and attaching to the "dumb" DOM elements to make
      them interactive.
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.017.jpeg
    caption:
      "Here's a rough diagram that defines the architecture of the codebase.
      There's a core API, which interacts with queries and returns search results.
      This core API is all modeled via shared models that never change. The index itself
      is a big serialized data structure, and Stork supports different index versions
      for backwards compatibility. Finally, there are two APIs on top of the core models:
      the WASM and the command line tool. Two different compilation targets for the
      same codebase."
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.018.jpeg
    caption:
      This is a diagram that shows the search index's data structure. The index
      stores "entries" and "queries", where entries are the full text of the documents
      that get indexed. Queries are a reverse hash map of all the extracted words in
      all of those documents, pointing to the entry and word index where that word appears.
      The queries map also contains aliases, which are used to redirect the search algorithm
      to a set of words that exist in the corpus. The search algorithm does a lot of
      deduplication when taking results from the hash map and building up the search
      results.
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.019.jpeg
    caption:
      The Javascript library seems trivial, but the complexity lies in the three
      things it's doing, all of which are asynchronous. First, it's loading the WASM
      blob. Second, it's loading the index file. Third, it's waiting for the DOM to
      be available and taking over the specified DOM elements. When the WASM is loaded
      and the index file is fetched, Stork can begin resolving search queries, but the
      DOM has to be responsive before that, and has to display failures properly.
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.020.jpeg
    caption: What's next?
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.021.jpeg
    caption:
      'I see Stork as a <a href="https://destroytoday.com/blog/exploring-a-modern-cushion">Lifetime
      Project</a>, where progress doesn''t have to be fast. That gives me the time to
      think through product directions and technical design, with the expectation that
      Stork will be something I continuously improve over a long time. That said, I
      do have some goals for the project. Stork should be the "obvious choice" for search
      if you''re building a static-ish site, which mostly means I want to reduce as
      much friction as I can when someone is setting it up or deploying it. It can also
      be a strong contender in other situations, like one search index per SaaS user.
      Finally, I want to skate to where the puck is going: use new web technologies,
      new design, etc. Stork should always feel a little futuristic, almost like it''s
      pushing a boundary.'
  - image: https://files.jameslittle.me/talks/stork-slides/Stork Slides.022.jpeg
    caption: Thanks! You can check out Stork at <a href="https://stork-search.net">https://stork-search.net</a>.
---

# Stork Search

I first gave this talk at a Fission.codes demo day in March 2021. It was recorded - you can see the video here:

<iframe src="https://player.vimeo.com/video/529898007?color=6446FA&portrait=0" width="640" height="289" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
