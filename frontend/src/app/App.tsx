import { useState, useEffect, FormEvent } from "react";
import {
  LayoutDashboard,
  Package,
  Upload,
  LogOut,
  CheckCircle2,
  Lock,
  X,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  Facebook,
  Instagram,
  AtSign,
  Trash2,
} from "lucide-react";

// ── CẤU HÌNH API BACKEND ────────────────────────────────────────────────────
const API_BASE_URL = "https://itunes-sangwon.onrender.com/api/v1";

// ── Types ─────────────────────────────────────────────────────────────────────
type AppView = "home" | "admin";
type AdminSection = "dashboard" | "inventory" | "distributed" | "import";

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

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/uriwonvn",
    icon: <Facebook className="w-4 h-4 text-white" />,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/uriwon.vn",
    icon: <Instagram className="w-4 h-4 text-white" />,
  },
  {
    label: "Threads",
    href: "https://www.threads.com/@uriwon.vn",
    icon: <AtSign className="w-4 h-4 text-white" />,
  },
];

// ── HomePage ──────────────────────────────────────────────────────────────────
function HomePage({ onAdminLogin }: { onAdminLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [claimedCode, setClaimedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Màn hình intro video (mặc định hiện, đúng 5 giây tự ẩn)
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Hàm validate định dạng & độ dài ở Frontend
  const validateInput = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return "Vui lòng nhập Email hoặc Threads ID!";

    // Kiểm tra cấu trúc Email
    if (trimmed.includes("@") && trimmed.includes(".")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return "Định dạng Email không hợp lệ!";
      }
      return null;
    }

    // Kiểm tra cấu trúc Threads Username
    const cleanHandle = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
    if (cleanHandle.length < 2) {
      return "Threads Username phải có ít nhất 2 ký tự!";
    }
    if (cleanHandle.length > 30) {
      return "Threads Username không được dài quá 30 ký tự!";
    }
    const threadsRegex = /^[a-zA-Z0-9._]+$/;
    if (!threadsRegex.test(cleanHandle)) {
      return "Threads Username chứa ký tự không hợp lệ!";
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormStatus("");
    setClaimedCode("");

    const errorMsg = validateInput(email);
    if (errorMsg) {
      setFormStatus(errorMsg);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/claim-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setClaimedCode(data.code);
        setFormStatus("Lấy code thành công!");
      } else {
        if (data.code) {
          setClaimedCode(data.code);
        }
        setFormStatus(data.message || "Không thể lấy code.");
      }
    } catch (err) {
      setFormStatus("Lỗi kết nối tới máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!claimedCode) return;
    navigator.clipboard.writeText(claimedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main
      className="w-full min-h-screen relative flex flex-col justify-between text-white bg-black bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.35) 100%), url('/my-bg.jpg')`,
      }}
    >
      {/* ── MÀN HÌNH INTRO VIDEO (5 GIÂY) ────────────────────────── */}
      {showSplash && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-500">
          <video
            src="/intro.mp4"
            autoPlay
            muted
            playsInline
            className="w-full h-full object-contain"
          />

          <button
            onClick={() => setShowSplash(false)}
            className="absolute top-4 right-4 z-10 px-4 py-1.5 rounded-full bg-black/60 border border-white/30 text-white text-xs hover:bg-white/20 transition-colors cursor-pointer"
          >
            Bỏ qua →
          </button>
        </div>
      )}

      {/* Header Mobile & Desktop */}
      <header className="w-full h-20 flex items-center justify-between px-4 sm:px-12 md:px-24 bg-black/50 backdrop-blur-md border-b border-white/10 z-20">
        <div className="flex items-center gap-2">
          <div className="w-12 h-6 sm:w-14 sm:h-8 bg-[url(/image-uriwon.png)] bg-contain bg-no-repeat bg-center" />
          <span className="text-white font-bold text-xs">×</span>
          <div className="w-16 h-12 sm:w-20 sm:h-16 bg-[url(/image-leospaze-2.png)] bg-contain bg-no-repeat bg-center" />
        </div>

        <button
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/50 text-xs sm:text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
          type="button"
          onClick={onAdminLogin}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Đăng nhập Admin</span>
        </button>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-start pt-4 sm:pt-6 pb-12 px-4 max-w-xl mx-auto w-full z-10">
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#50899c14] border border-white/20 backdrop-blur-sm">
          <span className="text-xs font-semibold tracking-wide">🎵 iTunes Streaming Code</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold text-center mb-3">
          Nhận code <span className="bg-gradient-to-r from-[#e40f48] to-[#ff8f7b] bg-clip-text text-transparent">iTunes</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 text-center mb-6 max-w-md">
          Nhập địa chỉ email hoặc Threads ID để nhận code iTunes đưa bài hát của ALD1 lên top 1 bảng xếp hạng!
        </p>

        {/* Form Nhận Code */}
        <form
          className="w-full p-5 sm:p-8 bg-black/80 rounded-2xl border border-[#50899c33] shadow-xl backdrop-blur-md flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-slate-200" htmlFor="input-1">
              Email / Threads Username
            </label>
            <input
              className="w-full h-11 px-4 bg-white rounded-lg text-slate-900 text-sm outline-none focus:ring-2 focus:ring-[#50899c]"
              id="input-1"
              name="email"
              placeholder="email@example.com hoặc @threads_user"
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required={true}
            />
          </div>

          <button
            className="w-full py-3 rounded-full font-semibold text-sm shadow-lg bg-gradient-to-r from-[#50899c] to-[#006168] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Lấy Code Ngay →"}
          </button>

          {formStatus && (
            <div className="w-full text-center text-xs font-medium text-amber-400">
              {formStatus}
            </div>
          )}

          {claimedCode && (
            <div className="w-full flex flex-col items-center gap-2 p-3 bg-white/10 rounded-lg border border-sky-300/40">
              <span className="text-xs text-slate-300">Mã code của bạn:</span>
              <div className="flex items-center gap-3">
                <span className="text-lg sm:text-xl font-mono font-bold text-sky-400 tracking-wider">
                  {claimedCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 bg-sky-500/20 text-sky-300 rounded hover:bg-sky-500/40 transition-colors cursor-pointer"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              {copied && <span className="text-[10px] text-emerald-400">✓ Đã sao chép!</span>}
            </div>
          )}

          <p className="text-[11px] sm:text-xs text-[#e40f48] text-center">
            ‼️ Mỗi email/Threads ID chỉ được nhận một code iTunes duy nhất.
          </p>
        </form>
      </section>

      {/* Footer Mobile & Desktop */}
      <footer className="w-full py-4 px-4 sm:px-12 md:px-24 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#50899c80] border-t border-white/10 backdrop-blur-md z-20">
        <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
          <span>đời bố, bố quản </span>
        </div>

        <nav className="flex items-center gap-4">
          {socialLinks.map((socialLink) => (
            <a
              className="flex items-center gap-1 text-xs text-white hover:underline"
              href={socialLink.href}
              key={socialLink.label}
              target="_blank"
              rel="noreferrer"
            >
              {socialLink.icon}
              <span>{socialLink.label}</span>
            </a>
          ))}
        </nav>
      </footer>
    </main>
  );
}

