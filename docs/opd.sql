sql-- คำถาม: จำนวนผู้ป่วยนอก
-- tags: opd, patient, count
-- ตาราง: ovst
SELECT COUNT(distinct(ovst.vn)) from ovst where vstdate between '2024-10-01' and '2025-09-30';