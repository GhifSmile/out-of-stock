"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { PlantComparisonData } from "@/services/outofStock";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface Props {
  data: PlantComparisonData[];
}

export default function ComparisonBarChart({ data }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // --- LOGIKA INTERAKTIF PERBAIKAN ---
  const handleBarClick = useCallback((item: any) => {
    // Di Recharts, saat onClick di taruh di <Bar />, datanya ada di item.payload
    if (item && item.plant) {
      const clickedPlant = item.plant;
      const params = new URLSearchParams(searchParams.toString());
      
      if (params.get("plant") === clickedPlant) {
        params.delete("plant");
      } else {
        params.set("plant", clickedPlant);
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [router, searchParams, pathname]);

  const tooltipOrder = ["Overall Out of Stock", "Fish Out of Stock", "Shrimp Out of Stock"];
  const sortedData = [...data].sort((a, b) => {
      return (b.overallOOS || 0) - (a.overallOOS || 0);
    });
  const legendOrder = ["Overall Out of Stock", "Fish Out of Stock", "Shrimp Out of Stock"]

  return (
    <Card className="shadow-sm rounded-xl overflow-visible border-none h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-black">Plant Group Comparison Out of Stock</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 w-full min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{ top: 20, right: 30, left: -10, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
            <XAxis 
              dataKey="plant" 
              tickLine={false} 
              axisLine={false} 
              fontSize={10}
              dy={5}
            />
            <YAxis 
              tickFormatter={(value) => `${value}`} 
              tickLine={false} 
              axisLine={false} 
              domain={[0, 2]} 
              fontSize={10}
              ticks={[0, 0.5, 1.0, 1.5, 2.0]}
            />

            <Tooltip 
              cursor={{fill: '#f8fafc'}}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              itemSorter={(item) => tooltipOrder.indexOf(item.name as string)}
              formatter={(value: number | string | undefined, labelName: any) => {
                const numericValue = Number(value);
                if (!value || numericValue === 0) return [null, null];
                
                const formattedValue = numericValue.toFixed(2);
                return [`${formattedValue}`, labelName];
                // if (typeof value === 'undefined') return ["0.0", labelName];
                // const formattedValue = Number(value).toFixed(1);
                // return [`${formattedValue}`, labelName];
              }}
            />           
            
            <Legend 
              verticalAlign="bottom" 
              align="center"
              itemSorter={(item) => legendOrder.indexOf(item.value as string)}
              iconType="rect"
              iconSize={10}          
              formatter={(value) => <span className="text-slate-700">{value}</span>}
              wrapperStyle={{ 
                fontSize: '12px', 
                paddingTop: '20px',
                position: 'relative',
                width: '100%'
              }} 
            />       
            
            {/* PINDAHKAN onClick KE DALAM SETIAP BAR DAN TAMBAHKAN CURSOR POINTER */}
            <Bar 
              name="Overall Out of Stock" 
              dataKey="overallOOS" 
              fill="#4bc0f2" 
              radius={[2, 2, 0, 0]} 
              onClick={handleBarClick}
              className="cursor-pointer"
            />
            <Bar 
              name="Fish Out of Stock" 
              dataKey="fishOOS" 
              fill="#f2a977" 
              radius={[2, 2, 0, 0]} 
              onClick={handleBarClick}
              className="cursor-pointer"
            />
            <Bar 
              name="Shrimp Out of Stock" 
              dataKey="shrimpOOS" 
              fill="#ca7bfc" 
              radius={[2, 2, 0, 0]} 
              onClick={handleBarClick}
              className="cursor-pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}