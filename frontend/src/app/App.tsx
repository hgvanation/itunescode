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
} from "lucide-react";

import image1 from "./image.svg";
import vector from "./vector.svg";
import vector2 from "./vector-2.svg";
import vector3 from "./vector-3.svg";
import vector4 from "./vector-4.svg";
import vector5 from "./vector-5.svg";
import vector6 from "./vector-6.svg";

// ── CẤU HÌNH API BACKEND ────────────────────────────────────────────────────
const API_BASE_URL = "https://itunes-sangwon.onrender.com";

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
    href: "https://www.facebook.com/",
    icon: (
      <img
        className="absolute w-[75.00%] h-[95.83%] top-[4.17%] left-[25.00%]"
        alt=""
        src={vector4}
      />
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    icon: (
      <>
        <img
          className="absolute w-[95.83%] h-[95.83%] top-[4.17%] left-[4.17%]"
          alt=""
          src={vector}
        />
        <img
          className="absolute w-[70.65%] h-[71.01%] top-[28.99%] left-[29.35%]"
          alt=""
          src={image1}
        />
        <img
          className="absolute w-[31.25%] h-[77.08%] top-[22.92%] left-[68.75%]"
          alt=""
          src={vector2}
        />
      </>
    ),
  },
  {
    label: "Threads",
    href: "https://www.threads.net/",
    icon: (
      <img
        className="absolute w-[93.86%] h-full top-0 left-[6.14%]"
        alt=""
        src={vector3}
      />
    ),
  },
];

