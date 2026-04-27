"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Calendar, Ticket, ChevronRight } from "lucide-react";
import { Event } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "./Button";

interface EventCardProps {
  event: Event;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const typeColors: Record<string, string> = {
    concert: "bg-blue-600",
    sport: "bg-green-600",
    festival: "bg-purple-600",
    theatre: "bg-orange-600",
    conference: "bg-gray-600",
  };
  const badgeColor = typeColors[event.type] || "bg-blue-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 group flex flex-col"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100 flex-shrink-0">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
            <Ticket className="w-12 h-12 text-blue-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className={`absolute top-3 right-3 ${badgeColor} text-white px-3 py-1 rounded-lg text-xs font-semibold capitalize`}>
          {event.type}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 space-y-3">
        <div>
          <h3 className="font-bold text-base text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
            {event.title}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{event.venue}, {event.city}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-600 py-2 border-y border-gray-100">
          <Calendar className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <span>{formatDate(event.date)}</span>
          {event.startTime && (
            <span className="text-gray-400 ml-1">• {event.startTime.slice(0, 5)}</span>
          )}
        </div>

        <div className="flex items-end justify-between pt-1 mt-auto">
          <div>
            <p className="text-xs text-gray-400">À partir de</p>
            <p className="text-xl font-bold text-blue-600">
              {event.minPrice > 0 ? formatPrice(event.minPrice) : "Prix TBD"}
            </p>
          </div>
          <Link href={`/event/${event.id}`}>
            <Button variant="primary" size="sm" className="group/btn">
              Voir le pack
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
