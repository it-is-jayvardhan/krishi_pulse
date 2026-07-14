"use client";

import { motion, Variants } from "framer-motion";
import { TrendingUp, TrendingDown, IndianRupee, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { MonthSummary } from "@/types/market";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

interface SummaryCardsProps {
  summary: MonthSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const items = [
    {
      label: "Average Price",
      value: `₹${summary.average.toLocaleString("en-IN")}`,
      icon: IndianRupee,
    },
    {
      label: "Highest Price",
      value: `₹${summary.highest.toLocaleString("en-IN")}`,
      icon: TrendingUp,
    },
    {
      label: "Lowest Price",
      value: `₹${summary.lowest.toLocaleString("en-IN")}`,
      icon: TrendingDown,
    },
    {
      label: "Available Records",
      value: summary.count.toLocaleString("en-IN"),
      icon: Database,
    },
  ];

  return (
    <div className="section-container grid grid-cols-2 gap-3 py-6 lg:grid-cols-4 lg:gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription>{item.label}</CardDescription>
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="font-[var(--font-jakarta)] text-2xl font-bold">
                {item.value}
              </CardTitle>
            </CardHeader>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
