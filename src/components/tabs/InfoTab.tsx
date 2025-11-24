export default function InfoTab() {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Regole Punteggio</h2>
      
      <div className="space-y-6">
        <div className="border-2 border-foreground p-6">
          <h3 className="text-xl font-semibold mb-3">Vittoria Standard</h3>
          <div className="space-y-2 text-muted-foreground">
            <p><strong className="text-foreground">Punti Base:</strong> 10 punti</p>
            <p><strong className="text-foreground">Bonus:</strong> +0,5 punti per ogni punto di scarto oltre i 2</p>
            <p className="mt-4 text-sm">
              <strong className="text-foreground">Esempi:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>21-19: Il vincitore ottiene 10 punti (nessun bonus)</li>
              <li>21-18: Il vincitore ottiene 10,5 punti (1 punto di bonus)</li>
              <li>21-15: Il vincitore ottiene 12 punti (4 punti di bonus)</li>
              <li>21-10: Il vincitore ottiene 14,5 punti (9 punti di bonus)</li>
            </ul>
          </div>
        </div>

        <div className="border-2 border-gold p-6 bg-gold/10">
          <h3 className="text-xl font-semibold mb-3">Vittoria ai Vantaggi (21-20)</h3>
          <div className="space-y-2 text-muted-foreground">
            <p><strong className="text-foreground">Vincitore:</strong> 7 punti</p>
            <p><strong className="text-foreground">Perdente:</strong> 3 punti</p>
            <p className="mt-4 text-sm text-foreground">
              Questa è considerata una vittoria simbolica in cui entrambe le squadre hanno giocato bene. Il perdente riceve punti per l'impegno.
            </p>
          </div>
        </div>

        <div className="border-2 border-foreground p-6">
          <h3 className="text-xl font-semibold mb-3">Tipi di Partita</h3>
          <div className="space-y-3 text-muted-foreground">
            <div>
              <strong className="text-foreground">Singolo:</strong> 1 vs 1
              <p className="text-sm">I punti vengono assegnati ai singoli giocatori</p>
            </div>
            <div>
              <strong className="text-foreground">Doppio:</strong> 2 vs 2
              <p className="text-sm">I punti vengono divisi equamente tra i membri del team</p>
            </div>
          </div>
        </div>

        <div className="border-2 border-foreground p-6">
          <h3 className="text-xl font-semibold mb-3">Classifica</h3>
          <div className="space-y-2 text-muted-foreground">
            <p>I giocatori sono classificati per:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li><strong className="text-foreground">Punti Totali</strong> (principale)</li>
              <li><strong className="text-foreground">Vittorie Totali</strong> (spareggio)</li>
            </ol>
            <p className="mt-4 text-sm">
              Il giocatore classificato #1 riceve il badge <strong className="text-gold">LEADER</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}