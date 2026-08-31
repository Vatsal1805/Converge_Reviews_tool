'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  QrCode,
  Edit,
  Trash2,
  ExternalLink,
  TrendingUp,
  BarChart3,
  Lock,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
} from 'lucide-react';
import QRCode from 'qrcode';

interface ClientWithStats {
  id: string;
  slug: string;
  business_name: string;
  business_type: string;
  google_review_link: string;
  keywords: string[];
  tone: string;
  language: string;
  accent_color: string;
  stats?: {
    totalScans: number;
    completedReviews: number;
    conversionRate: string;
    avgStar: string;
  };
}

export default function AdminDashboard() {
  const [password, setPassword] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<ClientWithStats | null>(null);
  
  const [formData, setFormData] = useState({
    slug: '',
    business_name: '',
    business_type: '',
    google_review_link: '',
    keywords: '',
    tone: 'warm, reassuring and professional',
    language: 'English',
    accent_color: '#9C6B1F',
  });

  // QR Modal States
  const [qrModalClient, setQrModalClient] = useState<ClientWithStats | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Check saved session password
  useEffect(() => {
    const saved = localStorage.getItem('converge_admin_token');
    if (saved) {
      setPassword(saved);
      fetchClients(saved);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    fetchClients(password);
  };

  const fetchClients = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setClients(data.clients || []);
        setIsAuthenticated(true);
        localStorage.setItem('converge_admin_token', token);
      } else {
        setAuthError(data.error || 'Invalid admin password');
        setIsAuthenticated(false);
      }
    } catch (err) {
      setAuthError('Connection failed');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Form Submission (Add or Update)
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        id: editingClient?.id,
        ...formData,
        keywords: formData.keywords.split(',').map((k) => k.trim()).filter(Boolean),
      };

      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setIsFormOpen(false);
        setEditingClient(null);
        fetchClients(password);
      } else {
        alert(data.error || 'Failed to save client');
      }
    } catch (err) {
      alert('Error saving client');
    } finally {
      setIsLoading(false);
    }
  };

  // Open Edit Form
  const handleEdit = (client: ClientWithStats) => {
    setEditingClient(client);
    setFormData({
      slug: client.slug,
      business_name: client.business_name,
      business_type: client.business_type,
      google_review_link: client.google_review_link,
      keywords: Array.isArray(client.keywords) ? client.keywords.join(', ') : '',
      tone: client.tone || 'warm and reassuring',
      language: client.language || 'English',
      accent_color: client.accent_color || '#9C6B1F',
    });
    setIsFormOpen(true);
  };

  // Open New Form
  const handleAddNew = () => {
    setEditingClient(null);
    setFormData({
      slug: '',
      business_name: '',
      business_type: '',
      google_review_link: '',
      keywords: '',
      tone: 'warm, reassuring and professional',
      language: 'English',
      accent_color: '#9C6B1F',
    });
    setIsFormOpen(true);
  };

  // Delete Client
  const handleDelete = async (client: ClientWithStats) => {
    if (!confirm(`Are you sure you want to delete ${client.business_name}?`)) return;

    try {
      const res = await fetch(`/api/admin/clients?id=${client.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${password}` },
      });

      if (res.ok) {
        fetchClients(password);
      } else {
        alert('Failed to delete client');
      }
    } catch (err) {
      alert('Error deleting client');
    }
  };

  // Generate QR Code
  const handleGenerateQR = async (client: ClientWithStats) => {
    setQrModalClient(client);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const targetUrl = `${baseUrl}/r/${client.slug}`;

    try {
      const url = await QRCode.toDataURL(targetUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: '#1C2321',
          light: '#FFFFFF',
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      alert('Failed to generate QR code');
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.business_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // -------------------------------------------------------------
  // LOGIN SCREEN
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center p-4 bg-paper text-ink">
        <div className="w-full max-w-sm bg-paper-raised rounded-2xl border border-line shadow-slip p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-paper border border-line flex items-center justify-center text-brass">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-display font-bold">Agency Admin Portal</h1>
            <p className="text-xs text-ink/60">Converge Digital Internal Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink/70 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin secret..."
                className="w-full px-4 py-2.5 rounded-xl bg-paper border border-line text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brass"
                required
              />
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="tactile-btn w-full py-3 rounded-xl bg-brass text-white font-medium text-sm shadow-sm hover:bg-brass-deep disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Access Admin Dashboard'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // MAIN ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <main className="min-h-[100dvh] bg-paper text-ink">
      {/* Header Bar */}
      <header className="border-b border-line bg-paper-raised sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brass text-white flex items-center justify-center font-bold">
              C
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-none">Converge Reviews</h1>
              <span className="text-xs text-ink/60 font-mono">Agency Client Management</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAddNew}
              className="tactile-btn px-4 py-2 rounded-xl bg-brass text-white text-sm font-medium flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Client</span>
            </button>

            <button
              onClick={() => {
                localStorage.removeItem('converge_admin_token');
                setIsAuthenticated(false);
              }}
              className="px-3 py-2 text-xs font-mono text-ink/60 hover:text-ink border border-line rounded-lg bg-paper"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Analytics High Level Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-paper-raised border border-line shadow-slip space-y-1">
            <span className="text-xs font-mono text-ink/60 uppercase">Total Clients</span>
            <p className="text-3xl font-display font-bold text-ink">{clients.length}</p>
          </div>
          <div className="p-5 rounded-2xl bg-paper-raised border border-line shadow-slip space-y-1">
            <span className="text-xs font-mono text-ink/60 uppercase">Total QR Scans</span>
            <p className="text-3xl font-display font-bold text-ink">
              {clients.reduce((acc, c) => acc + (c.stats?.totalScans || 0), 0)}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-paper-raised border border-line shadow-slip space-y-1">
            <span className="text-xs font-mono text-ink/60 uppercase">Completed Google Reviews</span>
            <p className="text-3xl font-display font-bold text-signal-good">
              {clients.reduce((acc, c) => acc + (c.stats?.completedReviews || 0), 0)}
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between gap-4 bg-paper-raised p-4 rounded-xl border border-line">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              placeholder="Search clients by name, slug or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-paper border border-line text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brass"
            />
          </div>

          <button
            onClick={() => fetchClients(password)}
            className="p-2 rounded-lg border border-line bg-paper text-ink/70 hover:text-ink"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Clients Data Table */}
        <div className="bg-paper-raised rounded-2xl border border-line shadow-slip overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper border-b border-line font-mono text-xs text-ink/70 uppercase">
                <tr>
                  <th className="p-4">Business</th>
                  <th className="p-4">URL Slug</th>
                  <th className="p-4">Keywords</th>
                  <th className="p-4">Total Scans</th>
                  <th className="p-4">Reviews Added</th>
                  <th className="p-4">Conv. Rate</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-ink/50 text-sm">
                      No business clients found. Click "Add Client" to onboard one.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-paper/50 transition-colors">
                      <td className="p-4 font-medium">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: client.accent_color || '#9C6B1F' }}
                            title={`Accent Color: ${client.accent_color}`}
                          />
                          <div>
                            <div className="font-bold text-ink">{client.business_name}</div>
                            <div className="text-xs text-ink/60 capitalize">{client.business_type}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-xs text-brass">
                        /r/{client.slug}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(client.keywords || []).slice(0, 3).map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-paper border border-line text-[11px] text-ink/80">
                              {kw}
                            </span>
                          ))}
                          {(client.keywords || []).length > 3 && (
                            <span className="text-[11px] text-ink/50">+{client.keywords.length - 3}</span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 font-mono font-medium">{client.stats?.totalScans || 0}</td>

                      <td className="p-4 font-mono font-medium text-signal-good">
                        {client.stats?.completedReviews || 0}
                      </td>

                      <td className="p-4 font-mono text-xs">
                        {client.stats?.conversionRate || '0%'}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleGenerateQR(client)}
                            className="p-2 rounded-lg border border-line bg-paper text-ink hover:border-brass hover:text-brass"
                            title="Generate & Download QR Code PNG"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          <a
                            href={`/r/${client.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg border border-line bg-paper text-ink hover:border-brass hover:text-brass"
                            title="Preview Customer Flow"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => handleEdit(client)}
                            className="p-2 rounded-lg border border-line bg-paper text-ink hover:border-brass hover:text-brass"
                            title="Edit Client"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(client)}
                            className="p-2 rounded-lg border border-line bg-paper text-red-600 hover:border-red-400 hover:bg-red-50"
                            title="Delete Client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ADD / EDIT CLIENT MODAL */}
      {/* ------------------------------------------------------------- */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-paper-raised rounded-2xl border border-line shadow-lg w-full max-w-xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h2 className="text-xl font-display font-bold">
                {editingClient ? 'Edit Client Record' : 'Onboard New Business Client'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg border border-line hover:bg-paper"
              >
                <X className="w-5 h-5 text-ink/70" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ink/70 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Harikrushna Dental & Eye Hospital"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-paper border border-line focus:outline-none focus:ring-2 focus:ring-brass"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ink/70 mb-1">
                    URL Slug * (e.g. harikrushna)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. harikrushna"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().trim() })}
                    className="w-full px-3.5 py-2 rounded-xl bg-paper border border-line font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brass"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ink/70 mb-1">
                    Business Type *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. dental and eye clinic"
                    value={formData.business_type}
                    onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-paper border border-line focus:outline-none focus:ring-2 focus:ring-brass"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ink/70 mb-1">
                    Accent Color (Hex)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.accent_color}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-line cursor-pointer p-0.5 bg-paper"
                    />
                    <input
                      type="text"
                      value={formData.accent_color}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-paper border border-line font-mono text-xs uppercase"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-ink/70 mb-1">
                  Google Review Link *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  value={formData.google_review_link}
                  onChange={(e) => setFormData({ ...formData, google_review_link: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-paper border border-line text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brass"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-ink/70 mb-1">
                  SEO Keywords (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="root canal, eye checkup, painless extraction"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-paper border border-line focus:outline-none focus:ring-2 focus:ring-brass"
                />
                <p className="text-[11px] text-ink/50 mt-1">
                  These keywords will be subtly woven into AI review drafts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ink/70 mb-1">
                    Tone of Voice
                  </label>
                  <input
                    type="text"
                    placeholder="warm, reassuring and professional"
                    value={formData.tone}
                    onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-paper border border-line focus:outline-none focus:ring-2 focus:ring-brass"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ink/70 mb-1">
                    Language
                  </label>
                  <input
                    type="text"
                    placeholder="English"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-paper border border-line focus:outline-none focus:ring-2 focus:ring-brass"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-line bg-paper text-ink/70 hover:text-ink font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="tactile-btn px-6 py-2.5 rounded-xl bg-brass text-white font-medium hover:bg-brass-deep"
                >
                  {isLoading ? 'Saving...' : 'Save Client Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PROMPT 6: QR CODE DOWNLOAD MODAL */}
      {/* ------------------------------------------------------------- */}
      {qrModalClient && qrDataUrl && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper-raised rounded-2xl border border-line shadow-lg w-full max-w-sm p-6 text-center space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-brass">
                Printable Counter QR
              </span>
              <button
                onClick={() => setQrModalClient(null)}
                className="p-1 rounded-lg border border-line hover:bg-paper"
              >
                <X className="w-5 h-5 text-ink/70" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg text-ink">
                {qrModalClient.business_name}
              </h3>
              <a
                href={`/r/${qrModalClient.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-paper border border-line text-xs font-mono text-brass hover:underline transition-colors"
                title="Click to open customer review page in new tab"
              >
                <span>/r/{qrModalClient.slug}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Generated QR Code Image */}
            <div className="p-4 bg-white rounded-xl border border-line shadow-sm inline-block mx-auto">
              <img
                src={qrDataUrl}
                alt={`QR code for ${qrModalClient.business_name}`}
                className="w-56 h-56 mx-auto object-contain"
              />
            </div>

            <p className="text-xs text-ink/70">
              High-resolution PNG output ready for printing counter standees or reception cards.
            </p>

            <div className="flex gap-3">
              <a
                href={qrDataUrl}
                download={`qr-${qrModalClient.slug}.png`}
                className="tactile-btn flex-1 py-3 rounded-xl bg-brass text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-brass-deep"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
