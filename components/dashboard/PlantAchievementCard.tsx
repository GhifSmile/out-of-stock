// "use client"

// import { CardContent } from "@/components/ui/card";
// import { Factory } from "lucide-react";
// import { PieChart, Pie, ResponsiveContainer } from "recharts";
// import { PlantComparisonData } from "@/services/outofStock";

// interface Props {
//   data: PlantComparisonData[];
//   year: number;
// }

// export default function PlantAchievementCard({ data, year }: Props) {
//   // const maxTarget = 1.0

//   const plantThresholds = {
//     'MDN fish': {
//       optimal: 2.75,
//     },
//     'MDN shrimp': {
//       optimal: 1.20,
//     },
//     'LPG fish': {
//       optimal: 0.50,
//     },
//     'LPG shrimp': {
//       optimal: 2.50,
//     },
//     'CKP fish': {
//       optimal: 0.50,
//     },
//     'SPJ fish': {
//       optimal: 4.00,
//     },
//     'SBY shrimp': {
//       optimal: 0.50,
//     },                                                                                                                                                                                          
//   }   

//   type ThresholdData = typeof plantThresholds;

//   const achievedCount = data.reduce((acc, p) => {
//     let count = 0;

//     if (year >= 2026) {
//       const getOptimalRange = (plant: string, type: string) => {
//         const key = `${plant} ${type}`;
//         const fallbackKey = `${plant} ${type === 'fish' ? 'shrimp' : 'fish'}`;

//         const thresholds = plantThresholds as Record<string, any>;
//         const threshold = thresholds[key] || thresholds[fallbackKey];

//         return threshold 
//           ? { max: threshold.optimal } 
//           : { max: null };
//       };

//       const fishRange = getOptimalRange(p.plant, 'fish');
//       const shrimpRange = getOptimalRange(p.plant, 'shrimp');

//       if (p.fishOOS !== null && p.fishOOS <= fishRange.max) {
//         count++;
//       }
//       if (p.shrimpOOS !== null && p.shrimpOOS <= shrimpRange.max) {
//         count++;
//       }

//     } else {
//       const maxTarget = 1.0;

//       if (p.fishOOS !== null && p.fishOOS <= maxTarget) count++;
//       if (p.shrimpOOS !== null && p.shrimpOOS <= maxTarget) count++;
//     }

//     return acc + count;
//   }, 0);    

//   const TOTAL_PLANTS = 7;
  
//   const chartData = [
//     { name: "Achieved", value: achievedCount, fill: "#ca7bfc" },
//     { name: "Remaining", value: Math.max(0, TOTAL_PLANTS - achievedCount), fill: "#f1f5f9" },
//   ]

//   return (

//     // <div 
//     //   className="rounded-xl shadow-sm w-full h-full overflow-hidden border border-slate-200" 
//     //   style={{ background: 'linear-gradient(135deg, #0dec111a 0%, #ffffff 100%)' }} // Opacity ~10% (#1a)
//     // >

//     <div 
//       className="bg-white rounded-xl shadow-sm w-full h-full overflow-hidden"
//     >
//       <CardContent className="h-full pt-4 pb-4 px-5 flex items-start justify-between bg-transparent">
        
//         {/* Sisi Kiri: Icon, Title, dan Angka */}
//         <div className="flex flex-col space-y-1"> 
          
//           {/* Icon Factory: Tanpa BG, mepet kiri sejajar Title */}
//           <div className="bg-transparent mb-3">
//             <Factory className="w-8 h-8 text-[#ca7bfc]" /> 
//           </div>

//           <div>
//             <h3 className="text-[12px] font-bold text-black tracking-widest leading-none mb-5">
//               Plant Achievement
//             </h3>
            
//             <div className="flex items-baseline gap-1">
//               <span className="text-6xl font-black text-slate-800 tracking-tighter leading-none">
//                 {achievedCount}
//               </span>
//               <span className="text-3xl font-bold text-slate-200">/</span>
//               <span className="text-3xl font-bold text-slate-400">
//                 {TOTAL_PLANTS}
//               </span>
//             </div>
            
