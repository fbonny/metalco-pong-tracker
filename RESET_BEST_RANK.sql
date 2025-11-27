-- ============================================
-- RESET BEST_RANK AI VALORI ATTUALI
-- ============================================
-- Questo script resetta tutti i best_rank per
-- farli combaciare con la classifica attuale,
-- eliminando i valori errati dovuti all'ordine
-- alfabetico quando tutti erano a 0 punti.

BEGIN;

-- Crea una tabella temporanea con i rank corretti
WITH ranked_players AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY points DESC, wins DESC) as current_rank
  FROM public.players
)
-- Aggiorna best_rank per farlo combaciare con la posizione attuale
UPDATE public.players p
SET best_rank = rp.current_rank
FROM ranked_players rp
WHERE p.id = rp.id;

-- Refresh PostgREST API
SELECT apply_postgrest_permissions();

COMMIT;

-- ============================================
-- VERIFICA
-- ============================================
-- Esegui questa query per verificare che tutto sia corretto:
-- SELECT name, points, best_rank FROM players ORDER BY points DESC;
