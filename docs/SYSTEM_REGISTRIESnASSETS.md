# Master Catalogs Manager & Centralized Dropdown Registry

## Overview
Currently, dropdown values for **Requesting Office**, **Facility / Asset**, and **Work Type** (in `CreateOrderView.vue`), as well as **Equipment** (in `DailyWorkLogView.vue`), are scattered across hardcoded fallback arrays and disjointed `localStorage` keys without a dedicated management hub.

This plan introduces a centralized **"Master Catalogs" (Folder-Style Management Center)**. It provides a structured database and administrative interface to create, view, update, and delete lookup records, with automatic real-time synchronization across all forms and drawers in Genso.

---

## 1. What Should It Be Called & What Will It Look Like?

### Recommended Name
- **Primary Title**: **"Master Catalogs"** (or **"System Registries & Assets"**)
- **Sidebar Menu Item**: **"Catalogs"** with a modern folder/database icon (`📁` / SVG database mark).
- **Sub-registries (Folder Tabs)**:
  1. 🏢 **Requesting Offices**
  2. 🏛️ **Facilities & Assets**
  3. 🛠️ **Work Classifications (Work Types)**
  4. 🧰 **Equipment & Tools Registry**

### UI/UX Layout (Frontend Design)
The view will be built as a clean, folder-style tabbed management center following Genso's `#006C49` brand aesthetic:
1. **Header Row**:
   - Title: *Master Data & Resource Catalogs*
   - Subtitle: *Centralized registry for facility assets, department offices, work classifications, and equipment.*
   - Global search bar and "+ Add Item" primary action button.
2. **Folder Tabs Bar**:
   - Styled as folder tabs (`[🏢 Requesting Offices (5)]`, `[🏛️ Facilities & Assets (6)]`, `[🛠️ Work Types (7)]`, `[🧰 Equipment & Tools (8)]`).
   - Active tab highlighted in Genso forest green with smooth transitions.
3. **Registry Table & Metrics**:
   - Search & filter bar per active folder.
   - Clean data table with attributes, status pills (`Active`), usage counts, and quick actions (`✏️ Edit`, `🗑️ Delete`).
4. **Modal / Form for Adding & Editing**:
   - Field validation, code/tag inputs, department/category selectors, and notes.

---

## 2. Cross-Page Dropdown Synchronization Rule
- **Strict Sync**: Only items registered in the Master Catalogs will appear in dropdown options.
- When an item is deleted or deactivated in Master Catalogs:
  - It immediately disappears from the dropdown choices on `CreateOrderView.vue` and `DailyWorkLogView.vue`.
  - Existing historical records preserve their recorded text to protect audit integrity, but new selections cannot pick deleted items.

---

## 3. Daily Work Log Equipment Drawer Enhancement
> [!IMPORTANT]
> The user requested: *"Don't change what the equipment side panels look like but just add the option where you can choose an equipment type or name."*

- **Visual Preservation**: The layout, card styling, borrower input, quantity input, notes input, and checkbox lists in Drawer 3 (`activeDrawer === 'equipment'`) will remain exactly as they are.
- **Added Option**:
  - Directly above or inside the "Name of the Equipment used" input, we add a `<select>` dropdown populated from the **Equipment & Tools Registry** (`"Choose from Equipment Catalog..."`).
  - Selecting an equipment auto-populates the name input while still allowing custom naming or adjustments.

---

## 4. Backend & Database Design (Laravel + MySQL/SQLite)

### Database Schema

We will create a dedicated table migration `create_catalogs_table.php` (or 4 discrete tables via polymorphic category structure):

```php
Schema::create('catalogs', function (Blueprint $table) {
    $table->id();
    $table->string('type');            // 'office', 'asset', 'work_type', 'equipment'
    $table->string('code')->nullable(); // e.g. 'OFF-01', 'BLD-101', 'EQ-HYD-01'
    $table->string('name');            // Display name
    $table->string('category')->nullable(); // e.g. 'Heavy Machinery', 'Building Wing'
    $table->string('location')->nullable(); // e.g. 'East Wing', 'Tool Depot Room B'
    $table->string('contact_person')->nullable(); // e.g. 'Dr. M. Santos'
    $table->integer('quantity')->default(1); // For equipment inventory
    $table->boolean('is_active')->default(true);
    $table->text('description')->nullable();
    $table->timestamps();

    $table->index(['type', 'is_active']);
});
```

### Laravel API Endpoints (`backend/routes/api.php`)