//             <p className="text-[10px] font-light text-slate-400 uppercase tracking-wider mt-0.5">
//               Plants on Target
//             </p>
//           </div>
//         </div>

//         {/* Sisi Kanan: Donut Chart */}
//         <div className="w-24 h-24 flex-shrink-0">
//           <ResponsiveContainer width="100%" height="100%">
//             <PieChart>
//               <Pie
//                 data={chartData}
//                 cx="50%"
//                 cy="50%"
//                 innerRadius={28} // Diperbesar sedikit agar proporsional dengan angka 6xl
//                 outerRadius={40}
//                 paddingAngle={0}
//                 dataKey="value"
//                 startAngle={90}
//                 endAngle={-270}
//                 stroke="none"
//               >
//               </Pie>
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//       </CardContent>
//     </div>
//   );
// }

// "use client"

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Download } from "lucide-react";
// import { PlantComparisonData } from "@/services/outofStock";
// import { useCallback, useRef, useState } from "react";
// import { toPng } from "html-to-image";

// interface Props {
//   data: PlantComparisonData[];
//   year: number;
//   selectedMonths?: string[];
// }

// const monthColors: Record<string, string> = {
//   Jan: "#ef4444",
//   Feb: "#f97316",
//   Mar: "#eab308",
//   Apr: "#22c55e",
//   May: "#10b981",
//   Jun: "#14b8a6",
//   Jul: "#06b6d4",
//   Aug: "#0ea5e9",
//   Sep: "#3b82f6",
//   Oct: "#8b5cf6",
//   Nov: "#a855f7",
//   Dec: "#d946ef",
// };

// const TOTAL_PLANTS = 7;
// const TARGET_THRESHOLD = 1.0;

// export default function PlantAchievementCard({ data, year, selectedMonths }: Props) {
//   const cardRef = useRef<HTMLDivElement>(null);
//   const [isDownloading, setIsDownloading] = useState(false);

//   const plantThresholds = {
//     'MDN fish': { optimal: 2.75 },
//     'MDN shrimp': { optimal: 1.20 },
//     'LPG fish': { optimal: 0.50 },
//     'LPG shrimp': { optimal: 2.50 },
//     'CKP fish': { optimal: 0.50 },
//     'SPJ fish': { optimal: 4.00 },
//     'SBY shrimp': { optimal: 0.50 },
//   };

//   // Calculate achievements by month
//   const achievementsByMonth: Record<string, number> = {};
//   const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//   months.forEach(month => {
//     let count = 0;
//     data.forEach(p => {
//       const getOptimalRange = (plant: string, type: string) => {
//         const key = `${plant} ${type}`;
//         const thresholds = plantThresholds as Record<string, any>;
//         return thresholds[key]?.optimal || TARGET_THRESHOLD;
//       };

//       if (year >= 2026) {
//         const fishOptimal = getOptimalRange(p.plant, 'fish');
//         const shrimpOptimal = getOptimalRange(p.plant, 'shrimp');

//         if (p.fishOOS !== null && p.fishOOS <= fishOptimal) count++;
//         if (p.shrimpOOS !== null && p.shrimpOOS <= shrimpOptimal) count++;
//       } else {
//         if (p.fishOOS !== null && p.fishOOS <= TARGET_THRESHOLD) count++;
//         if (p.shrimpOOS !== null && p.shrimpOOS <= TARGET_THRESHOLD) count++;
//       }
//     });
//     achievementsByMonth[month] = count;
//   });

//   // Use selected months or default to latest months
//   const displayMonths = selectedMonths || months.slice(-3);

//   const handleDownload = useCallback(async () => {
//     if (!cardRef.current) return;

//     try {
//       setIsDownloading(true);
//       const downloadBtn = cardRef.current.querySelector('[data-no-print]');
//       if (downloadBtn) {
//         (downloadBtn as HTMLElement).style.display = 'none';
//       }

