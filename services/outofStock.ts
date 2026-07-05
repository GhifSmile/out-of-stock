import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

interface MonthlyPerformanceRow {
  plant: string | null;
  business_unit: string | null;
  year: number | null;
  jan: string | number | null;
  feb: string | number | null;
  mar: string | number | null;
  apr: string | number | null;
  may: string | number | null;
  jun: string | number | null;
  jul: string | number | null;
  aug: string | number | null;
  sep: string | number | null;
  oct: string | number | null;
  nov: string | number | null;
  dec: string | number | null;
  total_oos_percentage_ytd: string | number | null;
}

interface TrendAnalysisRow {
  year: number | null;
  month: number | null;
  overall_oos_percentage: string | number | null;
  fish_oos_percentage: string | number | null;
  shrimp_oos_percentage: string | number | null;
  best_performing: string | null;
  worst_performing: string | null;
}

interface RawDataRow {
  year: number;
  month: number;
  week: number;
  plant: string;
  business_unit: string;
  kode_pakan: string;
  stock_pakan:number;
  kebutuhan_pakan: number;
  kirim: number;
  hasil_produksi: number;
  total_hari_oos: number;
}

interface DOProblem {
  year: number;
  month: number;
  plant: string;
  business_unit: string;
  kode_pakan: string;
  total_do_bermasalah: number;
};

interface DOTotal {
    year: number;
    month: number;
    plant: string;
    business_unit: string;
    total_do: number;
}

interface OOSFilters {
  year: number;   
  months?: number[]; // Array untuk multi-select
  plants?: string[]; // Array untuk multi-select
  business_unit?: string[];
}

interface OOSResult {
  oosData: RawDataRow[];
  doBermasalah: DOProblem[];
  totalDo: DOTotal[];
}

export interface OOSByPakanResult {
  business_unit: string;
  kode_pakan: string;
  oos: number | null;
}

export interface MonthlyPerformanceData {
  plant: string;
  businessUnit: string;
  year: number;
  monthlyData: { month: string; value: number | null }[];
  total_oos_percentage_ytd: number | null;
}

export interface TrendAnalysisData {
  year: number;
  month: string;
  overall_oos_percentage: number; 
  fish_oos_percentage: number;   
  shrimp_oos_percentage: number;  
  bestPerforming: string;
  worstPerforming: string;
}

export interface MonthlyTrendData {
  month: string;
  overallOOS: number | null;
}

export interface PlantComparisonData {
  plant: string;
  business_unit: string;
  oos: number | null;
  // overallOOS: number | null;
  // fishOOS: number | null;
  // shrimpOOS: number | null;
}

export interface PlantSubmissionStatus {
  plant: string;
  completedMonths: number;
  percentage: number;
  details: { month: number; isFilled: boolean }[];
}

// Helper
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function calculateOOSByUnit(data: OOSResult, businessUnitFilter: string | null = null): number | null {
  if (!data?.oosData || data.oosData.length === 0) {
    return null;
  }

  const filteredDays = businessUnitFilter 
    ? data.oosData.filter(td => td.business_unit === businessUnitFilter)
    : data.oosData;

  const uniqueYearMonths = new Set<string>();
  for (const row of filteredDays) {
    if (row.year && row.month) {
      uniqueYearMonths.add(`${row.year}-${row.month}`);
    }
  }

  let totalDays = 0;
  uniqueYearMonths.forEach(key => {
    const [year, month] = key.split("-").map(Number);
    totalDays += new Date(year, month, 0).getDate();
  });

  if (totalDays === 0) return 0;  

  const doBermasalahMap = new Map<string, number>();
  data.doBermasalah.forEach(db => {
    if (businessUnitFilter && db.business_unit !== businessUnitFilter) return;

    const key = `${db.kode_pakan}`;

    const existingTotal = doBermasalahMap.get(key) || 0;

    const newTotal = existingTotal + (Number(db.total_do_bermasalah) || 0);

    doBermasalahMap.set(key, newTotal);
  });

  const filteredTotalDo = businessUnitFilter 
    ? data.totalDo.filter(td => td.business_unit === businessUnitFilter)
    : data.totalDo;
  const grandTotalDo = filteredTotalDo.reduce((acc, row) => acc + (Number(row.total_do) || 0), 0);

  if (grandTotalDo === 0) return 0;

  const groupedData = new Map<string, {
    year: number,
    kode_pakan: string,
    sales_monthly: number,
    total_hari_oos: number
  }>();

  data.oosData.forEach((row) => {
    if (businessUnitFilter && row.business_unit !== businessUnitFilter) return;

    const key = `${row.kode_pakan}`;
    const existing = groupedData.get(key);

    if (existing) {
      existing.sales_monthly += Number(row.kirim) || 0;
      existing.total_hari_oos += Number(row.total_hari_oos) || 0;
    } else {
      groupedData.set(key, {
        year: Number(row.year), 
        kode_pakan: row.kode_pakan,
        sales_monthly: Number(row.kirim) || 0,
        total_hari_oos: Number(row.total_hari_oos) || 0,
      });
    }
  });

  let hasValidCalculation = false;
  let totalOOSPercentage = 0;

  groupedData.forEach((record) => {
    const totalDoBermasalah = doBermasalahMap.get(record.kode_pakan) || 0;

    if (totalDoBermasalah === 0) return;

    // const tiap_do = record.sales_monthly / totalDoBermasalah;
    let rowOosPercentage = 0;
  
    // Proteksi: jalankan formula hanya jika nilai pembagi aman (tidak nol/kosong)
    if (totalDays > 0 && grandTotalDo > 0) {
      if (record.year === 2025) {
        // rowOosPercentage = (tiap_do / totalDays) / grandTotalDo;
        rowOosPercentage = (totalDoBermasalah / totalDays) / grandTotalDo;
      } else {
        // rowOosPercentage = ((tiap_do / totalDays) * record.total_hari_oos) / grandTotalDo;
        rowOosPercentage = ((totalDoBermasalah / totalDays) * record.total_hari_oos) / grandTotalDo;
      }
    } else {
      rowOosPercentage = 0;
    }

    // Fail-safe: jika hasil kalkulasi bernilai NaN atau Infinity, paksa jadi 0
    if (isNaN(rowOosPercentage) || !isFinite(rowOosPercentage)) {
      rowOosPercentage = 0;
    }

    totalOOSPercentage += rowOosPercentage;
    hasValidCalculation = true;
  });

  if (!hasValidCalculation && groupedData.size === 0) return 0;
  return Number((totalOOSPercentage * 100).toFixed(2));
}

