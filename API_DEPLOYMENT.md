# 🚀 Guide de déploiement des APIs - Eventrip

> **Statut** : ✅ Prêt à déployer en production  
> **Dernière mise à jour** : 2024-05-09  
> **Version** : 1.0.0

---

## 📋 Vue d'ensemble

Ce guide couvre la mise en place complète des trois APIs principales pour Eventrip :
- **Duffel** : Vols et trains (remplace Amadeus)
- **Booking.com** : Hébergements
- **Supabase** : Base de données + authentification

---

## 1️⃣ Setup Duffel (Vols + Trains)

### Étapes

#### A. Créer un compte Duffel
1. Aller sur [duffel.com/developers](https://duffel.com/developers)
2. S'inscrire ou se connecter
3. Dashboard → API Keys
4. Générer une nouvelle clé :
   - Mode sandbox : `sk_test_...` (gratuit)
   - Mode production : `sk_live_...` (payant)

#### B. Copier la clé d'API
```bash
# Dans votre .env.local
DUFFEL_API_KEY=sk_test_xxxxxxxxxxxxx_or_sk_live_xxxxxxxxxxxxx
```

#### C. Tester la connexion
```bash
# Terminal
curl -H "Authorization: Bearer sk_test_..." \
  https://api.duffel.com/air_search_requests

# Devrait retourner : {"data": [], "errors": null}
```

### Fonctionnalités activées

✅ Recherche vols A/R via `/api/flights?from=Lyon&to=Paris&date=2024-06-15`  
✅ Recherche trains via `/api/trains?from=Paris&to=Lyon&date=2024-06-15`  
✅ Support multi-passagers (adultes + enfants)  
✅ Cache 3 min sur les résultats  
✅ Fallback gracieux en cas d'erreur  

### Limites et quotas

| Plan | Requêtes/jour | Coût |
|------|---------------|------|
| **Sandbox** (test) | Illimité | 0€ |
| **Starter** (prod) | 10,000 | €0.10/requête |
| **Scale** (prod) | Illimité | Contacter Duffel |

---

## 2️⃣ Setup Booking.com Partner API

### Étapes

#### A. S'inscrire en tant que partenaire
1. Aller sur [partner.booking.com](https://partner.booking.com)
2. S'inscrire → Affiliation partenaire
3. Après validation (24-48h), accéder au dashboard partenaire

#### B. Générer les credentials
1. Partner Dashboard → Settings → API
2. Copier :
   - **API Key** (publique)
   - **API Secret** (confidentielle)
   - **Affiliate ID** (optionnel, pour tracking)

#### C. Ajouter à .env.local
```env
BOOKING_API_KEY=votre_booking_api_key
BOOKING_API_SECRET=votre_booking_api_secret
BOOKING_AFFILIATE_ID=booking
```

#### D. Tester la connexion
```bash
# Terminal
curl -X POST https://api.booking.com/v2/json/hotels \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"data": {"city": "Paris"}}'
```

### Fonctionnalités activées

✅ Recherche par GPS (latitude/longitude)  
✅ Recherche par ville  
✅ Filtrage par distance et évaluation  
✅ Récupération détails d'un hôtel  
✅ Cache 10 min (les hôtels ne bougent pas)  

### Quotas Booking
- **API Calls** : ~100,000/jour pour les gros partenaires
- **Rate Limit** : ~10 req/sec
- **Commissions** : 0-30% selon volume

---

## 3️⃣ Setup Supabase (Base de données)

### Étapes

#### A. Créer un projet Supabase
1. Aller sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign up ou log in
3. New Project :
   - **Name** : "eventrip"
   - **Password** : généré automatiquement (sauvegarder!)
   - **Region** : EU-West-1 (Europe) recommandé
   - **Tier** : Free (gratuit)

#### B. Récupérer les credentials
Dans Settings → API :
- Copier **Project URL** (ex: `https://xxxxx.supabase.co`)
- Copier **Anon Key** (clé publique, safe)
- Copier **Service Role Key** (clé secrète, serveur uniquement)

#### C. Ajouter à .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### D. Créer les tables
1. Supabase Dashboard → SQL Editor → New Query
2. Copier-coller le contenu de `supabase-schema.sql`
3. **RUN** pour exécuter

#### E. Vérifier la création
```bash
# Vous devriez voir :
# ✅ users
# ✅ events
# ✅ bookings
# ✅ booking_items
# ✅ transactions
# ✅ saved_packages
```

### Tables créées

| Table | Purpose | Rows |
|-------|---------|------|
| `users` | Profils utilisateurs | ~1000s |
| `events` | Cache des événements | ~10,000s |
| `bookings` | Réservations complètes | Variable |
| `booking_items` | Items par réservation | Variable |
| `transactions` | Historique paiements | Variable |
| `saved_packages` | Favoris/panier | Variable |

### Sécurité : Row Level Security (RLS)

✅ Chaque user voit **seulement ses données**  
✅ Les events sont **publiques** (lecture)  
✅ Les données sensibles sont **cryptées**  
✅ Audit trails automatiques via `created_at/updated_at`  

---

## 4️⃣ Activation Ticketmaster (optionnel)

Pour les événements, on peut aussi ajouter Ticketmaster :

```env
TICKETMASTER_API_KEY=votre_cle_ticketmaster
```

[Inscription gratuite](https://developer.ticketmaster.com) sans CB.

---

## 5️⃣ Configuration des variables d'environnement

### Template complet

```env
# ═══════════════════════════════════════════════════════════════
# PRODUCTION - Copier ce fichier en .env.local
# ═══════════════════════════════════════════════════════════════

# Duffel (Vols + Trains)
DUFFEL_API_KEY=sk_test_xxxxx

# Booking.com (Hôtels)
BOOKING_API_KEY=votre_api_key
BOOKING_API_SECRET=votre_api_secret
BOOKING_AFFILIATE_ID=booking

# Ticketmaster (Événements)
TICKETMASTER_API_KEY=votre_key

# Supabase (Base de données)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Stripe (Paiements - phase 2)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# App Config
NEXT_PUBLIC_APP_URL=https://eventrip.com
NEXT_PUBLIC_APP_ENV=production
NODE_ENV=production

# Support
NEXT_PUBLIC_SUPPORT_EMAIL=support@eventrip.com
```

---

## 6️⃣ Routes API disponibles

### Vols et Trains
```
GET /api/flights
  ?from=Lyon
  &to=Paris
  &date=2024-06-15
  &returnDays=1
  &adults=1
  &children=0
  &transport=both
```

Response :
```json
{
  "success": true,
  "flights": [...],
  "trains": [...],
  "timestamp": "2024-05-09T14:00:00Z"
}
```

### Trains (route dédiée)
```
GET /api/trains
  ?from=Paris
  &to=Lyon
  &date=2024-06-15
  &passengers=1
```

### Hôtels (route existante)
```
GET /api/hotels
  ?latitude=48.8566
  &longitude=2.3522
  &checkIn=2024-06-15
  &checkOut=2024-06-17
  &radiusKm=15
```

### Événements (route existante)
```
GET /api/events
  ?q=taylor%20swift
  &city=Paris
  &dateFrom=2024-06-01
  &dateTo=2024-06-30
```

---

## 7️⃣ Déploiement en production

### Option A : Vercel (recommandé)
```bash
# Terminal
git push origin main

# Vercel détecte les changements et déploie automatiquement
# Les variables d'environnement doivent être configurées dans :
# Dashboard → Settings → Environment Variables
```

### Option B : Docker
```bash
docker build -t eventrip:latest .
docker run -e DUFFEL_API_KEY=sk_live_... \
           -e BOOKING_API_KEY=... \
           -e NEXT_PUBLIC_SUPABASE_URL=... \
           -p 3000:3000 \
           eventrip:latest
```

### Option C : Traditional Node
```bash
npm run build
npm start

# En production :
NODE_ENV=production PORT=3000 npm start
```

---

## 8️⃣ Tests et validation

### Test de chaque API

```bash
# 1. Duffel Flights
curl "http://localhost:3000/api/flights?from=Paris&to=Lyon&date=2024-06-15"

# 2. Booking Hotels
curl "http://localhost:3000/api/hotels?latitude=48.8566&longitude=2.3522&checkIn=2024-06-15&checkOut=2024-06-17"

# 3. Trains
curl "http://localhost:3000/api/trains?from=Paris&to=Lyon&date=2024-06-15"

# 4. Supabase Auth
# Tester login via /auth endpoint
```

### Checklist avant production

- [ ] Toutes les clés API configurées
- [ ] Supabase schema créé (tables présentes)
- [ ] RLS policies testées
- [ ] Variables .env.local vérifiées (ne pas committer!)
- [ ] Tests API réussis
- [ ] Cache et rate limits configurés
- [ ] Monitoring/logs en place

---

## 🆘 Troubleshooting

### "DUFFEL_API_KEY manquant"
```
→ Vérifier que DUFFEL_API_KEY est dans .env.local
→ Redémarrer le dev server : npm run dev
→ Vérifier que ce n'est pas 'undefined'
```

### "Booking API retourne erreur 401"
```
→ Vérifier BOOKING_API_KEY + BOOKING_API_SECRET
→ Vérifier signature HMAC (générée correctement)
→ Contacter support Booking si clés expirées
```

### "Supabase tables not found"
```
→ Vérifier que supabase-schema.sql a été exécuté
→ Check Tables tab dans Supabase Dashboard
→ Si erreur SQL : vérifier les extensions (uuid-ossp)
```

### "Rate limit exceeded"
```
→ Implémenter queue avec délais
→ Augmenter cache TTL
→ Contacter le provider pour upgrade
```

---

## 📊 Monitoring et observabilité

### Logs
- Console Next.js : `npm run dev`
- Supabase Logs : Dashboard → Logs
- Duffel Logs : Dashboard → API Activity
- Booking Logs : Partner Dashboard → Reports

### Metrics à surveiller
1. **API Response Time** : cible <200ms
2. **Cache Hit Rate** : cible >70%
3. **Error Rate** : cible <1%
4. **Rate Limit Usage** : cible <80% du quota

---

## 📚 Ressources

- [Duffel Docs](https://duffel.com/docs)
- [Booking.com Partner API](https://developers.booking.com)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

## ✅ Prochaines étapes

1. ✅ Configurer API keys (ce guide)
2. ✅ Déployer base Supabase
3. ⏳ Implémenter Stripe pour paiements
4. ⏳ Configurer emails (Resend)
5. ⏳ Ajouter analytics (Supabase + Google Analytics)
6. ⏳ Configurer CDN/cache (Vercel Edge)
7. ⏳ Setup monitoring (Sentry, LogRocket)

---

**Questions ?** Consultez les docs APIs ou créez une issue sur le repo.
