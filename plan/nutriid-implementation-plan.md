D# NutriiD Implementation Plan

## Project Overview

**NutriiD** adalah aplikasi web PWA untuk menganalisis nilai gizi makanan menggunakan kamera dan AI.

### Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Backend | Laravel 11 + PHP 8.x |
| Frontend | React 19 + TypeScript + Inertia.js |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Build | Vite + React Compiler |
| AI Service | OpenRouter API |
| PWA | Vite PWA Plugin |

### AI Models Available
- `qwen/qwen3-vl-235b-a22b-thinking` (primary)
- `mistralai/mistral-small-3.1-24b-instruct:free` (free tier)
- `qwen/qwen3-vl-30b-a3b-thinking`
- `nvidia/nemotron-nano-12b-v2-vl:free` (free tier)
- `bytedance-seed/seedream-4.5`

---

## Design System

### Color Palette (Nutrition Theme)

```
Primary:     #22C55E (Green 500) - Fresh, healthy
Primary Dark: #16A34A (Green 600)
Secondary:   #F97316 (Orange 500) - Energy, appetite
Accent:      #06B6D4 (Cyan 500) - Clean, modern
Background:  #F8FAFC (Slate 50) - Clean white
Dark:        #0F172A (Slate 900)
Success:     #10B981 (Emerald 500)
Warning:     #F59E0B (Amber 500)
Error:       #EF4444 (Red 500)
```

### UI Style
- Glassmorphism dengan subtle gradients
- Mobile-first design
- Bottom navigation untuk PWA feel
- Clean sans-serif typography (Instrument Sans)
- Rounded corners (radius-lg)
- Subtle shadows dan animations

---

## Feature Phases

### Phase 1 - MVP (Current)
- [x] Setup PWA infrastructure
- [x] Camera scan functionality
- [ ] AI food analysis integration
- [ ] Nutrition display (kalori, protein, carb, fat)
- [ ] Basic history tracking
- [ ] Daily summary

### Phase 2 - Enhanced
- [ ] Goals & targets
- [ ] Meal logging manual
- [ ] Detailed nutrition breakdown
- [ ] Charts & analytics

### Phase 3 - Advanced
- [ ] Offline mode
- [ ] Push notifications
- [ ] Social features
- [ ] Recipe suggestions

---

## Database Schema

### Table: food_scans
```sql
- id (UUID)
- user_id (FK)
- image_path (string)
- food_name (string)
- description (text, nullable)
- calories (decimal)
- protein (decimal)
- carbohydrates (decimal)
- fat (decimal)
- fiber (decimal, nullable)
- sugar (decimal, nullable)
- sodium (decimal, nullable)
- serving_size (string, nullable)
- confidence_score (decimal, nullable)
- raw_response (json, nullable)
- scanned_at (timestamp)
- timestamps
```

### Table: daily_summaries
```sql
- id (UUID)
- user_id (FK)
- date (date)
- total_calories (decimal)
- total_protein (decimal)
- total_carbs (decimal)
- total_fat (decimal)
- scan_count (integer)
- timestamps
```

### Table: nutrition_goals (Phase 2)
```sql
- id (UUID)
- user_id (FK)
- target_calories (decimal)
- target_protein (decimal)
- target_carbs (decimal)
- target_fat (decimal)
- active (boolean)
- timestamps
```

---

## Implementation Steps

### Step 1: PWA Setup
1. Install vite-plugin-pwa
2. Create manifest.json
3. Configure service worker
4. Update vite.config.ts

### Step 2: Backend API
1. Create migrations for food_scans, daily_summaries
2. Create models and relationships
3. Create FoodScanController with endpoints
4. Create AI service class for OpenRouter integration
5. Add routes

### Step 3: Frontend Components
1. Create camera capture component
2. Create nutrition card components
3. Create history list component
4. Create daily summary widget
5. Update app layout with bottom navigation

### Step 4: Integration
1. Connect camera to AI service
2. Handle image upload and processing
3. Display nutrition results
4. Save to history
5. Calculate daily summaries

### Step 5: UI Polish
1. Add loading states
2. Add error handling
3. Add animations
4. Responsive design tweaks
5. Dark mode support

---

## API Endpoints

### Food Scan
- `POST /api/food-scan` - Upload & analyze food image
- `GET /api/food-scan` - List user's scans
- `GET /api/food-scan/{id}` - Get scan detail
- `DELETE /api/food-scan/{id}` - Delete scan

### Daily Summary
- `GET /api/daily-summary` - Get today's summary
- `GET /api/daily-summary/{date}` - Get specific date summary

### User Settings (Phase 2)
- `GET /api/nutrition-goals` - Get user goals
- `POST /api/nutrition-goals` - Set goals
- `PUT /api/nutrition-goals` - Update goals

---

## Environment Variables

```env
# AI Service
OPENROUTER_API_URL=https://openrouter.ai/api/v1
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=qwen/qwen3-vl-235b-a22b-thinking

# App
APP_NAME=NutriiD
VITE_APP_NAME=NutriiD
```

---

## File Structure

```
app/
├── Http/Controllers/
│   └── FoodScanController.php
├── Models/
│   ├── FoodScan.php
│   └── DailySummary.php
├── Services/
│   └── AIService.php

database/
├── migrations/
│   ├── create_food_scans_table.php
│   └── create_daily_summaries_table.php

resources/js/
├── components/
│   ├── camera-capture.tsx
│   ├── nutrition-card.tsx
│   ├── daily-summary.tsx
│   ├── scan-history.tsx
│   └── bottom-nav.tsx
├── pages/
│   ├── dashboard.tsx (updated)
│   ├── scan.tsx
│   └── history.tsx
├── lib/
│   └── api.ts

routes/
├── web.php (updated)
└── api.php
```

---

## Timeline Estimate

| Phase | Duration | Tasks |
|-------|----------|-------|
| Setup | 1 day | PWA config, DB migrations, models |
| Backend | 1-2 days | Controllers, AI service, API |
| Frontend | 2-3 days | Components, pages, integration |
| Polish | 1 day | Animations, responsive, dark mode |

**Total: 5-7 days for MVP**