// ── Admin Login Modal ─────────────────────────────────────────────────────────
function AdminLoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
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
        setError(data.message || "Tài khoản hoặc mật khẩu không đúng!");
      }
    } catch (err) {
      setError("Không thể kết nối tới máy chủ Backend!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm p-6 sm:p-8 bg-black/90 border border-[#50899c40] rounded-2xl relative text-white shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
          <X size={18} />
        </button>
        <h2 className="text-xl font-bold mb-6 text-center">Đăng Nhập Admin</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tài khoản Admin"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white outline-none text-sm placeholder-slate-400"
          />
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white outline-none text-sm placeholder-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {error && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-cyan-600 to-teal-700 hover:opacity-90 transition-opacity cursor-pointer"
          >
            {loading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Admin Dashboard (Responsive Layout) ────────────────────────────────────────
function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [section, setSection] = useState<AdminSection>("dashboard");

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-white">
      {/* Sidebar Mobile & Desktop */}
      <aside className="w-full md:w-64 bg-slate-900 p-4 md:p-6 border-b md:border-b-0 md:border-r border-slate-800 flex flex-row md:flex-col justify-between items-center md:items-stretch">
        <div>
          <h2 className="text-base md:text-lg font-bold text-sky-400 hidden md:block md:mb-6">ADMIN PANEL</h2>
          <nav className="flex md:flex-col gap-1 md:gap-2 overflow-x-auto">
            {[
              { id: "dashboard", label: "Bảng điều khiển", Icon: LayoutDashboard },
              { id: "inventory", label: "Kho Mã", Icon: Package },
              { id: "distributed", label: "Lịch Sử", Icon: CheckCircle2 },
              { id: "import", label: "Nạp Mã", Icon: Upload },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id as AdminSection)}
                className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-xl text-xs md:text-sm whitespace-nowrap transition-colors cursor-pointer ${
                  section === item.id ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" : "text-slate-400 hover:bg-white/5"
                }`}
              >
                <item.Icon size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 text-xs md:text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">
          <LogOut size={16} /> <span className="hidden sm:inline">Đăng Xuất</span>
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-x-auto">
        {section === "dashboard" && <DashboardOverview token={token} />}
        {section === "inventory" && <CodeInventory token={token} />}
        {section === "distributed" && <DistributedCodes token={token} />}
        {section === "import" && <ImportCodes token={token} />}
      </main>
    </div>
  );
}

// ── Admin Sub-Components ─────────────────────────────────────────────────────
function DashboardOverview({ token }: { token: string }) {
  const [stats, setStats] = useState<StatsData>({ total: 0, available: 0, used: 0 });

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/codes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) setStats(data.stats);
      });
  }, [token]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <p className="text-slate-400 text-xs md:text-sm">Tổng Số Mã</p>
        <p className="text-2xl md:text-3xl font-bold text-white mt-1">{stats.total}</p>
      </div>
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <p className="text-emerald-400 text-xs md:text-sm font-semibold">Mã Còn Tồn (Khả dụng)</p>
        <p className="text-2xl md:text-3xl font-bold text-emerald-400 mt-1">{stats.available}</p>
      </div>
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <p className="text-[#50899c] text-xs md:text-sm font-semibold">Mã Đã Phân Phối</p>
        <p className="text-2xl md:text-3xl font-bold text-[#50899c] mt-1">{stats.used}</p>
      </div>
    </div>
  );
}

function CodeInventory({ token }: { token: string }) {
  const [codes, setCodes] = useState<CodeEntry[]>([]);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "AVAILABLE" | "USED">("ALL");

  const fetchCodes = () => {
    fetch(`${API_BASE_URL}/admin/codes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCodes(data.data || []);
      });
  };

  useEffect(() => {
    fetchCodes();
  }, [token]);

  // Xóa mã code khỏi kho
  const handleDeleteCode = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mã này khỏi hệ thống?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/codes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCodes((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(data.message || "Không thể xóa mã này!");
      }
    } catch (err) {
      alert("Lỗi kết nối tới máy chủ!");
    }
  };

  const filteredCodes = codes.filter((c) => {
    if (filterStatus === "AVAILABLE") return c.status === "AVAILABLE";
    if (filterStatus === "USED") return c.status === "USED";
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Nút Công Tắc Lọc Trạng Thái */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <span className="text-sm font-semibold text-slate-300">Bộ lọc trạng thái:</span>
        <div className="inline-flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === "ALL"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Tất cả ({codes.length})
          </button>
          <button
            onClick={() => setFilterStatus("AVAILABLE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === "AVAILABLE"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Khả dụng ({codes.filter((c) => c.status === "AVAILABLE").length})
          </button>
          <button
            onClick={() => setFilterStatus("USED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === "USED"
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Đã dùng ({codes.filter((c) => c.status === "USED").length})
          </button>
        </div>
      </div>

      {/* Bảng Hiển Thị Mã Code */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-950 border-b border-slate-800">
            <tr>
              <th className="p-4 text-xs text-slate-400 uppercase">ID</th>
              <th className="p-4 text-xs text-slate-400 uppercase">Mã Code</th>
              <th className="p-4 text-xs text-slate-400 uppercase">Trạng Thái</th>
              <th className="p-4 text-xs text-slate-400 uppercase text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredCodes.map((c) => (
              <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-sm text-slate-400">#{c.id}</td>
                <td className="p-4 font-mono font-bold text-[#50899c]">{c.code}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      c.status === "AVAILABLE"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {c.status === "AVAILABLE" ? "Khả dụng" : "Đã dùng"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {c.status === "AVAILABLE" && (
                    <button
                      onClick={() => handleDeleteCode(c.id)}
                      className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                      title="Xóa mã này"
                    >
                      <Trash2 size={14} />
                      <span className="hidden sm:inline">Xóa</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredCodes.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  Không có mã nào phù hợp với bộ lọc này
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DistributedCodes({ token }: { token: string }) {
  const [history, setHistory] = useState<DistributedEntry[]>([]);

  const fetchHistory = () => {
    fetch(`${API_BASE_URL}/admin/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setHistory(data.data || []);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  // Xóa lượt nhận để giải phóng mã lại cho người khác
  const handleDeleteRedemption = async (id: number) => {
    if (!confirm("Xóa lượt nhận này sẽ giải phóng mã code về trạng thái 'Khả dụng'. Bạn có chắc chắn?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/redemptions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(data.message || "Không thể xóa lượt nhận!");
      }
    } catch (err) {
      alert("Lỗi kết nối tới máy chủ!");
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-x-auto">
      <table className="w-full text-left min-w-[500px]">
        <thead className="bg-slate-950 border-b border-slate-800">
          <tr>
            <th className="p-3 sm:p-4 text-xs text-slate-400 uppercase">Mã Code</th>
            <th className="p-3 sm:p-4 text-xs text-slate-400 uppercase">Người Nhận</th>
            <th className="p-3 sm:p-4 text-xs text-slate-400 uppercase">Thời Gian Cấp</th>
            <th className="p-3 sm:p-4 text-xs text-slate-400 uppercase text-right">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id} className="border-b border-slate-800/50">
              <td className="p-3 sm:p-4 font-mono font-bold text-[#50899c] text-xs sm:text-sm">{h.code}</td>
              <td className="p-3 sm:p-4 text-xs sm:text-sm text-slate-300">{h.recipient_identifier}</td>
              <td className="p-3 sm:p-4 text-xs sm:text-sm text-slate-500">{new Date(h.claimed_at).toLocaleString("vi-VN")}</td>
              <td className="p-3 sm:p-4 text-right">
                <button
                  onClick={() => handleDeleteRedemption(h.id)}
                  className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                  title="Xóa lượt nhận và hoàn lại code"
                >
                  <Trash2 size={14} />
                  <span className="hidden sm:inline">Hủy lượt</span>
                </button>
              </td>
            </tr>
          ))}
          {history.length === 0 && (
            <tr><td colSpan={4} className="p-8 text-center text-slate-500">Chưa có lịch sử cấp mã</td></tr>
          )}
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
      setMsg(`Đã nạp thành công ${data.data.addedCount} mã! (Bỏ qua ${data.data.duplicateCount} mã lặp)`);
      setRawCodes("");
    } else {
      setMsg(data.message || "Lỗi nạp mã!");
    }
  };

  return (
    <div className="bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 max-w-xl w-full">
      <h3 className="font-bold mb-4 text-white text-base sm:text-lg">Nạp Mã Vào Kho</h3>
      <textarea
        value={rawCodes}
        onChange={(e) => setRawCodes(e.target.value)}
        placeholder="Dán danh sách mã vào đây (mỗi mã 1 dòng hoặc cách nhau bởi dấu phẩy)..."
        className="w-full h-40 p-4 bg-slate-950 border border-slate-800 text-white rounded-xl font-mono text-sm outline-none mb-4"
      />
      <button
        onClick={handleImport}
        className="w-full py-3 bg-[#50899c] hover:opacity-90 text-white rounded-xl font-bold transition-opacity text-sm sm:text-base cursor-pointer"
      >
        Nạp Ngay
      </button>
      {msg && <p className="mt-4 text-xs sm:text-sm text-emerald-400 font-medium">{msg}</p>}
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
      {view === "home" && (
        <HomePage onAdminLogin={() => setShowAdminModal(true)} />
      )}
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