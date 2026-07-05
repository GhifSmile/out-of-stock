// "use client"

// import dynamic from "next/dynamic";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Download } from "lucide-react";
// import { useCallback, useRef, useState } from "react";
// import { toPng } from "html-to-image";

// const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false });

// interface Props {
//   value: number | null;
//   title: string;
//   type: 'overall' | 'fish' | 'shrimp';
//   year: number;
//   plants?: string[]; 
// }

// export default function GaugeChart({ value, title, type, year, plants}: Props) {
//   const cardRef = useRef<HTMLDivElement>(null);
//   const [isDownloading, setIsDownloading] = useState(false);

//   const getArcConfig = () => {
//     if (year >= 2026) {
//       switch (type) {
//           case 'overall':
//           case 'fish':
//           case 'shrimp':
//             return [
//           { limit: 2.0, color: '#02d1a7'},
//         //   { limit: 1.0, color: '#4bc0f2'},          
//           { limit: 3.0, color: '#f04487' },
//         ];
//       default:
//         return [];
//       }
//     } else {
//       switch (type) {
//           case 'overall':
//           case 'fish':
//           case 'shrimp':
//             return [
//           { limit: 1.0, color: '#02d1a7'},        
//           { limit: 2.0, color: '#f04487' },
//         ];
//       default:
//         return [];
//       }      
//     }
//   }

//   const currentTicks = getArcConfig().map(arc => ({ value: arc.limit }));

//   const handleDownload = useCallback(async () => {
//     if (!cardRef.current) return;

//     try {
//       setIsDownloading(true);
//       const downloadBtn = cardRef.current.querySelector('[data-no-print]');
//       if (downloadBtn) {
//         (downloadBtn as HTMLElement).style.display = 'none';
//       }

//       const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });

//       if (downloadBtn) {
//         (downloadBtn as HTMLElement).style.display = '';
//       }

//       const sanitizedTitle = title.toLowerCase().replace(/\s+/g, '-');
//       const date = new Date().toISOString().split('T')[0];

//       const link = document.createElement('a');
//       link.href = dataUrl;
//       link.download = `${sanitizedTitle}-${date}.png`;
//       link.click();
//     } catch (error) {
//       console.error('Download failed:', error);
//       const downloadBtn = cardRef.current?.querySelector('[data-no-print]');
//       if (downloadBtn) {
//         (downloadBtn as HTMLElement).style.display = '';
//       }
//     } finally {
//       setIsDownloading(false);
//     }
//   }, [title]);

//   return (
//     <Card ref={cardRef} className="bg-white border-none shadow-sm">
        
//       <CardHeader className="relative pb-0 pt-4 px-4 flex items-center justify-center">
//         <CardTitle className="text-[12px] font-bold text-black tracking-widest text-center">
//           {title}
//         </CardTitle>

//         <div className="absolute right-4 -top-2">
//           <button
//             onClick={handleDownload}
//             disabled={isDownloading}
//             data-no-print
//             className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all duration-200 disabled:opacity-50"
//             title="Download as PNG"
//           >
//             <Download size={16} />
//           </button>
//         </div>       
//       </CardHeader>

//       <CardContent className="h-[200] flex flex-col items-center justify-center">
//         <GaugeComponent
//           value={value ?? 0.0}
//           maxValue={year < 2026 ? 2.0: 3.0}
//           type="radial"
//           style={{ 
//               width: "100%", 
//               maxWidth: "260px", // Mencegah gauge terlalu besar di mobile
//               margin: "0 auto",
//             }}
//           labels={{
//             valueLabel: {
//                 formatTextValue: () => value === null ? "-" : value.toFixed(2),
//                 style: {
//                     fill: "#000000",  
//                     textShadow: "none", 
//                     fontWeight: "bold",
//                     fontSize: value === null ? 40: 35,
//               }
//             },
//             tickLabels: {
//               type: "outer",
//               defaultTickValueConfig: {
//                 formatTextValue: (value: number) => `${value.toFixed(2)}`,
//                 style: {
//                     fill: "#000000",
//                     textShadow: "none",
//                     fontSize: 7,
//                 }
//               },
//               ticks: currentTicks
//             }
//           }}
//           arc={{
//             subArcs: getArcConfig(),
//             padding: 0.02,
//             width: 0.3,
//             cornerRadius: 0
//           }}
//           pointer={{
//             elastic: true,
//             animationDelay: 0,
//             type: "needle",
//             color: '#000000',
//             baseColor: '#000000',
//             width: 15,
//             length: 0.75,            
//           }}
//         />
//       </CardContent>
//     </Card>
//   );
// }

"use client"

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toPng } from "html-to-image";

const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false });

interface Props {
  value: number | null;
  title: string;
  type: 'overall' | 'fish' | 'shrimp';
  year: number;
  plants?: string[]; 
}

