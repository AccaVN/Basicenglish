import Link from "next/link";
import { signIn } from "../../../../auth";

export default function LoginPage() {
  return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
    <Link href="/" className="mb-6 text-sm font-semibold text-blue-700">← Trang chủ</Link>
    <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <h1 className="text-3xl font-black">Đăng nhập</h1>
      <p className="mt-2 text-slate-600">Lưu tiến độ và tiếp tục học ở bất cứ đâu.</p>
      <form action={async () => { "use server"; await signIn("google", { redirectTo: "/dashboard" }); }} className="mt-7">
        <button className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold">Tiếp tục với Google</button>
      </form>
      <form action={async (formData) => { "use server"; const email = String(formData.get("email") ?? ""); await signIn("nodemailer", { email, redirectTo: "/dashboard" }); }} className="mt-5">
        <label htmlFor="email" className="mb-2 block text-sm font-semibold">Hoặc đăng nhập bằng email</label>
        <input id="email" name="email" type="email" required placeholder="ban@example.com" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600" />
        <button className="mt-3 w-full rounded-xl bg-blue-700 px-4 py-3 font-bold text-white">Gửi liên kết đăng nhập</button>
      </form>
      <p className="mt-5 text-xs leading-5 text-slate-500">Bằng cách tiếp tục, bạn đồng ý sử dụng website theo các điều khoản và chính sách quyền riêng tư khi được công bố.</p>
    </div>
  </main>;
}
