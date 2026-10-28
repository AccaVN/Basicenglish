import Link from "next/link";

export default function VerifyRequestPage() {
  return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5"><div className="rounded-3xl border border-slate-200 bg-white p-7"><h1 className="text-2xl font-black">Kiểm tra email của bạn</h1><p className="mt-3 leading-7 text-slate-600">Nếu email hợp lệ, chúng tôi đã gửi liên kết đăng nhập. Hãy kiểm tra hộp thư đến và thư rác.</p><Link className="mt-6 inline-block font-semibold text-blue-700" href="/">Về trang chủ</Link></div></main>;
}
