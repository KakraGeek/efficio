### ✅ Step-by-Step: Load the Starter Project in Cursor

1. **Unzip the File**
   - Extract the contents of `efficio-starter.zip` to a folder on your computer, e.g., `efficio-starter`.

2. **Open in Cursor**
   - Launch **Cursor**.

   - Select **“Open Folder”** (or press `Cmd+O` / `Ctrl+O`).

   - Navigate to the unzipped folder `efficio-starter` and open it.

3. **Install Dependencies**
   - Open a terminal in Cursor (or use the built-in terminal).

   - Run:

     ```
     bash
     CopyEdit
     npm install
     ```

     This installs all necessary packages defined in `package.json`.

4. **Set Up Environment Variables**
   - Duplicate the `.env.example` file:

     ```
     bash
     CopyEdit
     cp .env.example .env
     ```

   - Open `.env` and replace placeholders with real API keys and database URLs (or leave as-is for now if testing UI only).

5. **Run the Dev Server**
   - Start the development server:

     ```
     bash
     CopyEdit
     npm run dev
     ```

   - Visit `http://localhost:3000` in your browser.

6. **Start Coding with Cursor**
   - Use Cursor’s AI assistant to scaffold new components or features.

   - Example prompt:

     > "Create a page under `/app/orders` that displays a list of active orders and allows uploading a sketch."

---

### 🧠 Tips for Using AI Agents with This Starter

- Files are modular and follow AI-editable structure.

- Use comments like:

  ```
  js
  CopyEdit
  // @vibe: scaffold a form here for adding a new client with measurements
  ```

- All technologies (Next.js, Tailwind, ShadCN, Clerk, etc.) are preconfigured.

- Focus is on mobile-first UI and Ghana-specific business flows.
