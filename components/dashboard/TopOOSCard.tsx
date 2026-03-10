"use client"

import { CardContent } from "@/components/ui/card";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { OOSByPakanResult } from "@/services/outofStock";

interface Props {
  data: OOSByPakanResult[];
}

export default function TopOOSCard({ data }: Props) {
  // Ambil top 3 OOS terbesar
  const top3 = [...data]
    .sort((a, b) => b.oos - a.oos)
    .slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-sm w-full h-full overflow-hidden">
      <CardContent className="h-full pt-4 pb-4 px-6 flex items-start bg-transparent">
        
        <div className="flex flex-col space-y-1 w-full"> 
          
          <div className="bg-transparent mb-3">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>

          <div>
            {/* Title - Sesuai template DOI */}
            <h3 className="text-[12px] font-bold text-black tracking-widest leading-none mb-5">
              Top 3 Out of Stock
            </h3>
            
            {/* List Detail: Menggunakan konten OOS sebelumnya dengan spacing DOI */}
            <div className="space-y-4">
              {top3.length > 0 ? (
                top3.map((item, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex flex-col max-w-[70%]">
                      {/* Business Unit kecil di atas */}
                      <span className="text-[10px] font-bold text-[#ca7bfc] uppercase tracking-wider leading-none mb-1">
                        {item.business_unit}
                      </span>
                      {/* Kode Pakan sebagai main label */}
                      <span className="text-base font-bold text-black truncate leading-tight">
                        {item.kode_pakan}
                      </span>
                    </div>
                    
                    {/* Value OOS di sisi kanan */}
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-2xl font-bold text-slate-800 tracking-tight">
                          {item.oos}
                        </span>
                        <span className="text-[12px] font-bold text-slate-400 ml-1">%</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#ca7bfc] transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-400 italic py-2">No data available</div>
              )}
            </div>
          </div>
        </div>

      </CardContent>
    </div>
  );
}