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
  oos: number;
}

export interface MonthlyPerformanceData {
  plant: string;
  businessUnit: string;
  year: number;
  monthlyData: { month: string; value: number }[];
  total_oos_percentage_ytd: number;
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
  overallOOS: number;
}

export interface PlantComparisonData {
  plant: string;
  overallOOS: number;
  fishOOS: number;
  shrimpOOS: number;
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

function calculateOOSByUnit(data: OOSResult, businessUnitFilter: string | null = null): number {
  if (!data?.oosData || data.oosData.length === 0) {
    return 0;
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

  let totalOOSPercentage = 0;

  groupedData.forEach((record) => {
    const totalDoBermasalah = doBermasalahMap.get(record.kode_pakan) || 0;
    const tiap_do = totalDoBermasalah > 0 ? record.sales_monthly / totalDoBermasalah : 0;

    let rowOosPercentage = 0;
  
    if (record.year === 2025) {
      rowOosPercentage = (tiap_do / totalDays) / grandTotalDo;
    } else {
      rowOosPercentage = ((tiap_do / totalDays) * record.total_hari_oos) / grandTotalDo;
    }

    totalOOSPercentage += rowOosPercentage;
  });

  return Number((totalOOSPercentage * 100).toFixed(2));
}

export const OOSUtils = {
  calculateOverall: (data: OOSResult) => calculateOOSByUnit(data, null),

  calculateFish: (data: OOSResult) => calculateOOSByUnit(data, 'fish'),

  calculateShrimp: (data: OOSResult) => calculateOOSByUnit(data, 'shrimp'),  

  computeMonthlyTrend: (data: OOSResult): MonthlyTrendData[] => {
    const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const rawData = data;

    const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

    return shortMonths.map((name, index) => {
      const monthNumber = index + 1;

      const monthOOS = rawData.oosData.filter(d => Number(d.month) === monthNumber);
      const monthDOB = rawData.doBermasalah.filter(d => Number(d.month) === monthNumber);
      const monthTotalDO = rawData.totalDo.filter(d => Number(d.month) === monthNumber);

      if (monthOOS.length === 0) {
        return { month: name, overallOOS: 0 };
      }

      const grandTotalDo = monthTotalDO.reduce((acc, row) => acc + (Number(row.total_do) || 0), 0);
      if (grandTotalDo === 0) return { month: name, overallOOS: 0 };

      const doBermasalahMap = new Map<string, number>();
      monthDOB.forEach(db => {
      
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

      monthOOS.forEach(row => {
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

      let totalOOSPercentage = 0;

      grouped.forEach((val, key) => {
        const totalDoBermasalah = doBermasalahMap.get(val.kode_pakan) || 0;
        const tiap_do = totalDoBermasalah > 0 ? val.sales_monthly / totalDoBermasalah : 0;
        const daysInMonth = getDaysInMonth(val.year, val.month);

        let rowOos = 0;
        if (val.year === 2025) {
          rowOos = (tiap_do / daysInMonth) / grandTotalDo;
        } else {
          rowOos = ((tiap_do / daysInMonth) * val.total_hari_oos) / grandTotalDo;
        }
        totalOOSPercentage += rowOos;
      });

      return {
        month: name,
        overallOOS: Number((totalOOSPercentage * 100).toFixed(2))
      };
    });
  },

  computePlantComparison: (data: OOSResult): PlantComparisonData[] => {
    const rawData = data;

    const plants = Array.from(new Set(rawData.oosData.map(d => d.plant))).filter(Boolean);

    // Helper function internal untuk menghitung akurasi per segment (Overall/Fish/Shrimp)
    const calculateInternalOOS = (
    dataOOS: any[], 
    dataDOB: any[], 
    dataTotalDO: any[], 
    businessUnit: string | null
    ) => {      
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

      if (filteredDataOOS.length === 0) return 0;

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
    
      if (totalDays === 0) return 0;          

      const doBermasalahMap = new Map<string, number>();
      filteredDataDOB.forEach(db => {  
        const key = `${db.kode_pakan}`;
      
        const existingTotal = doBermasalahMap.get(key) || 0;
      
        const newTotal = existingTotal + (Number(db.total_do_bermasalah) || 0);
      
        doBermasalahMap.set(key, newTotal);
      });      

      const grandTotalDo = filteredDataTotalDO.reduce((acc, row) => acc + (Number(row.total_do) || 0), 0);
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

      groupedData.forEach((record) => {

        const totalDoBermasalah = doBermasalahMap.get(record.kode_pakan) || 0;
        const tiap_do = totalDoBermasalah > 0 ? record.sales_monthly / totalDoBermasalah : 0;
      
        let rowOosPercentage = 0;
        if (record.year === 2025) {
          rowOosPercentage = (tiap_do / totalDays) / grandTotalDo;
        } else {
          rowOosPercentage = ((tiap_do / totalDays) * record.total_hari_oos) / grandTotalDo;
        }
      
        totalOOSPercentage += rowOosPercentage;
      });        

      return Number((totalOOSPercentage * 100).toFixed(2));

    };

    // 4. Map hasil untuk setiap plant
    return plants.map(plantName => {
      const plantOOS = rawData.oosData.filter(d => d.plant === plantName);
      const plantDOB = rawData.doBermasalah.filter(d => d.plant === plantName);
      const plantTotalDO = rawData.totalDo.filter(d => d.plant === plantName);   

      return {
      plant: plantName,
      overallOOS: calculateInternalOOS(plantOOS, plantDOB, plantTotalDO, null),
      fishOOS: calculateInternalOOS(plantOOS, plantDOB, plantTotalDO, 'fish'),
      shrimpOOS: calculateInternalOOS(plantOOS, plantDOB, plantTotalDO, 'shrimp'),
      };
    });
  },

  computeOOSByPakan: (data: OOSResult): OOSByPakanResult[] => {
    
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

    // const grandTotalDo = data.totalDo.reduce((acc, row) => acc + (Number(row.total_do) || 0), 0);
    // if (grandTotalDo === 0) return [];

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
      const tiap_do = totalDoBermasalah > 0 ? record.sales_monthly / totalDoBermasalah : 0;

      let rowOosValue = 0;
      
      if (record.year === 2025) {
        rowOosValue = (tiap_do / totalDays) / totalDoUnit;
      } else {
        rowOosValue = ((tiap_do / totalDays) * record.total_hari_oos) / totalDoUnit;
      }

      results.push({
        // Format label untuk visualisasi: "business_unit - kode_pakan"
        label: `${record.business_unit} - ${record.kode_pakan}`,
        business_unit: record.business_unit,
        kode_pakan: record.kode_pakan,
        oos: Number((rowOosValue * 100).toFixed(2))
      });
    });

    return results.sort((a, b) => b.oos - a.oos);    
  }
};

export const OOSService = {
  getSubmissionStatus: async (filters: OOSFilters): Promise<PlantSubmissionStatus[]> => {
    try {
      let targetMonth: number;

      const toTitleCase = (str: string) => {
        if (!str) return "";
        return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
      };      

      const plantData = await db.execute(sql`
          SELECT DISTINCT plant FROM out_of_stock
          ORDER BY plant ASC
      `) as unknown as { plant: string }[]; 

      const defaultPlants = plantData.map((r) => r.plant);

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

      const plantClause = filters.plants && filters.plants.length > 0 
        ? sql`AND plant IN (${sql.join(filters.plants, sql`, `)})` 
        : sql``;

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

      const formattedBU = toTitleCase(group.business_unit);
        const displayName = formattedBU 
          ? `${group.plant} - ${formattedBU}` 
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
    const result = await db.execute(sql`
      SELECT DISTINCT year FROM out_of_stock 
      ORDER BY year DESC
    `);

    const plantData = await db.execute(sql`
        SELECT DISTINCT plant FROM out_of_stock
        ORDER BY plant ASC
    `);

    const BUData = await db.execute(sql`
      SELECT DISTINCT business_unit FROM out_of_stock
      ORDER BY business_unit ASC  
    `);
    
    return {
      year: (result as any).map((r: any) => Number(r.year)),
      plants: (plantData as any).map((r: any) => r.plant),
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

    const plantClause = filters.plants && filters.plants.length > 0 
      ? sql`AND plant IN (${sql.join(filters.plants, sql`, `)})` 
      : sql``;

    const BUClause = filters.business_unit && filters.business_unit.length > 0 
      ? sql`AND business_unit IN (${sql.join(filters.business_unit, sql`, `)})` 
      : sql``;      
    
    try {
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
          { month: 'Jan', value: Number(row.jan) || 0 },
          { month: 'Feb', value: Number(row.feb) || 0 },
          { month: 'Mar', value: Number(row.mar) || 0 },
          { month: 'Apr', value: Number(row.apr) || 0 },
          { month: 'May', value: Number(row.may) || 0 },
          { month: 'Jun', value: Number(row.jun) || 0 },
          { month: 'Jul', value: Number(row.jul) || 0 },
          { month: 'Aug', value: Number(row.aug) || 0 },
          { month: 'Sep', value: Number(row.sep) || 0 },
          { month: 'Oct', value: Number(row.oct) || 0 },
          { month: 'Nov', value: Number(row.nov) || 0 },
          { month: 'Dec', value: Number(row.dec) || 0 },
        ],
        total_oos_percentage_ytd: Number(row.total_oos_percentage_ytd)|| 0,
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
        
      const plantClause = filters.plants && filters.plants.length > 0 
        ? sql`AND plant IN (${sql.join(filters.plants, sql`, `)})` 
        : sql``;

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