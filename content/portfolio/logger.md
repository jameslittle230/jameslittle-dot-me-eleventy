---
layout: portfolio-page
title: "RoboCup Logger App"
blurb: "This app connects to an Aldebaran Nao robot and streams data from the robots' two cameras to an iPhone. The app decodes bitmap data to save and display the camera's view in real-time."
platform: "iOS"
when: "2016"
tags: portfolio
thumbnail: "https://files.jameslittle.me/images/tmp/logger-thumb.png"
date: 2016-01-01
---

_A final project for Bowdoin's CSCI 2505: Mobile Computing course._

Bowdoin's RoboCup team is a group of computer scientists who program humanoid robots to play soccer autonomously. The robots we use have two cameras on their head that allow them to see their surroundings: one points out towards the field, and another points down at their feet. With those camera images as their main source of input, they use advanced, homegrown computer vision algorithms to detect soccer balls, navigate the soccer field, and avoid running into other robots.

When we debug the robots, we often want to look through the robots' eyes, seeing on our computers what they see in their cameras. We stream the images off the robots in real-time, save them to disk, and use them to debug vision algorithms offline. Previously, collecting camera data involved using a clunky Java program on a laptop computer. Collecting images was a slow process, especially for one person.

This app streamlines the process of collecting image data. It quickly connects users to a robot and immediately starts streaming camera data. It decodes our custom binary file format, creates iOS-compatible images from that binary data, and displays the images onscreen. By holding down a button, users can choose to save the filestream to the phone. Later, users can upload these saved image files to our development server for further testing.