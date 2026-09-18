/**
 * The Ellys' Welcome — Main Client Scripts
 * Gestione form lead, interazioni UI e tracking eventi in tempo reale.
 */

// Inizializzazione al caricamento del DOM
document.addEventListener("DOMContentLoaded", () => {
  setupTrackingListeners();
});

/**
 * Gestione apertura/chiusura menu mobile
 */
export function toggleMobileMenu() {
  const nav = document.getElementById("navLinks");
  if (!nav) return;

  const isFlex = nav.style.display === "flex";
  nav.style.display = isFlex ? "none" : "flex";

  if (!isFlex) {
    nav.style.flexDirection = "column";
    nav.style.position = "absolute";
    nav.style.top = "100%";
    nav.style.left = "0";
    nav.style.right = "0";
    nav.style.background = "#1C1C24";
    nav.style.padding = "1.5rem";
    nav.style.borderBottom = "1px solid var(--border-gold)";
  }
}

/**
 * Gestione invio lead proprietario tramite Cloudflare Pages Function /api/lead
 */
export async function handleLeadSubmit(event) {
  event.preventDefault();
  const btn = document.getElementById("btnSubmitLead");
  const msgSuccess = document.getElementById("formSuccessMessage");
  const msgError = document.getElementById("formErrorMessage");

  if (msgError) msgError.style.display = "none";
  if (btn) {
    btn.disabled = true;
    btn.textContent = "⏳ Invio in corso...";
  }

  const leadData = {
    name: document.getElementById("ownerName")?.value || "",
    phone: document.getElementById("ownerPhone")?.value || "",
    email: document.getElementById("ownerEmail")?.value || "",
    zone: document.getElementById("ownerZone")?.value || "",
    type: document.getElementById("ownerType")?.value || "",
    state: document.getElementById("ownerState")?.value || "",
    notes: document.getElementById("ownerNotes")?.value || "",
    _hp: document.getElementById("ownerHp")?.value || "",
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadData)
    });

    const result = await response.json().catch(() => ({}));

    if (response.ok && result.success) {
      if (btn) btn.style.display = "none";
      if (msgSuccess) msgSuccess.style.display = "block";
      trackEvent("generate_lead", {
        lead_type: "owner",
        property_zone: leadData.zone,
        property_type: leadData.type
      });
    } else {
      throw new Error(result.error || "Errore durante l'invio");
    }
  } catch (err) {
    console.error("[Lead Submission Error]:", err);
    if (btn) {
      btn.disabled = false;
      btn.textContent = "☕ Riprova a Inviare la Richiesta →";
    }
    if (msgError) {
      msgError.style.display = "block";
    } else {
      alert("Si è verificato un problema durante l'invio. Puoi contattarci direttamente su WhatsApp al +39 338 3956240.");
    }
  }
}

/**
 * Tracciamento eventi per Google Analytics 4 e Web Analytics
 */
export function trackEvent(eventName, eventParams = {}) {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, eventParams);
  }
  // Log per debug / audit
  console.log(`[EVENT TRACKED]: ${eventName}`, eventParams);
}

/**
 * Collega i listener di tracciamento sui pulsanti di conversione (WhatsApp, Airbnb)
 */
function setupTrackingListeners() {
  // Clic su WhatsApp
  document.querySelectorAll("a[href*='wa.me']").forEach(el => {
    el.addEventListener("click", () => {
      trackEvent("contact_whatsapp", {
        source_url: window.location.href,
        button_text: el.innerText.trim()
      });
    });
  });

  // Clic su Airbnb
  document.querySelectorAll("a[href*='airbnb.it']").forEach(el => {
    el.addEventListener("click", () => {
      trackEvent("view_airbnb_external", {
        target_url: el.href,
        label: el.innerText.trim()
      });
    });
  });
}

/**
 * Gestione accordion interattivo FAQ
 */
export function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  if (!item) return;
  const isActive = item.classList.contains('active');

  // Chiude gli altri elementi aperti per pulizia visiva
  document.querySelectorAll('.faq-item.active').forEach(openItem => {
    if (openItem !== item) {
      openItem.classList.remove('active');
      openItem.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
    }
  });

  // Alterna stato corrente
  if (isActive) {
    item.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
  } else {
    item.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
  }
}

// Esportazione per l'uso globale inline HTML
window.toggleMobileMenu = toggleMobileMenu;
window.handleLeadSubmit = handleLeadSubmit;
window.trackEvent = trackEvent;
window.toggleFaq = toggleFaq;

