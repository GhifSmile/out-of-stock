// "use client"

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Line, Legend } from 'recharts';
// import { MonthlyTrendData } from "@/services/outofStock";
// import { useRouter, useSearchParams, usePathname } from "next/navigation";
// import { useCallback } from "react";

// interface Props {
//   data: MonthlyTrendData[];
//   year: number;
// }

// export default function TrendOOSChartMonthly({ data, year }: Props) {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const pathname = usePathname();

//   // Mapping dari singkatan chart ke angka Database (1-12)
//   const monthMap: Record<string, string> = {
//     "Jan": "1", "Feb": "2", "Mar": "3", "Apr": "4",
//     "May": "5", "Jun": "6", "Jul": "7", "Aug": "8",
//     "Sep": "9", "Oct": "10", "Nov": "11", "Dec": "12"
//   };

//   const handleChartClick = useCallback((state: any) => {
//     // Recharts menyediakan activeLabel (isi dari XAxis yang diklik)
//     if (state && state.activeLabel) {
//       const monthLabel = state.activeLabel;
//       const monthValue = monthMap[monthLabel] || monthLabel; // Ambil angka dari map
      
//       const params = new URLSearchParams(searchParams.toString());
      
//       if (params.get("month") === String(monthValue)) {
//         params.delete("month");
//       } else {
//         params.set("month", String(monthValue));
//       }

//       router.push(`${pathname}?${params.toString()}`, { scroll: false });
//     }
//   }, [router, searchParams, pathname]);

//   const chartData = data.map(item => ({
//     ...item,
//     // UpperBound: 4,
//     Target: year<2026?1.0: 2.0,
//     // LowerBound : 2.5
//   }));

//   return (
//     <Card className="shadow-sm rounded-xl overflow-visible border-none">
//       <CardHeader>
//         <CardTitle className="text-lg font-bold text-black">Monthly Overall Out of Stock Trend</CardTitle>
//       </CardHeader>
//       {/* Tinggi disesuaikan ke 350px agar ada ruang untuk legend di bawah */}
//       <CardContent className="h-[350px] w-full">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart 
//             data={chartData} 
//             margin={{ top: 10, right: 30, left: -15, bottom: 20 }}
//             onClick={handleChartClick} // Trigger Cross-Filtering
//             style={{ cursor: 'pointer' }}
//           >

//             <defs>
//               <linearGradient id="colorOOS" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#4bc0f2" stopOpacity={0.3}/>
//                 <stop offset="95%" stopColor="#4bc0f2" stopOpacity={0}/>
//               </linearGradient>
//             </defs>

//             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
            
//             <XAxis 
//               dataKey="month" 
//               tickLine={false} 
//               axisLine={false} 
//               fontSize={10}
//               dy={10} 
//               className="text-slate-500 font-medium"
//             />
            
//             <YAxis 
//               tickFormatter={(value) => `${value}`} 
//               tickLine={false} 
//               axisLine={false} 
//               domain={[0, 4]} 
//               ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0]}
//               fontSize={10}
//               className="text-slate-500 font-medium"
//             />
            
//             <Tooltip 
//               cursor={{fill: '#f8fafc'}}
//               contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
//               formatter={(value: number | string | undefined, labelName: any) => {
//                 if (value === null || value === undefined) return ["-", labelName ?? "Out of Stock"];
//                 const formattedValue = Number(value).toFixed(2);
//                 return [`${formattedValue}`, labelName];
//               }}  
//             />

//             <Legend 
//               verticalAlign="bottom" 
//               align="center"
//               iconType="circle"
//               iconSize={8}
//               wrapperStyle={{ 
//                 fontSize: '10px', 
//                 paddingTop: '20px',
//                 position: 'relative'
//               }} 
//             />

//             <Area 
//               type="linear" 
//               dataKey="overallOOS" 
//               stroke="#4bc0f2" 
//               connectNulls={true}
//               activeDot={(props: any) => {
//                 const { cx, cy, stroke, strokeWidth, r, value } = props;
              
//                 if (value === null || value === undefined) return <></>;
        
