// "use client"

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
// import { PlantComparisonData } from "@/services/outofStock";
// import { useRouter, useSearchParams, usePathname } from "next/navigation";
// import { useCallback } from "react";

// interface Props {
//   data: PlantComparisonData[];
// }

// export default function ComparisonBarChart({ data }: Props) {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const pathname = usePathname();

//   const handleBarClick = useCallback((item: any) => {
//     if (item && item.plant) {
//       const clickedPlant = item.plant;
//       const params = new URLSearchParams(searchParams.toString());
      
//       if (params.get("plant") === clickedPlant) {
//         params.delete("plant");
//       } else {
//         params.set("plant", clickedPlant);
//       }

//       router.push(`${pathname}?${params.toString()}`, { scroll: false });
//     }
//   }, [router, searchParams, pathname]);

//   const tooltipOrder = ["Overall Out of Stock", "Fish Out of Stock", "Shrimp Out of Stock"];
//   const sortedData = [...data].sort((a, b) => {
//       return (b.overallOOS || 0) - (a.overallOOS || 0);
//     });
//   const legendOrder = ["Overall Out of Stock", "Fish Out of Stock", "Shrimp Out of Stock"]

//   return (
//     <Card className="shadow-sm rounded-xl overflow-visible border-none h-full flex flex-col">
//       <CardHeader>
//         <CardTitle className="text-lg font-bold text-black">Plant Group Comparison Out of Stock</CardTitle>
//       </CardHeader>
//       <CardContent className="flex-1 w-full min-h-[350px]">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart
//             data={sortedData}
//             margin={{ top: 20, right: 30, left: -10, bottom: 25 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
//             <XAxis 
//               dataKey="plant" 
//               tickLine={false} 
//               axisLine={false} 
//               fontSize={10}
//               dy={5}
//             />
//             <YAxis 
//               tickFormatter={(value) => `${value}`} 
//               tickLine={false} 
//               axisLine={false} 
//               domain={[0, 2]} 
//               fontSize={10}
//               ticks={[0, 0.5, 1.0, 1.5, 2.0]}
//             />

//             <Tooltip 
//               cursor={{fill: '#f8fafc'}}
//               contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
//               itemSorter={(item) => tooltipOrder.indexOf(item.name as string)}
//               formatter={(value: number | string | undefined, labelName: any) => {
//                 if (value === null || value === undefined) {
//                   return null;
//                 }
                
//                 const formattedValue = Number(value).toFixed(2);
//                 return [`${formattedValue}%`, labelName];
//               }}
//             />           
            
//             <Legend 
//               verticalAlign="bottom" 
//               align="center"
//               itemSorter={(item) => legendOrder.indexOf(item.value as string)}
//               iconType="rect"
//               iconSize={10}          
//               formatter={(value) => <span className="text-slate-700">{value}</span>}
//               wrapperStyle={{ 
//                 fontSize: '12px', 
//                 paddingTop: '20px',
//                 position: 'relative',
//                 width: '100%'
//               }} 
//             />       
            
//             {/* PINDAHKAN onClick KE DALAM SETIAP BAR DAN TAMBAHKAN CURSOR POINTER */}
//             <Bar 
//               name="Overall Out of Stock" 
//               dataKey="overallOOS" 
//               fill="#4bc0f2" 
//               radius={[2, 2, 0, 0]} 
//               onClick={handleBarClick}
//               className="cursor-pointer"
//             />
//             <Bar 
//               name="Fish Out of Stock" 
//               dataKey="fishOOS" 
//               fill="#f2a977" 
//               radius={[2, 2, 0, 0]} 
//               onClick={handleBarClick}
//               className="cursor-pointer"
//             />
//             <Bar 
//               name="Shrimp Out of Stock" 
//               dataKey="shrimpOOS" 
//               fill="#ca7bfc" 
//               radius={[2, 2, 0, 0]} 
//               onClick={handleBarClick}
//               className="cursor-pointer"
//             />
//           </BarChart>
//         </ResponsiveContainer>
//       </CardContent>
//     </Card>
//   );
// }

// "use client"

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ReferenceLine,
//   ResponsiveContainer,
// } from "recharts";
// import { PlantComparisonData } from "@/services/outofStock";
// import { useRouter, useSearchParams, usePathname } from "next/navigation";
// import { useCallback, useMemo, useState, useRef } from "react";
// import { Download, ChevronDown, Check, X } from "lucide-react";
// import { toPng } from "html-to-image";

