// "use client"

// import { CardContent } from "@/components/ui/card";
// import { AlertTriangle, ChevronRight } from "lucide-react";
// import { OOSByPakanResult } from "@/services/outofStock";

// interface Props {
//   data: OOSByPakanResult[];
// }

// export default function TopOOSCard({ data }: Props) {

//   const hasValidData = data.some(item => item.oos !== null);

//   const top3 = [...data]
//     .sort((a, b) => (b.oos ?? -1) - (a.oos ?? -1))
//     .slice(0, 3);

//   return (
//     <div className="bg-white rounded-xl shadow-sm w-full h-full overflow-hidden">
//       <CardContent className="h-full pt-4 pb-4 px-6 flex items-start bg-transparent">
        
//         <div className="flex flex-col space-y-1 w-full"> 
          
//           <div className="bg-transparent mb-3">
//             <AlertTriangle className="w-8 h-8 text-amber-500" />
//           </div>

//           <div>
//             <h3 className="text-[12px] font-bold text-black tracking-widest leading-none mb-5">
//               Top 3 Out of Stock
//             </h3>
            
//             <div className="space-y-4">
//               {top3.length > 0 ? (
//                 top3.map((item, index) => (
//                   <div key={index} className="flex items-center justify-between group">
//                     <div className="flex flex-col max-w-[70%]">
//                       {/* Business Unit kecil di atas */}
//                       <span className="text-[10px] font-bold text-[#ca7bfc] uppercase tracking-wider leading-none mb-1">
//                         {item.business_unit}
//                       </span>
//                       {/* Kode Pakan sebagai main label */}
//                       <span className="text-base font-bold text-black truncate leading-tight">
//                         {item.kode_pakan}
//                       </span>
//                     </div>
                    
//                     {/* Value OOS di sisi kanan */}
//                     <div className="flex items-center gap-2">
//                       <div className="text-right">
//                         <span className="text-2xl font-bold text-slate-800 tracking-tight">
//                           {item.oos === null ? "-" : item.oos.toFixed(2)}
//                         </span>
//                         {item.oos !== null && (
//                           <span className="text-[12px] font-bold text-slate-400 ml-1">%</span>
//                         )}
//                       </div>
//                       <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#ca7bfc] transition-colors" />
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-sm text-slate-400 italic py-2">No data available</div>
//               )}
//             </div>
//           </div>
//         </div>

//       </CardContent>
//     </div>
//   );
// }

// "use client";

// import { CardContent, Card, CardHeader, CardTitle } from "@/components/ui/card";
// import { OOSByPakanResult } from "@/services/outofStock";

// interface Props {
//   data: OOSByPakanResult[];
// }

// export default function TopOOSCard({ data }: Props) {
//   const top10 = [...data]
//     .sort((a, b) => (b.oos ?? -1) - (a.oos ?? -1))
//     .slice(0, 10);

//   return (
//     <Card
//       className="shadow-sm rounded-xl overflow-hidden border-none h-full flex flex-col bg-white"
//     >
//       {/* HEADER: judul + subtitle di kiri */}
//       <CardHeader className="flex flex-row items-start justify-between pb-3">
//         <div className="flex-1">
//           <h3 className="text-sm font-bold text-black mb-1">
//             Top 10 SKU Out of Stock
//           </h3>
//           <p className="text-xs text-slate-500 font-medium">
//             Highest out-of-stock SKUs by category
//           </p>
//         </div>
//       </CardHeader>

//       <CardContent className="relative flex-1 min-h-0 px-3 pb-2 flex flex-col">
//         {/* HEADER UTAMA (DIPISAH): Dijamin tidak akan bocor karena data tidak pernah melewati area ini */}
//         <div className="w-full bg-white border-b border-slate-200 shrink-0">
//           <table className="w-full table-fixed border-collapse">
//             <colgroup>
//               <col className="w-[35%]" />
//               <col className="w-[35%]" />
//               <col className="w-[30%]" />
//             </colgroup>
//             <thead>
//               <tr>
//                 <th className="px-2 py-2 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-white">
//                   Business Unit
//                 </th>
//                 <th className="px-2 py-2 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-white">
//                   SKU
//                 </th>
//                 <th className="px-2 py-2 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-white">
//                   %
//                 </th>
//               </tr>
//             </thead>
//           </table>
//         </div>

