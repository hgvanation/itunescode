import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Mail,
  Upload,
  Settings,
  LogOut,
  Copy,
  CheckCircle2,
  Search,
  Plus,
  Trash2,
  Download,
  Eye,
  EyeOff,
  X,
  Menu,
  Inbox,
  Lock,
  Check,
  Users,
  Database,
  FileUp,
  ChevronRight,
  AlertCircle,
  Music,
  Star,
  ShieldCheck,
} from "lucide-react";
import bannerImage from "@/imports/image.png";

// ── CẤU HÌNH API BACKEND ────────────────────────────────────────────────────
// Đổi URL này thành URL Render/Server thực tế khi bạn deploy
const API_BASE_URL = "http://localhost:3000/api/v1";

// ── Types ─────────────────────────────────────────────────────────────────────
type AppView = "home" | "admin";
type FormStep = "idle" | "loading" | "success" | "invalid" | "error";
type AdminSection =
  | "dashboard"
  | "inventory"
  | "distributed"
  | "emails"
  | "import"
  | "settings";

interface CodeEntry {
  id: number;
  code: string;
  status: "AVAILABLE" | "USED";
  created_at: string;
}

interface DistributedEntry {
  id: number;
  recipient_identifier: string;
  code: string;
  claimed_at: string;
}

interface StatsData {
  total: number;
  available: number;
  used: number;
}

// ── Shared Components ─────────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/85 backdrop-blur-xl border border-sky-200/60 rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function AssetPlaceholder({ label, className = "", Icon }: { label: string; className?: string; Icon?: React.ElementType }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-sky-300/50 rounded-2xl bg-sky-50/60 ${className}`}>
      {Icon && <Icon size={26} className="text-sky-300" strokeWidth={1.5} />}
      <span className="text-sky-400/70 text-[10px] font-semibold tracking-widest uppercase px-2 text-center leading-relaxed">
        {label}
      </span>
    </div>
  );
}