export default function GaugeChart({ value, title, type, year, plants}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const getTargetInfo = () => {
    let hasTarget = type === 'overall' || type === 'fish' || type === 'shrimp';
    
    // Default target: 1.0 untuk < 2026, dan 2.45 untuk >= 2026
    let target = year < 2026 ? 1.0 : 2.45;

    if (plants && plants.length > 0) {
      // 1. Cek isi seluruh array multiselect untuk mendeteksi kategori plant yang dipilih
      const hasFishInSelection = plants.some(p => p.toUpperCase().includes('FF') || p.toUpperCase().includes('FISH'));
      const hasShrimpInSelection = plants.some(p => p.toUpperCase().includes('SF') || p.toUpperCase().includes('SHRIMP'));

      // 2. Sembunyikan target hanya untuk tipe yang berlawanan (Chart Overall akan selalu aman & tetap tampil)
      if (type !== 'overall') {
        if (hasFishInSelection && !hasShrimpInSelection && type === 'shrimp') hasTarget = false;
        if (hasShrimpInSelection && !hasFishInSelection && type === 'fish') hasTarget = false;
      }

      // 3. Nilai spesifik per-plant hanya diaplikasikan jika hanya memilih TEPAT 1 plant
      if (plants.length === 1) {
        const plant = plants[0].toUpperCase();
        const isFF = plant.includes('FF') || plant.includes('FISH');
        const isSF = plant.includes('SF') || plant.includes('SHRIMP');

        // Logika nilai spesifik per plant hanya berjalan jika tahun >= 2026
        if (year >= 2026) {
          if (plant.includes('MDN') && isFF) target = 3.74;
          else if (plant.includes('MDN') && isSF) target = 1.43;
          else if (plant.includes('LPG') && isFF) target = 0.25;
          else if (plant.includes('LPG') && isSF) target = 2.93;
          else if (plant.includes('CKP') && isFF) target = 0;
          else if (plant.includes('SPJ') && isFF) target = 6.94;
          else if (plant.includes('SBY') && isSF) target = 0;
        }
      }
    }

    return { target, hasTarget };
  };

  const { target, hasTarget } = getTargetInfo();

  const baseMax = year < 2026 ? 2.0 : 3.0;
  const dynamicMaxValue = Math.max(
    baseMax, 
    target > 0 ? Math.ceil(target * 1.5) : baseMax, 
    value !== null ? Math.ceil(value * 1.2) : 0
  );

  const getArcConfig = () => {
    if (!hasTarget) return [];

    if (target === 0) {
      return [
        { limit: dynamicMaxValue, color: '#f04487' }
      ];
    }

    return [
      { limit: target, color: '#02d1a7'}, 
      { limit: dynamicMaxValue, color: '#f04487' },
    ];
  }

  const currentTicks = getArcConfig().map(arc => ({ value: arc.limit }));

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;

    try {
      setIsDownloading(true);
      const downloadBtn = cardRef.current.querySelector('[data-no-print]');
      if (downloadBtn) {
        (downloadBtn as HTMLElement).style.display = 'none';
      }

      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });

      if (downloadBtn) {
        (downloadBtn as HTMLElement).style.display = '';
      }

      const sanitizedTitle = title.toLowerCase().replace(/\s+/g, '-');
      const date = new Date().toISOString().split('T')[0];

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${sanitizedTitle}-${date}.png`;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
      const downloadBtn = cardRef.current?.querySelector('[data-no-print]');
      if (downloadBtn) {
        (downloadBtn as HTMLElement).style.display = '';
      }
    } finally {
      setIsDownloading(false);
    }
  }, [title]);

  // KUNCI PERBAIKAN: Membuat unique key agar komponen ter-remount saat state jarum berubah
  const gaugeKey = `gauge-${title}-${value === null ? 'empty' : 'filled'}-${hasTarget}-${target}`;

  return (
    <Card ref={cardRef} className="bg-white border-none shadow-sm">
        
      <CardHeader className="relative pb-0 pt-4 px-4 flex items-center justify-center">
        <CardTitle className="text-[12px] font-bold text-black tracking-widest text-center">
          {title}
        </CardTitle>

        <div className="absolute right-4 -top-2">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            data-no-print
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all duration-200 disabled:opacity-50"
            title="Download as PNG"
          >
            <Download size={16} />
          </button>
        </div>       
      </CardHeader>

      <CardContent className="h-[200] flex flex-col items-center justify-center">
        <GaugeComponent
          key={gaugeKey} // <-- Prop ini akan memaksa reset dari bug jarum hilang
          value={value ?? 0.0}
          maxValue={dynamicMaxValue}
          type="radial"
          style={{ 
              width: "100%", 
              maxWidth: "260px",
              margin: "0 auto",
            }}
          labels={{
            valueLabel: {
                formatTextValue: () => value === null ? "-" : value.toFixed(2),
                style: {
                    fill: "#000000",  
                    textShadow: "none", 
                    fontWeight: "bold",
                    fontSize: value === null ? 40: 35,
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
              ticks: currentTicks
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
            color: value === null ? 'transparent' : '#000000',
            baseColor: value === null ? 'transparent' : '#000000',
            width: 15,
            length: 0.75,            
          }}
        />
      </CardContent>
    </Card>
  );
}