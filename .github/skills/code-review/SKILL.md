# Code Review Skill

## Purpose

Review GitHub pull requests for correctness, maintainability, security, and test coverage.

## Review Rules

When reviewing code:

1. Focus on bugs, regressions, security issues, and incorrect behavior.
2. Prioritize findings by severity:

   * **Critical** — security vulnerabilities, data loss, broken production behavior.
   * **High** — likely bugs or significant correctness issues.
   * **Medium** — maintainability or reliability problems worth fixing.
   * **Low** — minor improvements or style issues.
3. Do not comment on formatting or style unless it affects readability or project conventions.
4. Prefer specific, actionable feedback over general criticism.
5. Include the affected file/line when possible.
6. Do not suggest changes without explaining the underlying problem.
7. Check whether tests cover important new or changed behavior.
8. Avoid speculative findings. Only report issues supported by the code or repository context.

## Output Format

For each finding:

**[Severity] Title**

* **Location:** `path/to/file:line`
* **Problem:** What is wrong and why it matters.
* **Suggestion:** A concise fix or next step.

If no significant issues are found, respond:

> No significant issues found. I reviewed correctness, security, maintainability, and test coverage.
