/**
 * GET /api/events/[id]
 * Détail complet d'un événement + vérification disponibilité
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEventById, checkEventAvailability } from '@/lib/api/ticketmaster';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'ID manquant' }, { status: 400 });
  }

  const [eventResult, availability] = await Promise.all([
    getEventById(id),
    checkEventAvailability(id),
  ]);

  if (!eventResult.success) {
    return NextResponse.json(eventResult, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      ...eventResult.data,
      availability,
    },
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=120' },
  });
}
