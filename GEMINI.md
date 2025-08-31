# 📄 PRD – Visitor Sketchboard (Node.js + Filesystem + MongoDB metadata optional)

**Feature:** Visitor Sketchboard
**Owner:** Jay (Portfolio Website)
**Version:** v1.0

---

## 1. Goal

Allow visitors to draw sketches in-browser and save them persistently by storing images on the server filesystem. MongoDB can optionally be used just to store metadata like filename, timestamp, and IP hash for gallery display or spam control.

---

## 2. Objectives

- 🎨 Interactive drawing canvas.
- 💾 Save sketches as image files on the server.
- 📱 Works smoothly on desktop and mobile.
- ✨ Fun gallery displaying visitor sketches.
- 🔒 Basic spam/abuse control (optional IP-based limit).

---

## 3. User Stories

1. Draw freehand on a canvas.
2. Select brush color & size, erase, or clear canvas.
3. Submit sketch → saves image to server filesystem.
4. View recent sketches in a gallery grid.

---

## 4. Functional Requirements

**Frontend (React + Tailwind + Astro):**

- Canvas for drawing (use `react-konva` or `fabric.js`).
- Tools: Brush, Eraser, Color Picker, Size Picker, Clear button.
- “Save Sketch” button to submit sketch to backend.
- Display gallery of recent sketches (images served from server).

**Backend (Node.js + Express):**

- Endpoint to receive sketches:

  - `POST /api/sketches` → accepts image data (base64 or multipart/form-data).
  - Save image to server filesystem (`/uploads/sketches/`) with unique filename (e.g., timestamp + UUID).
  - Optional: store metadata in MongoDB for gallery or spam control:

    ```ts
    {
      filename: string,
      createdAt: Date,
      ipHash?: string
    }
    ```

- Endpoint to retrieve gallery images:

  - `GET /api/sketches` → returns list of image URLs from filesystem or DB.

**Storage:**

- Directory structure example:

  ```
  /uploads/sketches/
      2025-08-24_001.png
      2025-08-24_002.png
  ```

---

## 5. Non-Functional Requirements

- Canvas interactions <50ms latency.
- Limit canvas size (e.g., 500x500px) to prevent huge files.
- Optimize gallery loading (lazy load images).
- Simple server-side validation: max file size, allowed image type (`.png`, `.webp`).

---

## 6. Suggested Tech Stack

- **Frontend:** Astro + React + TailwindCSS + `react-konva`
- **Backend:** Node.js + Express.js
- **Storage:** Server filesystem (`/uploads/sketches/`)
- **Optional DB:** MongoDB (metadata only)
- **Deployment:**

  - Frontend: Vercel / Netlify
  - Backend + filesystem: Railway / Render / DigitalOcean

---

## 7. UX Flow

1. User clicks “Leave a Sketch” → opens canvas.
2. User draws → optionally adjusts color/size.
3. Presses “Save” → sketch uploads to server → confirmation toast shown.
4. Sketch appears in gallery grid below.

---

## 8. Wireframe

```
 ---------------------------------------------------
|                 Leave Your Sketch!               |
|  [Canvas Area 500x500]                           |
|  Tools: [Brush] [Eraser] [Color] [Size] [Clear] |
|                                                  |
|                    [ Save ]                      |
 ---------------------------------------------------

 Recent Sketches:
 [Img1] [Img2] [Img3] [Img4] ...
```

---

## 9. Risks

- Server storage growth (mitigate: compress images, periodic cleanup, or max per IP).
- NSFW content (moderation panel can be added later).
- Mobile performance → optimize canvas interactions and gallery load.

---

## 10. Roadmap

- **v1 (MVP):** Canvas + save sketches to filesystem + gallery display.
- **v2:** Admin moderation panel, IP-based spam prevention.
- **v3:** Extra features: download, share, filters, fun animations.
