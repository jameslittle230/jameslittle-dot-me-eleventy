---
layout: portfolio-page
title: "PenguinEgg: Encrypted Chat"
blurb: "A real-time peer-to-peer encrypted online chat. Built with the goal of being as easy to use as Facebook Messenger is and as secure as Facebook Messenger isn't."
platform: "Web"
work: "Design and implementation"
when: "2018"
order: 5
tags: portfolio
---

_The final project for my Applied Cryptography course at [AIT-Budapest](http://www.ait-budapest.com/)._

I used Socket.io to build a real-time multi-party chat application in which messages were encrypted and signed in the sender's browser, routed by an intermediary server, then verified and decrypted in the reciever's browser. The application uses modern security standards combined with a well-designed secure channel, ensuring that eavesdroppers can never determine message content in transit or at rest, and that malicious actors cannot alter, reroute, or replay messages.

<!-- <img src="/img/portfolio/penguinegg/1.png" class="portfolio-image"> -->

The application sports several security features. The server administrator never has access to messages that users send. Encryption and decryption keys are rotated on every login. The encryption schema is designed to be fast while simultaneously encoding metadata about the sender, reciever, and message, all of which is verifiable on the client's end.

## [Read the paper describing the app's cryptographic features.](https://files.jameslittle.me/projects/penguinegg-paper.pdf)

<!-- <img src="/img/portfolio/penguinegg/2.png" class="portfolio-image-right"> -->

The system is battle tested: as part of the final demonstration, we had to carry out cryptographic attacks on the system, and show that they can be detected or blocked. Users can initiate either a replay attack (sending the same bitstream from to a recipient twice) or a spoofing attack (encoding the sender as a different user than the actual sender). In both cases, the frontend application will detect these attacks, block them from sending, and let the recipient know that the attacks are taking place.