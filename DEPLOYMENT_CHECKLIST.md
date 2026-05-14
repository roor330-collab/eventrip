# ✅ Checklist de déploiement - Eventrip

Suivez cette checklist pour déployer l'application en production.

---

## 📋 Phase 1 : Configuration locale

### Duffel (Vols + Trains)
- [ ] Compte créé sur [duffel.com/developers](https://duffel.com/developers)
- [ ] Clé API generée (sk_test_... ou sk_live_...)
- [ ] Clé ajoutée à `.env.local` : `DUFFEL_API_KEY=...`
- [ ] Test API réussi : `curl` depuis terminal

### Booking.com (Hôtels)
- [ ] Compte partenaire créé sur [partner.booking.com](https://partner.booking.com)
- [ ] Validation partenaire confirmée (24-48h)
- [ ] API Key et Secret générés
- [ ] Variables d'environnement ajoutées :
  ```
  BOOKING_API_KEY=...
  BOOKING_API_SECRET=...
  BOOKING_AFFILIATE_ID=...
  ```
- [ ] Test API réussi

### Ticketmaster (Événements)
- [ ] Compte créé sur [developer.ticketmaster.com](https://developer.ticketmaster.com)
- [ ] Clé API obtenue
- [ ] Variable ajoutée : `TICKETMASTER_API_KEY=...`

### Supabase (Base de données + Auth)
- [ ] Projet créé sur [supabase.com](https://supabase.com)
- [ ] Database region : EU-West-1
- [ ] Credentials récupérées :
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Variables ajoutées à `.env.local`
- [ ] SQL schema exécuté (supabase-schema.sql) ✅
- [ ] Tables vérifiées dans Supabase Dashboard
- [ ] RLS policies activées

---

## 🧪 Phase 2 : Tests locaux

### Dev environment
- [ ] Cloner le repo : `git clone ...`
- [ ] Installer deps : `npm install`
- [ ] Fichier `.env.local` créé avec toutes les variables
- [ ] Dev server démarré : `npm run dev`
- [ ] App accessible sur `http://localhost:3000`

### Test des routes API
```bash
# 1. Vols
curl "http://localhost:3000/api/flights?from=Paris&to=Lyon&date=2024-06-15"
# ✅ Vérifier que les vols s'affichent

# 2. Hôtels
curl "http://localhost:3000/api/hotels?latitude=48.8566&longitude=2.3522&checkIn=2024-06-15&checkOut=2024-06-17"
# ✅ Vérifier les hôtels

# 3. Trains
curl "http://localhost:3000/api/trains?from=Paris&to=Lyon&date=2024-06-15"
# ✅ Vérifier les trains

# 4. Événements
curl "http://localhost:3000/api/events?q=taylor&city=Paris"
# ✅ Vérifier les événements
```

### Test UI
- [ ] Homepage charge correctement
- [ ] Search bar fonctionne (3 tabs)
- [ ] Recherche trouve les événements
- [ ] Package builder ajoute items
- [ ] Prix se recalculent
- [ ] Checkout page accessible

### Test Supabase
- [ ] Dashboard Supabase accessible
- [ ] Tables présentes et non vides
- [ ] RLS policies testées (auth user vs non-auth)

---

## 🚀 Phase 3 : Déploiement en production

### Code & Git
- [ ] Tous les fichiers committés
- [ ] `.env.local` **non** commité (dans .gitignore)
- [ ] Branche `main` à jour

### Vercel (recommandé)
- [ ] Compte Vercel créé
- [ ] Projet créé depuis GitHub
- [ ] Variables d'environnement configurées dans Vercel Settings :
  - [ ] `DUFFEL_API_KEY`
  - [ ] `BOOKING_API_KEY`
  - [ ] `BOOKING_API_SECRET`
  - [ ] `BOOKING_AFFILIATE_ID`
  - [ ] `TICKETMASTER_API_KEY`
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL` (URL prod)
  - [ ] `NEXT_PUBLIC_APP_ENV=production`
  - [ ] `NODE_ENV=production`
- [ ] Build réussi
- [ ] Domain configuré (DNS)
- [ ] SSL activé

### Alternative : Docker
- [ ] Dockerfile créé (si nécessaire)
- [ ] Image buildée et testée localement
- [ ] Registry (Docker Hub, ECR, etc.) prêt
- [ ] Variables d'environnement injectées au runtime

### Alternative : Self-hosted
- [ ] Serveur Node.js configuré
- [ ] PM2 ou similaire pour persistence
- [ ] Nginx reverse proxy (optionnel)
- [ ] SSL/HTTPS configuré
- [ ] Logs collectés

---

## 🔐 Phase 4 : Sécurité & Production

### Secrets & Credentials
- [ ] Aucune clé API en clair dans le code
- [ ] `.env.local` ignité dans `.gitignore`
- [ ] Service Role Key stocké de manière sécurisée
- [ ] Rotation clés API programmée (tous les 6 mois)

### Supabase Security
- [ ] RLS policies vérifiées pour chaque table
- [ ] Auth policies restrictives
- [ ] Backups configurés
- [ ] Point-in-time recovery enabled (si payant)

### API Rate Limiting
- [ ] Rate limits configurés (vérifier dans apiFetch)
- [ ] Cache TTLs appropriés
- [ ] Fallback data en place

### Monitoring & Logging
- [ ] Logs centralisés (Sentry, Datadog, etc.)
- [ ] Alertes configurées (erreurs API, downtime)
- [ ] Analytics activées

---

## 📊 Phase 5 : Post-déploiement

### Smoke tests (en prod)
- [ ] Homepage charge < 3s
- [ ] Search retourne résultats
- [ ] API endpoints répondent
- [ ] Supabase accessible

### Performance
- [ ] Core Web Vitals mesurés
- [ ] Images optimisées
- [ ] Cache headers configurés
- [ ] CDN activé (Vercel auto, ou Cloudflare)

### Monitoring 24/7
- [ ] Uptime monitoring actif
- [ ] Error tracking activé
- [ ] Performance metrics collectées
- [ ] Alertes email configurées

---

## 🎯 Checklist résumée (TL;DR)

```
✅ Setup APIs (Duffel, Booking, Ticketmaster)
✅ Setup Supabase + schema
✅ Variables d'environnement ajoutées
✅ Tests locaux réussis
✅ Variables ajoutées à Vercel
✅ Build & déploiement réussi
✅ Tests en production réussis
✅ Monitoring + alertes activés
✅ Domaine + SSL configurés
✅ Support configuré
```

---

## 📞 Support

**Problèmes ?** Consulter :
- [API_DEPLOYMENT.md](./API_DEPLOYMENT.md) — guide détaillé
- [Duffel Docs](https://duffel.com/docs)
- [Booking Partner API](https://developers.booking.com)
- [Supabase Docs](https://supabase.com/docs)

---

**Déploiement réussi !** 🎉 Vous pouvez maintenant accepter des réservations en production.
