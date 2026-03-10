"use client"

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false });

interface Props {
  value: number;
  title: string;
  type: 'overall' | 'fish' | 'shrimp';
  year: number;
}

export default function GaugeChart({ value, title, type , year}: Props) {

  const getArcConfig = () => {
    switch (type) {
      case 'overall':
        return [
          { limit: 1.0, color: '#02d1a7'},
        //   { limit: 1.0, color: '#4bc0f2'},          
          { limit: 2.0, color: '#f04487' },
        ];
      case 'fish':
        return [
          { limit: 1.0, color: '#02d1a7'},
        //   { limit: 1.0, color: '#4bc0f2'},          
          { limit: 2.0, color: '#f04487' },
        ];
      case 'shrimp':
        return [
          { limit: 1.0, color: '#02d1a7'},
        //   { limit: 1.0, color: '#4bc0f2'},          
          { limit: 2.0, color: '#f04487' },
        ];
      default:
        return [];
    }
  };

  return (
    <Card className="bg-white border-none shadow-sm">
        
      <CardHeader className="pb-0 pt-2 px-4 flex flex-col items-center justify-center">
        <CardTitle className="text-[12px] font-bold text-black tracking-widest text-center">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="h-[200] flex flex-col items-center justify-center">
        <GaugeComponent
          value={value}
          maxValue={2.0}
          type="radial"
          style={{ 
              width: "100%", 
              maxWidth: "260px", // Mencegah gauge terlalu besar di mobile
              margin: "0 auto",
            }}
          labels={{
            valueLabel: {
                formatTextValue: (val: number) => `${val.toFixed(2)}`,
                style: {
                    fill: "#000000",  
                    textShadow: "none", 
                    fontWeight: "bold",
              }
            },
            tickLabels: {
              type: "outer",
              defaultTickValueConfig: {
                formatTextValue: (value: number) => `${value.toFixed(2)}`,
                style: {
                    fill: "#000000",
                    textShadow: "none",
                    fontSize: 7,
                }
              },
              ticks: [
                { value: 0.0 },
                { value: 0.5 },
                { value: 1.0 },
                { value: 1.5 },
                { value: 2.0 },
              ]
            }
          }}
          arc={{
            subArcs: getArcConfig(),
            padding: 0.02,
            width: 0.3,
            cornerRadius: 0
          }}
          pointer={{
            elastic: true,
            animationDelay: 0,
            type: "needle",
            color: '#000000',
            baseColor: '#000000',
            width: 15,
            length: 0.75,            
          }}
        />
        {/* Label Angka di Bawah Gauge */}
        {/* <div className="text-2xl font-bold text-slate-900 -mt-4">{value}%</div> */}
      </CardContent>
    </Card>
  );
}