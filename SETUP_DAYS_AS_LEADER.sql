-- ============================================
-- SETUP "GIORNI DA #1" FEATURE
-- ============================================
-- Esegui questo script nel SQL Editor di Supabase
-- per abilitare il conteggio automatico dei giorni
-- in cui un giocatore è stato al primo posto.

BEGIN;

-- 1. Aggiungi la colonna days_as_leader alla tabella players
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS days_as_leader INTEGER DEFAULT 0;

-- 2. Crea la funzione che incrementa il contatore per il leader
CREATE OR REPLACE FUNCTION increment_leader_days()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  leader_id UUID;
BEGIN
  -- Trova il giocatore con più punti (leader)
  SELECT id INTO leader_id
  FROM public.players
  ORDER BY points DESC, wins DESC
  LIMIT 1;
  
  -- Incrementa days_as_leader per il leader
  IF leader_id IS NOT NULL THEN
    UPDATE public.players
    SET days_as_leader = COALESCE(days_as_leader, 0) + 1
    WHERE id = leader_id;
  END IF;
END;
$$;

-- 3. Installa l'estensione pg_cron se non presente
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 4. Schedula l'esecuzione alle 14:00 ogni giorno (ora italiana CET/CEST)
-- NOTA: Potrebbe essere necessario ajustare il timezone
SELECT cron.schedule(
  'increment-leader-days',           -- Nome del job
  '0 14 * * *',                      -- Cron: 14:00 ogni giorno
  $$SELECT increment_leader_days();$$
);

-- 5. Refresh PostgREST per esporre la nuova colonna
SELECT apply_postgrest_permissions();

COMMIT;

-- ============================================
-- VERIFICA INSTALLAZIONE
-- ============================================
-- Esegui queste query per verificare che tutto funzioni:

-- Vedi i job schedulati:
-- SELECT * FROM cron.job;

-- Testa manualmente la funzione:
-- SELECT increment_leader_days();

-- Vedi i giorni da leader di ogni giocatore:
-- SELECT name, points, days_as_leader FROM players ORDER BY points DESC;

-- ============================================
-- RIMOZIONE (se necessario)
-- ============================================
-- Per rimuovere il job schedulato:
-- SELECT cron.unschedule('increment-leader-days');

-- Per rimuovere la colonna:
-- ALTER TABLE public.players DROP COLUMN days_as_leader;