// interface Props {
//   data: PlantComparisonData[];
// }

// type MetricType = "overall" | "fish" | "shrimp";

// const MAX_MONTHS = 3;

// const MONTHS = [
//   "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
// ];

// // Map tipe metrik -> field pada PlantComparisonData
// const METRIC_KEY: Record<MetricType, keyof PlantComparisonData> = {
//   overall: "overallOOS",
//   fish: "fishOOS",
//   shrimp: "shrimpOOS",
// };

// const METRIC_LABEL: Record<MetricType, string> = {
//   overall: "Overall",
//   fish: "Fish",
//   shrimp: "Shrimp",
// };

// // Palet warna per bulan (urut sesuai urutan pemilihan)
// const MONTH_COLORS = ["#e94987", "#4bc0f2", "#f2a977"];

// export default function ComparisonBarChart({ data }: Props) {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const pathname = usePathname();
//   const chartRef = useRef<HTMLDivElement>(null);

//   // bulan berjalan sebagai default
//   const currentMonth = MONTHS[new Date().getMonth()];

//   const [selectedType, setSelectedType] = useState<MetricType>("overall");
//   const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

//   const [selectedMonths, setSelectedMonths] = useState<string[]>([currentMonth]);
//   const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);

//   const [isDownloading, setIsDownloading] = useState(false);

//   // baseline = bulan TERAKHIR yang dipilih user
//   const baselineMonth = selectedMonths[selectedMonths.length - 1];

//   // bulan yang masih bisa ditambahkan (belum dipilih) — yang sudah dipilih disembunyikan
//   const availableMonths = useMemo(
//     () => MONTHS.filter((m) => !selectedMonths.includes(m)),
//     [selectedMonths],
//   );

//   const canAddMore = selectedMonths.length < MAX_MONTHS;

//   const handleAddMonth = (month: string) => {
//     setSelectedMonths((prev) => {
//       if (prev.includes(month) || prev.length >= MAX_MONTHS) return prev;
//       return [...prev, month];
//     });
//   };

//   const handleRemoveMonth = (month: string) => {
//     // sisakan minimal 1 bulan
//     setSelectedMonths((prev) =>
//       prev.length > 1 ? prev.filter((m) => m !== month) : prev,
//     );
//   };

//   // Susun data chart: 1 bar per bulan terpilih, nilainya dari metrik terpilih.
//   // Catatan: PlantComparisonData saat ini hanya berisi 1 snapshot, sehingga
//   // semua bulan memakai field metrik yang sama. Ketika data per-bulan sudah
//   // tersedia, ganti pemetaan di bawah agar mengambil nilai bulan terkait.
//   const metricKey = METRIC_KEY[selectedType];
//   const chartData = useMemo(() => {
//     const sorted = [...data].sort(
//       (a, b) => (Number(b[metricKey]) || 0) - (Number(a[metricKey]) || 0),
//     );
//     return sorted.map((row) => {
//       const entry: Record<string, number | string> = { plant: row.plant };
//       for (const month of selectedMonths) {
//         entry[month] = Number(row[metricKey]) || 0;
//       }
//       return entry;
//     });
//   }, [data, metricKey, selectedMonths]);

//   // nilai baseline = rata-rata metrik pada bulan baseline (acuan garis putus-putus)
//   const baselineValue = useMemo(() => {
//     if (chartData.length === 0) return 0;
//     const total = chartData.reduce(
//       (acc, row) => acc + (Number(row[baselineMonth]) || 0),
//       0,
//     );
//     return Number((total / chartData.length).toFixed(2));
//   }, [chartData, baselineMonth]);

//   const handleBarClick = useCallback(
//     (item: any) => {
//       if (item && item.plant) {
//         const clickedPlant = item.plant;
//         const params = new URLSearchParams(searchParams.toString());
//         if (params.get("plant") === clickedPlant) {
//           params.delete("plant");
//         } else {
//           params.set("plant", clickedPlant);
//         }
//         router.push(`${pathname}?${params.toString()}`, { scroll: false });
//       }
//     },
//     [router, searchParams, pathname],
//   );

//   const handleDownload = useCallback(async () => {
//     if (!chartRef.current) return;
//     try {
//       setIsDownloading(true);
//       const buttons = chartRef.current.querySelectorAll("[data-no-print]");
//       buttons.forEach((btn) => ((btn as HTMLElement).style.display = "none"));

//       const dataUrl = await toPng(chartRef.current, { pixelRatio: 2 });

