# Beginner setup and submission guide

Follow these steps in order. You do not need to create or copy individual code files—the project already contains them.

## 1. Install the required programs

Install:

1. **Visual Studio Code** from `https://code.visualstudio.com/`
2. **Node.js 22 LTS** from `https://nodejs.org/en/download`
3. **Git for Windows** from `https://git-scm.com/download/win`

Accept the normal/default installer options. Restart the computer after installing Node.js and Git so VS Code can detect them.

## 2. Open the project correctly

1. Extract the downloaded ZIP.
2. Open VS Code.
3. Choose **File → Open Folder**.
4. Select the extracted `fam-market-capstone` folder—not its parent Downloads folder.
5. You should see `server.js`, `package.json`, `public`, `routes` and `database` in the Explorer.

Do not open only `index.html`, and do not use the Live Server extension for this full-stack project. Express serves both the frontend and API.

## 3. Confirm Node.js works

In VS Code, select **Terminal → New Terminal**, then run:

```bash
node --version
npm --version
```

The Node command should show a version beginning with `v22`.

## 4. Install and run the project

In the same terminal:

```bash
npm install
npm start
```

Wait until the terminal says the marketplace is running. Open:

```text
http://localhost:3000
```

Keep the terminal open while using the app. Press `Ctrl+C` in the terminal to stop it.

## 5. Test before uploading

Confirm all of these:

- Six sample listings appear.
- Searching `Kaduna` shows Yellow Maize.
- A category button filters the cards.
- You can add a new produce listing with your phone number.
- You can order from the new listing.
- Its available quantity decreases.
- The WhatsApp button appears after the order.
- The page remains usable on a narrow/mobile-sized browser window.

## 6. Put the project on GitHub

Create a free GitHub account if needed, then create a new empty repository named `fam-market-capstone`. Do not add a README or `.gitignore` on GitHub because the project already contains them.

In the VS Code terminal, run the commands GitHub displays under **push an existing repository from the command line**. The normal sequence is:

```bash
git init
git add .
git commit -m "Build Fam Market produce marketplace MVP"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the URL GitHub gives you. Never upload the `node_modules` folder; `.gitignore` already excludes it.

## 7. Deploy while keeping one permanent link

Create a Render web service and connect the GitHub repository. Render can detect `render.yaml`; if it asks for settings, use:

- Build command: `npm install`
- Start command: `npm start`
- Environment variable: `NODE_VERSION` with value `22`

After deployment succeeds, open the generated public URL and repeat the test checklist. Add that URL to the README and submit it with the GitHub repository URL.

When you improve the project later:

```bash
git add .
git commit -m "Describe the improvement"
git push
```

Render normally redeploys the same service automatically, so the public link remains the same while the application updates.

## 8. Important SQLite deployment note

The app uses SQLite as requested for a beginner MVP. On a free host, database changes may reset after a service restart or new deployment because the local filesystem can be temporary. Sample listings are recreated automatically, so the demonstration remains usable. Mention PostgreSQL migration under future improvements rather than attempting it before the deadline.
