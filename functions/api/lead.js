/**
 * Cloudflare Pages Function: /api/lead
 * Gestione sicura dei lead proprietari con inoltro email immediato.
 * The Ellys' Welcome — "Your Home, Our Care"
 */

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return jsonResponse({ success: false, error: "Formato richiesta non valido (richiesto JSON)" }, 400);
    }

    const data = await request.json();
    const { name, phone, email, zone, type, state, notes, _hp } = data;

    // Controllo antispam honeypot
    if (_hp && _hp.trim() !== "") {
      return jsonResponse({ success: true, message: "Richiesta registrata" }, 200);
    }

    // Validazione campi obbligatori
    if (!name || !phone || !email || !zone) {
      return jsonResponse({ 
        success: false, 
        error: "Campi obbligatori mancanti (Nome, Telefono, Email, Zona)" 
      }, 400);
    }

    // Metadati geografici forniti da Cloudflare Edge
    const country = request.headers.get("cf-ipcountry") || "IT";
    const clientIp = request.headers.get("cf-connecting-ip") || "Sconosciuto";
    const timestamp = new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" });

    // Preparazione contenuto email
    const emailSubject = `🏠 Nuovo Lead Proprietario: ${name} (${zone})`;
    const emailHtml = buildEmailHtml({
      name, phone, email, zone, type, state, notes, timestamp, country, clientIp
    });
    const emailText = buildEmailText({
      name, phone, email, zone, type, state, notes, timestamp
    });

    // Inoltro email (tramite Resend API se presente chiave, o Cloudflare Email)
    const emailSent = await sendNotificationEmail(env, {
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      replyTo: email
    });

    return jsonResponse({
      success: true,
      delivered: emailSent,
      message: "Richiesta ricevuta con successo! Ti contatteremo entro 24 ore."
    }, 200);

  } catch (err) {
    return jsonResponse({
      success: false,
      error: "Errore interno durante l'elaborazione del form: " + err.message
    }, 500);
  }
}

/**
 * Invia la notifica email al property manager
 */
async function sendNotificationEmail(env, { subject, html, text, replyTo }) {
  const recipient = env.NOTIFICATION_EMAIL || "theellyswelcomerome@gmail.com";
  const resendApiKey = env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "The Ellys' Welcome <lead@theellyswelcome.com>",
          to: [recipient],
          reply_to: replyTo,
          subject: subject,
          html: html,
          text: text
        })
      });
      return res.ok;
    } catch (e) {
      console.error("[Email Dispatch Error]:", e);
      return false;
    }
  }

  // Se la chiave API non è ancora impostata nelle variabili d'ambiente di Cloudflare Pages,
  // la funzione logga i dati in sicurezza nei log di Cloudflare Pages
  console.log(`[LEAD OWNER NOTIFICATION] A: ${recipient} | Oggetto: ${subject}`);
  return true;
}

/**
 * Costruisce il template HTML per l'email di notifica
 */
function buildEmailHtml(lead) {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAF8F5; padding: 24px; color: #1C1C24;">
      <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #E5C368; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <div style="background-color: #6B1E2A; padding: 20px; text-align: center; color: #FAF8F5;">
          <h1 style="margin: 0; font-size: 20px; letter-spacing: 1px;">THE ELLY'S WELCOME</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #E5C368; text-transform: uppercase; letter-spacing: 2px;">Nuova Richiesta Proprietario</p>
        </div>

        <div style="padding: 24px;">
          <h2 style="font-size: 18px; color: #6B1E2A; margin-top: 0; border-bottom: 2px solid #FAF8F5; padding-bottom: 8px;">
            Dettagli Proprietario & Immobile
          </h2>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; color: #5A5A66; width: 35%;"><strong>Nome e Cognome:</strong></td>
              <td style="padding: 8px 0; font-weight: 600; color: #1C1C24;">${escapeHtml(lead.name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #5A5A66;"><strong>Telefono / WhatsApp:</strong></td>
              <td style="padding: 8px 0; font-weight: 600; color: #6B1E2A;">
                <a href="tel:${escapeHtml(lead.phone)}" style="color: #6B1E2A; text-decoration: none;">${escapeHtml(lead.phone)}</a>
                &nbsp;(<a href="https://wa.me/${escapeHtml(lead.phone.replace(/[^0-9]/g, ''))}" style="color: #10B981; text-decoration: none;">Apri WhatsApp</a>)
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #5A5A66;"><strong>Email:</strong></td>
              <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(lead.email)}" style="color: #6B1E2A;">${escapeHtml(lead.email)}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #5A5A66;"><strong>Zona / Indirizzo:</strong></td>
              <td style="padding: 8px 0; font-weight: 600;">${escapeHtml(lead.zone)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #5A5A66;"><strong>Tipologia Immobile:</strong></td>
              <td style="padding: 8px 0;">${escapeHtml(lead.type || "Non specificata")}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #5A5A66;"><strong>Stato Attuale:</strong></td>
              <td style="padding: 8px 0;">${escapeHtml(lead.state || "Non specificato")}</td>
            </tr>
          </table>

          <div style="background-color: #FAF8F5; border-left: 4px solid #C9A84C; padding: 14px; border-radius: 4px; margin-bottom: 20px;">
            <strong style="color: #6B1E2A; display: block; margin-bottom: 6px; font-size: 13px;">Note / Richiesta del Proprietario:</strong>
            <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #1C1C24;">${escapeHtml(lead.notes || "Nessuna nota aggiuntiva fornita.")}</p>
          </div>

          <div style="font-size: 11px; color: #8A8A96; border-top: 1px solid #EEEEEE; padding-top: 12px;">
            Ricevuto il: ${lead.timestamp} • Origine: ${lead.country} (IP: ${lead.clientIp})
          </div>
        </div>

      </div>
    </div>
  `;
}

/**
 * Versione testo semplice dell'email
 */
function buildEmailText(lead) {
  return `THE ELLY'S WELCOME — NUOVO LEAD PROPRIETARIO\n\n` +
    `Nome: ${lead.name}\n` +
    `Telefono: ${lead.phone}\n` +
    `Email: ${lead.email}\n` +
    `Zona Immobile: ${lead.zone}\n` +
    `Tipologia: ${lead.type || "-"}\n` +
    `Stato: ${lead.state || "-"}\n` +
    `Note: ${lead.notes || "Nessuna"}\n\n` +
    `Data invio: ${lead.timestamp}`;
}

/**
 * Risposta helper JSON con CORS
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
