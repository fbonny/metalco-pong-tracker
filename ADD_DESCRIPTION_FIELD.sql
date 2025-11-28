-- ============================================
-- AGGIUNGI CAMPO DESCRIZIONE AI GIOCATORI
-- ============================================
-- Esegui questo script nel SQL Editor

BEGIN;

-- Aggiungi la colonna description
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

-- Refresh PostgREST per esporre la nuova colonna
SELECT apply_postgrest_permissions();

COMMIT;

-- ============================================
-- VERIFICA
-- ============================================
-- SELECT name, description FROM players LIMIT 3;
