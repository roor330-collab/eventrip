/**
 * GET /api/live-check
 * ─────────────────────────────────────────────────────────────────────────────
 * Vérifie en temps réel la disponibilité d'un événement + d'un vol.
 * Utilisé par le frontend via polling (toutes les 30 secondes).
 *
 * Query params:
 *   eventId  — ID Ticketmaster
 *   packId   — ID de session (optionnel, pour tracking)
 *
 * Réponse:
 * {
 *   event:   { available, status, lastChecked }
 *   alerts:  string[]   — messages à afficher à l'utilisateur
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkEventAvailability } from '@/lib/api/ticketmaster';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get('eventId');
  const packId  = req.nextUrl.searchParams.get('packId');

  if (!eventId) {
    return NextResponse.json({ success: false, error: 'eventId requis' }, { status: 400 });
  }

  const availability = await checkEventAvailability(eventId);
  const alerts: string[] = [];

  // Construire les alertes selon le statut
  if (!availability.available) {
    switch (availability.status) {
      case 'offsale':
        alerts.push('⚠️ Les billets pour cet événement ne sont plus en vente.');
        break;
      case 'cancelled':
        alerts.push('❌ Cet événement a été annulé. Votre pack ne peut pas être finalisé.');
        break;
      case 'rescheduled':
        alerts.push('📅 Cet événement a été reporté. Vérifiez la nouvelle date avant de réserver.');
        break;
      case 'postponed':
        alerts.push('⏳ Cet événement est temporairement suspendu.');
        break;
      default:
        alerts.push('⚠️ La disponibilité de cet événement a changé.');
    }
  }

  // Mettre à jour la session Supabase si packId fourni
  if (packId) {
    try {
      await supabase.from('search_sessions').update({
        last_checked:    new Date().toISOString(),
        event_available: availability.available,
      }).eq('id', packId);
    } catch { /* non bloquant */ }
  }

  return NextResponse.json({
    success: true,
    data: {
      event: availability,
      alerts,
      checkedAt: new Date().toISOString(),
    },
  }, {
    // Pas de cache pour le live check
    headers: { 'Cache-Control': 'no-store' },
  });
}
