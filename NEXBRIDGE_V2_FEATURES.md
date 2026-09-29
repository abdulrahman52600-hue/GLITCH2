# NexBridge V2 — Evidence-First Hiring Layer

This iteration keeps the existing NexBridge UI and adds the product differentiators discussed for the SIH demo.

## 1. Skill Passport

Student-facing capability profile with three views:
- **Skill Passport:** separates self-declared skills from server-verified skills.
- **Skill Gap Analyzer:** compares verified capability against real sprint requirements and identifies exact gaps.
- **Work Reputation:** surfaces completed sprints, employer rating, delivery evidence, and assessment evidence.

The page is intentionally evidence-first: a profile claim is not presented as equivalent to an assessment-backed verification.

## 2. Employer Talent Radar

Company-facing talent discovery view:
- Choose an actual NexBridge sprint/project.
- Filter to candidates with verified evidence.
- Filter by proficiency level.
- See requirement coverage and the exact verified skills behind the match.
- Open **Prove It** to show a safe proof-of-work summary without exposing assessment answers.

## 3. Explainable matching

Instead of only showing a percentage, the new UI explains:
- which required skills are verified;
- verification score and proficiency;
- which required skills are still gaps;
- relevant work-history evidence.

## 4. Existing verification flow remains the source of truth

The existing assessment engine continues to issue verified skills server-side. Client profile edits do not replace the verified record.

## 5. Demo positioning

Recommended SIH narrative:

**Assess → Verify → Match → Work → Validate → Grow**

NexBridge is positioned as an evidence-backed micro-internship matching platform rather than a generic internship listing board.

## Validation

- Server JavaScript syntax checks: passed.
- Client production build: not completed in this environment because the dependency installation timed out and the resulting `node_modules` tree was incomplete (`vite` was unavailable). No claim of a full browser/build validation is made.