//       const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });

//       if (downloadBtn) {
//         (downloadBtn as HTMLElement).style.display = '';
//       }

//       const link = document.createElement('a');
//       link.href = dataUrl;
//       link.download = `plant-achievement-${new Date().toISOString().split('T')[0]}.png`;
//       link.click();
//     } catch (error) {
//       console.error('Download failed:', error);
//       const downloadBtn = cardRef.current?.querySelector('[data-no-print]');
//       if (downloadBtn) {
//         (downloadBtn as HTMLElement).style.display = '';
//       }
//     } finally {
//       setIsDownloading(false);
//     }
//   }, []);

//   return (
//     <Card ref={cardRef} className="shadow-sm rounded-xl overflow-hidden border-none h-full flex flex-col bg-white">
//       <CardHeader className="flex flex-row items-start justify-between pb-3">
//         <div className="flex-1">
//           <CardTitle className="text-sm font-bold text-black mb-1">
//             Plant Achievement
//           </CardTitle>
//           <p className="text-xs text-slate-500 font-medium">
//             Plants meeting the target per month
//           </p>
//         </div>

//         <button
//           onClick={handleDownload}
//           disabled={isDownloading}
//           data-no-print
//           className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all duration-200 disabled:opacity-50 flex-shrink-0 ml-2"
//           title="Download as PNG"
//         >
//           <Download size={16} />
//         </button>
//       </CardHeader>

//       <CardContent className="flex-1 flex flex-col overflow-y-auto space-y-3 pr-2">
//         {displayMonths.length > 0 ? (
//           displayMonths.map((month, index) => {
//             const achieved = achievementsByMonth[month] || 0;
//             const monthColor = monthColors[month] || "#6b7280";
//             const achievementPercentage = (achieved / TOTAL_PLANTS) * 100;

//             return (
//               <div
//                 key={index}
//                 className="p-3 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200"
//               >
//                 {/* Month and Count */}
//                 <div className="flex items-center justify-between mb-2">
//                   <div className="flex items-center gap-2">
//                     <div
//                       className="w-2.5 h-2.5 rounded-full flex-shrink-0"
//                       style={{ backgroundColor: monthColor }}
//                     />
//                     <span className="text-xs font-semibold text-slate-700">{month}</span>
//                   </div>
//                   <div className="text-right">
//                     <span className="text-base font-bold text-slate-900">{achieved}</span>
//                     <span className="text-xs text-slate-500 ml-0.5">/{TOTAL_PLANTS}</span>
//                   </div>
//                 </div>

//                 {/* Target Info */}
//                 <div className="flex items-center justify-between text-xs mb-2 px-2 py-1 bg-white rounded border border-slate-200">
//                   <span className="text-slate-600">Target ≤ 1.00%</span>
//                   <span className="font-semibold text-slate-700">0%</span>
//                 </div>

//                 {/* Progress Bar */}
//                 <div className="w-full h-1.5 bg-slate-300 rounded-full overflow-hidden">
//                   <div
//                     className="h-full transition-all duration-500 rounded-full"
//                     style={{
//                       width: `${achievementPercentage}%`,
//                       backgroundColor: monthColor,
//                     }}
//                   />
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <div className="flex items-center justify-center h-full">
//             <p className="text-xs text-slate-400 italic">No months selected</p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }


"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMPARISON_MONTH_COLORS } from "@/components/dashboard/BarChartComparison";

interface Props {
  /** Plant comparison per bulan (key = label bulan). Sama dengan yang dipakai Bar Chart. */
  comparisonByMonth: Record<string, any[]>;
  year: number;
  /**
   * Bulan-bulan yang ditampilkan, dikirim dari page.tsx agar konten Plant
   * Achievement SELALU mengikuti bulan yang tampil di Bar Chart.
   */
  displayMonths?: string[];
}

const TOTAL_PLANTS = 7;
const TARGET_THRESHOLD = 1.0;

