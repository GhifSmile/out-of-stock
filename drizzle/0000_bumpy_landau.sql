CREATE TABLE "out_of_stock" (
	"year" integer,
	"month" integer,
	"week" integer,
	"plant" varchar(50),
	"business_unit" varchar(50),
	"kode_pakan" varchar(50),
	"stock_pakan" numeric,
	"kebutuhan_pakan" numeric,
	"kirim" numeric,
	"hasil_produksi" numeric,
	"total_hari_oos" numeric,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "out_of_stock_do_bermasalah" (
	"year" integer,
	"month" integer,
	"plant" varchar(50),
	"business_unit" varchar(50),
	"kode_pakan" varchar(50),
	"total_do_bermasalah" integer
);
--> statement-breakpoint
CREATE TABLE "out_of_stock_total_do" (
	"year" integer,
	"month" integer,
	"plant" varchar(50),
	"business_unit" varchar(50),
	"total_do" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'officer',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE VIEW "public"."oos_trend_analysis_monthly" AS (
with Monthly_Data as (
	 select
        t1.year,
        t1.month,
        t1.plant,
        t1.business_unit,
        t1.kode_pakan,
        sum(t1.ach_over_120) as total_ach_over_120
    from out_of_stock t1
    group by
        t1.year,
        t1.month,
        t1.plant,
        t1.business_unit,
        t1.kode_pakan	
),
Monthly_Data_2 as (
	select 
		t1.*,
		t2.total_do_bermasalah,
		t3.total_do,
        (
            case 
                when t1.total_ach_over_120 = 0
                then (t2.total_do_bermasalah / EXTRACT(DAY FROM (DATE_TRUNC('month', MAKE_DATE(t1.year, t1.month, 1)) + INTERVAL '1 month - 1 day'))) / nullif(t3.total_do, 0)
                else (t2.total_do_bermasalah / EXTRACT(DAY FROM (DATE_TRUNC('month', MAKE_DATE(t1.year, t1.month, 1)) + INTERVAL '1 month - 1 day')) * (t1.total_ach_over_120)) / nullif(t3.total_do, 0)
            end
        ) as oos_percentage        
	from Monthly_Data t1
	left join out_of_stock_do_bermasalah t2
		on t1.year = t2.year
		and t1.month = t2.month
		and t1.plant = t2.plant
		and t1.business_unit = t2.business_unit
		and t1.kode_pakan = t2.kode_pakan
	left join out_of_stock_total_do t3
		on t1.year = t3.year
		and t1.month = t3.month
		and t1.plant = t3.plant
		and t1.business_unit = t3.business_unit
	order by t1.year, t1.month, t1.plant, t1.business_unit, t1.kode_pakan	
),
Monthly_OOS as (
	select
		t1.year,
		t1.month,
		round(sum(t1.oos_percentage) * 100, 2) as overall_oos_percentage,		
		round((sum(t1.oos_percentage) filter (where t1.business_unit = 'fish')) * 100, 2) as fish_oos_percentage,
		round((sum(t1.oos_percentage) filter (where t1.business_unit = 'shrimp')) * 100, 2) as shrimp_oos_percentage		
	from Monthly_Data_2 t1
	group by 
		t1.year, 
		t1.month
),
Plant_BU_OOS as (
	select
		t1.year,
		t1.month,
		concat(t1.plant, ' - ', initcap(t1.business_unit)) as plant_bu_combined,
		sum(t1.oos_percentage) as oos_value
	from Monthly_Data_2 t1
	group by t1.year, t1.month, t1.plant, t1.business_unit
),
Ranked_Performance as (
	select
		t1.*,
		rank() over (partition by t1.year, t1.month order by t1.oos_value asc) as rank_best,
		rank() over (partition by t1.year, t1.month order by t1.oos_value desc) as rank_worst
	from Plant_BU_OOS t1
),
Aggregated_Best_Worst as (
	select
		t1.year,
		t1.month,
		string_agg(plant_bu_combined, ', ' order by plant_bu_combined asc) filter (where rank_best = 1) as best_performing,
		string_agg(plant_bu_combined, ', ' order by plant_bu_combined asc) filter (where rank_worst = 1) as worst_performing
	from Ranked_Performance t1
	group by t1.year, t1.month
)

select
	t1.year,
	t1.month,
	t1.overall_oos_percentage,
	t1.fish_oos_percentage,
	t1.shrimp_oos_percentage,
	t2.best_performing,
	t2.worst_performing
from Monthly_OOS t1
inner join Aggregated_Best_Worst t2
	on t1.year = t2.year
	and t1.month = t2.month
order by
	t1.year,
	t1.month
);--> statement-breakpoint
CREATE VIEW "public"."oos_plant_performance_detail_monthly" AS (
with Code_Summary as (
    select
        t1.year,
        t1.month,
        t1.plant,
        t1.business_unit,
        t1.kode_pakan,
        sum(t1.kebutuhan_pakan) as kebutuhan_pakan_monthly,
        sum(t1.kirim) as sales_monthly,
        sum(t1.hasil_produksi) as hasil_produksi_monthly,
        avg(t1.kirim) as rata_rata_kirim,
        sum(t1.ach_over_120) as total_ach_over_120
    from out_of_stock t1
    group by
        t1.year,
        t1.month,
        t1.plant,
        t1.business_unit,
        t1.kode_pakan
),
Code_Summary_2 as (
	select 
		t1.*,
		t2.total_do_bermasalah,
		t3.total_do,
		(t1.sales_monthly / nullif(t2.total_do_bermasalah, 0)) as tiap_do,
        (
            case 
                when t1.total_ach_over_120 = 0
                then (t2.total_do_bermasalah / EXTRACT(DAY FROM (DATE_TRUNC('month', MAKE_DATE(t1.year, t1.month, 1)) + INTERVAL '1 month - 1 day')))
                else (t2.total_do_bermasalah / EXTRACT(DAY FROM (DATE_TRUNC('month', MAKE_DATE(t1.year, t1.month, 1)) + INTERVAL '1 month - 1 day')) * (t1.total_ach_over_120))
            end
        ) as jumlah_do_ach_over_120,
        (
            case 
                when t1.total_ach_over_120 = 0
                then (t2.total_do_bermasalah / EXTRACT(DAY FROM (DATE_TRUNC('month', MAKE_DATE(t1.year, t1.month, 1)) + INTERVAL '1 month - 1 day'))) * (t1.sales_monthly / nullif(t2.total_do_bermasalah, 0))
                else (t2.total_do_bermasalah / EXTRACT(DAY FROM (DATE_TRUNC('month', MAKE_DATE(t1.year, t1.month, 1)) + INTERVAL '1 month - 1 day')) * (t1.total_ach_over_120)) * (t1.sales_monthly / nullif(t2.total_do_bermasalah, 0))
            end
        ) as total_do_ton,
        (
            case 
                when t1.total_ach_over_120 = 0
                then (t2.total_do_bermasalah / EXTRACT(DAY FROM (DATE_TRUNC('month', MAKE_DATE(t1.year, t1.month, 1)) + INTERVAL '1 month - 1 day'))) / nullif(t3.total_do, 0)
                else (t2.total_do_bermasalah / EXTRACT(DAY FROM (DATE_TRUNC('month', MAKE_DATE(t1.year, t1.month, 1)) + INTERVAL '1 month - 1 day')) * (t1.total_ach_over_120)) / nullif(t3.total_do, 0)
            end
        ) as oos_percentage        
	from Code_Summary t1
	left join out_of_stock_do_bermasalah t2
		on t1.year = t2.year
		and t1.month = t2.month
		and t1.plant = t2.plant
		and t1.business_unit = t2.business_unit
		and t1.kode_pakan = t2.kode_pakan
	left join out_of_stock_total_do t3
		on t1.year = t3.year
		and t1.month = t3.month
		and t1.plant = t3.plant
		and t1.business_unit = t3.business_unit
	order by t1.year, t1.month, t1.plant, t1.business_unit, t1.kode_pakan
),
BU_Monthly_OOS as (
	select
		t1.year,
		t1.month,
		t1.plant,
		t1.business_unit,
		sum(t1.kebutuhan_pakan_monthly) as total_kebutuhan_pakan,
		sum(t1.sales_monthly) as total_sales,
		sum(t1.hasil_produksi_monthly) as total_produksi,
		avg(t1.rata_rata_kirim) as avg_rata_rata_kirim,
		max(t1.total_do) as total_do,
		sum(t1.tiap_do) as total_tiap_do,
		sum(t1.jumlah_do_ach_over_120) as total_do_ach_over_120,
		sum(t1.total_do_ton) as total_do_ton,
		round(sum(t1.oos_percentage) * 100, 2) as total_oos_percentage
	from Code_Summary_2 t1
	group by 
		t1.year, 
		t1.month, 
		t1.plant, 
		t1.business_unit

),
Max_Month as (
	select
		t1.year,
		t1.plant,
		t1.business_unit,
		min(month) as bulan_awal,
		max(month) as bulan_akhir
	from Code_Summary t1
	group by
		t1.year,
		t1.plant,
		t1.business_unit
),
oos_do_bermasalah as (
	select
		t1.year,
		t1.plant,
		t1.business_unit,
		t1.kode_pakan,
		sum(t1.total_do_bermasalah) as total_do_bermasalah
	from out_of_stock_do_bermasalah t1
	group by
		t1.year,
		t1.plant,
		t1.business_unit,
		t1.kode_pakan
),
oos_total_do as (
	select
		t1.year,
		t1.plant,
		t1.business_unit,
		sum(t1.total_do) as total_do
	from out_of_stock_total_do t1
	group by
		t1.year,
		t1.plant,
		t1.business_unit
),
Code_Summary_YTD as (
	select 
		t1.year,
		t1.plant,
		t1.business_unit,
		t1.kode_pakan,
        sum(t1.kebutuhan_pakan) as kebutuhan_pakan_yearly,
        sum(t1.kirim) as sales_yearly,
        sum(t1.hasil_produksi) as hasil_produksi_yearly,
        avg(t1.kirim) as rata_rata_kirim,
        sum(t1.ach_over_120) as total_ach_over_120
    from out_of_stock t1
    inner join Max_Month mm
    	on t1.year = mm.year
    	and t1.plant = mm.plant
    	and t1.business_unit = mm.business_unit
    where t1.month <= mm.bulan_akhir
    group by
        t1.year,
        t1.plant,
        t1.business_unit,
        t1.kode_pakan		
),
Code_Summary_YTD_2 as (
	select 
		t1.*,
		t2.total_do_bermasalah,
		t3.total_do,
		(t1.sales_yearly / nullif(t2.total_do_bermasalah, 0)) as tiap_do,
        (
            case 
                when t1.total_ach_over_120 = 0
                then (t2.total_do_bermasalah::numeric / ((DATE_TRUNC('month', MAKE_DATE(t1.year, mm.bulan_akhir, 1)) + INTERVAL '1 month - 1 day')::date - MAKE_DATE(t1.year, mm.bulan_awal, 1) + 1))
                else (t2.total_do_bermasalah::numeric / ((DATE_TRUNC('month', MAKE_DATE(t1.year, mm.bulan_akhir, 1)) + INTERVAL '1 month - 1 day')::date - MAKE_DATE(t1.year, mm.bulan_awal, 1) + 1) * (t1.total_ach_over_120))
            end
        ) as jumlah_do_ach_over_120,
        (
            case 
                when t1.total_ach_over_120 = 0
                then (t2.total_do_bermasalah::numeric / ((DATE_TRUNC('month', MAKE_DATE(t1.year, mm.bulan_akhir, 1)) + INTERVAL '1 month - 1 day')::date - MAKE_DATE(t1.year, mm.bulan_awal, 1) + 1)) * (t1.sales_yearly / nullif(t2.total_do_bermasalah, 0))
                else (t2.total_do_bermasalah::numeric / ((DATE_TRUNC('month', MAKE_DATE(t1.year, mm.bulan_akhir, 1)) + INTERVAL '1 month - 1 day')::date - MAKE_DATE(t1.year, mm.bulan_awal, 1) + 1) * (t1.total_ach_over_120)) * (t1.sales_yearly / nullif(t2.total_do_bermasalah, 0))
            end
        ) as total_do_ton,
        (
            case 
                when t1.total_ach_over_120 = 0
                then (t2.total_do_bermasalah::numeric / ((DATE_TRUNC('month', MAKE_DATE(t1.year, mm.bulan_akhir, 1)) + INTERVAL '1 month - 1 day')::date - MAKE_DATE(t1.year, mm.bulan_awal, 1) + 1)) / nullif(t3.total_do, 0)
                else (t2.total_do_bermasalah::numeric / ((DATE_TRUNC('month', MAKE_DATE(t1.year, mm.bulan_akhir, 1)) + INTERVAL '1 month - 1 day')::date - MAKE_DATE(t1.year, mm.bulan_awal, 1) + 1) * (t1.total_ach_over_120)) / nullif(t3.total_do, 0)
            end
        ) as oos_percentage        
	from Code_Summary_YTD t1
    inner join Max_Month mm
    	on t1.year = mm.year
    	and t1.plant = mm.plant
    	and t1.business_unit = mm.business_unit
	left join oos_do_bermasalah t2
		on t1.year = t2.year
		and t1.plant = t2.plant
		and t1.business_unit = t2.business_unit
		and t1.kode_pakan = t2.kode_pakan
	left join oos_total_do t3
		on t1.year = t3.year
		and t1.plant = t3.plant
		and t1.business_unit = t3.business_unit
	order by t1.year, t1.plant, t1.business_unit, t1.kode_pakan
),
BU_Yearly_OOS as (
	select
		t1.year,
		t1.plant,
		t1.business_unit,
		sum(t1.kebutuhan_pakan_yearly) as total_kebutuhan_pakan,
		sum(t1.sales_yearly) as total_sales,
		sum(t1.hasil_produksi_yearly) as total_produksi,
		avg(t1.rata_rata_kirim) as avg_rata_rata_kirim,
		max(t1.total_do) as total_do,
		sum(t1.tiap_do) as total_tiap_do,
		sum(t1.jumlah_do_ach_over_120) as total_do_ach_over_120,
		sum(t1.total_do_ton) as total_do_ton,
		round(sum(t1.oos_percentage) * 100, 2) as total_oos_percentage
	from Code_Summary_YTD_2 t1
	group by 
		t1.year, 
		t1.plant, 
		t1.business_unit
),

Final_Report as (
	select
		t1.plant,
		t1.business_unit,
		t1.year,
		
        SUM(CASE WHEN t1.month = 1 THEN t1.total_oos_percentage ELSE NULL END) AS Jan,
        SUM(CASE WHEN t1.month = 2 THEN t1.total_oos_percentage ELSE NULL END) AS Feb,
        SUM(CASE WHEN t1.month = 3 THEN t1.total_oos_percentage ELSE NULL END) AS Mar,
        SUM(CASE WHEN t1.month = 4 THEN t1.total_oos_percentage ELSE NULL END) AS Apr,
        SUM(CASE WHEN t1.month = 5 THEN t1.total_oos_percentage ELSE NULL END) AS May,
        SUM(CASE WHEN t1.month = 6 THEN t1.total_oos_percentage ELSE NULL END) AS Jun,
        SUM(CASE WHEN t1.month = 7 THEN t1.total_oos_percentage ELSE NULL END) AS Jul,
        SUM(CASE WHEN t1.month = 8 THEN t1.total_oos_percentage ELSE NULL END) AS Aug,
        SUM(CASE WHEN t1.month = 9 THEN t1.total_oos_percentage ELSE NULL END) AS Sep,
        SUM(CASE WHEN t1.month = 10 THEN t1.total_oos_percentage ELSE NULL END) AS Oct,
        SUM(CASE WHEN t1.month = 11 THEN t1.total_oos_percentage ELSE NULL END) AS Nov,
        SUM(CASE WHEN t1.month = 12 THEN t1.total_oos_percentage ELSE NULL END) AS Dec
        
    FROM
        BU_Monthly_OOS t1
    GROUP BY
        t1.plant, t1.business_unit, t1.year		
)

select
	t1.*,
	t2.total_oos_percentage as total_oos_percentage_ytd
from Final_Report t1
inner join BU_Yearly_OOS t2 
	on t1.year = t2.year
	and t1.plant = t2.plant
	and t1.business_unit = t2.business_unit
order by
	t1.year,
	t1.plant,
	t1.business_unit
);