// ── HomePage ──────────────────────────────────────────────────────────────────
function HomePage({ onAdminLogin }: { onAdminLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [claimedCode, setClaimedCode] = useState("");
  const [stats, setStats] = useState<StatsData>({ total: 0, available: 0, used: 0 });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Tải thống kê thực tế từ Backend khi load trang
  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/codes`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormStatus("");
    setClaimedCode("");

    if (!email.trim()) {
      setFormStatus("Vui lòng nhập địa chỉ email hoặc Threads ID.");
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

  const statisticsList = [
    { value: stats.total.toString(), label: "Tổng code", valueClassName: "text-[#e40f48]" },
    { value: stats.available.toString(), label: "Còn lại", valueClassName: "text-[#50899c]" },
    { value: stats.used.toString(), label: "Đã nhận", valueClassName: "text-[#474747]" },
  ];

  return (
    <main className="[background:radial-gradient(50%_50%_at_34%_37%,rgba(80,137,156,0.28)_0%,rgba(80,137,156,0)_52%),radial-gradient(50%_50%_at_66%_63%,rgba(26,179,255,0.22)_0%,rgba(26,179,255,0)_52%),radial-gradient(50%_50%_at_50%_50%,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0)_60%),linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(0,0,0,0)_100%),linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,1)_100%),linear-gradient(0deg,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] w-full min-w-[1440px] min-h-[1024px] relative">
      <header className="flex w-[1440px] h-20 items-center justify-between px-[120px] py-0 absolute top-0 left-[calc(50.00%_-_720px)] bg-[#00000080] shadow-[0px_2px_4px_#00000040] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)]">
        <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]" aria-label="Uriwon và LeoSpaze">
          <div className="relative w-[59px] h-8 bg-[url(/image-uriwon.png)] bg-cover bg-[50%_50%]" />
          <div className="inline-flex items-start flex-[0_0_auto] flex-col relative" aria-hidden="true">
            <div className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-Bold',Helvetica] font-bold text-white text-xs tracking-[0] leading-4 whitespace-nowrap">
              ×
            </div>
          </div>
          <div className="relative w-[79px] h-20 bg-[url(/image-leospaze-2.png)] bg-cover bg-[50%_50%]" />
        </div>

        <button
          className="all-unset box-border inline-flex items-center gap-1.5 px-4 py-2 relative flex-[0_0_auto] rounded-[20px] border-[0.73px] border-solid border-[#ffffff80] cursor-pointer hover:bg-white/10 transition-colors"
          type="button"
          onClick={onAdminLogin}
        >
          <span className="relative w-3 h-3" aria-hidden="true">
            <img className="absolute w-[91.67%] h-[58.33%] top-[41.67%] left-[8.33%]" alt="" src={vector5} />
            <img className="absolute w-[75.00%] h-[95.83%] top-[4.17%] left-[25.00%]" alt="" src={vector6} />
          </span>
          <span className="inline-flex items-center flex-[0_0_auto] flex-col relative">
            <span className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-Medium',Helvetica] font-medium text-white text-sm text-center tracking-[0] leading-5 whitespace-nowrap">
              Đăng nhập Admin
            </span>
          </span>
        </button>
      </header>

      <section
        className="inline-flex flex-col items-center gap-6 p-10 absolute top-[calc(50.00%_-_352px)] left-[calc(50.00%_-_332px)] rounded-xl backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)]"
        aria-labelledby="page-title"
      >
        <div className="flex items-start justify-center relative self-stretch w-full flex-[0_0_auto]">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 relative self-stretch flex-[0_0_auto] bg-[#50899c14] rounded-[24403200px] border-[0.73px] border-solid border-[#ffffff40] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)]">
            <span className="relative w-fit [font-family:'Montserrat-SemiBold',Helvetica] font-semibold text-white text-xs tracking-[0.30px] leading-4 whitespace-nowrap">
              🎵 iTunes Streaming Code
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center relative self-stretch w-full flex-[0_0_auto]">
          <h1 id="page-title" className="inline-flex items-start justify-center gap-2.5 relative flex-[0_0_auto]">
            <span className="relative w-[204px] mt-[-1.00px] [font-family:'Montserrat-Bold',Helvetica] font-bold text-white text-4xl tracking-[0] leading-[45px]">
              Nhận code
            </span>
            <span className="relative w-fit mt-[-1.00px] bg-[linear-gradient(117deg,rgba(228,15,72,1)_0%,rgba(255,143,123,1)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Montserrat-Bold',Helvetica] font-bold text-transparent text-4xl text-center tracking-[0] leading-[45px] whitespace-nowrap">
              iTunes
            </span>
          </h1>
          <div className="flex flex-col items-center pt-3 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
            <p className="relative w-[482px] mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-white text-base text-center tracking-[0] leading-6">
              Nhập địa chỉ email hoặc Threads ID để nhận code iTunes đưa bài hát của ALD1 lên top 1 bảng xếp hạng!
            </p>
          </div>
        </div>

        <form
          className="inline-flex flex-col items-start p-10 relative flex-[0_0_auto] bg-[#000000cc] rounded-lg border-2 border-solid border-[#50899c33] shadow-[0px_1px_2px_-1px_#50899c66,0px_1px_3px_#50899c66] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)]"
          onSubmit={handleSubmit}
        >
          <div className="items-start gap-6 flex flex-col relative self-stretch w-full flex-[0_0_auto]">
            <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
              <div className="flex flex-col items-start pt-0 pb-2 px-0 relative self-stretch w-full flex-[0_0_auto]">
                <label
                  className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-Medium',Helvetica] font-medium text-white text-sm tracking-[0] leading-5 whitespace-nowrap"
                  htmlFor="input-1"
                >
                  Email / Threads Username
                </label>
              </div>
              <input
                className="w-[500px] h-[47px] px-4 py-3 bg-white rounded-lg overflow-hidden border-[1.45px] border-solid border-[#50899c33] relative self-stretch [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#1a0633] text-sm tracking-[0] leading-[normal] outline-none"
                id="input-1"
                name="email"
                placeholder="email@example.com hoặc @threads_user"
                type="text"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required={true}
              />
            </div>

            <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
              <button
                className="all-unset box-border flex flex-col w-[500px] items-center justify-center px-0 py-3 relative flex-[0_0_auto] rounded-[100px] shadow-[0px_4px_20px_#18c2e04c] [background:radial-gradient(50%_50%_at_65%_45%,rgba(80,137,156,1)_0%,rgba(0,97,104,1)_100%)] cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                <span className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-SemiBold',Helvetica] font-semibold text-white text-sm text-center tracking-[0] leading-5 whitespace-nowrap">
                  {loading ? "Đang xử lý..." : "Lấy Code Ngay →"}
                </span>
              </button>

              {formStatus && (
                <div className="w-full text-center text-xs font-medium text-amber-400">
                  {formStatus}
                </div>
              )}

              {claimedCode && (
                <div className="w-full flex flex-col items-center gap-2 p-3 bg-white/10 rounded-lg border border-sky-300/40 mt-2">
                  <span className="text-xs text-slate-300">Mã code của bạn:</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-mono font-bold text-sky-400 tracking-wider">
                      {claimedCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="p-1.5 bg-sky-500/20 text-sky-300 rounded hover:bg-sky-500/40 transition-colors"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  {copied && <span className="text-[10px] text-emerald-400">✓ Đã sao chép!</span>}
                </div>
              )}

              <div className="flex flex-col items-center relative self-stretch w-full flex-[0_0_auto]">
                <p className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#e40f48] text-xs text-center tracking-[0] leading-4 whitespace-nowrap">
                  ‼️ Mỗi email/Threads ID chỉ được nhận một code iTunes duy nhất.
                </p>
              </div>
            </div>
          </div>
        </form>

        <dl className="grid grid-cols-3 grid-rows-[75.45px] h-fit gap-[12px_22px]">
          {statisticsList.map((statistic, index) => (
            <div
              className={`col-[${index + 1}_/_${index + 2}] relative row-[1_/_2] w-[180px] h-[75px] flex flex-col items-center p-3 bg-[#ffffffe6] rounded-lg border-[0.73px] border-solid border-pink-100 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)]`}
              key={statistic.label}
            >
              <dd className={`${statistic.valueClassName} relative w-fit mt-[-1.00px] [font-family:'Montserrat-Bold',Helvetica] font-bold text-[32px] text-center tracking-[0] leading-8 whitespace-nowrap`}>
                {statistic.value}
              </dd>
              <dt className="flex flex-col w-[115.88px] h-[18px] items-center pt-0.5 pb-0 px-0 relative">
                <span className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-black text-sm text-center tracking-[0] leading-4 whitespace-nowrap">
                  {statistic.label}
                </span>
              </dt>
            </div>
          ))}
        </dl>
      </section>

      <footer className="flex w-[1440px] h-20 items-center justify-between px-[120px] py-0 absolute top-[944px] left-[calc(50.00%_-_720px)] bg-[#50899c80] shadow-[0px_-2px_4px_#00000040] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)]">
        <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]" aria-label="Uriwon và LeoSpaze">
          <div className="relative w-[59px] h-8 bg-[url(/image.png)] bg-cover bg-[50%_50%]" />
          <div className="inline-flex items-start flex-[0_0_auto] flex-col relative" aria-hidden="true">
            <div className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-Bold',Helvetica] font-bold text-white text-xs tracking-[0] leading-4 whitespace-nowrap">
              ×
            </div>
          </div>
          <div className="relative w-[79px] h-20 bg-[url(/image-leospaze.png)] bg-cover bg-[50%_50%]" />
        </div>
        <nav className="inline-flex items-center gap-4 relative flex-[0_0_auto]" aria-label="Mạng xã hội">
          {socialLinks.map((socialLink) => (
            <a
              className="inline-flex items-center gap-1.5 relative flex-[0_0_auto]"
              href={socialLink.href}
              key={socialLink.label}
              target="_blank"
              rel="noreferrer"
              aria-label={socialLink.label}
            >
              <span className="relative w-[17px] h-[17px]" aria-hidden="true">
                {socialLink.icon}
              </span>
              <span className="inline-flex items-start flex-[0_0_auto] flex-col relative">
                <span className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-Medium',Helvetica] font-medium text-white text-xs tracking-[0] leading-4 whitespace-nowrap">
                  {socialLink.label}
                </span>
              </span>
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
      <div className="w-full max-w-sm p-8 bg-[#000000eb] border border-[#50899c40] rounded-2xl relative text-white shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={18} />
        </button>
        <h2 className="text-xl font-bold mb-6 text-center text-white">Đăng Nhập Admin</h2>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {error && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-cyan-600 to-teal-700 hover:opacity-90 transition-opacity"
          >
            {loading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [section, setSection] = useState<AdminSection>("dashboard");

  return (
    <div className="min-h-screen flex bg-slate-950 text-white">
      <aside className="w-64 bg-slate-900 p-6 border-r border-slate-800 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold mb-6 text-sky-400">ADMIN PANEL</h2>
          <nav className="flex flex-col gap-2">
            {[
              { id: "dashboard", label: "Bảng điều khiển", Icon: LayoutDashboard },
              { id: "inventory", label: "Kho Mã", Icon: Package },
              { id: "distributed", label: "Lịch Sử Nhận Mã", Icon: CheckCircle2 },
              { id: "import", label: "Nạp Kho Mã", Icon: Upload },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id as AdminSection)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                  section === item.id ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" : "text-slate-400 hover:bg-white/5"
                }`}
              >
                <item.Icon size={17} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors">
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

// ── Admin Components Gọi API Thực Tế ─────────────────────────────────────────
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
    <div className="grid grid-cols-3 gap-6">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <p className="text-slate-400 text-sm">Tổng Số Mã</p>
        <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
      </div>
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <p className="text-emerald-400 text-sm font-semibold">Mã Còn Tồn (Khả dụng)</p>
        <p className="text-3xl font-bold text-emerald-400 mt-2">{stats.available}</p>
      </div>
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <p className="text-sky-400 text-sm font-semibold">Mã Đã Phân Phối</p>
        <p className="text-3xl font-bold text-sky-400 mt-2">{stats.used}</p>
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
        if (data.success) setCodes(data.data || []);
      });
  }, [token]);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-950 border-b border-slate-800">
          <tr>
            <th className="p-4 text-xs text-slate-400 uppercase">ID</th>
            <th className="p-4 text-xs text-slate-400 uppercase">Mã Code</th>
            <th className="p-4 text-xs text-slate-400 uppercase">Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          {codes.map((c) => (
            <tr key={c.id} className="border-b border-slate-800/50">
              <td className="p-4 text-sm text-slate-400">#{c.id}</td>
              <td className="p-4 font-mono font-bold text-sky-400">{c.code}</td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                  {c.status === 'AVAILABLE' ? 'Khả dụng' : 'Đã dùng'}
                </span>
              </td>
            </tr>
          ))}
          {codes.length === 0 && (
            <tr><td colSpan={3} className="p-8 text-center text-slate-500">Kho mã rỗng</td></tr>
          )}
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
        if (data.success) setHistory(data.data || []);
      });
  }, [token]);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-950 border-b border-slate-800">
          <tr>
            <th className="p-4 text-xs text-slate-400 uppercase">Mã Code</th>
            <th className="p-4 text-xs text-slate-400 uppercase">Người Nhận</th>
            <th className="p-4 text-xs text-slate-400 uppercase">Thời Gian Cấp</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id} className="border-b border-slate-800/50">
              <td className="p-4 font-mono font-bold text-sky-400">{h.code}</td>
              <td className="p-4 text-sm text-slate-300">{h.recipient_identifier}</td>
              <td className="p-4 text-sm text-slate-500">{new Date(h.claimed_at).toLocaleString("vi-VN")}</td>
            </tr>
          ))}
          {history.length === 0 && (
            <tr><td colSpan={3} className="p-8 text-center text-slate-500">Chưa có lịch sử cấp mã</td></tr>
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
      setMsg(`Đã nạp thành công ${data.data.addedCount} mã! (Phát hiện & bỏ qua ${data.data.duplicateCount} mã lặp)`);
      setRawCodes("");
    } else {
      setMsg(data.message || "Lỗi nạp mã!");
    }
  };

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 max-w-xl">
      <h3 className="font-bold mb-4 text-white">Nạp Mã Vào Kho</h3>
      <textarea
        value={rawCodes}
        onChange={(e) => setRawCodes(e.target.value)}
        placeholder="Dán danh sách mã vào đây (phân tách bằng dòng mới hoặc dấu phẩy)..."
        className="w-full h-40 p-4 bg-slate-950 border border-slate-800 text-white rounded-xl font-mono text-sm outline-none mb-4"
      />
      <button
        onClick={handleImport}
        className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-colors"
      >
        Nạp Ngay
      </button>
      {msg && <p className="mt-4 text-sm text-emerald-400 font-medium">{msg}</p>}
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