```php
Route::get('/catalogs', [CatalogController::class, 'index']);           // Returns all grouped catalogs
Route::get('/catalogs/{type}', [CatalogController::class, 'byType']);   // Filter by type
Route::post('/catalogs', [CatalogController::class, 'store']);          // Create new record
Route::put('/catalogs/{id}', [CatalogController::class, 'update']);     // Update record
Route::delete('/catalogs/{id}', [CatalogController::class, 'destroy']); // Delete record
```

### Fallback & Offline Resilience
- Like other views in this project, the frontend will maintain a resilient client store (`localStorage` key `genso_master_catalogs`) initialized with default campus data.
- When the Laravel backend is reachable, it loads from and saves to the database automatically.

---

## 5. Proposed Changes & Components

### Types & Data Store
#### [MODIFY] [index.ts](file:///f:/BSCS%20-%20III/WORK%20WORK%20WORK/keana/genso-project-manager/src/types/index.ts)
- Add `CatalogItem`, `CatalogType = 'office' | 'asset' | 'work_type' | 'equipment'`, and `MasterCatalogsState` interfaces.

### New Component: CatalogsView
#### [NEW] [CatalogsView.vue](file:///f:/BSCS%20-%20III/WORK%20WORK%20WORK/keana/genso-project-manager/src/components/CatalogsView.vue)
- Folder-tabbed management interface with:
  - 4 sub-registries (Offices, Assets, Work Types, Equipment).
  - Add / Edit modal.
  - Delete action with confirmation toast.
  - Quick search and filtering.

### Navigation Integration
#### [MODIFY] [Sidebar.vue](file:///f:/BSCS%20-%20III/WORK%20WORK%20WORK/keana/genso-project-manager/src/components/Sidebar.vue)
- Add **"Catalogs"** nav item under Teams/Personnel with an SVG folder/database icon.

#### [MODIFY] [Breadcrumbs.vue](file:///f:/BSCS%20-%20III/WORK%20WORK%20WORK/keana/genso-project-manager/src/components/Breadcrumbs.vue)
- Add route mapping for `catalogs` view.

#### [MODIFY] [App.vue](file:///f:/BSCS%20-%20III/WORK%20WORK%20WORK/keana/genso-project-manager/src/App.vue)
- Host reactive `masterCatalogs` state.
- Handle add, edit, and delete events.
- Pass catalog lists as props to `CreateOrderView.vue`, `DailyWorkLogView.vue`, and `CatalogsView.vue`.

### Form Dropdowns Integration
#### [MODIFY] [CreateOrderView.vue](file:///f:/BSCS%20-%20III/WORK%20WORK%20WORK/keana/genso-project-manager/src/components/CreateOrderView.vue)
- Bind `officeOptions`, `assetOptions`, and `workTypeOptions` directly to the `masterCatalogs` props.
- Add "+ Manage in Catalogs" option or quick-add shortcut.

#### [MODIFY] [DailyWorkLogView.vue](file:///f:/BSCS%20-%20III/WORK%20WORK%20WORK/keana/genso-project-manager/src/components/DailyWorkLogView.vue)
- In the Equipment Drawer (`activeDrawer === 'equipment'`), add a `<select>` dropdown populated with the catalog equipment list above the name input.
- Keep the exact drawer layout intact.

### Backend Implementation
#### [NEW] `backend/database/migrations/2026_09_07_000005_create_catalogs_table.php`
- Database table schema for catalogs.

#### [NEW] `backend/app/Models/CatalogItem.php`
- Eloquent model with fillable attributes and scopes.

#### [NEW] `backend/app/Http/Controllers/Api/CatalogController.php`
- Controller handling `index`, `store`, `update`, `destroy`.

#### [MODIFY] [backend/routes/api.php](file:///f:/BSCS%20-%20III/WORK%20WORK%20WORK/keana/genso-project-manager/backend/routes/api.php)
- Register `/catalogs` API endpoints.

---

## 6. Verification Plan

### Automated Build & Compilation
- Run `npm run build` in root to ensure Vue 3 + TypeScript compiles without errors.
- Run `php artisan test` or verify PHP syntax if PHP CLI is available.

### User Flow Verification
1. Open **"Catalogs"** in the sidebar.
2. Add a new Requesting Office (`"Dean of Engineering Office"`), Facility (`"Innovation Hub"`), Work Type (`"Solar PV Maintenance"`), and Equipment (`"Thermal Imaging Camera"`).
3. Switch to **"Create Work Order"**:
   - Verify that only the registered offices, facilities, and work types appear in their respective dropdowns.
4. Switch to **"Daily Work Log"** -> open **Equipment** drawer:
   - Verify the equipment side panel looks identical to before, with the added dropdown option to pick `"Thermal Imaging Camera"`.
5. Return to **"Catalogs"** and delete an office:
   - Verify that deleted office immediately disappears from the Work Order dropdown.
