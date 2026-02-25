# API Refactor Plan (Rails Way + Best Practices)

Project-specific roadmap aligned with Rails Way. Each item includes problem, goal, concrete actions, and definition of done. Prioritized from most critical to least critical.

## 1) Authentication & Session (PRIORITY: VERY HIGH)
**Problem:** Authentication flow is inconsistent and may conflict with default helpers.
**Goal:** A single, predictable, secure auth path — Devise is the source of truth.

**Actions**
- Remove overrides that conflict with Devise's authentication mechanism.
- Centralize `current_user` and `authenticate_user!` into one unified flow.
- Review login/logout to ensure session behavior is consistent.

**Done when**
- Login/logout works across all endpoints.
- `current_user` always comes from the same source.
- Auth tests pass without inconsistent mocks.

---

## 2) Error Handling (PRIORITY: HIGH)
**Problem:** Error responses vary by controller; there is no single standard.
**Goal:** Predictable, consistent error responses.

**Actions**
- Define a standard response shape: `{ error: { code, message, details } }`.
- Centralize `rescue_from` for common errors (not found, validation, authorization).
- Ensure correct HTTP status codes across all actions.

**Done when**
- All errors return the same JSON format.
- HTTP statuses and messages are consistent everywhere.

---

## 3) RESTful Routes (PRIORITY: HIGH)
**Problem:** Custom endpoints drift from REST conventions.
**Goal:** Idiomatic routes that are easy to maintain.

**Actions**
- Migrate to `resources` wherever possible.
- Remove verbs from paths and align to standard REST actions.
- Clearly document unavoidable exceptions.

**Done when**
- Main routes follow resource-based REST patterns.
- Documentation reflects the final routing standard.

---

## 4) Services (PRIORITY: MEDIUM)
**Problem:** Services are inconsistent in naming and structure.
**Goal:** One predictable service pattern.

**Actions**
- Move services to `app/services`.
- Rename to singular (e.g., `CreateDiaryService`).
- Adopt a standard interface: `call` + consistent result (`success?`, `errors`, `payload`).

**Done when**
- All services share the same folder location, naming rules, and interface.

---

## 5) Models & Business Rules (PRIORITY: MEDIUM)
**Problem:** Long methods and non-idiomatic validations.
**Goal:** Smaller, more testable models.

**Actions**
- Split long methods into validators / smaller methods.
- Remove timestamp validations.
- Use `enum` for status fields.

**Done when**
- Complex logic is split into smaller, testable units.
- Validations reflect only business rules.

---

## 6) Controllers & JSON Responses (PRIORITY: MEDIUM)
**Problem:** Controllers contain too much logic and render inconsistently.
**Goal:** Thin, standardized controllers.

**Actions**
- Controllers should orchestrate only (call services/queries).
- Responses should follow one JSON format.
- Avoid rendering in callbacks without an explicit `return`.

**Done when**
- Controllers are simple and consistent.
- JSON responses follow the same schema everywhere.

---

## 7) Tests & CI (PRIORITY: MEDIUM)
**Problem:** Partial coverage and CI differs from the real local runner.
**Goal:** Reliable, fast feedback.

**Actions**
- Ensure CI runs the same test runner used locally.
- Add specs for services and request specs.
- Cover critical flows (auth, main CRUD, errors).
- Align specs with Better Specs best practices for readability, intent, and safety.

**Done when**
- CI passes with the same suite used locally.
- Critical flows are covered by tests.
- Specs follow Better Specs guidance (clear contexts, minimal stubs, behavior-first).

---

## 8) Infrastructure & Configuration (PRIORITY: LOW)
**Problem:** Small mismatches between local and Docker config.
**Goal:** Predictable setup.

**Actions**
- Align DB configs with the container environment.
- Ensure CORS is correct for external consumers.

**Done when**
- Local environment boots without manual tweaks.

---

## 9) Documentation (PRIORITY: LOW)
**Problem:** README lacks a practical guide.
**Goal:** Fast onboarding.

**Actions**
- Add setup steps, essential commands, and request examples.
- List key endpoints and basic flows.

**Done when**
- A new developer can run and test the project in a few minutes.

---

## Evaluation Checklist (OK / Medium / Bad)
1. Authentication & session
2. Error handling
3. RESTful routes
4. Services
5. Models & business rules
6. Controllers & JSON
7. Tests & CI
8. Infrastructure & configuration
9. Documentation

---

## Expected Outcome
- More idiomatic and predictable code aligned with Rails Way.
- Less duplication and lower controller complexity.
- Business rules isolated and testable.
- A consistent, consumer-friendly API
