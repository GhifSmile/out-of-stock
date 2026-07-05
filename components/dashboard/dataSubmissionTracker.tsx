"use client";

import { Activity } from "lucide-react";
import { PlantSubmissionStatus } from "@/services/outofStock";

interface Props {
  data: PlantSubmissionStatus[];
  currentMonth?: number;
}

export default function DataSubmissionTracker({ data, currentMonth }: Props) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm w-full overflow-hidden border border-slate-100">
      <div className="pt-4 pb-4 px-6 flex flex-col lg:flex-row lg:items-center gap-6">
        
        {/* Sisi Kiri: Title & Icon */}
        <div className="flex items-center gap-4 lg:border-r lg:border-slate-100 lg:pr-8 min-w-fit">
          <div className="p-2 bg-sky-50 rounded-lg">
            <Activity className="w-6 h-6 text-sky-500" />
          </div>
          <div>
            <h3 className="text-[12px] font-bold text-black tracking-widest leading-none uppercase">
              Submission Status
            </h3>
            <p className="text-[9px] font-light text-slate-400 tracking-wider mt-1 flex items-center gap-1">
              Monthly Data Monitoring
              {currentMonth && (
                <span className="text-[#4174ff] font-bold ml-1 whitespace-nowrap">
                  • {monthNames[currentMonth - 1]}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Sisi Kanan: Grid Plants */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 flex-1 items-center">
          {data && data.length > 0 ? (
            data.map((item) => (
              <div key={item.plant} className="flex flex-col gap-2">
                {/* Info Plant & Counter (Bulan) */}
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black text-slate-700 tracking-tight">
                    {item.plant}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    item.completedMonths === 1 ? 'bg-emerald-50 text-[#02d1a7]' : 'bg-slate-50 text-slate-400'
                  }`}>
                    {item.completedMonths}/1
                  </span>
                </div>

                {/* Indikator Status Bulan */}
                <div className="flex gap-1.5">
                  {item.details.map((monthData) => (
                    <div
                      key={monthData.month}
                      className="flex-1 flex flex-col items-center"
                      title={`${monthNames[monthData.month - 1]}: ${monthData.isFilled ? 'Filled' : 'Pending'}`}
                    >
                      <div
                        className={`h-1.5 w-full rounded-full transition-all duration-700 ${
                          monthData.isFilled 
                            ? "bg-[#02d1a7] shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                            : "bg-slate-100"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-2 text-center opacity-30 italic text-[10px]">
              No plant data selected in filter
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="hidden xl:flex flex-col gap-2 border-l border-slate-100 pl-6 ml-2">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#02d1a7]"></div>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Filled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Pending</span>
          </div>
        </div>

      </div>
    </div>
  );
}