export const OOSUtils = {
  calculateOverall: (data: OOSResult) => calculateOOSByUnit(data, null),

  calculateFish: (data: OOSResult) => calculateOOSByUnit(data, 'fish'),

  calculateShrimp: (data: OOSResult) => calculateOOSByUnit(data, 'shrimp'),  

  // computeMonthlyTrend: (data: OOSResult): MonthlyTrendData[] => {
  //   const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  //   const rawData = data;

  //   const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

  //   return shortMonths.map((name, index) => {
  //     const monthNumber = index + 1;

  //     const monthOOS = rawData.oosData.filter(d => Number(d.month) === monthNumber);
  //     const monthDOB = rawData.doBermasalah.filter(d => Number(d.month) === monthNumber);
  //     const monthTotalDO = rawData.totalDo.filter(d => Number(d.month) === monthNumber);

  //     if (monthOOS.length === 0) {
  //       return { month: name, overallOOS: null };
  //     }

  //     const grandTotalDo = monthTotalDO.reduce((acc, row) => acc + (Number(row.total_do) || 0), 0);
  //     if (grandTotalDo === 0) return { month: name, overallOOS: null };

  //     const doBermasalahMap = new Map<string, number>();
  //     monthDOB.forEach(db => {
      
  //       const key = `${db.kode_pakan}`;
      
  //       const existingTotal = doBermasalahMap.get(key) || 0;
      
  //       const newTotal = existingTotal + (Number(db.total_do_bermasalah) || 0);
      
  //       doBermasalahMap.set(key, newTotal);
  //     });

  //     const grouped = new Map<string, { 
  //       year: number, 
  //       month: number, 
  //       kode_pakan: string, 
  //       sales_monthly: number, 
  //       total_hari_oos: number
  //     }>();

  //     monthOOS.forEach(row => {
  //       const key = `${row.year}-${row.month}-${row.kode_pakan}`;
  //       const existing = grouped.get(key);
  //       if (existing) {
  //         existing.sales_monthly += Number(row.kirim) || 0;
  //         existing.total_hari_oos += Number(row.total_hari_oos) || 0;
  //       } else {
  //         grouped.set(key, { 
  //           year: row.year, month: row.month, kode_pakan: row.kode_pakan,
  //           sales_monthly: Number(row.kirim) || 0,
  //           total_hari_oos: Number(row.total_hari_oos) || 0,
  //         });
  //       }
  //     });

  //     let hasValidCalculation = false;
  //     let totalOOSPercentage = 0;

  //     grouped.forEach((val) => {
  //       const totalDoBermasalah = doBermasalahMap.get(val.kode_pakan) || 0;

  //       if (totalDoBermasalah === 0) return;

  //       // const tiap_do = val.sales_monthly / totalDoBermasalah;
  //       const daysInMonth = getDaysInMonth(val.year, val.month);

  //       let rowOos = 0;
  //       if (val.year === 2025) {
  //         // rowOos = (tiap_do / daysInMonth) / grandTotalDo;
  //         rowOos = (totalDoBermasalah / daysInMonth) / grandTotalDo;
  //       } else {
  //         // rowOos = ((tiap_do / daysInMonth) * val.total_hari_oos) / grandTotalDo;
  //         rowOos = ((totalDoBermasalah / daysInMonth) * val.total_hari_oos) / grandTotalDo;
  //       }
  //       totalOOSPercentage += rowOos;
  //       hasValidCalculation = true;
  //     });

  //     if (!hasValidCalculation) {
  //       return { month: name, overallOOS: null };
  //     }

  //     return {
  //       month: name,
  //       overallOOS: Number((totalOOSPercentage * 100).toFixed(2))
  //     };
  //   });
  // },

  computeMonthlyTrend: (data: OOSResult): MonthlyTrendData[] => {
    const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const rawData = data;
  
    const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();
  
    // Helper function untuk menghitung OOS berdasarkan data yang sudah difilter
    const calculateOOS = (oosList: any[], dobList: any[], totalDoList: any[]) => {
      // Merujuk pada ada tidaknya oos data -> tetap keluarkan null
      if (oosList.length === 0) return null;
    
      const grandTotalDo = totalDoList.reduce((acc, row) => acc + (Number(row.total_do) || 0), 0);
      if (grandTotalDo === 0) return 0;
    
      const doBermasalahMap = new Map<string, number>();
      dobList.forEach(db => {
        const key = `${db.kode_pakan}`;
        const existingTotal = doBermasalahMap.get(key) || 0;
        const newTotal = existingTotal + (Number(db.total_do_bermasalah) || 0);
        doBermasalahMap.set(key, newTotal);
      });
    
      const grouped = new Map<string, { 
        year: number, 
        month: number, 
        kode_pakan: string, 
        sales_monthly: number, 
        total_hari_oos: number
      }>();
    
      oosList.forEach(row => {
        const key = `${row.year}-${row.month}-${row.kode_pakan}`;
        const existing = grouped.get(key);
        if (existing) {
          existing.sales_monthly += Number(row.kirim) || 0;
          existing.total_hari_oos += Number(row.total_hari_oos) || 0;
        } else {
          grouped.set(key, { 
            year: row.year, month: row.month, kode_pakan: row.kode_pakan,
            sales_monthly: Number(row.kirim) || 0,
            total_hari_oos: Number(row.total_hari_oos) || 0,
          });
        }
      });
    
      let hasValidCalculation = false;
      let totalOOSPercentage = 0;
    
      grouped.forEach((val) => {
        const totalDoBermasalah = doBermasalahMap.get(val.kode_pakan) || 0;
      
        if (totalDoBermasalah === 0) return;
      
        const daysInMonth = getDaysInMonth(val.year, val.month);
      
        let rowOos = 0;

        // Proteksi: jalankan formula hanya jika nilai pembagi aman (tidak nol/kosong)
        if (daysInMonth > 0 && grandTotalDo > 0) {
          if (val.year === 2025) {
            rowOos = (totalDoBermasalah / daysInMonth) / grandTotalDo;
          } else {
            rowOos = ((totalDoBermasalah / daysInMonth) * val.total_hari_oos) / grandTotalDo;
          }
        } else {
          rowOos = 0;
        }

        // Fail-safe: jika hasil kalkulasi bernilai NaN atau Infinity, paksa jadi 0
        if (isNaN(rowOos) || !isFinite(rowOos)) {
          rowOos = 0;
        }

        totalOOSPercentage += rowOos;
        hasValidCalculation = true;
      });
    
      // Jika oos data ada tapi formula tidak menghasilkan komputasi yang valid -> keluarkan 0
      if (!hasValidCalculation) return 0;
    
      return Number((totalOOSPercentage * 100).toFixed(2));
    };
  
    return shortMonths.map((name, index) => {
      const monthNumber = index + 1;
    
      // Filter data mentah berdasarkan bulan saat ini
      const monthOOS = rawData.oosData.filter(d => Number(d.month) === monthNumber);
      const monthDOB = rawData.doBermasalah.filter(d => Number(d.month) === monthNumber);
      const monthTotalDO = rawData.totalDo.filter(d => Number(d.month) === monthNumber);
    
      // 1. Hitung Overall OOS (Tanpa memandang business_unit)
      const overallOOS = calculateOOS(monthOOS, monthDOB, monthTotalDO);
    
      // 2. Hitung Overall Fish OOS (Hanya yang business_unit === 'fish')
      const overallFish = calculateOOS(
        monthOOS.filter(d => d.business_unit === "fish"),
        monthDOB.filter(d => d.business_unit === "fish"),
        monthTotalDO.filter(d => d.business_unit === "fish")
      );
    
      // 3. Hitung Overall Shrimp OOS (Hanya yang business_unit === 'shrimp')
      const overallShrimp = calculateOOS(
        monthOOS.filter(d => d.business_unit === "shrimp"),
        monthDOB.filter(d => d.business_unit === "shrimp"),
        monthTotalDO.filter(d => d.business_unit === "shrimp")
      );
    
      return {
        month: name,
        overallOOS,
        overallFish,
        overallShrimp
      };
    });
  },

  // computePlantComparison: (data: OOSResult): PlantComparisonData[] => {
  //   const rawData = data;

  //   const plants = Array.from(new Set(rawData.oosData.map(d => d.plant))).filter(Boolean);

  //   // Helper function internal untuk menghitung akurasi per segment (Overall/Fish/Shrimp)
  //   const calculateInternalOOS = (
  //   dataOOS: any[], 
  //   dataDOB: any[], 
  //   dataTotalDO: any[], 
  //   businessUnit: string | null
  //   ): number | null => {      
  //     // Filter berdasarkan Business Unit jika diminta (fish/shrimp)
  //     const filteredDataOOS = businessUnit 
  //       ? dataOOS.filter(d => d.business_unit?.toLowerCase() === businessUnit.toLowerCase())
  //       : dataOOS;
  //     const filteredDataDOB = businessUnit 
  //       ? dataDOB.filter(d => d.business_unit?.toLowerCase() === businessUnit.toLowerCase())
  //       : dataDOB;
  //     const filteredDataTotalDO = businessUnit 
  //       ? dataTotalDO.filter(d => d.business_unit?.toLowerCase() === businessUnit.toLowerCase())
  //       : dataTotalDO;

  //     if (filteredDataOOS.length === 0) return null;

  //     const uniqueYearMonths = new Set<string>();
  //     for (const row of filteredDataOOS) {
  //       if (row.year && row.month) {
  //         uniqueYearMonths.add(`${row.year}-${row.month}`);
  //       }
  //     }
    
  //     let totalDays = 0;
  //     uniqueYearMonths.forEach(key => {
  //       const [year, month] = key.split("-").map(Number);
  //       totalDays += new Date(year, month, 0).getDate();
  //     });
    
  //     if (totalDays === 0) return null;          

  //     const doBermasalahMap = new Map<string, number>();
  //     filteredDataDOB.forEach(db => {  
  //       const key = `${db.kode_pakan}`;
      
  //       const existingTotal = doBermasalahMap.get(key) || 0;
      
  //       const newTotal = existingTotal + (Number(db.total_do_bermasalah) || 0);
      
  //       doBermasalahMap.set(key, newTotal);
  //     });      

  //     const grandTotalDo = filteredDataTotalDO.reduce((acc, row) => acc + (Number(row.total_do) || 0), 0);
  //     if (grandTotalDo === 0) return null;

  //     const groupedData = new Map<string, {
  //       year: number, kode_pakan: string,
  //       sales_monthly: number, total_hari_oos: number
  //     }>();        

  //     filteredDataOOS.forEach((row) => {
  //       const key = `${row.kode_pakan}`;
  //       const existing = groupedData.get(key);
  //       if (existing) {
  //         existing.sales_monthly += Number(row.kirim) || 0;
  //         existing.total_hari_oos += Number(row.total_hari_oos) || 0;
  //       } else {
  //         groupedData.set(key, {
  //           year: row.year, kode_pakan: row.kode_pakan,
  //           sales_monthly: Number(row.kirim) || 0,
  //           total_hari_oos: Number(row.total_hari_oos) || 0,
  //         });
  //       }
  //     });

  //     let totalOOSPercentage = 0;
  //     let hasValidCalculation = false;

  //     groupedData.forEach((record) => {

  //       const totalDoBermasalah = doBermasalahMap.get(record.kode_pakan) || 0;

  //       if (totalDoBermasalah === 0) return;

  //       // const tiap_do = record.sales_monthly / totalDoBermasalah
  //       let rowOosPercentage = 0;

  //       if (record.year === 2025) {
  //         // rowOosPercentage = (tiap_do / totalDays) / grandTotalDo;
  //         rowOosPercentage = (totalDoBermasalah / totalDays) / grandTotalDo;
  //       } else {
  //         // rowOosPercentage = ((tiap_do / totalDays) * record.total_hari_oos) / grandTotalDo;
  //         rowOosPercentage = ((totalDoBermasalah / totalDays) * record.total_hari_oos) / grandTotalDo;
  //       }
      
  //       totalOOSPercentage += rowOosPercentage;
  //       hasValidCalculation = true;
  //     });        

  //     if (!hasValidCalculation) return null;

  //     return Number((totalOOSPercentage * 100).toFixed(2));

  //   };

  //   // 4. Map hasil untuk setiap plant
  //   return plants.map(plantName => {
  //     const plantOOS = rawData.oosData.filter(d => d.plant === plantName);
  //     const plantDOB = rawData.doBermasalah.filter(d => d.plant === plantName);
  //     const plantTotalDO = rawData.totalDo.filter(d => d.plant === plantName);   

  //     return {
  //     plant: plantName,
  //     overallOOS: calculateInternalOOS(plantOOS, plantDOB, plantTotalDO, null),
  //     fishOOS: calculateInternalOOS(plantOOS, plantDOB, plantTotalDO, 'fish'),
  //     shrimpOOS: calculateInternalOOS(plantOOS, plantDOB, plantTotalDO, 'shrimp'),
  //     };
  //   });
  // },

  computePlantComparison: (data: OOSResult): PlantComparisonData[] => {
    const rawData = data;
  
    // 1. Ambil semua kombinasi unik 'plant:business_unit' yang benar-benar ada di data asli
    const uniqueCombinations = new Set<string>();
    rawData.oosData.forEach(d => {
      if (d.plant && d.business_unit) {
        // Satukan dengan separator ':' untuk mempermudah grouping unik
        uniqueCombinations.add(`${d.plant}:${d.business_unit.toLowerCase()}`);
      }
    });
  
    // Helper function internal untuk menghitung akurasi per segment (Overall/Fish/Shrimp)
    const calculateInternalOOS = (
      dataOOS: any[], 
      dataDOB: any[], 
      dataTotalDO: any[], 
      businessUnit: string | null
    ): number | null => {      
      // Filter berdasarkan Business Unit jika diminta (fish/shrimp)
      const filteredDataOOS = businessUnit 
        ? dataOOS.filter(d => d.business_unit?.toLowerCase() === businessUnit.toLowerCase())
        : dataOOS;
      const filteredDataDOB = businessUnit 
        ? dataDOB.filter(d => d.business_unit?.toLowerCase() === businessUnit.toLowerCase())
        : dataDOB;
      const filteredDataTotalDO = businessUnit 
        ? dataTotalDO.filter(d => d.business_unit?.toLowerCase() === businessUnit.toLowerCase())
        : dataTotalDO;
    
      // Merujuk pada ada tidaknya oos data -> tetap keluarkan null
      if (filteredDataOOS.length === 0) return null;
    
      const uniqueYearMonths = new Set<string>();
      for (const row of filteredDataOOS) {
        if (row.year && row.month) {
          uniqueYearMonths.add(`${row.year}-${row.month}`);
        }
      }
    
      let totalDays = 0;
      uniqueYearMonths.forEach(key => {
        const [year, month] = key.split("-").map(Number);
        totalDays += new Date(year, month, 0).getDate();
      });
    
      // Bukan merujuk pada ketidaksediaan data oos awal -> keluarkan 0
      if (totalDays === 0) return 0;          
    
      const doBermasalahMap = new Map<string, number>();
      filteredDataDOB.forEach(db => {  
        const key = `${db.kode_pakan}`;
      
        const existingTotal = doBermasalahMap.get(key) || 0;
      
        const newTotal = existingTotal + (Number(db.total_do_bermasalah) || 0);
      
        doBermasalahMap.set(key, newTotal);
      });      
    
      const grandTotalDo = filteredDataTotalDO.reduce((acc, row) => acc + (Number(row.total_do) || 0), 0);
      // Bukan merujuk pada ketidaksediaan data oos awal -> keluarkan 0
      if (grandTotalDo === 0) return 0;
    
      const groupedData = new Map<string, {
        year: number, kode_pakan: string,
        sales_monthly: number, total_hari_oos: number
      }>();        
    
      filteredDataOOS.forEach((row) => {
        const key = `${row.kode_pakan}`;
        const existing = groupedData.get(key);
        if (existing) {
          existing.sales_monthly += Number(row.kirim) || 0;
          existing.total_hari_oos += Number(row.total_hari_oos) || 0;
        } else {
          groupedData.set(key, {
            year: row.year, kode_pakan: row.kode_pakan,
            sales_monthly: Number(row.kirim) || 0,
            total_hari_oos: Number(row.total_hari_oos) || 0,
          });
        }
      });
    
      let totalOOSPercentage = 0;
      let hasValidCalculation = false;
    
      groupedData.forEach((record) => {
      
        const totalDoBermasalah = doBermasalahMap.get(record.kode_pakan) || 0;
      
        if (totalDoBermasalah === 0) return;
      
        let rowOosPercentage = 0;
      
        // Proteksi: jalankan formula hanya jika nilai pembagi aman (tidak nol)
        if (totalDays > 0 && grandTotalDo > 0) {
          if (record.year === 2025) {
            rowOosPercentage = (totalDoBermasalah / totalDays) / grandTotalDo;
          } else {
            rowOosPercentage = ((totalDoBermasalah / totalDays) * record.total_hari_oos) / grandTotalDo;
          }
        } else {
          rowOosPercentage = 0;
        }

        // Fail-safe: jika hasil kalkulasi bernilai NaN atau Infinity, paksa jadi 0
        if (isNaN(rowOosPercentage) || !isFinite(rowOosPercentage)) {
          rowOosPercentage = 0;
        }
      
        totalOOSPercentage += rowOosPercentage;
        hasValidCalculation = true;
      });        
    
      // Jika oos data ada tapi formula tidak menghasilkan komputasi yang valid -> keluarkan 0
      if (!hasValidCalculation) return 0;
    
      return Number((totalOOSPercentage * 100).toFixed(2));
    };
  
    // 2. Lakukan mapping berdasarkan pasang kombinasi unik yang benar-benar ada di data
    return Array.from(uniqueCombinations).map(combo => {
      const [plantName, buName] = combo.split(":");
    
      const plantOOS = rawData.oosData.filter(d => d.plant === plantName);
      const plantDOB = rawData.doBermasalah.filter(d => d.plant === plantName);
      const plantTotalDO = rawData.totalDo.filter(d => d.plant === plantName);   
    
      return {
        plant: plantName,
        business_unit: buName, // otomatis 'fish' atau 'shrimp' sesuai data aslinya
        oos: calculateInternalOOS(plantOOS, plantDOB, plantTotalDO, buName)
      };
    });
  },

  computeOOSByPakan: (data: OOSResult): OOSByPakanResult[] => {
    // Merujuk pada ada tidaknya oos data -> keluarkan array kosong []
    if (!data?.oosData || data.oosData.length === 0) {
      return [];
    }

    const uniqueYearMonths = new Set<string>();
    for (const row of data.oosData) {
      if (row.year && row.month) {
        uniqueYearMonths.add(`${row.year}-${row.month}`);
      }
    }

    let totalDays = 0;
    uniqueYearMonths.forEach(key => {
      const [year, month] = key.split("-").map(Number);
      totalDays += new Date(year, month, 0).getDate();
    });

    if (totalDays === 0) return [];

    const doBermasalahMap = new Map<string, number>();
    data.doBermasalah.forEach(db => {
      const key = `${db.business_unit}|${db.kode_pakan}`;
      const existingTotal = doBermasalahMap.get(key) || 0;
      doBermasalahMap.set(key, existingTotal + (Number(db.total_do_bermasalah) || 0));
    });

    const totalDoByUnitMap = new Map<string, number>();
    data.totalDo.forEach(td => {
      const key = td.business_unit; // Hanya business_unit
      const existingTotal = totalDoByUnitMap.get(key) || 0;
      totalDoByUnitMap.set(key, existingTotal + (Number(td.total_do) || 0));
    });      

    const groupedData = new Map<string, {
      year: number,
      business_unit: string,
      kode_pakan: string,
      sales_monthly: number,
      total_hari_oos: number
    }>();

    data.oosData.forEach((row) => {
      const key = `${row.business_unit}|${row.kode_pakan}`;
      const existing = groupedData.get(key);

      if (existing) {
        existing.sales_monthly += Number(row.kirim) || 0;
        existing.total_hari_oos += Number(row.total_hari_oos) || 0;
      } else {
        groupedData.set(key, {
          year: Number(row.year), 
          business_unit: row.business_unit,
          kode_pakan: row.kode_pakan,
          sales_monthly: Number(row.kirim) || 0,
          total_hari_oos: Number(row.total_hari_oos) || 0,
        });
      }
    });

    const results: any[] = [];

    groupedData.forEach((record) => {
      const mapKey = `${record.business_unit}|${record.kode_pakan}`;
      const totalDoBermasalah = doBermasalahMap.get(mapKey) || 0;
      const totalDoUnit = totalDoByUnitMap.get(record.business_unit) || 0;
      
      let oosFinalValue: number = 0; // Ubah default dari null ke 0 untuk menampung hasil perhitungan aman
      
      // Proteksi: jalankan formula hanya jika nilai pembagi aman (tidak nol)
      if (totalDays > 0 && totalDoUnit > 0) {
        let rowOosValue = 0;
        
        if (record.year === 2025) {
          rowOosValue = (totalDoBermasalah / totalDays) / totalDoUnit;
        } else {
          rowOosValue = ((totalDoBermasalah / totalDays) * record.total_hari_oos) / totalDoUnit;
        }
        
        // Fail-safe: jika hasil kalkulasi bernilai NaN atau Infinity, paksa jadi 0
        if (isNaN(rowOosValue) || !isFinite(rowOosValue)) {
          rowOosValue = 0;
        }

        oosFinalValue = Number((rowOosValue * 100).toFixed(2));
      } else {
        oosFinalValue = 0; // Berikan fallback 0 jika komponen pembagi kosong/nol
      }

      results.push({
        label: `${record.business_unit} - ${record.kode_pakan}`,
        business_unit: record.business_unit,
        kode_pakan: record.kode_pakan,
        oos: oosFinalValue
      });
    });

    return results.sort((a, b) => (b.oos ?? -1) - (a.oos ?? -1));   
  }
};

