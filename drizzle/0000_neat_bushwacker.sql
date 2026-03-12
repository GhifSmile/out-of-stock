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
		t1.business_unit,
		t1.kode_pakan,
		sum(t1.kirim) as sales_monthly,
		sum(t1.total_hari_oos) as total_hari_oos
	from out_of_stock t1
	group by
		t1.year,
		t1.month,
		t1.business_unit,
		t1.kode_pakan
),
Total_DO_Bermasalah as (
	select
		t1.year,
		t1.month,
		t1.business_unit,
		t1.kode_pakan,
		sum(t1.total_do_bermasalah) as total_do_bermasalah_kode_pakan
	from out_of_stock_do_bermasalah t1
	group by
		t1.year,
		t1.month,
		t1.business_unit,
		t1.kode_pakan
),
Total_DO_Aggregated as (
    select
        t1.year,
        t1.month,
        t1.business_unit,
        sum(t1.total_do) as total_do_bu
    from out_of_stock_total_do t1
    group by
        t1.year,
        t1.month,
        t1.business_unit
),
Total_DO_Final as (
    select
        t1.*,
        sum(total_do_bu) over (partition by t1.year, t1.month) as total_do_nasional
    from Total_DO_Aggregated t1
),
Monthly_Data_2 as (
	select
		t1.*,
		t2.total_do_bermasalah_kode_pakan,
		t3.total_do_bu,
		t3.total_do_nasional,
		EXTRACT(DAY FROM (DATE_TRUNC('month', MAKE_DATE(t1.year, t1.month, 1)) + INTERVAL '1 month - 1 day')) as days_in_month
	from Monthly_Data t1
	left join Total_DO_Bermasalah t2
		on t1.year = t2.year
		and t1.month = t2.month
		and t1.business_unit = t2.business_unit
		and t1.kode_pakan = t2.kode_pakan
	left join Total_DO_Final t3
		on t1.year = t3.year
		and t1.month = t3.month
		and t1.business_unit = t3.business_unit
),
Calculated_OOS as (
    select
        t1.*,
        case 
            when t1.year = 2025 
            then (t1.total_do_bermasalah_kode_pakan / t1.days_in_month) / nullif(t1.total_do_bu, 0)
            else ((t1.total_do_bermasalah_kode_pakan / t1.days_in_month) * t1.total_hari_oos) / nullif(t1.total_do_bu, 0)
        end as oos_weighted_bu,
        case 
            when t1.year = 2025 
            then (t1.total_do_bermasalah_kode_pakan / t1.days_in_month) / nullif(t1.total_do_nasional, 0)
            else ((t1.total_do_bermasalah_kode_pakan / t1.days_in_month) * t1.total_hari_oos) / nullif(t1.total_do_nasional, 0)
        end as oos_weighted_national
    from Monthly_Data_2 t1
),
Monthly_OOS as (
    select
        t1.year, 
        t1.month,
        round(sum(t1.oos_weighted_national) * 100, 2) as overall_oos_percentage,		
        round(sum(t1.oos_weighted_bu) filter (where t1.business_unit = 'fish') * 100, 2) as fish_oos_percentage,
        round(sum(t1.oos_weighted_bu) filter (where t1.business_unit = 'shrimp') * 100, 2) as shrimp_oos_percentage		
    from Calculated_OOS t1
    group by 
    	t1.year, 
    	t1.month
),
Plant_Monthly_Data as (
	select
		t1.year,
		t1.month,
		t1.business_unit,
		t1.plant,
		t1.kode_pakan,
		sum(t1.kirim) as sales_monthly,
		sum(t1.total_hari_oos) as total_hari_oos
	from out_of_stock t1
	group by
		t1.year,
		t1.month,
		t1.business_unit,
		t1.plant,
		t1.kode_pakan	
),
Plant_Monthly_Data_2 as (
	select
		t1.*,
		t2.total_do_bermasalah,
		t3.total_do,
		EXTRACT(DAY FROM (DATE_TRUNC('month', MAKE_DATE(t1.year, t1.month, 1)) + INTERVAL '1 month - 1 day')) as days_in_month
	from Plant_Monthly_Data t1
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
),
Code_Summary as (
    select
        t1.*, 
		(
			case
				when t1.year = 2025
				then (t1.total_do_bermasalah / t1.days_in_month) / t1.total_do
				else ((t1.total_do_bermasalah / t1.days_in_month) * t1.total_hari_oos) / t1.total_do
			end
			
		) as oos_percentage
    from Plant_Monthly_Data_2 t1
),
Plant_BU_OOS as (
    select
        t1.year, 
        t1.month,
        concat(t1.plant, ' - ', initcap(t1.business_unit)) as plant_bu_combined,
        sum(t1.oos_percentage) as oos_value
    from Code_Summary t1
    group by 
    	t1.year, 
    	t1.month, 
    	t1.plant, 
    	t1.business_unit
),
Ranked_Performance as (
    select
        *,
        rank() over (partition by t1.year, t1.month order by t1.oos_value asc) as rank_best,
        rank() over (partition by t1.year, t1.month order by t1.oos_value desc) as rank_worst
    from Plant_BU_OOS t1
    where t1.oos_value is not null
),
Aggregated_Best_Worst as (
    select
        t1.year, 
        t1.month,
        string_agg(t1.plant_bu_combined, ', ' order by t1.plant_bu_combined asc) filter (where t1.rank_best = 1) as best_performing,
        string_agg(t1.plant_bu_combined, ', ' order by t1.plant_bu_combined asc) filter (where t1.rank_worst = 1) as worst_performing
    from Ranked_Performance t1
    group by 
    	t1.year, 
    	t1.month
)
select
    t1.*, 
    t2.best_performing, 
    t2.worst_performing
