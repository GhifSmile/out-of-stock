import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

// Helper
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const OutofStockService = {
  getFilterOptions: async () => {
    const result = await db.execute(sql`
      SELECT DISTINCT year FROM oos_final 
      ORDER BY year DESC
    `);

    const plantData = await db.execute(sql`
        SELECT DISTINCT plant FROM oos_final
        ORDER BY plant ASC
    `);

    const BUData = await db.execute(sql`
      SELECT DISTINCT business_unit FROM oos_final
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
        FROM oos_final
        WHERE year = ${year}
      `);
      
      const maxMonth = (result as any)[0]?.max_month;
      return maxMonth ? Number(maxMonth) : null;
    } catch (error) {
      console.error("Error fetching latest month:", error);
      return null;
    }
  },    

};