// ── HomePage ──────────────────────────────────────────────────────────────────
function HomePage({ onAdminLogin }: { onAdminLogin: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [step, setStep] = useState<FormStep>("idle");
  const [code, setCode] = useState("");
  const [apiMessage, setApiMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setStep("invalid");
      setApiMessage("Vui lòng nhập Email hoặc Threads ID!");
      return;
    }

    setStep("loading");
    setApiMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/claim-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setCode(data.code);
        setStep("success");
      } else {
        if (data.code) {
          setCode(data.code);
          setStep("success");
        } else {
          setStep("error");
        }
        setApiMessage(data.message);
      }
    } catch (err) {
      setStep("error");
      setApiMessage("Không thể kết nối đến hệ thống máy chủ!");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse at 10% 15%, rgba(41,171,226,0.32) 0%, transparent 55%), radial-gradient(ellipse at 88% 80%, rgba(255,208,0,0.22) 0%, transparent 55%), radial-gradient(ellipse at 55% 45%, rgba(0,207,255,0.14) 0%, transparent 65%), #e6f5ff",
      }}
    >
      <header
        className="sticky top-0 z-50 border-b border-sky-200/50"
        style={{ background: "rgba(230,245,255,0.82)", backdropFilter: "blur(20px)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <AssetPlaceholder label="Logo" className="w-28 h-8 rounded-xl" />
          <button
            onClick={onAdminLogin}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-sky-300/60 text-sky-600 text-sm hover:bg-sky-50 hover:border-sky-400/70 transition-all duration-200 font-medium"
          >
            <Lock size={13} />
            Đăng nhập Admin
          </button>
        </div>
      </header>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-14 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div className="flex flex-col gap-7">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 border border-sky-300/60 w-fit">
            <Music size={13} className="text-sky-500" />
            <span className="text-sky-600 text-xs font-semibold tracking-wide">iTunes Streaming Code</span>
          </div>

          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#0b1c33] leading-[1.15]">
              Nhận code{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #1aa7e4 0%, #00cfff 50%, #29abe2 100%)",
                }}
              >
                iTunes
              </span>
              <br />
              bài hát
            </h1>
            <p className="mt-4 text-slate-500 text-base lg:text-lg leading-relaxed max-w-md">
              Nhập email hoặc Threads ID để nhận mã iTunes đưa bài hát lên top 1 bảng xếp hạng!
            </p>
          </div>

          {(step === "idle" || step === "loading" || step === "invalid" || step === "error") && (
            <Card className="p-6 shadow-md shadow-sky-200/40">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-slate-600 text-sm font-medium mb-2">
                    Email hoặc Threads ID
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (step !== "idle") setStep("idle");
                    }}
                    placeholder="email@example.com hoặc @threads_id"
                    className={`w-full px-4 py-3 rounded-xl text-[#0b1c33] text-sm placeholder-slate-300 outline-none transition-all duration-200 bg-sky-50/60 border ${
                      step === "invalid" || step === "error"
                        ? "border-red-300 focus:border-red-400"
                        : "border-sky-200 focus:border-sky-400"
                    }`}
                  />
                  {(step === "invalid" || step === "error") && (
                    <p className="mt-2 text-red-500 text-xs flex items-center gap-1.5">
                      <AlertCircle size={12} />
                      {apiMessage}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={step === "loading"}
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-60 transition-all duration-200 shadow-md shadow-sky-300/40"
                  style={{
                    background:
                      step === "loading"
                        ? "#7fc9e8"
                        : "linear-gradient(135deg, #1aa7e4 0%, #00cfff 100%)",
                  }}
                >
                  {step === "loading" ? "Đang lấy mã..." : "Lấy Code Ngay →"}
                </button>
              </form>
            </Card>
          )}

          {step === "success" && (
            <Card className="p-6 border-sky-300/60 shadow-lg shadow-sky-200/50">
              <div className="flex flex-col items-center gap-5 text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-sky-300/40"
                  style={{ background: "linear-gradient(135deg, #1aa7e4, #00cfff)" }}
                >
                  <CheckCircle2 size={26} className="text-white" />
                </div>
                <div>
                  <h3 className="text-[#0b1c33] font-bold text-xl">Code iTunes Của Bạn</h3>
                  {apiMessage && <p className="text-amber-600 text-xs mt-1 font-medium">{apiMessage}</p>}
                </div>
                <div className="w-full bg-sky-50 border border-sky-200 rounded-xl p-4 relative group">
                  <p className="text-sky-700 font-mono text-xl font-bold tracking-[0.18em] pr-10">{code}</p>
                  <button
                    onClick={handleCopy}
                    className="absolute top-1/2 right-3 -translate-y-1/2 p-2 rounded-lg hover:bg-sky-100 transition-all duration-200"
                  >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-sky-400" />}
                  </button>
                </div>
                {copied && <p className="text-emerald-500 text-xs font-medium -mt-2">✓ Đã sao chép code!</p>}
              </div>
            </Card>
          )}
        </div>

        <div className="hidden lg:flex flex-col items-center gap-6 relative">
          <img src={bannerImage} alt="Banner" className="w-full h-auto rounded-3xl object-cover shadow-2xl" />
        </div>
      </section>
    </div>
  );
}