//         {/* CONTAINER SCROLL DATA: Hanya berisi isi data (tbody) */}
//         <div className="max-h-[380px] overflow-y-auto lg:absolute lg:top-[38px] lg:bottom-2 lg:left-3 lg:right-3 lg:max-h-none">
//           <table className="w-full table-fixed border-collapse">
//             <colgroup>
//               <col className="w-[35%]" />
//               <col className="w-[35%]" />
//               <col className="w-[30%]" />
//             </colgroup>
//             <tbody>
//               {top10.length > 0 ? (
//                 top10.map((item, index) => {
//                   const isHigh = item.oos !== null && item.oos >= 1;
//                   return (
//                     <tr
//                       key={index}
//                       className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/60 transition-colors"
//                     >
//                       {/* Business Unit dengan badge angka bulat */}
//                       <td className="px-2 py-2.5">
//                         <div className="flex items-center gap-2.5 min-w-0">
//                           <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-pink-100 text-[11px] font-bold text-[#e94987]">
//                             {index + 1}
//                           </span>
//                           <span className="truncate text-[13px] font-semibold text-slate-800">
//                             {item.business_unit.charAt(0).toUpperCase() + item.business_unit.slice(1)}
//                           </span>
//                         </div>
//                       </td>

//                       {/* SKU / Kode Pakan - rata tengah, proporsional */}
//                       <td className="px-2 py-2.5 text-[12px] font-medium text-slate-900 truncate text-center">
//                         {item.kode_pakan}
//                       </td>

//                       {/* Persentase, merah jika tinggi & hijau jika rendah */}
//                       <td className="px-2 py-2.5 text-right">
//                         <span
//                           className={`text-[13px] font-bold tabular-nums ${
//                             item.oos === null
//                               ? "text-slate-400"
//                               : isHigh
//                                 ? "text-red-500"
//                                 : "text-emerald-500"
//                           }`}
//                         >
//                           {item.oos === null ? "-" : `${item.oos.toFixed(2)}%`}
//                         </span>
//                       </td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td colSpan={3} className="px-3 py-8 text-center">
//                     <div className="text-xs text-slate-400">No data available</div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

"use client";

import { CardContent, Card, CardHeader, CardTitle } from "@/components/ui/card";
import { OOSByPakanResult } from "@/services/outofStock";

interface Props {
  data: OOSByPakanResult[];
}

export default function TopOOSCard({ data }: Props) {
  const top10 = [...data]
    .sort((a, b) => (b.oos ?? -1) - (a.oos ?? -1))
    .slice(0, 10);

  return (
    <Card
      className="shadow-sm rounded-xl overflow-hidden border-none h-full flex flex-col bg-white"
    >
      {/* HEADER: judul + subtitle di kiri */}
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-black mb-1">
            Top 10 SKU Out of Stock
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Highest out-of-stock SKUs by category
          </p>
        </div>
      </CardHeader>

      <CardContent className="relative flex-1 min-h-0 px-3 pb-2 flex flex-col">
        {/* HEADER UTAMA (DIPISAH): Dijamin tidak akan bocor karena data tidak pernah melewati area ini */}
        <div className="w-full bg-white border-b border-slate-200 shrink-0">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-[35%]" />
              <col className="w-[35%]" />
              <col className="w-[30%]" />
            </colgroup>
            <thead>
              <tr>
                <th className="px-2 py-2 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-white">
                  Business Unit
                </th>
                <th className="px-2 py-2 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-white">
                  SKU
                </th>
                <th className="px-2 py-2 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-white">
                  %
                </th>
              </tr>
            </thead>
          </table>
        </div>

        {/* CONTAINER SCROLL DATA: Hanya berisi isi data (tbody) */}
        <div className="max-h-[380px] overflow-y-auto lg:absolute lg:top-[38px] lg:bottom-2 lg:left-3 lg:right-3 lg:max-h-none">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-[35%]" />
              <col className="w-[35%]" />
              <col className="w-[30%]" />
            </colgroup>
            <tbody>
              {top10.length > 0 ? (
                top10.map((item, index) => {
                  return (
                    <tr
                      key={index}
                      className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Business Unit dengan badge angka bulat */}
                      <td className="px-2 py-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-pink-100 text-[11px] font-bold text-[#e94987]">
                            {index + 1}
                          </span>
                          <span className="truncate text-[13px] font-semibold text-slate-800">
                            {item.business_unit.charAt(0).toUpperCase() + item.business_unit.slice(1)}
                          </span>
                        </div>
                      </td>

                      {/* SKU / Kode Pakan - rata tengah, proporsional */}
                      <td className="px-2 py-2.5 text-[12px] font-medium text-slate-900 truncate text-left">
                        {item.kode_pakan}
                      </td>

                      {/* Persentase, warna tetap #4bc0f2 */}
                      <td className="px-2 py-2.5 text-center">
                        <span
                          className="text-[13px] font-bold tabular-nums"
                          style={{ color: "#4bc0f2" }}
                        >
                          {item.oos === null ? "-" : `${item.oos.toFixed(2)}%`}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="px-3 py-8 text-center">
                    <div className="text-xs text-slate-400">No data available</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}









