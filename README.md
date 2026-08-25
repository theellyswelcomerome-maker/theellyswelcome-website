# The Ellys' Welcome — Official Website Repository

Vetrina istituzionale (B2B & B2C) per **The Ellys' Welcome**, property management di dimore esclusive nel cuore di Roma.

- **Stack**: HTML5, Vanilla CSS (Brand Palette Imperiale), Vanilla JS (ES Modules), Cloudflare Pages Functions
- **Hosting**: Cloudflare Pages (Edge Serverless CDN)
- **Dominio**: `https://theellyswelcome.com` (e `https://theellyswelcome.pages.dev`)

---

## Struttura del Progetto
```
theellyswelcome-website/
├── index.html              # Landing page istituzionale con SEO & Schema.org JSON-LD
├── style.css               # Master stylesheet (Palette Imperiale)
├── main.js                 # Script client (gestione lead, UI, tracking eventi live)
├── robots.txt              # Regole di crawling per motori di ricerca
├── sitemap.xml             # Mappa XML per l'indicizzazione Google
├── functions/
│   └── api/
│       └── lead.js         # Cloudflare Pages Function: endpoint /api/lead per invio email
├── assets/                 # Logo ufficiale e foto reali degli alloggi
│   ├── logo.png
│   ├── giovanni.jpg
│   ├── spacedom.jpg
│   ├── ellyshouse.png
│   └── dipohouse.png
└── README.md
```

---

## Variabili d'Ambiente Cloudflare Pages (Opzionali per Email API)
Nel pannello **Cloudflare Pages > Settings > Environment Variables**:
- `RESEND_API_KEY`: Chiave API Resend per recapito email istantaneo via SMTP/HTTP.
- `NOTIFICATION_EMAIL`: Email di destinazione (default: `theellyswelcomerome@gmail.com`).

---

## Analytics & Monitoraggio Live
1. **Cloudflare Web Analytics**: Attivo a livello di Cloudflare Pages (dashboard in tempo reale, zero cookie, 100% GDPR compliant).
2. **Google Analytics 4**: Predisposto in `index.html` con tracciamento eventi per conversioni WhatsApp, visualizzazioni Airbnb e invio lead.
