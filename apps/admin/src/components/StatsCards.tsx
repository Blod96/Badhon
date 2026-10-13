import React from "react";
import { Users, Droplet, AlertTriangle, CheckCircle, ArrowUpRight } from "lucide-react";

export function StatsCards() {
  const stats = [
    {
      title: "Registered Donors",
      value: "482",
      change: "+12 this week",
      icon: <Users className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50 border-blue-200"
    },
    {
      title: "Active Requests",
      value: "3",
      change: "2 Critical (<6h)",
      icon: <Droplet className="w-5 h-5 text-brand-primary" />,
      bg: "bg-red-50 border-red-200"
    },
    {
      title: "Pending Reports",
      value: "1",
      change: "Requires triage",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50 border-amber-200"
    },
    {
      title: "Notification Health",
      value: "99.4%",
      change: "FCM Queue Healthy",
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50 border-emerald-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item) => (
        <div
          key={item.title}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-text-secondary">
              {item.title}
            </span>
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${item.bg}`}>
              {item.icon}
            </div>
          </div>
          <div>
            <div className="font-display font-bold text-2xl text-text-primary">
              {item.value}
            </div>
            <div className="flex items-center text-[11px] font-medium text-slate-500 mt-1">
              <span>{item.change}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
