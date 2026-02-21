---
name: browser-testing
description: Browser automation and visual testing using Antigravity's browser_subagent
---

# Browser Testing

Use Antigravity's `browser_subagent` tool for browser-based testing, visual verification, and UI interaction recording.

## When to Activate

- Testing web applications
- Verifying UI changes visually
- Automating browser interactions
- Recording user flow demonstrations

## Core Patterns

### Navigation and Interaction

Always provide clear, specific tasks to `browser_subagent`:

```
browser_subagent(
  TaskName: "Verify Login Flow",
  Task: "1. Navigate to http://localhost:3000/login
         2. Type 'testuser' into the username field
         3. Type 'password123' into the password field
         4. Click the 'Sign In' button
         5. Verify the page shows 'Welcome, testuser'
         6. Return whether the login was successful",
  RecordingName: "login_flow_test"
)
```

### Task Design Principles

1. **Be explicit**: Specify exact URLs, selectors, text to type
2. **Define success**: Tell the subagent exactly what "success" looks like
3. **Request return values**: Ask for specific information to be returned
4. **Name recordings**: Use descriptive `RecordingName` (lowercase, underscores, max 3 words)

### Visual Verification

After making UI changes, verify visually:
1. Start the dev server via `run_command` (background)
2. Use `browser_subagent` to navigate to the changed page
3. Check for layout, styling, content correctness
4. Recordings are saved as WebP videos automatically

### Common Tasks

| Task | Pattern |
|------|---------|
| Fill a form | Specify each field + value + submit action |
| Check responsive layout | Resize browser, check element visibility |
| Test navigation | Click links, verify URL changes |
| Verify error states | Submit invalid data, check error messages |
| Record a demo | Walk through a user flow, name the recording |

## Tips

- Always wait for page loads (the subagent handles this)
- If an element isn't found, try alternative selectors
- For SPAs, wait for content to render after navigation
- Maximize parallel: start dev server in background, THEN launch browser tests
