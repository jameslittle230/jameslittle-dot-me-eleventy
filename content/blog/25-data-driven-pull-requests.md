---
title: "Data Driven Pull Requests"
date: 2022-05-03
layout: post
tags: post
blurb: "My system for running comparative benchmarks for Stork patches, and how it helps make sure Stork moves in the right direction."
---

One of the core values of the [Stork](https://stork-search.net) project is that it respects the end user's experience.

More concretely, this means that:

1. Searches should feel fast,
2. Embedding Stork shouldn't slow down the hosting webpage, and
3. Loading a search index shouldn't take longer than is necessary.

In practice, this requires that, during development, I keep track of certain metrics that affect the end-user experience, making sure they stay at an acceptable level. For example, the size of a search index should be small so that a client can download it quickly and hold less data in memory once it's been loaded. The search algorithm should be fast, so that there isn't latency between typing something into the search box and getting a result. These are the metrics that, in theory, separate Stork from other, similar services and justify using lesser-proven technologies (like Rust compiled to WASM) where, perhaps, something more customary (filtering a JSON blob with Javascript) would have worked instead.

The Stork project, though, has room to improve on nearly every measurable metric. I'd love for Stork in two years to produce smaller index files, perform faster searches, and build indexes faster than it does today. As I make changes, I want to make sure that those metrics are, in general, trending in the right direction.

In this post, I'll describe how I set up the infrastructure to track and display metric changes on a per-pull-request basis, and describe how that infrastructure changes my flow of developing new features.

## Measure what can be measured

The first step to making data-driven pull requests is collecting the data necessary. As of this writing, Stork has two types of metrics: build artifact file sizes, and algorithm speed benchmarks. Here's the data I track:

- Build artifact file sizes
  - The size of `stork.js`
  - The size of `stork.wasm`
  - The size of `federalist.st`, a sample search index built from the federalist papers, with no other config settings customized
- Algorithm speed benchmarks
  - The duration of an end-to-end search for a single word
  - The duration of an index build

[Criterion.rs](https://crates.io/crates/criterion), a benchmark framework for Rust code, runs in CI to measure the algorithm speed benchmarks. Python's `os.path.getsize()` measures the build artifact file sizes.

I've written a script that will run all my tests and output a JSON blob with a single data point for each:

```json
{
  search_duration: 0.25,
  build_duration: 4.1,
  stork_wasm_filesize: 12.82,
  ...
}
```

It's important that this script be able to run in CI successfully for every commit so that I can run this on any arbitrary commit[^1] and get results representative of the state of the world at that moment in Git history. Therefore, I've made it a requirement that this script return successful output in CI for every pull request; if it can't run or doesn't succeed, I treat that as a unit test failure and Github won't let me merge the PR. When combined with a strict "only squash-and-merge allowed" policy, this means that, for every commit on `master`, I can know that I can run my benchmarking script and it will succeed.

## Compare measurements automatically

To understand the impact of a pull request, I want to know how each of my metrics compares before the patch is applied, then after a patch is applied. If I have a PR where I'm trying to shrink the typical index size, no matter how successful I am at shrinking the index it shouldn't be acceptable if it also slows down searches by an order of magnitude.

I've built (er, cobbled together from multiple sources) a script that runs in CI, along with my unit tests and linters, that does the following:

1. Fetches the base SHA for the PR it's acting upon
2. Runs the benchmarking script, ensures it succeeds, and writes its output to a tempfile
3. Checks out the PR's base SHA and recompiles the project
4. Runs the benchmarking script again, ensures it succeeds, and writes its output to a different tempfile
5. Runs a script to compare the JSON blobs in the two tempfiles, determining the percentage change for each of the values
6. Comments on the PR with those percent changes, letting me judge the impact of the PR. (There's some fanciness where it'll update the comment if it sees that it's already commented.)

{% image "data-driven-pull-requests/github-comment.png" %}

You might be asking, "Why does the CI job need to run the script twice? Isn't it already running the script for every commit? Can't it save those values somewhere?"

Good question. For better or for worse, Stork uses Github Actions as its continuous integration service. Running benchmarks on shared machines is unreliable - invoking the same script on the same commit hash can result in wildly different benchmark durations, because the shared machines that Github Actions offers can be under arbitrary amounts of load at a given time. (I've seen the same benchmark on the same git commit vary by a 20% buffer!) Therefore, comparing incoming benchmark values with preexisting benchmark values will be bad science, since I can't isolate all the variables that are going into the benchmark times.

It's not perfect, but I try to isolate for this jitter by running the two comparison benchmarks in direct sequence, on the same machine, during the same Github Actions job. There's still some jitter (you see it in the `1.02x` in the screenshot above), but much less. I also only keep the raw duration values around as a sanity check - I never really perform any action based on those values.

## The impact on Stork's development process

There's a cost to running this system: CI takes much longer for every PR. Even so, I've found it to be "worth it" - these metrics let me create data-driven decisions for each pull request that I wasn't making before. Even though the tools were all available for me to make this comparison on my own, the automatic Github report has changed by development behavior.

With this system in place, I'm much less afraid of experimentation. If I have an idea for an optimization, I'll put up a PR that hacks it together. If one of my metrics goes in a bad direction, I'll know that it's not worth continuing to pursue. I've also started putting up competing PRs that both solve the same problem in different ways, which lets me

I also feel more energy to make optimizations since the impact of my work is made very clear to me. Putting up a PR that reduces search duration by 5% is notable, and it's nicer to anticipate being able to celebrate that when I'm in the throes of algorithm optimization.

## Appendix: How it all works

- [This script runs the benchmarks—both Criterion and filesize—and outputs a JSON object.](https://github.com/jameslittle230/stork/blob/714698991465328fc06cef2654a2cff9d88ce71c/scripts/generate_stats.py)
- [This script compares two JSON objects and generates the HTML for a Github comment.](https://github.com/jameslittle230/stork/blob/714698991465328fc06cef2654a2cff9d88ce71c/scripts/compare_stats.py)
- [This part of my Github Actions file orchestrates the benchmark runs, runs the comparison script, and publishes the Github PR comment.](https://github.com/jameslittle230/stork/blob/714698991465328fc06cef2654a2cff9d88ce71c/.github/workflows/ci-on-push.yml#L122-L159)

[^1]: Any arbitrary commit _after I've added this script_, of course.
