import { loginAdmin } from '@/lib/admin-auth';

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form action={loginAdmin} className="w-full max-w-sm space-y-5 border border-neutral-200 p-6 rounded-lg">
        <div>
          <h1 className="text-2xl font-semibold">Admin login</h1>
          <p className="text-sm text-neutral-600 mt-1">Sign in to manage product reviews.</p>
        </div>

        {error && <p className="text-sm text-red-600">Invalid password.</p>}

        <label className="block text-sm font-medium">
          Password
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="mt-2 w-full border border-neutral-300 rounded px-3 py-2"
          />
        </label>

        <button type="submit" className="w-full rounded bg-black px-4 py-2 text-white hover:bg-neutral-800">
          Sign in
        </button>
      </form>
    </main>
  );
}