---
layout: portfolio-page
title: "Isolation-Based Scene Generation"
blurb: "My senior thesis describing a synthetic data generation method for training machine-learning object detectors."
platform: "Tensorflow"
work: "Research, experimentation, and writing"
when: "2018-19"
order: 7
tags: portfolio
thumbnail: "https://files.jameslittle.me/images/tmp/ibsg-thumb.png"
date: 2019-05-01
---

My senior thesis built on some of the [RoboCup](https://robocup.bowdoin.edu) work I had done as a Freshman and Sophomore. One previous team captain had tried (with limited success) to write an algorithm to detect the [league's](https://spl.robocup.org/) new soccer ball, which was black and white instead of orange, and could not be detected using image color segmentation alone.

We had tried using machine learning but quickly ran into the issue of getting a training dataset. My thesis worked to formalize a method for generating training images and tried to argue that, in this scenario, synthetic training data would be nearly as effective as real training data.

<img src="https://files.jameslittle.me/images/tmp/isolations-highlighted.png" class="portfolio-image-small">

This project aimed to solve the problem of not having enough training data by defining and exploring the use cases for a synthetic data generation methodology. This methodology would let researchers with limited resources build a dataset that could be used to train object detectors for audio-visual purposes. The methodology, called Isolation-Based Scene Generation (IBSG), involved identifying and extracting key “ingredients” in the dataset and computationally compositing these ingredients to create artificial, automatically classified scenes. 

<img src="https://files.jameslittle.me/images/tmp/isolations-extracted.png" class="portfolio-image-small">

<img src="https://files.jameslittle.me/images/tmp/isolations-combined.png" class="portfolio-image-small">

We trained Tensorflow-based neural networks with hand-labeled, real-world-collected data and trained similar networks with IBSG data that has been designed to mimic that real data. We then compared the accuracy of those neural nets using a real data test set on both the IBSG-trained models and the real-trained models. Finally, we explored if and when ISBG is an appropriate replacement for real data, and make suggestions on how ISBG datasets should be created and designed.

A paper based on the thesis was submitted to the 2019 Conference on Neural Information Processing Systems (NIPS).

For more information, see the project's website at [https://ibsg.jameslittle.me](https://ibsg.jameslittle.me).