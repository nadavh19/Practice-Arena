# `use-profile-form` explanation

This explains [`app/(protected)/profile/hooks/use-profile-form.ts`](/C:/Users/nadav/Documents/Afeka/final_project/practice-arena/practice-arena/app/(protected)/profile/hooks/use-profile-form.ts:1) in two ways:

1. very simply, like you are 5
2. then each part in detail so the logic is clear

## Like you're 5

Think of `use-profile-form.ts` like a little helper robot for the profile page.

The page says:
"Robot, please remember what the user typed, go get the old profile from the server, tell me when we are loading, tell me if something went wrong, and save the form when the user clicks submit."

So this file is not the screen itself. It is the brain behind the screen.

Imagine a paper form with 3 boxes:

- nickname
- level
- goals

This hook is the grown-up holding the clipboard.

It does 4 jobs:

- remembers what is inside the boxes
- fetches the old answers when the page opens
- checks if the answers make sense
- sends the answers back to the server when you save

The page component just draws the boxes.  
This hook handles the thinking.

## Detailed explanation

### `"use client";`

At line 1, this tells Next.js that the file must run in the browser.

Why?
Because it uses React hooks like `useState` and `useEffect`, which are used for interactive client-side behavior.

### React imports

At line 3:

```ts
import { useEffect, useState, type FormEvent } from "react";
```

This imports:

- `useState`: stores changing values
- `useEffect`: runs code after the component appears
- `FormEvent`: the type for a form submit event

### API imports

At line 4:

```ts
import { apiGet, apiPost } from "@/lib/client/api-client";
```

These are helpers for talking to the backend:

- `apiGet` gets data
- `apiPost` sends data

### Type imports

At line 5:

```ts
import type { UserLevel, UserProfile } from "@/lib/client/types";
```

These tell TypeScript what kind of data this hook expects.

### `ProfileFormState`

At lines 7-11:

```ts
type ProfileFormState = {
  goals: string;
  level: UserLevel;
  nickname: string;
};
```

This defines the shape of the local form state.

That means the form always looks like:

```ts
{
  goals: "...",
  level: "beginner" | "intermediate" | "advanced",
  nickname: "..."
}
```

### `useProfileForm()`

At line 13:

```ts
export function useProfileForm() {
```

This is a custom React hook.

A custom hook is a function that contains React state and logic that can be reused cleanly by a component.

The profile page calls this hook to get everything it needs.

## State inside the hook

### `form`

At lines 14-18:

```ts
const [form, setForm] = useState<ProfileFormState>({
  goals: "",
  level: "beginner",
  nickname: "",
});
```

This stores the current form values.

At first, the form starts empty:

- `goals = ""`
- `level = "beginner"`
- `nickname = ""`

Later, when the profile is loaded from the server, this state gets replaced with real values.

### `loading`

At line 19:

```ts
const [loading, setLoading] = useState(true);
```

This tracks whether the hook is still fetching the existing profile from the server.

It starts as `true` because the page begins by loading data.

### `saving`

At line 20:

```ts
const [saving, setSaving] = useState(false);
```

This tracks whether the form is currently being submitted.

The UI can use it to:

- disable the submit button
- show `Saving...`

### `error`

At line 21:

```ts
const [error, setError] = useState<string | null>(null);
```

This stores an error message when something goes wrong.

Examples:

- fetch failed
- validation failed
- save failed

`null` means there is no error right now.

### `successMessage`

At line 22:

```ts
const [successMessage, setSuccessMessage] = useState<string | null>(null);
```

This stores a success message after saving.

Example:

- `"Profile updated."`

## Loading the profile on page load

At lines 24-55:

```ts
useEffect(() => {
  let active = true;
  ...
}, []);
```

This effect runs once when the component mounts.

The empty dependency array `[]` means:
"run once on first render."

### `active`

At line 25:

```ts
let active = true;
```

This is a safety flag.

It protects against updating React state after the component has already disappeared.

If the component unmounts before the request finishes, the flag gets turned off.

### `loadProfile()`

At line 27:

```ts
async function loadProfile() {
```

This function performs the actual fetch.

### Start loading

At lines 28-29:

```ts
setLoading(true);
setError(null);
```

This means:

- show loading state
- clear old errors before trying again

### Request profile data

At line 30:

```ts
const result = await apiGet<UserProfile>("/api/profile");
```

This sends a request to the profile API and waits for the response.

The expected response shape is `UserProfile`.

### Check whether the component is still alive

At lines 32-34:

```ts
if (!active) {
  return;
}
```

If the component was unmounted while waiting for the API, stop here.

This avoids unsafe state updates.

### End loading

At line 36:

```ts
setLoading(false);
```

The request is finished, so loading stops.

### Handle request failure

At lines 38-41:

```ts
if (!result.success) {
  setError(result.error.message);
  return;
}
```

If the API returned an error:

- store the error message
- stop the function

### Fill the form with real profile data

At lines 43-47:

```ts
setForm({
  goals: result.data.goals,
  level: result.data.level,
  nickname: result.data.nickname ?? "",
});
```

If the request worked:

- copy `goals` from the server
- copy `level` from the server
- copy `nickname`, but turn `null` into `""`

That last part matters because form inputs usually want a string, not `null`.

### Start the async loader

At line 50:

```ts
void loadProfile();
```

This calls the async function.

The `void` means:
"I know this returns a promise, and I am intentionally not using that promise here."

### Cleanup

At lines 52-54:

```ts
return () => {
  active = false;
};
```

This cleanup runs when the component unmounts.

It flips `active` to `false`, so late async responses are ignored.

## Handling form submit

At lines 57-88:

```ts
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
```

This runs when the form is submitted.

### Stop the browser's default form submit

At line 58:

```ts
event.preventDefault();
```

Normally, form submission refreshes the whole page.

This stops that so React can handle submission itself.

### Clear old messages

At lines 59-60:

```ts
setSuccessMessage(null);
setError(null);
```

This resets old UI feedback before validating and saving again.

### Validate goals

At lines 62-65:

```ts
if (!form.goals.trim()) {
  setError("Goals are required.");
  return;
}
```

`trim()` removes spaces from the beginning and end.

That means:

- `"practice chords"` is valid
- `"   "` becomes empty and is invalid

If the field is effectively empty, the hook sets an error and stops.

### Validate nickname

At lines 67-71:

```ts
const nickname = form.nickname.trim();
if (nickname.length > 0 && nickname.length < 2) {
  setError("Nickname must be at least 2 characters if provided.");
  return;
}
```

This means:

- empty nickname is allowed
- nickname with 1 character is not allowed
- nickname with 2 or more characters is allowed

### Begin save request

At line 73:

```ts
setSaving(true);
```

This marks the UI as actively saving.

### Send the cleaned data

At lines 74-79:

```ts
const result = await apiPost<UserProfile>("/api/profile", {
  goals: form.goals.trim(),
  instrument: "guitar",
  level: form.level,
  nickname: nickname.length === 0 ? null : nickname,
});
```

This sends the final cleaned payload to the server.

Important details:

- goals are trimmed before saving
- level is sent as chosen
- instrument is fixed to `"guitar"`
- nickname becomes `null` if the field is empty

That `nickname` rule means:

- empty string in the form becomes `null` in the API
- real text stays real text

### End saving state

At line 80:

```ts
setSaving(false);
```

The request finished, so saving is over.

### Handle save failure

At lines 82-85:

```ts
if (!result.success) {
  setError(result.error.message);
  return;
}
```

If the API rejected the save:

- store the error message
- stop

### Handle save success

At line 87:

```ts
setSuccessMessage("Profile updated.");
```

If the request worked, show a success message.

## What the hook returns

At lines 90-98:

```ts
return {
  error,
  form,
  handleSubmit,
  loading,
  saving,
  setForm,
  successMessage,
};
```

This is the public interface of the hook.

The page that uses it gets:

- `form`: the current input values
- `setForm`: a way to update the values
- `loading`: whether the initial profile is still loading
- `saving`: whether a save request is in progress
- `error`: any current error message
- `successMessage`: the success message after saving
- `handleSubmit`: the function to run when the form is submitted

## One-sentence summary

`useProfileForm()` loads the current profile into the form, remembers edits, validates the input, sends updates to the API, and tells the page whether it is loading, saving, successful, or in an error state.

## Why this hook exists

This keeps the profile page cleaner by separating:

- UI rendering in the page/component
- data fetching and form logic in the hook

That makes the code easier to read, reuse, and change later.