//                 return (
//                   <circle 
//                     cx={cx} 
//                     cy={cy} 
//                     r={r || 6} 
//                     fill="#4bc0f2" 
//                     stroke={stroke} 
//                     strokeWidth={strokeWidth} 
//                   />
//                 );
//               }}             
//               dot={(props: any) => {
//                 const { cx, cy, payload, value } = props;
//                 if (value === null || value === undefined || payload.overallOOS === null) {
//                   return null;
//                 }
//                 return <circle key={`dot-${payload.month}`} cx={cx} cy={cy} r={4} fill="#4bc0f2" stroke="none" />;
//               }}            
//               fillOpacity={1} 
//               fill="url(#colorOOS)" 
//               strokeWidth={2} 
//               name="Overall Out of Stock"
//             />

//             <Line 
//               type="linear" 
//               dataKey="Target" 
//               stroke="#f04487" 
//               strokeDasharray="5 5" 
//               strokeWidth={1.5} 
//               dot={false} 
//               name="Target Out of Stock"
//             />       
      
//           </AreaChart>
//         </ResponsiveContainer>
//       </CardContent>
//     </Card>
//   );
// }

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Line, Legend } from 'recharts';
import { MonthlyTrendData } from "@/services/outofStock";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { Download, ChevronDown } from "lucide-react";
import { toPng } from "html-to-image";

interface Props {
  data: MonthlyTrendData[];
  year: number;
}