// ── Admin Login Modal ─────────────────────────────────────────────────────────
function AdminLoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        onSuccess(data.token);
      } else {
        setError(data.message || "Đăng nhập thất bại!");
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ Backend!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-sm p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400">
          <X size={18} />
        </button>
        <h2 className="text-[#0b1c33] text-xl font-bold mb-6 text-center">Đăng Nhập Admin</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tài khoản Admin"
            className="w-full px-4 py-3 rounded-xl bg-sky-50/60 border border-sky-200 outline-none text-sm"
          />
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              className="w-full px-4 py-3 rounded-xl bg-sky-50/60 border border-sky-200 outline-none text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm"
            style={{ background: "linear-gradient(135deg, #1aa7e4 0%, #00cfff 100%)" }}
          >
            {loading ? "Đang xác thực..." : "Đăng Nhập"}
          </button>
        </form>
      </Card>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [section, setSection] = useState<AdminSection>("dashboard");

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-[#0b1d38] p-6 text-white flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold mb-6">ADMIN PANEL</h2>
          <nav className="flex flex-col gap-2">
            {[
              { id: "dashboard", label: "Bảng điều khiển", Icon: LayoutDashboard },
              { id: "inventory", label: "Kho Mã", Icon: Package },
              { id: "distributed", label: "Lịch Sử Nhận Mã", Icon: CheckCircle2 },
              { id: "import", label: "Nhập Mã Mã Nhanh", Icon: Upload },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id as AdminSection)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                  section === item.id ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" : "text-slate-400"
                }`}
              >
                <item.Icon size={17} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white">
          <LogOut size={17} /> Đăng Xuất
        </button>
      </aside>

      <main className="flex-1 p-8">
        {section === "dashboard" && <DashboardOverview token={token} />}
        {section === "inventory" && <CodeInventory token={token} />}
        {section === "distributed" && <DistributedCodes token={token} />}
        {section === "import" && <ImportCodes token={token} />}
      </main>
    </div>
  );
}

// ── Admin Sections Gọi API ───────────────────────────────────────────────────
function DashboardOverview({ token }: { token: string }) {
  const [stats, setStats] = useState<StatsData>({ total: 0, available: 0, used: 0 });

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/codes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.stats);
      });
  }, [token]);

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <p className="text-slate-400 text-sm">Tổng Số Mã</p>
        <p className="text-3xl font-bold text-slate-800 mt-2">{stats.total}</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <p className="text-emerald-500 text-sm font-semibold">Mã Còn Tồn (Khả dụng)</p>
        <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.available}</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <p className="text-sky-500 text-sm font-semibold">Mã Đã Phân Phối</p>
        <p className="text-3xl font-bold text-sky-600 mt-2">{stats.used}</p>
      </div>
    </div>
  );
}

function CodeInventory({ token }: { token: string }) {
  const [codes, setCodes] = useState<CodeEntry[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/codes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCodes(data.data);
      });
  }, [token]);

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="p-4 text-xs text-slate-400 uppercase">ID</th>
            <th className="p-4 text-xs text-slate-400 uppercase">Mã Code</th>
            <th className="p-4 text-xs text-slate-400 uppercase">Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          {codes.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-4 text-sm text-slate-500">#{c.id}</td>
              <td className="p-4 font-mono font-bold text-sky-600">{c.code}</td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {c.status === 'AVAILABLE' ? 'Khả dụng' : 'Đã dùng'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DistributedCodes({ token }: { token: string }) {
  const [history, setHistory] = useState<DistributedEntry[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setHistory(data.data);
      });
  }, [token]);

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="p-4 text-xs text-slate-400 uppercase">Mã Code</th>
            <th className="p-4 text-xs text-slate-400 uppercase">Người Nhận</th>
            <th className="p-4 text-xs text-slate-400 uppercase">Thời Gian Cấp</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id} className="border-b">
              <td className="p-4 font-mono font-bold text-sky-600">{h.code}</td>
              <td className="p-4 text-sm">{h.recipient_identifier}</td>
              <td className="p-4 text-sm text-slate-400">{new Date(h.claimed_at).toLocaleString("vi-VN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ImportCodes({ token }: { token: string }) {
  const [rawCodes, setRawCodes] = useState("");
  const [msg, setMsg] = useState("");

  const handleImport = async () => {
    const arr = rawCodes.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    if (arr.length === 0) return;

    const res = await fetch(`${API_BASE_URL}/admin/codes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ codes: arr }),
    });
    const data = await res.json();
    if (data.success) {
      setMsg(`Đã nạp thành công ${data.data.addedCount} mã! (Bỏ qua ${data.data.duplicateCount} mã trùng)`);
      setRawCodes("");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm max-w-xl">
      <h3 className="font-bold mb-4">Nạp Mã Vào Kho</h3>
      <textarea
        value={rawCodes}
        onChange={(e) => setRawCodes(e.target.value)}
        placeholder="Dán danh sách mã vào đây (mỗi mã 1 dòng)..."
        className="w-full h-40 p-4 border rounded-xl font-mono text-sm outline-none mb-4"
      />
      <button
        onClick={handleImport}
        className="w-full py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600"
      >
        Nạp Ngay
      </button>
      {msg && <p className="mt-4 text-sm text-emerald-600 font-medium">{msg}</p>}
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<AppView>("home");
  const [adminToken, setAdminToken] = useState<string>("");
  const [showAdminModal, setShowAdminModal] = useState(false);

  return (
    <div>
      {view === "home" && <HomePage onAdminLogin={() => setShowAdminModal(true)} />}
      {view === "admin" && (
        <AdminDashboard token={adminToken} onLogout={() => setView("home")} />
      )}
      {showAdminModal && (
        <AdminLoginModal
          onClose={() => setShowAdminModal(false)}
          onSuccess={(token) => {
            setAdminToken(token);
            setShowAdminModal(false);
            setView("admin");
          }}
        />
      )}
    </div>
  );
}