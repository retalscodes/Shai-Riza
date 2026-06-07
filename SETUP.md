# Riza Tea — Setup Guide

## What You're Deploying

| Feature | How it works |
|---|---|
| Website (4 pages) | Static HTML/CSS/JS on Netlify |
| Digital Menu | Pulled from Supabase, editable via admin |
| Gallery | Photos uploaded via admin → stored in Supabase Storage |
| Loyalty Cards | Customer phone → stamps → free drink at 10 |
| Admin Panel | Password protected at `/admin.html` |
| Bilingual | Arabic/English toggle, remembers preference |
| PWA | Installable on phones |

---

## Step 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Note your **Project URL** and **anon key** (Settings → API)
3. Also note your **service_role key** (keep this secret)

### Run this SQL in the Supabase SQL editor:

```sql
-- Customers (loyalty cards)
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  stamps INTEGER DEFAULT 0,
  total_stamps INTEGER DEFAULT 0,
  free_drinks_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stamp history
CREATE TABLE stamp_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('stamp', 'redeem')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu items
CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  price DECIMAL(10,2),
  price_label TEXT,
  available BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- App settings (hours, gallery, about text, today's special)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read for menu and settings
CREATE POLICY "Public read menu" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

-- Customers: allow lookup by phone (no auth needed for loyalty card)
CREATE POLICY "Lookup by phone" ON customers FOR SELECT USING (true);
CREATE POLICY "Register customer" ON customers FOR INSERT WITH CHECK (true);

-- Stamp history: public insert (admin verifies via token in function)
CREATE POLICY "Read history" ON stamp_history FOR SELECT USING (true);
CREATE POLICY "Add history" ON stamp_history FOR INSERT WITH CHECK (true);
```

### Create Supabase Storage bucket:

In Supabase → Storage → New Bucket → name it `riza-gallery` → set to **Public**.

---

## Step 2 — Seed the Menu

In the Supabase SQL editor, run this to load the initial menu:

```sql
INSERT INTO menu_items (category, name_en, name_ar, price, price_label, sort_order, available) VALUES
('tea', 'Ghada Tea', 'شاي غادة', 1.00, NULL, 1, true),
('tea', 'Smoked Tea', 'شاي مدخن', 1.00, NULL, 2, true),
('tea', 'Oooh Tea', 'شاي اوووه', 1.00, NULL, 3, true),
('tea', 'Iraqi Khiyam Tea', 'شاي خيام عراقي', 1.00, NULL, 4, true),
('tea', 'Arba 7 7 7 Tea', 'شاي أربع 777', 1.00, NULL, 5, true),
('tea', 'Iraqi Maareb Tea', 'شاي معارب عراقي', 1.00, NULL, 6, true),
('tea', 'Khalid Tea', 'شاي خالد', 1.00, NULL, 7, true),
('tea', 'Salmoon Tea', 'شاي السلمون', 1.00, NULL, 8, true),
('tea', 'Al-Fakhn Tea', 'شاي الفخن', 1.00, NULL, 9, true),
('tea', 'Khadeer Tea', 'شاي خضير', 1.00, NULL, 10, true),
('tea', 'Karak Chai (Saffron Masala)', 'كرك تشاي (زعفران مسالة)', NULL, 'AED 1.2 / 1.5', 11, true),
('coffee', 'Turkish Coffee (Al Ameed)', 'قهوة تركية (بن السيد)', 2.00, NULL, 1, true),
('coffee', 'V.6.0', 'V.6.0', 3.50, NULL, 2, true),
('cold', 'Blueberry Mojito', 'موهيتو بلوبيري', 3.50, NULL, 1, true),
('cold', 'Strawberry Mojito', 'موهيتو فراولة', 2.50, NULL, 2, true),
('cold', 'Classic Mojito', 'موهيتو كلاسيك', 2.00, NULL, 3, true),
('cold', 'Iced Tea Peach', 'آيس تي خوخ', 3.50, NULL, 4, true),
('cold', 'Iced Matcha', 'آيس ماتشا', 4.00, NULL, 5, true),
('cold', 'Water Bottle', 'زجاجة ماء', 1.00, NULL, 6, true),
('acai', 'Acai Smoothie', 'سموذي أساي', 4.00, NULL, 1, true),
('acai', 'Acai Signature', 'أساي سيغنتشر', 5.00, NULL, 2, true),
('breakfast', 'Egg Toast', 'توست بيض', 3.00, NULL, 1, true),
('breakfast', 'Halloumi Cheese & Avocado Toast', 'توست حلوم وأفوكادو', 4.00, NULL, 2, true),
('breakfast', 'Halloumi Cheese Croissant', 'كرواسون حلوم', 3.50, NULL, 3, true),
('breakfast', 'Cheese Pie', 'فطيرة الجبن', 4.20, NULL, 4, true),
('desserts', 'Karak Cake', 'كيكة كرك', 3.00, NULL, 1, true),
('desserts', 'Crème Caramel', 'كريم كراميل', 2.50, NULL, 2, true),
('desserts', 'Croissant Beehive', 'كرواسون بيهايف', 3.50, NULL, 3, true),
('desserts', 'Beehive with Cheese', 'بيهايف بالجبنة', 4.00, NULL, 4, true),
('desserts', 'Basbousa', 'بسبوسة', 2.00, NULL, 5, true);
```

---

## Step 3 — Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
2. Connect your GitHub repo (or drag-drop the folder)
3. Build settings:
   - **Build command:** *(leave empty)*
   - **Publish directory:** `.`
4. Add **Environment Variables** (Site Settings → Environment Variables):

| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJ…` (anon key) |
| `SUPABASE_SERVICE_KEY` | `eyJ…` (service_role key) |
| `ADMIN_PASSWORD` | A strong password your mom will use |

5. Deploy! The site will be live at `your-site.netlify.app`

---

## Step 4 — Add the Logo

Replace `assets/logo.png` with the actual logo file.
Update the SVG in the `<nav>` section of each HTML file to show the real logo:

```html
<!-- Replace the SVG with: -->
<img src="assets/logo.png" style="height:42px;width:auto" alt="Riza Tea"/>
```

---

## Using the Admin Panel

Go to `your-site.netlify.app/admin.html`

### What your mom can do:
| Section | What she can change |
|---|---|
| **Menu** | Add/edit/delete items, toggle available/unavailable |
| **Gallery** | Upload photos, delete photos |
| **Today's Special** | Turn on/off a featured item banner on homepage |
| **About & Hours** | Edit the story text, update opening hours |
| **Stamp Customers** | Search a phone number → add a stamp → redeem free drink |
| **All Customers** | See all loyalty card holders |

### Loyalty Card flow:
1. Customer orders a drink
2. Mom opens `/admin.html` → **Add a Stamp**
3. Types customer's phone number → **Find Customer**
4. Clicks **Add Stamp ☕**
5. At 10 stamps → **Redeem Free Drink 🎁** button appears

### Customer flow:
1. Customer goes to `your-site.netlify.app/loyalty`
2. Types their phone number
3. Sees their card with animated stamps
4. First visit → card is created automatically

---

## Custom Domain (optional)

In Netlify → Domain Management → Add custom domain.
Get a `.com` domain from Namecheap (~$10/year) and point it to Netlify.