//       buttons.forEach((btn) => ((btn as HTMLElement).style.display = ""));

//       const link = document.createElement("a");
//       link.href = dataUrl;
//       link.download = `comparison-chart-${new Date().toISOString().split("T")[0]}.png`;
//       link.click();
//     } catch (error) {
//       console.error("Download failed:", error);
//       const buttons = chartRef.current?.querySelectorAll("[data-no-print]");
//       buttons?.forEach((btn) => ((btn as HTMLElement).style.display = ""));
//     } finally {
//       setIsDownloading(false);
//     }
//   }, []);

//   return (
//     <Card
//       ref={chartRef}
//       className="shadow-sm rounded-xl overflow-visible border-none h-full flex flex-col bg-white"
//     >
//       <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-start sm:justify-between">
//         <div className="flex flex-col gap-0.5">
//           <CardTitle className="text-lg font-bold text-slate-900">
//             Plant Group Comparison Out of Stock
//           </CardTitle>
//           <p className="text-xs text-slate-400">
//             Baseline:{" "}
//             <span className="font-semibold text-[#e94987]">{baselineMonth}</span>
//           </p>
//         </div>

//         {/* Controls */}
//         <div className="flex flex-wrap items-center gap-2" data-no-print>
//           {/* Month Multiselect (filter utama) */}
//           <div className="relative">
//             <button
//               onClick={() => setIsMonthDropdownOpen((v) => !v)}
//               className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all duration-200 text-xs font-medium text-slate-700 hover:text-slate-900"
//             >
//               <span>Compare: {selectedMonths.join(", ")}</span>
//               <ChevronDown
//                 size={16}
//                 className={`transition-transform duration-200 ${isMonthDropdownOpen ? "rotate-180" : ""}`}
//               />
//             </button>

//             {isMonthDropdownOpen && (
//               <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
//                 {/* Bulan terpilih (bisa dihapus) */}
//                 <div className="px-3 py-2 border-b border-slate-100">
//                   <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
//                     Selected ({selectedMonths.length}/{MAX_MONTHS})
//                   </p>
//                   <div className="flex flex-wrap gap-1.5">
//                     {selectedMonths.map((m) => (
//                       <span
//                         key={m}
//                         className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-pink-50 text-[11px] font-medium text-[#e94987]"
//                       >
//                         {m}
//                         {selectedMonths.length > 1 && (
//                           <button
//                             onClick={() => handleRemoveMonth(m)}
//                             className="hover:text-pink-700"
//                             title={`Remove ${m}`}
//                           >
//                             <X size={12} />
//                           </button>
//                         )}
//                       </span>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Daftar bulan yang tersedia (yang sudah dipilih tidak muncul) */}
//                 <div className="max-h-56 overflow-y-auto">
//                   {!canAddMore ? (
//                     <p className="px-4 py-3 text-xs text-slate-400">
//                       Maximum {MAX_MONTHS} months reached.
//                     </p>
//                   ) : (
//                     availableMonths.map((month) => (
//                       <button
//                         key={month}
//                         onClick={() => handleAddMonth(month)}
//                         className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors text-sm text-slate-700"
//                       >
//                         <span>{month}</span>
//                         <Check size={14} className="text-transparent" />
//                       </button>
//                     ))
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Type Dropdown (overall / fish / shrimp) */}
//           <div className="relative">
//             <button
//               onClick={() => setIsTypeDropdownOpen((v) => !v)}
//               className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all duration-200 text-xs font-medium text-slate-700 hover:text-slate-900"
//             >
//               <span>{METRIC_LABEL[selectedType]}</span>
//               <ChevronDown
//                 size={16}
//                 className={`transition-transform duration-200 ${isTypeDropdownOpen ? "rotate-180" : ""}`}
//               />
//             </button>

//             {isTypeDropdownOpen && (
//               <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
//                 {(Object.keys(METRIC_LABEL) as MetricType[]).map((type) => (
//                   <button
//                     key={type}
//                     onClick={() => {
//                       setSelectedType(type);
//                       setIsTypeDropdownOpen(false);
//                     }}
//                     className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-all duration-150 ${
//                       selectedType === type
//                         ? "bg-pink-50 text-[#e94987]"
//                         : "text-slate-700 hover:bg-slate-50"
//                     }`}
//                   >
//                     {METRIC_LABEL[type]}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Download Button */}
//           <button
//             onClick={handleDownload}
//             disabled={isDownloading}
//             className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all duration-200 disabled:opacity-50"
//             title="Download as PNG"
//           >
//             <Download size={18} />
//           </button>
//         </div>
//       </CardHeader>

