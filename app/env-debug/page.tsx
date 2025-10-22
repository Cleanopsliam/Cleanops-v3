export default function EnvDebug() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const mask = (v?: string) =>
    v ? v.slice(0, 12) + '…' + v.slice(-4) : '(missing)';

  return (
    <pre style={{whiteSpace:'pre-wrap'}}>
{`NEXT_PUBLIC_SUPABASE_URL: ${url ?? '(missing)'}
NEXT_PUBLIC_SUPABASE_ANON_KEY: ${mask(anon)}`}
    </pre>
  );
}
