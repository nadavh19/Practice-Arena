# Frontend Task Fields Update

## Summary

The frontend now renders the richer task data added to the database schema. Current sessions and history entries both use a shared task details component so task display stays consistent.

## Updated Pages

- `/session/current` shows full details for every task in the active practice plan.
- `/history` shows full details for every task inside each saved session.

## Reusable Components

- `app/components/tasks/task-details.tsx` renders one `PracticeTask`.
- The component includes reusable internal pieces for metadata badges, labeled text sections, and monospace tab blocks.

## Displayed Fields

The UI displays every non-empty task field available in `PracticeTask`: `name`, `category`, `difficulty`, `duration`, `description`, `instrument`, `key`, `bpm`, `tab`, `chords`, `scale`, `songName`, and `artistName`.

Optional fields are hidden when they are empty or `null`, so tasks do not show blank labels.

## Styling Notes

- Metadata is shown with compact light badges using dark zinc text.
- Descriptions, chords, and scales are shown in bordered white sections with dark text.
- Tabs are shown in a dark monospace block with light text and horizontal scrolling.
- The current-session checkbox row uses a light background and dark text to avoid same-color foreground/background issues.

## Verification

Run:

```bash
npm run build
```

Then verify that `/session/current` and `/history` show the full task details, optional empty fields are hidden, and tab/chord/scale content remains readable on narrow and wide screens.
