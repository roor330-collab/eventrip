"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Calendar, Users, ChevronRight } from "lucide-react";
import { Event } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "./Button";

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
      className="glass group overflow-hidden hover:shadow-glow transition-smooth"
    >
      <div className="relative h-48 overflow-hidden bg-dark-800">
        <Image
          src={event.image || "/placeholder.jpg"}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 bg-primary-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">
          {event.type}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary-400 transition-smooth">
            {event.title}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
            <MapPin className="w-4 h-4" />
            {event.venue}, {event.city}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-300 py-2 border-y border-white/10">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-accent-400" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-accent-400" />
            {event.ticketsAvailable} places
          </div>
        </div>

        <div className="flex items-end justify-between pt-2">
          <div>
            <p className="text-xs text-gray-400">À partir de</p>
            <p className="text-2xl font-bold gradient-text">
              {formatPrice(event.minPrice)}
            </p>
          </div>
          <Link href={`/event/${event.id}`}>
            <Button variant="primary" size="md" className="group">
              Créer un Pack
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
