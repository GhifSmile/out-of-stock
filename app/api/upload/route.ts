import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    // Helpers
    const clean = (val: any) => {
      if (val === null || val === undefined) return null;
      if (typeof val === "object") {
        if (val.result !== undefined) return val.result;
        return null;
      }
      return val;
    };

    const parseNum = (val: any) => {
      const n = Number(val);
      return isNaN(n) || !isFinite(n) ? 0 : n;
    };

    const sanitize = (val: any) => String(val || "").trim().replace(/\s+/g, " ");

    const oosData: { values: any[], deletes: any[] } = { values: [], deletes: [] };
    const doBermasalahData: { values: any[], deletes: any[] } = { values: [], deletes: [] };
    const totalDoData: { values: any[], deletes: any[] } = { values: [], deletes: [] };

    // --- 1. PROSES SHEET: OUT OF STOCK ---
    const sheetOOS = workbook.getWorksheet("Out of Stock");
    if (sheetOOS) {
      sheetOOS.eachRow((row, rowNum) => {
        if (rowNum > 1) {
          const year = parseNum(clean(row.getCell(1).value));
          const month = parseNum(clean(row.getCell(2).value));
          const week = parseNum(clean(row.getCell(3).value));
          const plant = sanitize(row.getCell(4).value).toUpperCase();
          const bizUnit = sanitize(row.getCell(5).value).toLowerCase();
          const kodePakan = sanitize(row.getCell(6).value).toUpperCase();
          
          if (!year || !bizUnit || !kodePakan) return;

          // Kolom Numeric (Desimal diperbolehkan)
          const stockPakan = parseNum(clean(row.getCell(7).value));
          const kebutuhanPakan = parseNum(clean(row.getCell(8).value));
          const kirim = parseNum(clean(row.getCell(9).value));
          const totalHariOos = parseNum(clean(row.getCell(10).value)); // Integer
          const hasilProduksi = parseNum(clean(row.getCell(11).value));

          oosData.values.push(sql`(
            ${year}::int, ${month}::int, ${week}::int, 
            ${plant}::varchar, ${bizUnit}::varchar, ${kodePakan}::varchar, 
            ${stockPakan}::numeric, ${kebutuhanPakan}::numeric, ${kirim}::numeric, 
            ${totalHariOos}::int, ${hasilProduksi}::numeric, NOW()
          )`);
          
          oosData.deletes.push(sql`(${year}::int, ${month}::int, ${week}::int, ${plant}::varchar, ${bizUnit}::varchar, ${kodePakan}::varchar)`);
        }
      });
    }

    // --- 2. PROSES SHEET: DO BERMASALAH ---
    const sheetDOB = workbook.getWorksheet("DO Bermasalah");
    if (sheetDOB) {
      sheetDOB.eachRow((row, rowNum) => {
        if (rowNum > 1) {
          const year = parseNum(clean(row.getCell(1).value));
          const month = parseNum(clean(row.getCell(2).value));
          const plant = sanitize(row.getCell(3).value).toUpperCase();
          const bizUnit = sanitize(row.getCell(4).value).toLowerCase();
          const kodePakan = sanitize(row.getCell(5).value).toUpperCase();
          const totalDOB = parseNum(clean(row.getCell(6).value)); // Integer

          if (bizUnit && kodePakan) {
            doBermasalahData.values.push(sql`(${year}::int, ${month}::int, ${plant}::varchar, ${bizUnit}::varchar, ${kodePakan}::varchar, ${totalDOB}::int, NOW())`);
            doBermasalahData.deletes.push(sql`(${year}::int, ${month}::int, ${plant}::varchar, ${bizUnit}::varchar, ${kodePakan}::varchar)`);
          }
        }
      });
    }

    // --- 3. PROSES SHEET: TOTAL DO ---
    const sheetTDO = workbook.getWorksheet("Total DO");
    if (sheetTDO) {
      sheetTDO.eachRow((row, rowNum) => {
        if (rowNum > 1) {
          const year = parseNum(clean(row.getCell(1).value));
          const month = parseNum(clean(row.getCell(2).value));
          const plant = sanitize(row.getCell(3).value).toUpperCase();
          const bizUnit = sanitize(row.getCell(4).value).toLowerCase();
          const totalDO = parseNum(clean(row.getCell(5).value)); // Integer

          if (bizUnit) {
            totalDoData.values.push(sql`(${year}::int, ${month}::int, ${plant}::varchar, ${bizUnit}::varchar, ${totalDO}::int, NOW())`);
            totalDoData.deletes.push(sql`(${year}::int, ${month}::int, ${plant}::varchar, ${bizUnit}::varchar)`);
          }
        }
      });
    }

    // --- TRANSACTION ---
    await db.transaction(async (tx) => {
      if (oosData.values.length > 0) {
        await tx.execute(sql`DELETE FROM out_of_stock WHERE (year, month, week, plant, business_unit, kode_pakan) IN (${sql.join(oosData.deletes, sql`, `)})`);
        await tx.execute(sql`INSERT INTO out_of_stock (year, month, week, plant, business_unit, kode_pakan, stock_pakan, kebutuhan_pakan, kirim, total_hari_oos, hasil_produksi, created_at) VALUES ${sql.join(oosData.values, sql`, `)}`);
      }

      if (doBermasalahData.values.length > 0) {
        await tx.execute(sql`DELETE FROM out_of_stock_do_bermasalah WHERE (year, month, plant, business_unit, kode_pakan) IN (${sql.join(doBermasalahData.deletes, sql`, `)})`);
        await tx.execute(sql`INSERT INTO out_of_stock_do_bermasalah (year, month, plant, business_unit, kode_pakan, total_do_bermasalah, created_at) VALUES ${sql.join(doBermasalahData.values, sql`, `)}`);
      }

      if (totalDoData.values.length > 0) {
        await tx.execute(sql`DELETE FROM out_of_stock_total_do WHERE (year, month, plant, business_unit) IN (${sql.join(totalDoData.deletes, sql`, `)})`);
        await tx.execute(sql`INSERT INTO out_of_stock_total_do (year, month, plant, business_unit, total_do, created_at) VALUES ${sql.join(totalDoData.values, sql`, `)}`);
      }
    });

    return NextResponse.json({ 
      message: `Berhasil! Data telah terupload: 
      - Out of Stock: ${oosData.values.length} baris
      - DO Bermasalah: ${doBermasalahData.values.length} baris
      - Total DO: ${totalDoData.values.length} baris` 
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data ke database." }, { status: 500 });
  }
}