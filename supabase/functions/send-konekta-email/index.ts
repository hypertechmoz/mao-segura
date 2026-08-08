import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') ?? Deno.env.get('SENDINBLUE_API_KEY');
const FROM_EMAIL = Deno.env.get('KONEKTA_FROM_EMAIL') ?? 'konekta@morstar.online';
const FROM_NAME = Deno.env.get('KONEKTA_FROM_NAME') ?? 'Konekta';

type EmailType = 'welcome' | 'email_verified';

function buildEmail(type: EmailType, name: string, appUrl: string) {
  const loginUrl = appUrl.replace(/\/$/, '') + '/auth/login';

  if (type === 'welcome') {
    return {
      subject: 'Bem-vindo ao Konekta!',
      html: `
        <p>Olá ${name},</p>
        <p>O seu email foi confirmado com sucesso. Bem-vindo ao Konekta!</p>
        <p>Explore oportunidades, conecte-se com clientes e profissionais em Moçambique.</p>
        <p><a href="${loginUrl}">Aceder ao Konekta</a></p>
      `,
    };
  }

  return {
    subject: 'Email verificado — pode aceder ao Konekta',
    html: `
      <p>Olá ${name},</p>
      <p>O seu email foi verificado com sucesso. Já pode aceder à plataforma Konekta.</p>
      <p><a href="${loginUrl}">Entrar no Konekta</a></p>
    `,
  };
}

async function sendViaBrevoApi(
  toEmail: string,
  toName: string,
  subject: string,
  htmlContent: string,
) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY!,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: toEmail, name: toName || toEmail }],
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Brevo API error', res.status, text);
    if (res.status === 401 || text.includes('Key not found') || text.includes('API key')) {
      throw new Error('INVALID_BREVO_KEY');
    }
    throw new Error(`Brevo API ${res.status}`);
  }

  return res.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    if (!BREVO_API_KEY) {
      return new Response(JSON.stringify({ error: 'BREVO_API_KEY not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (BREVO_API_KEY.startsWith('xsmtpsib-')) {
      return new Response(JSON.stringify({
        error: 'Use a chave API do Brevo (xkeysib-...), não a chave SMTP (xsmtpsib-...). Crie em Brevo → SMTP & API → API Keys.',
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { type, email, name, appUrl } = await req.json();

    if (!email || !type) {
      return new Response(JSON.stringify({ error: 'Missing email or type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = buildEmail(type as EmailType, name || 'Utilizador', appUrl || 'https://morstar-konekta.web.app');
    const data = await sendViaBrevoApi(email, name || 'Utilizador', payload.subject, payload.html);

    return new Response(JSON.stringify({ ok: true, data }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Brevo error:', err);
    const message = err instanceof Error && err.message === 'INVALID_BREVO_KEY'
      ? 'Chave Brevo inválida. Use uma API Key (xkeysib-...) em Brevo → SMTP & API → API Keys.'
      : 'Failed to send email';
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
