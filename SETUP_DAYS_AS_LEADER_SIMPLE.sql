-- ============================================
-- SETUP SEMPLIFICATO "GIORNI DA #1"
-- ============================================
-- Esegui SOLO questo script (senza pg_cron)
-- L'incremento automatico è gestito dall'app

BEGIN;

-- 1. Aggiungi la colonna days_as_leader
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS days_as_leader INTEGER DEFAULT 0;

-- 2. Imposta 3 giorni per Federico (leader attuale)
UPDATE public.players 
SET days_as_leader = 3 
WHERE name = 'Federico';

-- 3. Refresh PostgREST per esporre la nuova colonna
SELECT apply_postgrest_permissions();

COMMIT;

-- ============================================
-- VERIFICA
-- ============================================
-- Esegui questa query per verificare:
-- SELECT name, points, days_as_leader FROM players ORDER BY points DESC LIMIT 3;
