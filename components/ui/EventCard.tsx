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
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-blue-200 transition-smooth group"
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <Image
          src={event.image || "/placeholder.jpg"}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-semibold capitalize">
          {event.type}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-smooth">
            {event.title}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin className="w-4 h-4" />
            {event.venue}, {event.city}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 py-2 border-y border-gray-100">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-blue-500" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-blue-500" />
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
          <Link href="/">
            <Button variant="primary" size="md" className="group">
              Voir le pack
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