//       <CardContent className="flex-1 w-full min-h-[350px]">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={chartData} margin={{ top: 20, right: 30, left: -10, bottom: 25 }}>
//             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
//             <XAxis dataKey="plant" tickLine={false} axisLine={false} fontSize={11} dy={5} />
//             <YAxis
//               tickFormatter={(value) => `${value}`}
//               tickLine={false}
//               axisLine={false}
//               fontSize={11}
//             />

//             <Tooltip
//               cursor={{ fill: "#f8fafc" }}
//               contentStyle={{
//                 borderRadius: "8px",
//                 border: "none",
//                 boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//               }}
//               formatter={(value: number | string | undefined, name: any) => {
//                 if (value === null || value === undefined) return null;
//                 return [`${Number(value).toFixed(2)}%`, name];
//               }}
//             />

//             <Legend
//               verticalAlign="bottom"
//               align="center"
//               iconType="circle"
//               iconSize={10}
//               formatter={(value) => <span className="text-slate-700">{value}</span>}
//               wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
//             />

//             {/* Garis baseline = rata-rata metrik pada bulan baseline */}
//             <ReferenceLine
//               y={baselineValue}
//               stroke="#e94987"
//               strokeDasharray="6 4"
//               strokeWidth={1.5}
//             />

//             {/* Satu bar per bulan terpilih (maks 3) */}
//             {selectedMonths.map((month, idx) => (
//               <Bar
//                 key={month}
//                 name={month}
//                 dataKey={month}
//                 fill={MONTH_COLORS[idx % MONTH_COLORS.length]}
//                 radius={[3, 3, 0, 0]}
//                 onClick={handleBarClick}
//                 className="cursor-pointer"
//               />
//             ))}
//           </BarChart>
//         </ResponsiveContainer>
//       </CardContent>
//     </Card>
//   );
// }


"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { Download, ChevronDown, Check, X } from "lucide-react";
import { toPng } from "html-to-image";

interface Props {
  /** Plant comparison per bulan. */
  comparisonByMonth: Record<string, any[]>;
  /** Bulan baseline dari filter utama page.tsx. */
  baselineMonth: string;
  /** Bulan yang ditampilkan (baseline + pembanding), maks 3. */
  displayMonths: string[];
  /** Tahun filter yang aktif */
  year: number;
}

const MAX_MONTHS = 3;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Mapping singkatan bulan ke nama lengkap khusus untuk tampilan UI Dropdown
const FULL_MONTH_NAMES: Record<string, string> = {
  "Jan": "January", "Feb": "February", "Mar": "March", "Apr": "April",
  "May": "May", "Jun": "June", "Jul": "July", "Aug": "August",
  "Sep": "September", "Oct": "October", "Nov": "November", "Dec": "December"
};

// Palet warna statis berdasarkan urutan posisi klik asli user (index 0 = baseline)
export const COMPARISON_MONTH_COLORS = ["#4bc0f2", "#842aed", "#f04487"];

