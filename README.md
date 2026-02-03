# Premium MERN Blog Platform

Premium minimal MERN blog with admin-only JWT auth, Markdown posts, and a
SaaS-style layout built with Tailwind CSS.

## Structure
- `backend/` Express + MongoDB + JWT
- `frontend/` React (Vite) + Tailwind

## Prerequisites
- Node.js 18+
- MongoDB running locally or a cloud URI

## Backend Setup
1. `cd backend`
2. `npm install`
3. Create `.env` in `backend/`:
   - `PORT=5000`
   - `MONGO_URI=mongodb://127.0.0.1:27017/minimal_blog`
   - `JWT_SECRET=change_this_secret`
   - `CLIENT_URL=http://localhost:5173`
   - `ADMIN_USERNAME=admin`
   - `ADMIN_PASSWORD=admin123`
   - `OPENROUTER_API_KEY=your_openrouter_key` (for AI SEO generation)
   - `SERPAPI_KEY=your_serpapi_key` (for real-time SERP analysis - get free key at https://serpapi.com)
   - `ZENSERP_API_KEY=your_zenserp_key` (optional fallback for SERP analysis)
4. Seed data: `npm run seed`
5. Run server: `npm run dev`

## Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create `.env` in `frontend/`:
   - `VITE_API_URL=http://localhost:5000/api`
4. Run app: `npm run dev`

## API Overview
- `POST /api/auth/login` admin login
- `GET /api/blogs` list published blogs (pagination via `page`, `limit`, filter by `category`)
- `GET /api/blogs/categories` list available categories
- `GET /api/blogs/:slug` published blog by slug
- `GET /api/admin/blogs` list all blogs (protected)
- `POST /api/admin/blogs` create blog (protected)
- `PUT /api/admin/blogs/:id` update blog (protected)
- `DELETE /api/admin/blogs/:id` delete blog (protected)
- `POST /api/admin/seo/serp-analysis` analyze SERP for keyword (protected)
- `POST /api/admin/seo/score` calculate SEO score for content (protected)
- `POST /api/admin/blogs/ai/titles` generate SEO titles (protected)
- `POST /api/admin/blogs/ai/content` generate blog content (protected)

## SEO Features
- **Real-time SERP Analysis**: Fetches top 10 Google results and analyzes top 5 pages
- **Yoast-style SEO Scoring**: Calculates SEO score (0-100) based on:
  - Title length (50-60 chars optimal)
  - Meta description length (140-160 chars optimal)
  - Primary keyword in title, first paragraph, and slug
  - Content length vs SERP average
  - Keyword density (0.5% - 2% optimal)
- **Content Gap Analysis**: Identifies missing sections compared to top-ranking pages
- **Visual SEO Meter**: Circular progress indicator with color-coded scores

## Notes
- Admin JWT stored in `localStorage` on the client.
- Markdown rendered with `react-markdown` + `remark-gfm`, sanitized with `rehype-sanitize`.
