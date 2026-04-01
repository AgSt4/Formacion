export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 shadow-card">
        <h1 className="font-heading text-3xl text-navy">No fue posible completar el acceso</h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">
          Vuelve a intentarlo desde Google y verifica que las URLs de redireccion esten configuradas en Supabase y
          Vercel.
        </p>
      </div>
    </main>
  );
}
