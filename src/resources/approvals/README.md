# Approvals

Notes for future contributors:

- UI constants (select options) for this resource live in `./constants.ts`:
  - `approvalStatusOptions`
  - `entityTypeOptions`

- Color / theme utilities are centralized in `src/theme/tokens.ts`:
  - Use `getStatusColor(status)` and `getEntityTypeColor(entityType)` to keep colors consistent across the app.

- Why centralize?
  - Keeps theme decisions in one place for consistent UX and easier testing.
  - Avoid duplication across components.

- If you add new status values or entity types, update both the enum (`src/types/enums.ts`) and the helpers in `src/theme/tokens.ts`.
