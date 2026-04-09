# Forms of Action — Grade 5 Board Game

A simple **two-player, turn-based board game** for the same device. Players move along a path by answering multiple-choice questions about five forms of action:

- Lifestyle choices  
- Participation  
- Advocacy  
- Social entrepreneurship  
- Social justice  

**No backend.** Plain HTML, CSS, and JavaScript. Suitable for **GitHub Pages** or any static host.

## How to run locally

Browsers block loading `questions.json` when you open `index.html` as a file (`file://`). You need a **local web server**.

### Option A: Python 3

From this folder:

```bash
cd forms-of-action-game
python3 -m http.server 8080
```

Then open: `http://localhost:8080`

### Option B: VS Code Live Server

Open the folder in VS Code, install the **Live Server** extension, right-click `index.html` → **Open with Live Server**.

## How to deploy to GitHub Pages

1. Create a repository and upload the contents of this folder (or push from Git).
2. In the repo on GitHub: **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch **`main`** (or `master`) and folder **`/ (root)`**, then save.
5. After a minute, the site will be at `https://<username>.github.io/<repo>/` (or your custom domain).

**Note:** If the game is not at the root of your site (for example project pages), keep all asset paths **relative** (`./questions.json`, `style.css`, `app.js`). If something breaks on a subpath, ensure `index.html` uses relative URLs (this project already does).

## How to edit questions (`questions.json`)

1. Edit **`questions.json`** only — no code changes needed for new questions.
2. Use **UTF-8** encoding. **Do not** add trailing commas after the last item in an array or object (JSON does not allow them).
3. Each card needs:
   - **`id`**: unique string (e.g. `c17`).
   - **`type`**: `classify` | `odd_one_out` | `best_fit` | `same_issue`
   - **`prompt`**: the question text students see.
   - **`options`**: array of 3–4 answer choices (strings).
   - **`answer`**: must be **exactly identical** to one of the strings in `options` (same spelling and capitalization).
   - **`explanation`**: short text shown after the answer (correct or incorrect).

Optional fields (for your notes and for certain prompts):

- **`target`**: for `odd_one_out`, which form the “majority” share (helps you write consistent cards).
- **`namedAction`**: for `same_issue`, which form students must match.

The top-level **`labels`** object is for **teacher reference** (short definitions). The game does not require it to run, but it helps keep wording consistent when you write new cards.

After saving, refresh the browser. If the file has a JSON syntax error, the game may not load questions — use a JSON validator if unsure.

## Game rules (short)

1. Enter names (or use defaults) and **Start game**.
2. On your turn, **Roll** (1–6), then answer the question.
3. **Correct** → move that many spaces toward **Finish**. **Incorrect** → stay.
4. Some spaces have small effects (**Roll again**, **+1**, **−1**); see on-board labels.
5. **First player to reach Finish wins.**
6. **Next turn** passes to the other player after you finish your turn (unless a space says you roll again).

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure |
| `style.css` | Layout and colors |
| `app.js` | Game logic and board layout |
| `questions.json` | All question cards (edit this to customize content) |
| `README.md` | This file |

The **board path** (number of spaces and special tiles) is defined in `app.js` as `BOARD_SPACES` so the JSON file stays focused on questions. To change the board, edit that array in `app.js`.

## License

Educational use: adapt freely for your classroom.
