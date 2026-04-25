"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Ticket } from "lucide-react";
import { Event } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";

interface EventCardProps {
  event: Event;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="glass overflow-hidden group hover:shadow-glow transition-smooth"
    >
      <Link href={`/event/${event.id}`}>
        <div className="relative h-48 overflow-hidden">
          {event.image ? (
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-900 to-dark-800 flex items-center justify-center">
              <Ticket className="w-16 h-16 text-primary-400 opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-full bg-primary-600 text-white text-xs font-semibold uppercase tracking-wider">
              {event.type}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <h3 className="font-bold text-lg group-hover:text-primary-400 transition-smooth line-clamp-2">
            {event.title}
          </h3>

          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent-400 flex-shrink-0" />
              <span className="truncate">
                {event.venue}, {event.city}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-400 flex-shrink-0" />
              <span>
                {formatDate(event.date)} à {event.startTime}
              </span>
            </div>
            {event.ticketsAvailable !== undefined && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-accent-400 flex-shrink-0" />
                <span>{event.ticketsAvailable} places disponibles</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div>
              <p className="text-xs text-gray-500">À partir de</p>
              <p className="text-xl font-bold gradient-text">
                {formatPrice(event.minPrice)}
              </p>
            </div>
            <motion.span
              whileHover={{ x: 4 }}
              className="text-primary-400 text-sm font-semibold group-hover:text-primary-300 flex items-center gap-1"
            >
              Voir le pack →
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