export default function ComparisonBarChart({ comparisonByMonth, baselineMonth, displayMonths, year }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const chartRef = useRef<HTMLDivElement>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Ref untuk melacak nilai baselineMonth sebelumnya
  const prevBaselineRef = useRef<string>(baselineMonth);

  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Menangani event klik di luar area dropdown bulan
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMonthDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const compareParamString = searchParams.get("compare") || "";

  // RULES 1: Reset bulan pembanding jika baseline berubah (Misal: User klik Reset/Ganti Filter)
  useEffect(() => {
    if (prevBaselineRef.current !== baselineMonth) {
      // Simpan ref secara langsung agar tidak memicu re-render berulang
      prevBaselineRef.current = baselineMonth;
      
      // const params = new URLSearchParams(searchParams.toString());
      const params = new URLSearchParams(window.location.search);
      if (params.has("compare")) {
        params.delete("compare");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }
  }, [baselineMonth, router, pathname]);

  // Bulan yang sedang tampil (baseline selalu di index 0)
  const selectedMonths = displayMonths;

  // Bulan pembanding (selain baseline)
  const compareMonths = useMemo(
    () => selectedMonths.filter((m) => m !== baselineMonth),
    [selectedMonths, baselineMonth],
  );

  // Bulan yang masih bisa ditambahkan
  const availableMonths = useMemo(
    () => MONTHS.filter((m) => !selectedMonths.includes(m)),
    [selectedMonths],
  );

  const canAddMore = selectedMonths.length < MAX_MONTHS;

  // RULES 2: Urutkan bulan terpilih KHUSUS untuk render bar secara visual berdasarkan kalender (Jan -> Dec)
  const sortedMonthsForChart = useMemo(() => {
    return [...selectedMonths].sort((a, b) => MONTHS.indexOf(a) - MONTHS.indexOf(b));
  }, [selectedMonths]);

  // Tulis bulan pembanding ke URL
  const updateCompareParam = useCallback(
    (months: string[]) => {
      // const params = new URLSearchParams(searchParams.toString());
      const params = new URLSearchParams(window.location.search);
      if (months.length > 0) {
        params.set("compare", months.join(","));
      } else {
        params.delete("compare");
      }
      // router.push(`${pathname}?${params.toString()}`, { scroll: false });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname],
  );

  const handleAddMonth = (month: string) => {
    if (selectedMonths.includes(month) || selectedMonths.length >= MAX_MONTHS) return;
    updateCompareParam([...compareMonths, month]);
  };

  const handleRemoveMonth = (month: string) => {
    if (month === baselineMonth) return;
    updateCompareParam(compareMonths.filter((m) => m !== month));
  };

  // Susun data chart: Plant + Business Unit
  const chartData = useMemo(() => {
    const combinationSet = new Set<string>();
    
    for (const month of selectedMonths) {
      (comparisonByMonth[month] ?? []).forEach((row) => {
        if (row.plant && row.business_unit) {
          combinationSet.add(`${row.plant}:${row.business_unit}`);
        }
      });
    }

    // RULES 4: Mengurutkan X-axis berdasarkan Alphabet Plant A-Z
    const combinations = Array.from(combinationSet).map((str) => {
      const [plant, business_unit] = str.split(":");
      return { plant, business_unit };
    }).sort((a, b) => {
      const plantCompare = a.plant.localeCompare(b.plant);
      if (plantCompare !== 0) return plantCompare;
      return a.business_unit.localeCompare(b.business_unit); 
    });

    return combinations.map(({ plant, business_unit }) => {
      const suffix = business_unit.toLowerCase() === "fish" ? "FF" : "SF";
      const displayLabel = `${plant} ${suffix}`;

      const entry: Record<string, any> = { displayLabel, plant, business_unit };

      for (const month of selectedMonths) {
        const row = (comparisonByMonth[month] ?? []).find(
          (r) => r.plant === plant && r.business_unit === business_unit
        );
        const value = row ? row.oos : null;
        entry[month] = value === null || value === undefined ? null : Number(value);
      }
      return entry;
    });
  }, [comparisonByMonth, selectedMonths]);

  // Target line dinamis
  const baselineValue = useMemo(() => {
    return year < 2026 ? 1.0 : 2.45;
  }, [year]);

  // Max axis Y
  const yAxisMax = useMemo(() => {
    let maxVal = baselineValue;
    chartData.forEach((row) => {
      selectedMonths.forEach((month) => {
        const val = row[month];
        if (typeof val === "number" && val > maxVal) {
          maxVal = val;
        }
      });
    });
    return Math.ceil(maxVal * 1.15);
  }, [chartData, selectedMonths, baselineValue]);

  const handleBarClick = useCallback(
    (item: any) => {
      if (item && item.displayLabel) {
        const clickedPlantLabel = item.displayLabel;
        const params = new URLSearchParams(searchParams.toString());
        if (params.get("plant") === clickedPlantLabel) {
          params.delete("plant");
        } else {
          params.set("plant", clickedPlantLabel);
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    },
    [router, searchParams, pathname],
  );

  const handleDownload = useCallback(async () => {
    if (!chartRef.current) return;
    try {
      setIsDownloading(true);
      const buttons = chartRef.current.querySelectorAll("[data-no-print]");
      buttons.forEach((btn) => ((btn as HTMLElement).style.display = "none"));

      const dataUrl = await toPng(chartRef.current, { pixelRatio: 2 });

      buttons.forEach((btn) => ((btn as HTMLElement).style.display = ""));

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `comparison-chart-${new Date().toISOString().split("T")[0]}.png`;
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
      const buttons = chartRef.current?.querySelectorAll("[data-no-print]");
      buttons?.forEach((btn) => ((btn as HTMLElement).style.display = ""));
    } finally {
      setIsDownloading(false);
    }
  }, []);

  // Membuat unik string untuk prop `key` agar grafik me-render ulang total saat kombinasi bulan berubah
  const chartReactivityKey = `chart-${baselineMonth}-${sortedMonthsForChart.join("-")}`;

  return (
    <>
      <style>{`
        @media print {
          [data-no-print] {
            display: none !important;
          }
        }
      `}</style>
      <Card
        ref={chartRef}
        className="shadow-sm rounded-xl overflow-visible border-none h-full flex flex-col bg-white"
      >
        <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 sm:px-6">
          {/* Bagian Judul: min-w-0 mencegah judul mendorong elemen lain keluar */}
          <div className="flex flex-col gap-0.5 min-w-0">
            <CardTitle className="text-sm sm:text-lg font-bold text-black line-clamp-1">
              Plant Comparison Out of Stock
            </CardTitle>
            <p className="text-xs text-slate-400 truncate">
              Baseline{" "}
              <span className="font-bold text-[#4174ff]">• {FULL_MONTH_NAMES[baselineMonth] || baselineMonth}</span>
            </p>
          </div>

          {/* Bagian Tombol: flex-shrink-0 menjaga tombol agar tidak ikut mengecil */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0" data-no-print>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsMonthDropdownOpen((v) => !v)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all duration-200 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                {/* Tampilan Desktop: Nama bulan penuh */}
                <span className="hidden sm:inline">
                  Compare: {selectedMonths.map(m => FULL_MONTH_NAMES[m] || m).join(", ")}
                </span>

                {/* Tampilan Mobile: Hanya angka */}
                <span className="sm:hidden">
                  Compare: {selectedMonths.length}
                </span>

                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-200 flex-shrink-0 ${isMonthDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu - Tetap konsisten */}
              {isMonthDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Selected ({selectedMonths.length}/{MAX_MONTHS})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMonths.map((m) => {
                        const isBaseline = m === baselineMonth;
                        return (
                          <span key={m} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-pink-50 text-[11px] font-medium text-[#e94987]">
                            {FULL_MONTH_NAMES[m] || m}
                            {isBaseline ? (
                              <span className="text-[9px] uppercase tracking-wide text-pink-400">base</span>
                            ) : (
                              <button onClick={() => handleRemoveMonth(m)} className="hover:text-pink-700 cursor-pointer">
                                <X size={12} />
                              </button>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {!canAddMore ? (
                      <p className="px-4 py-3 text-xs text-slate-400">Maximum {MAX_MONTHS} months reached.</p>
                    ) : (
                      availableMonths.map((month) => (
                        <button
                          key={month}
                          onClick={() => handleAddMonth(month)}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors text-sm text-slate-700"
                        >
                          <span>{FULL_MONTH_NAMES[month] || month}</span>
                          <Check size={14} className="text-transparent" />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
              title="Download as PNG"
            >
              <Download size={16} />
            </button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 w-full min-h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              key={chartReactivityKey} // MEMAKSA RECHARTS MERENDER ULANG DARI AWAL
              data={chartData} 
              margin={{ top: 20, right: 30, left: -10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
              
              <XAxis dataKey="displayLabel" tickLine={false} axisLine={false} fontSize={11} dy={5} />
              
              <YAxis
                tickFormatter={(value) => `${value}`}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                domain={[0, yAxisMax]}
              />

              {/* RULES 3: Tooltip diurutkan sesuai urutan kalender */}
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                itemSorter={(item) => {
                  const name = String(item.name);
                  return MONTHS.indexOf(name);
                }}
                formatter={(value: number | string | undefined, name: any) => {
                  if (value === null || value === undefined) return null;
                  return [`${Number(value).toFixed(2)}%`, name];
                }}
              />

              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={10}
                formatter={(value) => <span className="text-slate-700">{value}</span>}
                wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
              />

              <ReferenceLine
                y={baselineValue}
                stroke="#f04487"
                strokeDasharray="6 4"
                strokeWidth={1.5}
              />

              {/* Batang dirender selalu urut berdasarkan kalender (sortedMonthsForChart) */}
              {sortedMonthsForChart.map((month) => {
                const colorIdx = selectedMonths.indexOf(month);
                return (
                  <Bar
                    key={month}
                    name={month}
                    dataKey={month}
                    fill={COMPARISON_MONTH_COLORS[colorIdx !== -1 ? colorIdx : 0]}
                    radius={[3, 3, 0, 0]}
                    onClick={handleBarClick}
                    className="cursor-pointer"
                    minPointSize={5}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}




