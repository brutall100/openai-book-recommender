# OpenAI Book Recommender

Pick a genre and let an AI librarian pull your next great read off the shelf, powered by the OpenAI API.

**[▶ Live demo](https://brutall100.github.io/openai-book-recommender/)** · **[Source code](https://github.com/brutall100/openai-book-recommender)**

![OpenAI Book Recommender – light theme](docs/screenshot.webp)

## About

A small full-stack project: a Node.js + Express server asks OpenAI for book recommendations and returns clean JSON, and a vanilla JavaScript front end shows them as book-shaped cards on a cosy "old library" page.

GitHub Pages can only host static files, so the live demo runs in **demo mode**: books come from a curated shelf stored in the browser. Run the server locally with your own API key and the same page switches to **live mode** and asks OpenAI for real recommendations. A badge in the top-right corner shows which mode you are in.

## Features

- 📚 Choose a genre (classics, sci-fi, fantasy, mystery, non-fiction or "surprise me") and how many books you want
- 🤖 **Live mode**: real recommendations from OpenAI (`gpt-4o-mini` by default), returned as structured JSON
- 🌐 **Demo mode**: works on GitHub Pages with no server, and is used automatically when the API is unavailable
- 🌗 Light and dark themes: follows your system setting, has a toggle that remembers your choice, and never flashes on load
- ✨ Drifting book-spine background, cards that lift on hover, count-up stats, reveal-on-scroll and ripple buttons
- 📱 Responsive down to 390 px, with no horizontal scrolling
- ♿ Accessible: skip link, visible focus rings, labelled form fields, live status messages and `prefers-reduced-motion` support
- 🔒 Safe server: the API key lives only in `.env`, input is validated against a whitelist, requests are rate-limited, and only the front-end folders are served publicly

## Built with

- **Front end:** HTML, CSS (custom properties, no framework), vanilla JavaScript
- **Back end:** Node.js 22+, Express 5, the official `openai` SDK, `dotenv`
- **Font:** [Nunito](https://fonts.google.com/specimen/Nunito) (Google Fonts)

**Colour palette**

| Colour | HEX | Used for |
|---|---|---|
| ![#703b3b](https://placehold.co/16x16/703b3b/703b3b.png) Rosewood | `#703B3B` | Buttons, headings, links (light theme) |
| ![#e1d0b3](https://placehold.co/16x16/e1d0b3/e1d0b3.png) Parchment | `#E1D0B3` | Paper tones, headings (dark theme) |
| ![#9bb4c0](https://placehold.co/16x16/9bb4c0/9bb4c0.png) Dusty blue | `#9BB4C0` | Second accent, book spines, badges |
| ![#a18d6d](https://placehold.co/16x16/a18d6d/a18d6d.png) Oak | `#A18D6D` | Borders, shelf, decorative lines |

Every colour is a CSS variable at the top of [`css/style.css`](css/style.css), so the whole palette can be swapped in a minute. All text meets WCAG AA contrast (4.5:1 or better). Where a brand colour is too light for text (dusty blue, oak), a darker shade of it is used for text instead.

## What I learned

- Calling the OpenAI Chat Completions API from a server, and asking for **JSON output** so the answer is easy and safe to use
- Keeping secrets out of the code with environment variables, and out of git with `.gitignore`
- Validating user input on the server and adding a simple rate limiter
- Building a static fallback (demo mode) so a server-based project still works on GitHub Pages
- Theming with CSS custom properties, including a flash-free dark-mode toggle
- Animating only `transform` and `opacity` so effects stay smooth and light on the CPU

## Run it locally

You need **Node.js 22 or newer**.

```bash
git clone https://github.com/brutall100/openai-book-recommender.git
cd openai-book-recommender
npm install
cp .env.example .env      # then put your key in .env
npm start
```

Open <http://localhost:6500>.

- **With** `OPENAI_API_KEY` in `.env`: the badge says **Live · OpenAI** and books come from OpenAI.
- **Without** a key: the server still runs, the badge says **Demo mode**, and books come from the built-in shelf.

Optional `.env` settings: `OPENAI_MODEL` (default `gpt-4o-mini`) and `PORT` (default `6500`).

> Get an API key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys). Never commit your `.env` file.

## Project structure

```
openai-book-recommender/
├── index.html              # The page
├── css/
│   └── style.css           # All styles; the palette is at the top
├── js/
│   ├── theme-init.js       # Applies the saved theme before the first paint
│   ├── demo-books.js       # Offline shelf for demo mode
│   └── app.js              # Form, rendering, animations, theme toggle
├── images/
│   └── favicon.svg
├── docs/
│   └── screenshot.webp
├── server/
│   ├── server.js           # Express app: serves the page and the API
│   ├── config.js           # Reads settings from .env
│   ├── genres.js           # Allowed genres and limits
│   ├── book-service.js     # Talks to OpenAI
│   ├── rate-limit.js       # Simple per-IP rate limiter
│   └── routes/
│       └── books.js        # GET /api/health and GET /api/books
├── .env.example
├── package.json
└── LICENSE
```

**API**

| Endpoint | Returns |
|---|---|
| `GET /api/health` | `{ "ai": true }` if an API key is set |
| `GET /api/books?genre=fantasy&count=5` | `{ "source": "openai", "genre": "...", "books": [{ "title", "author", "year", "why" }] }` |

## Credits

- Recommendations by the [OpenAI API](https://platform.openai.com/)
- Font: [Nunito](https://fonts.google.com/specimen/Nunito) by Vernon Adams, via Google Fonts
- Demo shelf descriptions written for this project

## License

[MIT](LICENSE)