export default function PlantAchievementCard({ comparisonByMonth, year, displayMonths }: Props) {
  const plantThresholds = {
    'MDN fish': { optimal: 3.74 },
    'MDN shrimp': { optimal: 1.43 },
    'LPG fish': { optimal: 0.25 },
    'LPG shrimp': { optimal: 2.93 },
    'CKP fish': { optimal: 0.00 },
    'SPJ fish': { optimal: 6.94 },
    'SBY shrimp': { optimal: 0.00 },
  };

  const getOptimalRange = (plant: string, type: string) => {
    const key = `${plant} ${type}`;
    const thresholds = plantThresholds as Record<string, any>;
    return thresholds[key]?.optimal || TARGET_THRESHOLD;
  };

  const visibleMonths = displayMonths && displayMonths.length > 0 ? displayMonths : [];

  const getAchievedData = (month: string): { count: number; plants: string[] } | null => {
    const rows = comparisonByMonth[month];
    if (!rows || rows.length === 0) return null;

    let count = 0;
    const achievedPlants: string[] = [];
    
    rows.forEach((p) => {
      if (p.oos !== null && p.oos !== undefined) {
        let isAchieved = false;
        if (year >= 2026) {
          const optimal = getOptimalRange(p.plant, p.business_unit);
          if (p.oos <= optimal) isAchieved = true;
        } else {
          if (p.oos <= TARGET_THRESHOLD) isAchieved = true;
        }

        if (isAchieved) {
          count++;
          let buLabel = '';
          if (p.business_unit?.toLowerCase() === 'fish') buLabel = 'FF';
          else if (p.business_unit?.toLowerCase() === 'shrimp') buLabel = 'SF';
          
          achievedPlants.push(buLabel ? `${p.plant} ${buLabel}` : p.plant);
        }
      }
    });
    
    // Sort abjad A-Z
    achievedPlants.sort((a, b) => a.localeCompare(b));
    
    return { count, plants: achievedPlants };
  };

  return (
    <Card className="shadow-sm rounded-xl overflow-hidden border-none h-full flex flex-col bg-white">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex-1">
          <CardTitle className="text-sm font-bold text-black mb-1">
            Plant Achievement
          </CardTitle>
          <p className="text-xs text-slate-500 font-medium">
            Plants meeting the target per month
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-y-auto space-y-3 px-3 pb-3">
        {visibleMonths.length > 0 ? (
          visibleMonths.map((month, index) => {
            const achievedData = getAchievedData(month);
            const hasData = achievedData !== null;
            const achievedCount = hasData ? achievedData.count : 0;
            const achievedPlants = hasData ? achievedData.plants : [];
            const monthColor = COMPARISON_MONTH_COLORS[index % COMPARISON_MONTH_COLORS.length];
            const achievementPercentage = hasData ? (achievedCount / TOTAL_PLANTS) * 100 : 0;

            return (
              <div
                key={index}
                className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: monthColor }}
                    />
                    <span className="text-xs font-semibold text-slate-700">{month}</span>
                  </div>
                  <div className="text-right">
                    {hasData ? (
                      <>
                        <span className="text-base font-bold text-slate-900">{achievedCount}</span>
                        <span className="text-xs text-slate-500 ml-0.5">/{TOTAL_PLANTS}</span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No data</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs mb-2 px-2 py-1 bg-white rounded border border-slate-200">
                  <span className="text-slate-600">
                    {year >= 2026 ? "Target: Optimal per Plant" : "Target ≤ 1.00%"}
                  </span>
                  <span className="font-semibold text-slate-700">
                    {hasData ? `${Math.round(achievementPercentage)}%` : "-"}
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-300 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${achievementPercentage}%`,
                      backgroundColor: monthColor,
                    }}
                  />
                </div>

                {hasData && achievedPlants.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {achievedPlants.map((plantName, i) => (
                      <span 
                        key={i} 
                        className="text-[10px] font-medium px-1.5 py-0.5 bg-white border border-slate-200 text-slate-600 rounded"
                      >
                        {plantName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-slate-400 italic">No months selected</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


