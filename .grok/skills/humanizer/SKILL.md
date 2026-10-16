---
name: humanizer
description: >
  Crosscheck user-visible prose for AI-writing tells and rewrite only the lines that
  fail, keeping specific facts and a plain voice. Use when the user says humanizer,
  AI slop, Wikipedia signs of AI writing, WP:AISIGNS, or asks to make site or README
  copy sound like a person. Slash command: /humanizer.
---

# Humanizer

Checklist distilled from [Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) (WP:AISIGNS). The page is descriptive. A hit is a lead, not a verdict. Do not paste that article into a file, and do not "fix" a tell by swapping in a synonym from the same list.

## When to run

Run this on text a visitor, a recruiter, or a repo reader sees: page copy, captions, tips, the README, and commit messages you are about to write. Skip tests, lockfiles, generated bundles, and vendor trees.

## Pass 1: inventory

Collect the strings. Note the file and the fact each sentence is allowed to say. If a fact is not already in the repo, do not add it.

## Pass 2: score

Flag a line only when a pattern below is doing the work of the sentence. One ordinary word is not a hit.

- Significance padding: stands as, testament, pivotal, crucial, underscores, highlights its importance, reflects a broader, setting the stage, evolving landscape, indelible, deeply rooted.
- Notability padding: independent coverage, featured in, active social media presence, written by a leading expert, when the sentence is about the outlet instead of the work.
- Trailing participle: highlighting, ensuring, reflecting, contributing to, fostering, showcasing, encompassing, tacked on to sound analytical.
- Ad copy: boasts, vibrant, rich, profound, groundbreaking, renowned, nestled, in the heart of, diverse array, commitment to.
- Vague link: associated with, in connection with, when a plain verb would name the relationship.
- Weasel: experts argue, observers have cited, some critics, several sources, when the page has one source.
- Formula sections: Despite these challenges, Future outlook, Awards and recognition, In conclusion, Overall.
- Copula dodge: serves as, stands as, functions as, represents a, boasts a, when "is" or "has" is the true verb.
- Contrast costume: not just X but Y, it is not X it is Y, rather than, used to sound deep. A real correction stays ("this is not a Google login").
- Rule of three: adjective, adjective, and adjective, or three equal clauses, where a person would stop at one.
- Vocabulary pile: additionally, delve, intricate, tapestry, meticulous, pivotal, underscore, robust, vibrant, foster, leverage, showcase, align with, garner. Later models also pile challenge, multifaceted, practical, prioritize, quietly, steady.
- Emphasis machinery: bold on every term, emoji as bullets, title case on every heading, a heading that only contains headings.
- Chat residue: Certainly, I hope this helps, as an AI language model, would you like, based on available information, while specific details are limited.
- Placeholder: [Name], Add your URL here, 2025-xx-xx.
- Markup leak: Markdown links or headings inside a site that is not Markdown, citation tokens, utm_source=chatgpt.com.

Ignore, on their own: correct grammar, a formal sentence, one transition word, a missing citation, an em dash in a repo that already bans them, curly quotes from a phone.

## Pass 3: rewrite

Change the flagged line. Leave the clean neighbors.

- Keep the names, dates, numbers, and tools. Do not promote a fact into a legacy.
- Prefer a short sentence with "is" or "has". Vary the length. One specific detail beats three adjectives.
- A list is for items a person would scan. Prose is for a sequence. Do not turn a paragraph into bold-label bullets.
- Translations of a changed string change with it. Do not add a second key for the same line.
- Read the new line back. If it could describe a different person or project, it is still slop. Rewrite again or restore the original.

## Report

Lead with what you changed and why. Then list the files you read and left alone, in one short group. Do not print a score for every sentence.
