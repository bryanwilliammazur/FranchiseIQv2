-- ═══════════════════════════════════════════════════════════════
-- FranchiseIQ — Full PostgreSQL Schema
-- Run this on your Neon database via the SQL editor
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy text search

-- ── USERS & AUTH ─────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  password_hash TEXT,
  role          TEXT NOT NULL DEFAULT 'viewer'
                CHECK (role IN ('owner','admin','analyst','manager','viewer')),
  brand_access  TEXT[] DEFAULT ARRAY['all'],
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── BRANDS ───────────────────────────────────────────────────────
CREATE TABLE brands (
  id         SERIAL PRIMARY KEY,
  slug       TEXT UNIQUE NOT NULL,  -- 'jib','popeyes','dennys','deltaco','corner'
  name       TEXT NOT NULL,
  color      TEXT NOT NULL,
  emoji      TEXT,
  active     BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO brands (slug, name, color, emoji) VALUES
  ('jib',    'Jack in the Box', '#ff9800', '🍔'),
  ('popeyes','Popeyes',         '#ff4d4d', '🍗'),
  ('dennys', 'Denny''s',        '#ffb800', '🥞'),
  ('deltaco','Del Taco',        '#00c853', '🌮'),
  ('corner', 'Corner Bakery',   '#64b5f6', '🥐');

-- ── LOCATIONS ────────────────────────────────────────────────────
CREATE TABLE locations (
  id              SERIAL PRIMARY KEY,
  r365_id         TEXT UNIQUE,         -- R365 location ID
  qu_id           TEXT,                -- QU POS location ID
  brand_id        INTEGER REFERENCES brands(id),
  name            TEXT NOT NULL,
  number          TEXT,                -- store number e.g. "#0441"
  address         TEXT,
  city            TEXT,
  state           TEXT,
  zip             TEXT,
  lat             DECIMAL(10,7),
  lng             DECIMAL(10,7),
  phone           TEXT,
  manager         TEXT,
  status          TEXT DEFAULT 'open'
                  CHECK (status IN ('open','closed','remodeling','opening_soon')),
  open_date       DATE,
  lease_expiry    DATE,
  sq_footage      INTEGER,
  has_drive_thru  BOOLEAN DEFAULT FALSE,
  has_delivery    BOOLEAN DEFAULT FALSE,
  seating_capacity INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_locations_brand ON locations(brand_id);
CREATE INDEX idx_locations_state ON locations(state);
CREATE INDEX idx_locations_status ON locations(status);

-- ── DAILY SALES SUMMARY ──────────────────────────────────────────
CREATE TABLE daily_sales (
  id               BIGSERIAL PRIMARY KEY,
  location_id      INTEGER REFERENCES locations(id),
  business_date    DATE NOT NULL,
  net_sales        DECIMAL(12,2) DEFAULT 0,
  gross_sales      DECIMAL(12,2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  guest_count      INTEGER DEFAULT 0,
  avg_check        DECIMAL(8,2) DEFAULT 0,
  dine_in_sales    DECIMAL(12,2) DEFAULT 0,
  drive_thru_sales DECIMAL(12,2) DEFAULT 0,
  delivery_sales   DECIMAL(12,2) DEFAULT 0,
  catering_sales   DECIMAL(12,2) DEFAULT 0,
  void_amount      DECIMAL(10,2) DEFAULT 0,
  discount_amount  DECIMAL(10,2) DEFAULT 0,
  tax_amount       DECIMAL(10,2) DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(location_id, business_date)
);

CREATE INDEX idx_daily_sales_date     ON daily_sales(business_date DESC);
CREATE INDEX idx_daily_sales_location ON daily_sales(location_id);
CREATE INDEX idx_daily_sales_loc_date ON daily_sales(location_id, business_date DESC);

-- ── INDIVIDUAL TRANSACTIONS ───────────────────────────────────────
CREATE TABLE transactions (
  id               BIGSERIAL PRIMARY KEY,
  r365_id          TEXT UNIQUE,
  location_id      INTEGER REFERENCES locations(id),
  business_date    DATE NOT NULL,
  transaction_time TIMESTAMPTZ,
  amount           DECIMAL(10,2) NOT NULL,
  item_count       INTEGER DEFAULT 0,
  payment_type     TEXT,           -- 'cash','credit','debit','mobile','gift'
  order_type       TEXT,           -- 'dine_in','drive_thru','delivery','online'
  channel          TEXT,           -- 'pos','app','doordash','ubereats','grubhub'
  void_flag        BOOLEAN DEFAULT FALSE,
  discount_amount  DECIMAL(8,2) DEFAULT 0,
  tax_amount       DECIMAL(8,2) DEFAULT 0,
  tip_amount       DECIMAL(8,2) DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_date     ON transactions(business_date DESC);
CREATE INDEX idx_transactions_location ON transactions(location_id);
CREATE INDEX idx_transactions_time     ON transactions(transaction_time DESC);
CREATE INDEX idx_transactions_type     ON transactions(order_type);

-- ── LABOR ────────────────────────────────────────────────────────
CREATE TABLE labor_daily (
  id              BIGSERIAL PRIMARY KEY,
  location_id     INTEGER REFERENCES locations(id),
  business_date   DATE NOT NULL,
  total_hours     DECIMAL(8,2) DEFAULT 0,
  regular_hours   DECIMAL(8,2) DEFAULT 0,
  overtime_hours  DECIMAL(8,2) DEFAULT 0,
  total_cost      DECIMAL(12,2) DEFAULT 0,
  regular_cost    DECIMAL(12,2) DEFAULT 0,
  overtime_cost   DECIMAL(12,2) DEFAULT 0,
  benefits_cost   DECIMAL(10,2) DEFAULT 0,
  employee_count  INTEGER DEFAULT 0,
  labor_pct       DECIMAL(5,2),   -- labor cost / net sales * 100
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(location_id, business_date)
);

CREATE INDEX idx_labor_date     ON labor_daily(business_date DESC);
CREATE INDEX idx_labor_location ON labor_daily(location_id);

-- ── FOOD COST / COGS ─────────────────────────────────────────────
CREATE TABLE food_cost_daily (
  id              BIGSERIAL PRIMARY KEY,
  location_id     INTEGER REFERENCES locations(id),
  business_date   DATE NOT NULL,
  total_cogs      DECIMAL(12,2) DEFAULT 0,
  food_cost       DECIMAL(12,2) DEFAULT 0,
  beverage_cost   DECIMAL(10,2) DEFAULT 0,
  paper_cost      DECIMAL(10,2) DEFAULT 0,
  waste_amount    DECIMAL(10,2) DEFAULT 0,
  variance        DECIMAL(10,2) DEFAULT 0,
  food_cost_pct   DECIMAL(5,2),
  waste_pct       DECIMAL(5,2),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(location_id, business_date)
);

CREATE INDEX idx_foodcost_date     ON food_cost_daily(business_date DESC);
CREATE INDEX idx_foodcost_location ON food_cost_daily(location_id);

-- ── EXPENSES / AP ────────────────────────────────────────────────
CREATE TABLE expenses (
  id              BIGSERIAL PRIMARY KEY,
  r365_id         TEXT UNIQUE,
  location_id     INTEGER REFERENCES locations(id),
  invoice_date    DATE NOT NULL,
  due_date        DATE,
  vendor_name     TEXT,
  vendor_id       TEXT,
  category        TEXT,
  gl_account      TEXT,
  amount          DECIMAL(12,2) NOT NULL,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','paid','overdue','disputed')),
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_date     ON expenses(invoice_date DESC);
CREATE INDEX idx_expenses_location ON expenses(location_id);
CREATE INDEX idx_expenses_vendor   ON expenses(vendor_name);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_status   ON expenses(status);

-- ── ALERTS ───────────────────────────────────────────────────────
CREATE TABLE alerts (
  id              BIGSERIAL PRIMARY KEY,
  location_id     INTEGER REFERENCES locations(id),
  brand_id        INTEGER REFERENCES brands(id),
  alert_type      TEXT NOT NULL,
  severity        TEXT NOT NULL CHECK (severity IN ('critical','warning','info')),
  title           TEXT NOT NULL,
  message         TEXT,
  metric_value    DECIMAL(12,2),
  metric_label    TEXT,
  resolved        BOOLEAN DEFAULT FALSE,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_resolved  ON alerts(resolved, created_at DESC);
CREATE INDEX idx_alerts_severity  ON alerts(severity);
CREATE INDEX idx_alerts_location  ON alerts(location_id);

-- ── AI INSIGHTS (cached AI findings) ─────────────────────────────
CREATE TABLE ai_insights (
  id              BIGSERIAL PRIMARY KEY,
  insight_type    TEXT NOT NULL,  -- 'savings','revenue','alert','opportunity','marketing'
  brand_id        INTEGER REFERENCES brands(id),
  location_id     INTEGER REFERENCES locations(id),
  title           TEXT NOT NULL,
  description     TEXT,
  impact_amount   DECIMAL(12,2),
  impact_label    TEXT,
  priority_score  INTEGER DEFAULT 50, -- 0-100
  action_items    JSONB,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insights_type     ON ai_insights(insight_type);
CREATE INDEX idx_insights_priority ON ai_insights(priority_score DESC);
CREATE INDEX idx_insights_expires  ON ai_insights(expires_at);

-- ── AI CHAT HISTORY ───────────────────────────────────────────────
CREATE TABLE ai_conversations (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES users(id),
  session_id      TEXT NOT NULL,
  messages        JSONB NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_user    ON ai_conversations(user_id);
CREATE INDEX idx_conversations_session ON ai_conversations(session_id);

-- ── SYNC LOG ─────────────────────────────────────────────────────
CREATE TABLE sync_log (
  id              BIGSERIAL PRIMARY KEY,
  source          TEXT NOT NULL,  -- 'r365','qu','olo'
  sync_type       TEXT NOT NULL,  -- 'sales','labor','transactions' etc
  status          TEXT NOT NULL CHECK (status IN ('success','error','partial')),
  records_synced  INTEGER DEFAULT 0,
  error_message   TEXT,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX idx_sync_log_source ON sync_log(source, started_at DESC);

-- ── USEFUL VIEWS ─────────────────────────────────────────────────

-- Portfolio summary view (used by executive dashboard)
CREATE OR REPLACE VIEW v_portfolio_summary AS
SELECT
  b.slug                                    AS brand,
  b.name                                    AS brand_name,
  b.color,
  COUNT(DISTINCT l.id)                      AS location_count,
  SUM(ds.net_sales)                         AS total_revenue,
  SUM(ds.transaction_count)                 AS total_transactions,
  AVG(ds.avg_check)                         AS avg_check,
  SUM(ld.total_cost)                        AS total_labor_cost,
  SUM(fcd.total_cogs)                       AS total_cogs,
  AVG(ld.labor_pct)                         AS avg_labor_pct,
  AVG(fcd.food_cost_pct)                    AS avg_food_cost_pct
FROM brands b
JOIN locations l        ON l.brand_id = b.id AND l.status = 'open'
LEFT JOIN daily_sales ds ON ds.location_id = l.id
  AND ds.business_date >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN labor_daily ld ON ld.location_id = l.id
  AND ld.business_date >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN food_cost_daily fcd ON fcd.location_id = l.id
  AND fcd.business_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY b.id, b.slug, b.name, b.color;

-- Top / bottom performing locations
CREATE OR REPLACE VIEW v_location_performance AS
SELECT
  l.id,
  l.name,
  l.number,
  l.city,
  l.state,
  b.slug                                    AS brand,
  b.color,
  SUM(ds.net_sales)                         AS revenue_30d,
  SUM(ds.transaction_count)                 AS transactions_30d,
  AVG(ds.avg_check)                         AS avg_check,
  AVG(ld.labor_pct)                         AS avg_labor_pct,
  AVG(fcd.food_cost_pct)                    AS avg_food_cost_pct,
  RANK() OVER (PARTITION BY b.id ORDER BY SUM(ds.net_sales) DESC) AS rank_in_brand,
  RANK() OVER (ORDER BY SUM(ds.net_sales) DESC)                   AS rank_overall
FROM locations l
JOIN brands b              ON b.id = l.brand_id
LEFT JOIN daily_sales ds   ON ds.location_id = l.id
  AND ds.business_date >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN labor_daily ld   ON ld.location_id = l.id
  AND ld.business_date >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN food_cost_daily fcd ON fcd.location_id = l.id
  AND fcd.business_date >= CURRENT_DATE - INTERVAL '30 days'
WHERE l.status = 'open'
GROUP BY l.id, l.name, l.number, l.city, l.state, b.slug, b.color;

-- Daily revenue trend (last 90 days, all brands)
CREATE OR REPLACE VIEW v_daily_trend AS
SELECT
  ds.business_date,
  b.slug                    AS brand,
  SUM(ds.net_sales)         AS revenue,
  SUM(ds.transaction_count) AS transactions,
  AVG(ds.avg_check)         AS avg_check
FROM daily_sales ds
JOIN locations l  ON l.id = ds.location_id
JOIN brands b     ON b.id = l.brand_id
WHERE ds.business_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY ds.business_date, b.slug
ORDER BY ds.business_date DESC;
