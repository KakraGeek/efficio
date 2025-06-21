## 🛠️ Feature: Add New Client with Standard Measurements

### 🎯 What We Want to Build

A page at `/app/clients/add` that allows the user to:

- Enter client name, contact, and email

- Input standard measurements (e.g. neck, chest, waist, hip, inseam, etc.)

- Submit and save to database

- Sync later if offline

---

### ✅ Step-by-Step in Cursor

> 🧠 Make sure your project from the `efficio-starter` zip is open in Cursor, with `efficio-vibe-scaffolding.md` nearby.

---

#### 1. **Create the Page File**

Go to Cursor's Command Bar or file browser and create:

```
swift
CopyEdit
/app/clients/add/page.tsx
```

Then type this prompt in the file:

```
tsx
CopyEdit
// @cursor: Build a mobile-first client registration form.
// The form should include:
// - Name, Phone, Email
// - Standard clothing measurements (neck, chest, bust, waist, hips, thigh, inseam, arm length)
// - Text area for special notes
// - Save button that calls a tRPC mutation
// Use shadcn/ui components and Tailwind. Ensure good spacing and section headers.
```

Press `Enter` or `Run`, and Cursor will scaffold the UI.

---

#### 2. **Create the Form Validation Schema**

Create the Zod schema in `/lib/validations/client.ts` or `/lib/validators/clientSchema.ts`

```
ts
CopyEdit
// @cursor: Define a Zod schema for the client form including all measurement fields.
```

---

#### 3. **Generate the Backend tRPC Route**

Go to `server/api/routers/clients.ts` (or create it) and prompt:

```
ts
CopyEdit
// @cursor: Add a tRPC mutation `addClient` that accepts the client form input and saves it to the Drizzle PostgreSQL table `clients`.
// Assume offline support is managed in the frontend with IndexedDB or localStorage.
```

---

#### 4. **Connect Frontend to Backend**

Back in `/app/clients/add/page.tsx`, you can now prompt:

```
tsx
CopyEdit
// @cursor: Hook up the submit button to call `api.clients.addClient.useMutation()`
// Show success or error message on response. Disable button when submitting.
```

---

#### 5. **Test and Refine**

Run `npm run dev`, go to `http://localhost:3000/app/clients/add`, and test the form.

---

### 🔁 Bonus: Make It Work Offline

Later, you can enhance offline support by prompting:

```
tsx
CopyEdit
// @cursor: If the user is offline, save the form data to localStorage with a `syncStatus: 'pending'`
// When back online, sync the data to the server.
```