export const OOSService = {
  getSubmissionStatus: async (filters: OOSFilters): Promise<PlantSubmissionStatus[]> => {
    try {
      let targetMonth: number;

      const formatBusinessUnit = (bu: string) => {
        if (!bu) return "";
        const lower = bu.toLowerCase().trim();

        if (lower === "fish") return "FF";
        if (lower === "shrimp") return "SF";

        return lower.replace(/\b\w/g, (char) => char.toUpperCase());
      };    

      // const toTitleCase = (str: string) => {
      //   if (!str) return "";
      //   return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
      // };      

      // const plantData = await db.execute(sql`
      //     SELECT DISTINCT plant FROM out_of_stock
      //     ORDER BY plant ASC
      // `) as unknown as { plant: string }[]; 

      // const defaultPlants = plantData.map((r) => r.plant);

      const plantData = await db.execute(sql`
          SELECT DISTINCT plant, business_unit FROM out_of_stock
          ORDER BY plant ASC, business_unit ASC
      `) as unknown as { plant: string; business_unit: string }[]; 
      
      // 2. Gabungkan formatnya menjadi "Plant BU" (tanpa "-") agar serasi dengan filter baru
      const defaultPlants = plantData.map((r) => {
        const formattedBU = formatBusinessUnit(r.business_unit);
        return formattedBU ? `${r.plant} ${formattedBU}` : r.plant;
      });      

      const activePlants: string[] = filters.plants && filters.plants.length > 0 
        ? filters.plants 
        : defaultPlants;

      if (filters.months && filters.months.length > 0) {
        targetMonth = Math.max(...filters.months);
      } else {
        const maxMonthResult = await db.execute(sql`
          SELECT MAX(month) as max_month
          FROM out_of_stock
          WHERE year = ${filters.year}
        `);
        targetMonth = (maxMonthResult as any)[0]?.max_month || (new Date().getMonth() + 1);
      }

      let plantClause = sql``;
      if (filters.plants && filters.plants.length > 0) {
        const conditions = filters.plants.map((p) => {
          const parts = p.trim().split(" ");
          const buCode = parts.pop() || ""; // Mengambil kode terakhir ("FF" atau "SF")
          const plantName = parts.join(" "); // Mengambil sisa kata sebagai nama plant

          // Mengembalikan kode ke value database asli
          let buDb = "";
          if (buCode.toUpperCase() === "FF") buDb = "fish";
          else if (buCode.toUpperCase() === "SF") buDb = "shrimp";
          else buDb = buCode; 

          // Membuat sub-kondisi SQL: (plant = 'X' AND business_unit = 'Y')
          return sql`(plant = ${plantName} AND business_unit = ${buDb})`;
        });

        // Menggabungkan semua kondisi dengan OR
        plantClause = sql`AND (${sql.join(conditions, sql` OR `)})`;
      }      

      // const plantClause = filters.plants && filters.plants.length > 0 
      //   ? sql`AND plant IN (${sql.join(filters.plants, sql`, `)})` 
      //   : sql``;

      // Hanya ambil data untuk targetMonth yang ditentukan
      const result = await db.execute(sql`
        SELECT DISTINCT plant, business_unit
        FROM out_of_stock
        WHERE year = ${filters.year} 
          AND month = ${targetMonth}
          ${plantClause}
      `);

      const rows = result as unknown as { plant: string; business_unit: string }[];

      const uniqueGroups = Array.from(
        new Set(rows.map(r => `${r.plant}|${r.business_unit}`))
      ).map(key => {
        const [plant, business_unit] = key.split('|');
        return { plant, business_unit };
      });  
      
      uniqueGroups.sort((a, b) => {
        const plantCompare = a.plant.localeCompare(b.plant);
        if (plantCompare !== 0) return plantCompare;
        return a.business_unit.localeCompare(b.business_unit);
      });      

      return uniqueGroups.map(group => {
      const isFilled = rows.some(r => 
        r.plant?.toUpperCase() === group.plant.toUpperCase() &&
        r.business_unit?.toUpperCase() === group.business_unit.toUpperCase()
      );

      const formattedBU = formatBusinessUnit(group.business_unit);
      const displayName = formattedBU 
        ? `${group.plant} ${formattedBU}` 
        : group.plant;

      const details = [{
        month: targetMonth,
        isFilled: isFilled
      }];

        return {
          plant: displayName,
          completedMonths: isFilled ? 1 : 0,
          percentage: isFilled ? 100 : 0,
          details: details
        };
      });

    } catch (error) {
      console.error("Error in getSubmissionStatus:", error);
      return [];
    }
  },  

  getFilterOptions: async () => {

    const formatBusinessUnit = (bu: string) => {
      if (!bu) return "";
      const lower = bu.toLowerCase().trim();
      if (lower === "fish") return "FF";
      if (lower === "shrimp") return "SF";
      return lower.replace(/\b\w/g, (char) => char.toUpperCase());
    }; 

    const result = await db.execute(sql`
      SELECT DISTINCT year FROM out_of_stock 
      ORDER BY year DESC
    `);

    // const plantData = await db.execute(sql`
    //     SELECT DISTINCT plant FROM out_of_stock
    //     ORDER BY plant ASC
    // `);

    const plantBUData = await db.execute(sql`
      SELECT DISTINCT plant, business_unit 
      FROM out_of_stock
      ORDER BY plant ASC, business_unit ASC
    `) as unknown as { plant: string; business_unit: string }[];    

    const BUData = await db.execute(sql`
      SELECT DISTINCT business_unit FROM out_of_stock
      ORDER BY business_unit ASC  
    `);

    const combinedPlants = plantBUData.map((r) => {
    const formattedBU = formatBusinessUnit(r.business_unit);
    return formattedBU ? `${r.plant} ${formattedBU}` : r.plant;
    });
    
    return {
      year: (result as any).map((r: any) => Number(r.year)),
      // plants: (plantData as any).map((r: any) => r.plant),
      plants: combinedPlants,
      business_unit: (BUData as any).map((r: any) => r.business_unit),
      months: monthNames.map((name, i) => ({ id: i + 1, name }))
    };
  },  
  
  getLatestMonthAvailable: async (year: number): Promise<number | null> => {
    try {
      const result = await db.execute(sql`
        SELECT MAX(month) as max_month 
        FROM out_of_stock
        WHERE year = ${year}
      `);
      
      const maxMonth = (result as any)[0]?.max_month;
      return maxMonth ? Number(maxMonth) : null;
    } catch (error) {
      console.error("Error fetching latest month:", error);
      return null;
    }
  },
  
  getMonthlyPerformance: async (filters: OOSFilters): Promise<MonthlyPerformanceData[]> => {
    const yearClause = sql`AND year = ${filters.year}`;

    // const plantClause = filters.plants && filters.plants.length > 0 
    //   ? sql`AND plant IN (${sql.join(filters.plants, sql`, `)})` 
    //   : sql``;

    const BUClause = filters.business_unit && filters.business_unit.length > 0 
      ? sql`AND business_unit IN (${sql.join(filters.business_unit, sql`, `)})` 
      : sql``;     
    
    let plantClause = sql``;
    if (filters.plants && filters.plants.length > 0) {
      const conditions = filters.plants.map((p) => {
        const parts = p.trim().split(" ");
        const buCode = parts.pop() || ""; // Mengambil kode terakhir ("FF" atau "SF")
        const plantName = parts.join(" "); // Mengambil sisa kata sebagai nama plant

        // Mengembalikan kode ke value database asli
        let buDb = "";
        if (buCode.toUpperCase() === "FF") buDb = "fish";
        else if (buCode.toUpperCase() === "SF") buDb = "shrimp";
        else buDb = buCode; 

        // Membuat sub-kondisi SQL: (plant = 'X' AND business_unit = 'Y')
        return sql`(plant = ${plantName} AND business_unit = ${buDb})`;
      });

      // Menggabungkan semua kondisi dengan OR
      plantClause = sql`AND (${sql.join(conditions, sql` OR `)})`;
    }  
    
    try {
      // const result = await db.execute(sql`
      //   SELECT * FROM oos_plant_performance_detail_monthly
      //   WHERE 1=1
      //   ${yearClause}
      //   ${plantClause}  
      //   ${BUClause}      
      //   ORDER BY plant ASC, business_unit ASC
      // `);

      const result = await db.execute(sql`
        SELECT * FROM oos_plant_performance_detail_monthly
        WHERE 1=1
        ${yearClause}
        ${plantClause}   
        ${BUClause}   
        ORDER BY plant ASC, business_unit ASC
      `);      

      const rows = result as unknown as MonthlyPerformanceRow[];

      return rows.map((row) => ({
        plant: row.plant ?? "Unknown",
        businessUnit: row.business_unit ?? "N/A",
        year: Number(row.year),
        monthlyData: [
          { month: 'Jan', value: row.jan !== null ? Number(row.jan) : null },
          { month: 'Feb', value: row.feb !== null ? Number(row.feb) : null },
          { month: 'Mar', value: row.mar !== null ? Number(row.mar) : null },
          { month: 'Apr', value: row.apr !== null ? Number(row.apr) : null },
          { month: 'May', value: row.may !== null ? Number(row.may) : null },
          { month: 'Jun', value: row.jun !== null ? Number(row.jun) : null },
          { month: 'Jul', value: row.jul !== null ? Number(row.jul) : null },
          { month: 'Aug', value: row.aug !== null ? Number(row.aug) : null },
          { month: 'Sep', value: row.sep !== null ? Number(row.sep) : null },
          { month: 'Oct', value: row.oct !== null ? Number(row.oct) : null },
          { month: 'Nov', value: row.nov !== null ? Number(row.nov) : null },
          { month: 'Dec', value: row.dec !== null ? Number(row.dec) : null },
        ],
        // Membiarkan null jika value dari DB adalah null
        total_oos_percentage_ytd: row.total_oos_percentage_ytd !== null ? Number(row.total_oos_percentage_ytd) : null,
      }));
    } catch (error) {
      console.error("Error in getMonthlyPerformance:", error);
      return [];
    }
  },

  getTrendAnalysis: async (filters: OOSFilters): Promise<TrendAnalysisData[]> => {
    const targetYear = filters.year;
    const targetMonths = filters.months;
    try {
      // Pastikan query tetap menggunakan sintaks yang benar untuk parameter opsional
      const monthCondition = (targetMonths && targetMonths.length > 0)
        ? sql`AND month IN (${sql.join(targetMonths, sql`, `)})`
        : sql``;

      const result = await db.execute(sql`
        SELECT 
          *
        FROM oos_trend_analysis_monthly 
        WHERE year = ${targetYear}
        ${monthCondition}
        ORDER BY month ASC
      `);

      const rows = result as unknown as TrendAnalysisRow[];

      return rows.map((row) => ({
        year: Number(row.year) || targetYear,
        month: row.month ? monthNames[Number(row.month) - 1] : "Unknown",
        overall_oos_percentage: Number(row.overall_oos_percentage) || 0,
        fish_oos_percentage: Number(row.fish_oos_percentage) || 0,
        shrimp_oos_percentage: Number(row.shrimp_oos_percentage) || 0,
        bestPerforming: row.best_performing ?? "-",
        worstPerforming: row.worst_performing ?? "-",
      }));
    } catch (error) {
      console.error("Error in getTrendAnalysis:", error);
      return [];
    }
  },

  getOOSData: async (filters: OOSFilters): Promise<OOSResult> => {
    try {

      const yearClause = sql`AND year = ${filters.year}`;

      const monthClause = filters.months && filters.months.length > 0 
        ? sql`AND month IN (${sql.join(filters.months, sql`, `)})` 
        : sql``;
        
      // const plantClause = filters.plants && filters.plants.length > 0 
      //   ? sql`AND plant IN (${sql.join(filters.plants, sql`, `)})` 
      //   : sql``;

      let plantClause = sql``;
      if (filters.plants && filters.plants.length > 0) {
        const conditions = filters.plants.map((p) => {
          const parts = p.trim().split(" ");
          const buCode = parts.pop() || ""; // Mengambil kode terakhir ("FF" atau "SF")
          const plantName = parts.join(" "); // Mengambil sisa kata sebagai nama plant

          // Mengembalikan kode ke value database asli
          let buDb = "";
          if (buCode.toUpperCase() === "FF") buDb = "fish";
          else if (buCode.toUpperCase() === "SF") buDb = "shrimp";
          else buDb = buCode; 

          // Membuat sub-kondisi SQL: (plant = 'X' AND business_unit = 'Y')
          return sql`(plant = ${plantName} AND business_unit = ${buDb})`;
        });

        // Menggabungkan semua kondisi dengan OR
        plantClause = sql`AND (${sql.join(conditions, sql` OR `)})`;
      }  

      const [resOos, resDoBermasalah, resTotalDo] = await Promise.all([
        db.execute(sql`
          SELECT 
            year, month, week, plant, business_unit, kode_pakan, 
            stock_pakan, kebutuhan_pakan, kirim, hasil_produksi, 
            total_hari_oos
          FROM out_of_stock
          WHERE 1=1 ${yearClause} ${monthClause} ${plantClause}
        `),
        db.execute(sql`
          SELECT year, month, plant, business_unit, kode_pakan, total_do_bermasalah
          FROM out_of_stock_do_bermasalah
          WHERE 1=1 ${yearClause} ${monthClause} ${plantClause}
        `),
        db.execute(sql`
          SELECT year, month, plant, business_unit, total_do
          FROM out_of_stock_total_do
          WHERE 1=1 ${yearClause} ${monthClause} ${plantClause}
        `)
      ]);

      return {
        oosData: resOos as unknown as RawDataRow[],
        doBermasalah: resDoBermasalah as unknown as DOProblem[],
        totalDo: resTotalDo as unknown as DOTotal[]
      };
      
    } catch (error) {
      console.error("Error in getOOSData:", error);
      return {
        oosData: [],
        doBermasalah: [],
        totalDo: []
      };
    }
  },  
};