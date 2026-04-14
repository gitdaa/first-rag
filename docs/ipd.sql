sql-- คำถาม: จำนวนผู้ป่วยใน
-- tags: ipd, patient, count, admit
-- ตาราง: ovst
SELECT COUNT(distinct(ipt.an)) from ipt where ipt.dchdate between '2024-10-01' and '2025-09-30';