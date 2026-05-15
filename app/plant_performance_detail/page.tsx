import Navigation from "@/components/dashboard/Navigation";
import FilterGroup from "@/components/dashboard/filterGroup";

import UploadButton from "@/components/dashboard/uploadButton";
import DownloadButton from "@/components/dashboard/downloadButton";

import { OOSService } from "@/services/outofStock";

export default async function PerformanceDetailPage({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const params = await searchParams;
  const options = await OOSService.getFilterOptions();

  const selectedYear = params.year
    ? Number(params.year.split(",")[0])
    : options.year[0];

  const selectedPlants = params.plant 
    ? String(params.plant).split(",").filter((v) => v !== "") 
    : [];     
    
  const selectedBU = params.business_unit 
    ? String(params.business_unit).split(",").filter((v) => v !== "") 
    : [];     

  const filters = {
    year: selectedYear,
    plants: selectedPlants,
    business_unit: selectedBU
  };

  const performanceData = await OOSService.getMonthlyPerformance(filters);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER SECTION */}
      <header className="bg-gradient-to-br from-[#e94987] to-[#b755a2] pt-4 pb-6 px-6 text-white shadow-lg">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-4 text-center lg:text-left">
            
            <div className="flex flex-col items-center lg:items-start gap-0">

              <div className="relative h-24 md:h-32 w-auto overflow-hidden flex-shrink-0">
                <img 
                  src="/oos_2.PNG"
                  alt="Logo" 
                  className="h-full w-auto object-contain object-left opacity-20"
                />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase">
                  Monitoring Out of Stock
                </h1>
                <p className="text-xs md:text-sm italic opacity-80 mt-1 text-orange-100">
                  Striving to achieve the best planning process
                </p>
              </div>
            </div>
            
            <div className="w-full lg:w-auto flex justify-center">
              <Navigation />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mt-4 pt-4 border-t border-white/20">

            <div className="flex flex-wrap justify-center lg:justify-start gap-2 order-2 lg:order-1">
               <FilterGroup options={options} showMonth={false}/>
            </div>
             
            <div className="flex flex-wrap justify-center lg:justify-end gap-3 order-1 lg:order-2">
              <DownloadButton />
              <UploadButton />
            </div>
                
          </div>
          
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
          <div className="overflow-x-auto text-slate-700">
            {/* table-fixed digunakan agar lebar kolom yang kita set dipatuhi 100% */}
            <table className="w-full text-left text-[11px] border-collapse table-fixed">
              <thead>
                <tr className="bg-[#4bc0f2] text-white uppercase tracking-wider font-bold">
                  {/* Lebar diset tetap (80 + 100 + 60 = 240px total sticky) */}
                  <th className="w-[80px] px-4 py-3 sticky left-0 z-20 bg-[#4bc0f2]">Plant Group</th>
                  <th className="w-[100px] px-4 py-3 sticky left-[80px] z-20 bg-[#4bc0f2]">Segment</th>
                  <th className="w-[60px] px-4 py-3 text-center sticky left-[180px] z-20 bg-[#4bc0f2]">Year</th>
                  
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                    <th key={m} className="w-[65px] px-2 py-3 border-r border-white/10 text-center">{m}</th>
                  ))}
                  
                  <th className="w-[80px] px-4 py-3 border-r border-white/10 text-center">YTD Avg</th>
                  <th className="w-[80px] px-4 py-3 border-r border-white/10 text-center">VS Target</th>
                  <th className="w-[80px] px-4 py-3 border-r border-white/10 text-center">Status</th>
                  <th className="w-[200px] px-4 py-3 text-left">Action Needed</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100">
                {performanceData.length > 0 ? (
                  performanceData.map((row, idx) => {

                    // const target = row.year >= 2026 
                    //   ? 1.0 
                    //   : 1.0;

                    const plantThresholds = {
                      'MDN fish': {
                        optimal: 2.75,
                      },
                      'MDN shrimp': {
                        optimal: 1.20,
                      },
                      'LPG fish': {
                        optimal: 0.50,
                      },
                      'LPG shrimp': {
                        optimal: 2.50,
                      },
                      'CKP fish': {
                        optimal: 0.50,
                      },
                      'SPJ fish': {
                        optimal: 4.00,
                      },
                      'SBY shrimp': {
                        optimal: 0.50,
                      },                                                                                                                                                                                          
                    }      
                    
                    const key = `${row.plant} ${row.businessUnit}`;
                    const thresholds = plantThresholds[key as keyof typeof plantThresholds];
                    const ytd = row.total_oos_percentage_ytd;
                    // const vsT = ytd - target

                    // const vsTargetPercent = vsT;

                    let vsT: string | number = 0;
                    let statusEmoji = "";
                    let actionText = "";
                    let colorClass = "";

                    if (row.year >= 2026) {
                        if (!thresholds) {
                            statusEmoji = "⚪";
                            actionText = "Threshold Not Found";
                            colorClass = "text-gray-400";
                            vsT = "-";
                        } else {
                            if (ytd == thresholds.optimal) {
                                statusEmoji = "🟢";
                                actionText = "Optimal Stock";
                                colorClass = "text-green-600";
                                vsT = "-";
                            } else {
                                vsT = ytd - thresholds.optimal;
                            
                                if(ytd > thresholds.optimal) {
                                  statusEmoji = "🔴";
                                  actionText = "Supply Disruption : Disruption in Fulfilling Orders to Customers";
                                  colorClass = "text-red-500";
                                } else if (ytd < thresholds.optimal) {
                                  statusEmoji = "🔵";
                                  actionText = "Excellence: High Service Level";
                                  colorClass = "text-blue-600";                      
                                }
                            }
                        }
                    } else {
                        if (ytd == 1.0) {
                            statusEmoji = "🟢";
                            actionText = "Optimal Stock";
                            colorClass = "text-green-600";
                            vsT = "-";
                        } else {
                            vsT = ytd - 1.0
                        
                            if(ytd > 1.0) {
                              statusEmoji = "🔴";
                              actionText = "Supply Disruption : Disruption in Fulfilling Orders to Customers";
                              colorClass = "text-red-500";
                            } else if (ytd < 1.0) {
                              statusEmoji = "🔵";
                              actionText = "Excellence: High Service Level";
                              colorClass = "text-blue-600";                      
                            }
                        }
                    }

                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors odd:bg-white even:bg-slate-50 group">

                        <td className="px-4 py-3 font-bold text-slate-800 sticky left-0 z-10 
                          bg-white group-even:bg-slate-50 group-hover:bg-slate-100 truncate">
                          {row.plant}
                        </td>
                        
                        <td className="px-4 py-3 font-bold uppercase sticky left-[80px] z-10 
                          bg-white group-even:bg-slate-50 group-hover:bg-slate-100 truncate">
                          {row.businessUnit}
                        </td>
                        
                        <td className="px-4 py-3 font-bold text-center sticky left-[180px] z-10 
                          bg-white group-even:bg-slate-50 group-hover:bg-slate-100 border-r border-slate-200/50">
                          {row.year}
                        </td>

                        {row.monthlyData.map((m, i) => (
                          <td key={i} className={`px-2 py-3 text-center border-r border-slate-100 ${m.value === 0 ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>
                            {m.value > 0 ? `${(m.value).toFixed(2)}` : "-"}
                          </td>
                        ))}

                        <td className="px-4 py-3 text-center font-bold border-r border-slate-100 whitespace-nowrap">
                          {(row.total_oos_percentage_ytd).toFixed(2)}
                        </td>
                        <td className={`px-4 py-3 text-center font-bold border-r border-slate-100 whitespace-nowrap ${typeof vsT === 'number' ? colorClass : 'text-slate-400'}`}>
                          {typeof vsT === 'number' 
                            ? (vsT > 0 ? `+${vsT.toFixed(2)}` : vsT.toFixed(2)) 
                            : vsT}
                        </td>
                        <td className="px-4 py-3 text-center text-lg leading-none border-r border-slate-100">
                          {statusEmoji}
                        </td>
                        <td className={`px-4 py-3 italic break-words leading-tight font-medium ${vsT === '-' ? 'text-green-600' : 'font-medium ' + colorClass}`}>
                          {actionText}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={20} className="py-20 text-center text-slate-400 italic bg-white">
                      No data found for the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </main>
  );
}