import Navigation from "@/components/dashboard/Navigation";
import UploadButton from "@/components/dashboard/uploadButton";
import DownloadButton from "@/components/dashboard/downloadButton";
import FilterGroup from "@/components/dashboard/filterGroup";

import { OOSService } from "@/services/outofStock";

export default async function TrendAnalysis({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  
  const params = await searchParams;
  const options = await OOSService.getFilterOptions();

  const selectedYear = params.year 
    ? Number(params.year.split(",")[0]) 
    : options.year[0];

  const selectedMonths = params.month 
    ? String(params.month).split(",").map(Number).filter((n) => !isNaN(n)) 
    : [];    

  const filters = {
    year: selectedYear,
    months: selectedMonths,
  };  

  const trendData = await OOSService.getTrendAnalysis(filters);

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER SECTION */}
      <header className="bg-gradient-to-br from-[#e94987] to-[#b755a2] pt-4 pb-6 px-6 text-white shadow-lg">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-4 text-center lg:text-left">
            
            <div className="flex flex-col items-center lg:items-start gap-0">

              <div className="relative h-24 md:h-32 w-auto overflow-hidden flex-shrink-0">
                <img 
                  src="/oos_2.png"
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
               <FilterGroup options={options} showPlant={false} showBU={false}/>
            </div>
             
            <div className="flex flex-wrap justify-center lg:justify-end gap-3 order-1 lg:order-2">
              <DownloadButton />
              <UploadButton />
            </div>
                
          </div>
          
        </div>
      </header>

      {/* CONTENT SECTION - Tabel Trend Analysis */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
          <div className="overflow-x-auto text-slate-700">
            {/* table-fixed untuk memastikan hitungan pixel 'left' akurat */}
            <table className="w-full text-left text-[11px] border-collapse table-fixed">
              <thead>
                <tr className="bg-[#4bc0f2] text-white uppercase tracking-wider font-bold">
                  {/* Sticky Column: Year (60px) + Month (80px) = 140px total sticky */}
                  <th className="w-[60px] px-4 py-3 sticky left-0 z-20 bg-[#4bc0f2]">Year</th>
                  <th className="w-[80px] px-4 py-3 sticky left-[60px] z-20 bg-[#4bc0f2]">Month</th>
                  
                  <th className="w-[120px] px-4 py-3 border-r border-white/10 text-center">Overall Out of Stock</th>
                  <th className="w-[120px] px-4 py-3 border-r border-white/10 text-center">Fish Out of Stock</th>
                  <th className="w-[120px] px-4 py-3 border-r border-white/10 text-center">Shrimp Out of Stock</th>
                  <th className="w-[180px] px-4 py-3 border-r border-white/10 text-center">Best Performing Plant</th>
                  <th className="w-[180px] px-4 py-3 text-center">Worst Performing Plant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trendData.length > 0 ? (
                  trendData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors odd:bg-white even:bg-slate-50 group">
                      <td className="px-4 py-3 sticky left-0 z-10 
                        bg-white group-even:bg-slate-50 group-hover:bg-slate-100 font-bold">
                        {row.year}
                      </td>

                      <td className="px-4 py-3 sticky left-[60px] z-10
                        bg-white group-even:bg-slate-50 group-hover:bg-slate-100 font-bold">
                        {row.month}
                      </td>

                      <td className="px-4 py-3 border-r border-slate-100 text-center">
                          {row.overall_oos_percentage.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 border-r border-slate-100 text-center">
                          {row.fish_oos_percentage.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 border-r border-slate-100 text-center">
                          {row.shrimp_oos_percentage.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 border-r border-slate-100 text-center font-semibold text-teal-600">
                          {row.bestPerforming}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-red-600">
                          {row.worstPerforming}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-slate-400 italic bg-white">
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