/**
 * Cloudflare Pages Middleware
 * The Ellys' Welcome — Canonical Domain & Redirect Enforcement
 * 
 * Gestione reindirizzamenti 301 permanenti:
 * 1. Da www.theellyswelcome.com verso theellyswelcome.com
 * 2. Dal dominio tecnico theellyswelcome.pages.dev verso theellyswelcome.com
 * Risolve definitivamente la segnalazione Google Search Console "Pagina duplicata senza URL canonico".
 */

export async function onRequest(context) {
  const url = new URL(context.request.url);

  // 1. Reindirizzamento 301 da www a dominio principale (apice)
  if (url.hostname === 'www.theellyswelcome.com') {
    url.hostname = 'theellyswelcome.com';
    return Response.redirect(url.toString(), 301);
  }

  // 2. Reindirizzamento 301 da Cloudflare Pages preview/staging a dominio principale
  if (url.hostname.endsWith('.pages.dev')) {
    url.hostname = 'theellyswelcome.com';
    return Response.redirect(url.toString(), 301);
  }

  // Prosegui con la richiesta standard
  return context.next();
}
