import { useState, useEffect } from 'react';
import { Report, getReports, createReport, deleteReport } from '@/lib/database';
import { FileText, Trash2, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const data = await getReports();
      setReports(data);
    } catch (error) {
      console.error('Errore caricamento report:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!author.trim() || !content.trim()) {
      toast.error('Inserisci nome e commento');
      return;
    }

    setLoading(true);
    try {
      await createReport({
        author: author.trim(),
        content: content.trim(),
        created_at: new Date().toISOString(),
      });
      
      toast.success('Report salvato!');
      setContent('');
      await loadReports();
    } catch (error) {
      toast.error('Errore salvataggio report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminare questo report?')) return;

    try {
      await deleteReport(id);
      toast.success('Report eliminato');
      await loadReports();
    } catch (error) {
      toast.error('Errore eliminazione report');
      console.error(error);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Report Giornata</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8 border-2 border-foreground p-6">
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Il tuo nome</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Es: Mario Rossi"
            className="w-full p-3 border-2 border-foreground bg-background"
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Commento sulla giornata</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Scrivi qui il tuo commento sulle partite di oggi..."
            rows={5}
            className="w-full p-3 border-2 border-foreground bg-background resize-none"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-foreground text-background border-2 border-foreground hover:bg-background hover:text-foreground transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          {loading ? 'Salvataggio...' : 'Pubblica Report'}
        </button>
      </form>

      {/* Reports List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Report Precedenti
        </h3>

        {reports.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 border-2 border-foreground">
            Nessun report ancora pubblicato
          </div>
        ) : (
          reports.map(report => (
            <div
              key={report.id}
              className="p-6 border-2 border-foreground hover:bg-muted transition-colors group"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="font-bold text-lg">{report.author}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(report.created_at)}
                  </div>
                </div>
                
                <button
                  onClick={() => handleDelete(report.id)}
                  className="p-2 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors opacity-0 group-hover:opacity-100"
                  title="Elimina"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-foreground whitespace-pre-wrap">
                {report.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
