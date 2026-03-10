import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function GET() {
  const workbook = new ExcelJS.Workbook();
  const sheet_names = ["Out of Stock", "DO Bermasalah", "Total DO"];

  sheet_names.forEach((sheetName) => {
    const worksheet = workbook.addWorksheet(sheetName);

    if (sheetName === "Out of Stock") {
      worksheet.columns = [
        { header: "year", key: "year", width: 10, style: { numFmt: '0' } },
        { header: "month", key: "month", width: 10, style: { numFmt: '0' } },
        { header: "week", key: "week", width: 10, style: { numFmt: '0' } },
        { header: "plant", key: "plant", width: 15 },
        { header: "business_unit", key: "business_unit", width: 20 },
        { header: "kode_pakan", key: "kode_pakan", width: 25 },
        { header: "stock_pakan", key: "stock_pakan", width: 20, style: { numFmt: '#,##0' } },
        { header: "kebutuhan_pakan", key: "kebutuhan_pakan", width: 20, style: { numFmt: '#,##0' } },
        { header: "kirim", key: "kirim", width: 20, style: { numFmt: '#,##0' } },
        { header: "total_hari_oos", key: "total_hari_oos", width: 20, style: { numFmt: '0' } }, 
        { header: "hasil_produksi", key: "hasil_produksi", width: 20, style: { numFmt: '#,##0' } },
      ];
    } else if (sheetName === "DO Bermasalah") {
      worksheet.columns = [
        { header: "year", key: "year", width: 10, style: { numFmt: '0' } },
        { header: "month", key: "month", width: 10, style: { numFmt: '0' } },
        { header: "plant", key: "plant", width: 15 },
        { header: "business_unit", key: "business_unit", width: 20 },
        { header: "kode_pakan", key: "kode_pakan", width: 25 },
        { header: "total_do_bermasalah", key: "total_do_bermasalah", width: 20, style: { numFmt: '0' } },  
      ];
    } else {
      worksheet.columns = [
        { header: "year", key: "year", width: 10, style: { numFmt: '0' } },
        { header: "month", key: "month", width: 10, style: { numFmt: '0' } },
        { header: "plant", key: "plant", width: 15 },
        { header: "business_unit", key: "business_unit", width: 20 },
        { header: "total_do", key: "total_do", width: 10, style: { numFmt: '0' } },  
      ];
    }

    const headerRow = worksheet.getRow(1);

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFB755A2' }, 
      };

      cell.font = {
        bold: true,
        color: { argb: 'FF000000' },
        size: 11
      };

      const borderColor = { argb: 'FFE1EBFC' }; 

      cell.border = {
        top: { style: 'thin', color: borderColor },
        left: { style: 'thin', color: borderColor },
        bottom: { style: 'thin', color: borderColor },
        right: { style: 'thin', color: borderColor }
      };

      cell.alignment = { 
        vertical: 'middle', 
        horizontal: 'left', 
      };
    });

    headerRow.height = 20;
  });

  try {
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=Out_of_Stock-[Plant]_[Year][Month].xlsx",
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return new NextResponse("Error generating excel", { status: 500 });
  }
}