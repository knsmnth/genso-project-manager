# Implementation Plan: Inspection Photos, Detailed Notes & Storage Strategy

Add photo capture (camera & gallery upload), expandable lightbox preview, detailed inspection notes, and an optimized storage solution for Inspection Details in the Daily Work Log.

## User Review Required

> [!IMPORTANT]
> **Storage Strategy Decision (Database vs Google Drive vs Compressed Local Storage)**
> 
> You asked: *"I don't know how should we approach in saving the photos when uploaded, see how should we solve this and where I can optimize this, see the database if we can put it there or we can directly save the photo on a gdrive?"*
>
> Below are the 3 viable options and our recommendation:
>
> 1. **(Recommended) Client-Side Canvas Compression + Local/IndexedDB + Backend Ready**:
>    - **How it works**: When a photo is taken or uploaded (often 3MB - 8MB on modern phones), an in-browser canvas compressor instantly scales it (max 1280px, WebP/JPEG 0.75 quality) down to **~60KB - 120KB** without losing visible clarity.
>    - **Why this is best**:
>      - **Instant & 100% offline-ready**: Field workers in basements or areas with poor cell service can take photos without failures or lag.
>      - **Zero extra API keys or login screens**: Works immediately on Android, iOS, and desktop browsers.
>      - **Dual-capable**: If your Laravel API (`http://localhost:8000/api`) or cloud storage is enabled, it can seamlessly send the compressed base64 or multipart file to your server.
>
> 2. **Direct Google Drive API**:
>    - **How it works**: Uses Google Drive REST API to upload photos into a designated Google Drive folder.
>    - **Drawbacks**: Requires configuring Google Cloud Console, setting up OAuth 2.0 Client IDs, an OAuth consent screen, and requires every field technician to sign in with Google or managing service account keys with sensitive secrets on the client. If connectivity drops, upload fails.
>
> 3. **Backend Database / Cloud Storage (Laravel Storage / Supabase / Cloudinary)**:
>    - **How it works**: Sends image payload to Laravel or Supabase/Cloudinary, which saves to disk/S3 and stores the URL in the database.
>    - **Status**: Your current project has an optional Laravel API client (`src/services/api.ts`). We can support saving compressed photos both locally in cached daily work logs and dispatching them to your Laravel `/api/inspection-photos` endpoint if configured.
>
> **Proposed Recommendation**: Implement **Client-Side Compression + Dual Storage (Local/IndexedDB + Laravel API fallback)**. This gives you instant offline capture, zero bloat, and the ability to sync to a database or Google Drive webhook whenever available.

---

## Key Features in This Plan

1. **Dual Photo Input (Camera + File Gallery)**:
   - **Take Photo**: Uses HTML5 `<input type="file" accept="image/*" capture="environment">` to directly launch the smartphone's camera.
   - **Upload Photo**: Uses `<input type="file" accept="image/*" multiple>` to pick existing images from device storage or desktop.
2. **Client-Side Image Optimizer**:
   - Auto-resizes and compresses photos before saving to avoid large memory footprints.
3. **Multi-Photo Thumbnails & Removal**:
   - Shows a clean thumbnail strip of captured photos with a badge count and remove button (`✕`).
4. **Expandable Photo Lightbox (Full Screen Modal)**:
   - Clicking any photo thumbnail opens a high-definition lightbox viewer with close button (`✕`), backdrop click-to-close, and filename/date tag.
5. **Detailed Inspection Notes Box**:
   - Multi-line expandable textarea for comprehensive findings, safety observations, and corrective actions.
6. **Card & PDF Integration**:
   - Logged inspection cards display photo thumbnails (clicking them also opens the lightbox).
   - Export PDF Log includes inspection photo summaries and findings.

---

## Proposed Changes

### Data Models & Types

#### [MODIFY] [types/index.ts](file:///f:/BSCS%20-%20III/WORK%20WORK%20WORK/keana/genso-project-manager/src/types/index.ts)
- Add `InspectionPhoto` interface:
  ```ts
  export interface InspectionPhoto {
    id: string;
    url: string; // Compressed Base64 data URL or remote URL
    name?: string;
    timestamp?: string;
  }
  ```
- Update `InspectionItem` to include `photos?: InspectionPhoto[]` and `detailedNotes?: string`.

---

### Utility & Image Compression

#### [NEW] [src/utils/imageCompressor.ts](file:///f:/BSCS%20-%20III/WORK%20WORK%20WORK/keana/genso-project-manager/src/utils/imageCompressor.ts)
- Lightweight utility using HTML5 Canvas:
  - Resizes images exceeding max dimensions (e.g., 1280px width/height).
  - Compresses to WebP (with JPEG fallback) at 0.75 quality.
  - Converts File/Blob to optimized Base64 data string in milliseconds.

---

### Daily Work Log View

#### [MODIFY] [DailyWorkLogView.vue](file:///f:/BSCS%20-%20III/WORK%20WORK%20WORK/keana/genso-project-manager/src/components/DailyWorkLogView.vue)
- **Inspection Drawer (`activeDrawer === 'inspection'`)**:
  - Add camera button: `<button @click="triggerCameraInput">📷 Take Photo</button>`
  - Add gallery button: `<button @click="triggerGalleryInput">🖼️ Upload Photos</button>`
  - Add hidden camera file input (`capture="environment"`) and gallery file input (`multiple`).
  - Add thumbnail grid for staged photos with a delete button (`✕`) on each.
  - Add detailed notes / findings textarea with character counter.
- **Lightbox Modal**:
  - Teleported full-screen image viewer modal:
    - Displays full-scale photo.
    - Close button (`✕`) and ESC key / backdrop click support.
    - Inspector and timestamp badge.
- **Card Preview**:
  - Displays mini photo badges or thumbnails on the inspection item card in the drawer.
- **PDF Export**:
  - Updates `handleExportPDF` to note photos attached to each inspection record.

---

### Styles & Design System

#### [MODIFY] [src/index.css](file:///f:/BSCS%20-%20III/WORK%20WORK%20WORK/keana/genso-project-manager/src/index.css)
- Add CSS for:
  - Photo upload dropzone & camera action buttons.
  - Thumbnail strip with hover zoom and remove badge.
  - Lightbox modal overlay (`.inspection-lightbox-overlay`, `.lightbox-image`, `.lightbox-close`).

---

## Verification Plan

### Automated Tests / Compilation
- Run `npm run build` to ensure TypeScript types and Vue SFC compilation succeed with zero errors.

### Manual Verification
1. **Camera / Photo Upload**:
   - Click "Take Photo" and verify mobile device opens the camera.
   - Click "Upload Photos" and select images from local storage.
   - Verify image compressor converts images to lightweight data URLs.
2. **Notes**:
   - Enter multi-line detailed notes in the inspection notes box.
   - Save inspection detail and verify notes appear in the card list.
3. **Photo Lightbox**:
   - Click on any photo thumbnail in the inspection form or card.
   - Verify the full-scale lightbox modal opens with sharp quality.
   - Click the close button or backdrop and verify it dismisses smoothly.
4. **Data Persistence**:
   - Reload the page; verify photos and detailed notes remain intact in the inspection drawer and row counts.