export default function TrendOOSChartMonthly({ data, year }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [selectedType, setSelectedType] = useState<"overall" | "fish" | "shrimp">("overall");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 1. Tambahkan ref untuk mendeteksi area dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 2. Tambahkan useEffect untuk menangani event klik di luar dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    // Bind event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind event listener saat komponen unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;

    try {
      // Hide buttons temporarily
      const buttons = cardRef.current.querySelectorAll('[data-no-print]');
      buttons.forEach((btn) => {
        (btn as HTMLElement).style.display = 'none';
      });

      // Convert to PNG and download
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
      });

      // Show buttons again
      buttons.forEach((btn) => {
        (btn as HTMLElement).style.display = '';
      });

      // Create download link
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `trend-chart-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
      // Show buttons again in case of error
      const buttons = cardRef.current.querySelectorAll('[data-no-print]');
      buttons.forEach((btn) => {
        (btn as HTMLElement).style.display = '';
      });
    }
  }, []);

  // Mapping dari singkatan chart ke angka Database (1-12)
  const monthMap: Record<string, string> = {
    "Jan": "1", "Feb": "2", "Mar": "3", "Apr": "4",
    "May": "5", "Jun": "6", "Jul": "7", "Aug": "8",
    "Sep": "9", "Oct": "10", "Nov": "11", "Dec": "12"
  };

  const handleChartClick = useCallback((state: any) => {
    // Recharts menyediakan activeLabel (isi dari XAxis yang diklik)
    if (state && state.activeLabel) {
      const monthLabel = state.activeLabel;
      const monthValue = monthMap[monthLabel] || monthLabel; // Ambil angka dari map
      
      const params = new URLSearchParams(searchParams.toString());
      
      if (params.get("month") === String(monthValue)) {
        params.delete("month");
      } else {
        params.set("month", String(monthValue));
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [router, searchParams, pathname]);

  const chartData = data.map(item => ({
    ...item,
    Target: year < 2026 ? 1.0 : 2.45,
  }));

  // Hitung nilai maksimum secara dinamis berdasarkan data tipe yang sedang dipilih dan Target
  const yAxisMax = useMemo(() => {
    const targetValue = year < 2026 ? 1.0 : 2.45;
    let maxVal = targetValue;

    const activeKey = 
      selectedType === "overall" ? "overallOOS" : 
      selectedType === "fish" ? "overallFish" : "overallShrimp";

    data.forEach((item: any) => {
      const val = item[activeKey];
      if (typeof val === "number" && val > maxVal) {
        maxVal = val;
      }
    });

    // Berikan ruang aman tambahan sebesar 15% di bagian atas
    return Math.ceil(maxVal * 1.15);
  }, [data, selectedType, year]);

  const typeColors = {
    overall: { stroke: "#4bc0f2", stopColor: "#4bc0f2" },
    fish: { stroke: "#842aed", stopColor: "#842aed" },    
    shrimp: { stroke: "#02d1a7", stopColor: "#02d1a7" }
  };

  const currentColor = typeColors[selectedType];  

  return (
    <>
      <style>{`
        @media print {
          [data-no-print] {
            display: none !important;
          }
        }
      `}</style>
      <Card ref={cardRef} className="shadow-sm rounded-xl overflow-visible border-none">
        <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 sm:px-6">
          <CardTitle className="text-sm sm:text-lg font-bold text-black line-clamp-2">{`Monthly ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Out of Stock Trend`}</CardTitle>
          
          {/* Dropdown and Download Button */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0" data-no-print>
            {/* Type Dropdown */}
            {/* 3. Tempelkan dropdownRef pada parent div dari dropdown ini */}
            <div className="relative mr-1 sm:mr-1.5" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all duration-200 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                <span className="capitalize">{selectedType}</span>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-200 flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 sm:w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-10 overflow-hidden">
                  {["overall", "fish", "shrimp"].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedType(type as "overall" | "fish" | "shrimp");
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                        selectedType === type
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
              title="Download as PNG"
            >
              <Download size={16} />
            </button>
          </div>
        </CardHeader>
      {/* Tinggi disesuaikan ke 350px agar ada ruang untuk legend di bawah */}
      <CardContent className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            margin={{ top: 10, right: 30, left: -15, bottom: 20 }}
            onClick={handleChartClick} // Trigger Cross-Filtering
            style={{ cursor: 'pointer' }}
          >

            <defs>
              <linearGradient id="colorOOS" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentColor.stopColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={currentColor.stopColor} stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
            
            <XAxis 
              dataKey="month" 
              tickLine={false} 
              axisLine={false} 
              fontSize={10}
              dy={10} 
              className="text-slate-500 font-medium"
            />
            
            {/* UPDATE: Domain disesuaikan agar dinamis menggunakan [0, yAxisMax], tanpa property ticks statis */}
            <YAxis 
              tickFormatter={(value) => `${value}`} 
              tickLine={false} 
              axisLine={false} 
              domain={[0, yAxisMax]} 
              fontSize={10}
              className="text-slate-500 font-medium"
            />
            
            <Tooltip 
              cursor={{fill: '#f8fafc'}}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value: number | string | undefined, labelName: any) => {
                if (value === null || value === undefined) return ["-", labelName ?? "Out of Stock"];
                const formattedValue = Number(value).toFixed(2);
                return [`${formattedValue}`, labelName];
              }}  
            />

            <Legend 
              verticalAlign="bottom" 
              align="center"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ 
                fontSize: '10px', 
                paddingTop: '20px',
                position: 'relative'
              }} 
            />

            <Area 
              type="linear" 
              dataKey={
                selectedType === "overall" ? "overallOOS" : 
                selectedType === "fish" ? "overallFish" : "overallShrimp"
              }
              stroke={currentColor.stroke} 
              connectNulls={true}
              activeDot={(props: any) => {
                const { cx, cy, stroke, strokeWidth, r, value } = props;
              
                if (value === null || value === undefined) return <></>;
        
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={r || 6} 
                    fill={currentColor.stroke} 
                    stroke={stroke} 
                    strokeWidth={strokeWidth} 
                  />
                );
              }}             
              dot={(props: any) => {
                const { cx, cy, payload, value } = props;
                // Menyesuaikan pengecekan nilai null sesuai key yang aktif
                const activeKey = selectedType === "overall" ? "overallOOS" : selectedType === "fish" ? "overallFish" : "overallShrimp";
                if (value === null || value === undefined || payload[activeKey] === null) {
                  return null;
                }
                return <circle key={`dot-${payload.month}`} cx={cx} cy={cy} r={4} fill={currentColor.stroke} stroke="none" />;
              }}            
              fillOpacity={1} 
              fill="url(#colorOOS)" 
              strokeWidth={2} 
              name={`${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Out of Stock`}
            />

            <Line 
              type="linear" 
              dataKey="Target" 
              stroke="#f04487" 
              strokeDasharray="5 5" 
              strokeWidth={1.5} 
              dot={false} 
              name="Target Out of Stock"
            />       
      
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
    </>
  );
}