from Monthly_OOS t1
left join Aggregated_Best_Worst t2 
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
        sum(t1.total_hari_oos) as total_hari_oos
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
		coalesce(t1.sales_monthly / nullif(t2.total_do_bermasalah, 0), 0) as tiap_do_kg,
		EXTRACT(DAY FROM (DATE_TRUNC('month', MAKE_DATE(t1.year, t1.month, 1)) + INTERVAL '1 month - 1 day')) as days_in_month
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
	order by 
		t1.year, 
		t1.month, 
		t1.plant, 
		t1.business_unit, 
		t1.kode_pakan
),
Code_Summary_3 as (
	select
		t1.*,
		(t1.tiap_do_kg / 1000) as tiap_do_ton,
		(
			case
				when t1.year = 2025
				then (t1.total_do_bermasalah / t1.days_in_month)
				else (t1.total_do_bermasalah / t1.days_in_month) * t1.total_hari_oos
			end
			
		) as jumlah_do_problem,
		(
			case
				when t1.year = 2025
				then (t1.total_do_bermasalah / t1.days_in_month) * t1.tiap_do_kg
				else ((t1.total_do_bermasalah / t1.days_in_month) * t1.total_hari_oos) * t1.tiap_do_kg
			end
			
		) as total_do_kg,
		(
			case
				when t1.year = 2025
				then ((t1.total_do_bermasalah / t1.days_in_month) * t1.tiap_do_kg) / 1000
				else (((t1.total_do_bermasalah / t1.days_in_month) * t1.total_hari_oos) * t1.tiap_do_kg) / 1000
			end
			
		) as total_do_ton,		
		(
			case
				when t1.year = 2025
				then (t1.total_do_bermasalah / t1.days_in_month) / t1.total_do
				else ((t1.total_do_bermasalah / t1.days_in_month) * t1.total_hari_oos) / t1.total_do
			end
			
		) as oos_percentage
	from Code_Summary_2 t1
),	
BU_Monthly_OOS as (
	select
		t1.year,
		t1.month,
		t1.plant,
		t1.business_unit,
		round(sum(t1.oos_percentage) * 100, 2) as total_oos_percentage
	from Code_Summary_3 t1
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
        sum(t1.total_hari_oos) as total_hari_oos
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
		coalesce(t1.sales_yearly / nullif(t2.total_do_bermasalah, 0), 0) as tiap_do_kg,
		((DATE_TRUNC('month', MAKE_DATE(t1.year, mm.bulan_akhir, 1)) + INTERVAL '1 month - 1 day')::date - MAKE_DATE(t1.year, mm.bulan_awal, 1) + 1) as days_in_year
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
	order by 
		t1.year, 
		t1.plant, 
		t1.business_unit, 
		t1.kode_pakan
),
Code_Summary_YTD_3 as (
	select
		t1.*,
		(t1.tiap_do_kg / 1000) as tiap_do_ton,
		(
			case
				when t1.year = 2025
				then (t1.total_do_bermasalah::numeric / t1.days_in_year)
				else (t1.total_do_bermasalah::numeric / t1.days_in_year) * t1.total_hari_oos
			end
			
		) as jumlah_do_problem,
		(
			case
				when t1.year = 2025
				then (t1.total_do_bermasalah::numeric / t1.days_in_year) * t1.tiap_do_kg
				else ((t1.total_do_bermasalah::numeric / t1.days_in_year) * t1.total_hari_oos) * t1.tiap_do_kg
			end
			
		) as total_do_kg,
		(
			case
				when t1.year = 2025
				then ((t1.total_do_bermasalah::numeric / t1.days_in_year) * t1.tiap_do_kg) / 1000
				else (((t1.total_do_bermasalah::numeric / t1.days_in_year) * t1.total_hari_oos) * t1.tiap_do_kg) / 1000
			end
			
		) as total_do_ton,		
		(
			case
				when t1.year = 2025
				then ((t1.total_do_bermasalah::numeric / t1.days_in_year)) / t1.total_do
				else ((t1.total_do_bermasalah::numeric / t1.days_in_year) * t1.total_hari_oos) / t1.total_do
			end
			
		) as oos_percentage
	from Code_Summary_YTD_2 t1
),
BU_Yearly_OOS as (
	select
		t1.year,
		t1.plant,
		t1.business_unit,
		round(sum(t1.oos_percentage) * 100, 2) as total_oos_percentage
	from Code_Summary_YTD_3 t1
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
        t1.plant, 
        t1.business_unit, 
        t1.year		
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