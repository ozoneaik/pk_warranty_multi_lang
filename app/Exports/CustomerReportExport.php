<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

class CustomerReportExport implements WithMultipleSheets
{
    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function sheets(): array
    {
        return [
            new SummarySheet($this->data['stats']),
            new CustomersSheet($this->data['customers']),
            new HistorySheet($this->data['history']),
        ];
    }
}

// --- Sheet 1: ข้อมูลสรุป (Statistics) ---
class SummarySheet implements FromCollection, WithHeadings, WithTitle
{
    protected $stats;
    public function __construct($stats)
    {
        $this->stats = $stats;
    }
    public function title(): string
    {
        return 'สรุปภาพรวม (Summary)';
    }
    public function collection()
    {
        return collect([
            ['หัวข้อ', 'จำนวน'],
            ['ลูกค้าทั้งหมดในระบบ', $this->stats['total_customers']],
            ['ลูกค้าใหม่ (ตามช่วงเวลา)', $this->stats['new_customers']],
            ['ยอดการลงทะเบียนสินค้า', $this->stats['total_registrations']],
            ['คะแนนที่แจกทั้งหมด', $this->stats['total_points_given']],
            ['คะแนนที่ถูกใช้ไป', $this->stats['total_points_redeemed']],
            ['จำนวนการแลกของรางวัล', $this->stats['count_rewards']],
            ['จำนวนการแลกสิทธิพิเศษ', $this->stats['count_privileges']],
            ['จำนวนการแลกคูปอง', $this->stats['count_coupons']],
        ]);
    }
    public function headings(): array
    {
        return ['รายงานสรุปข้อมูลลูกค้า'];
    }
}

// --- Sheet 2: รายชื่อลูกค้า (Customers) ---
class CustomersSheet implements FromCollection, WithHeadings, WithTitle
{
    protected $customers;
    public function __construct($customers)
    {
        $this->customers = $customers;
    }
    public function title(): string
    {
        return 'รายชื่อลูกค้าใหม่';
    }
    public function collection()
    {
        return $this->customers;
    }
    public function headings(): array
    {
        return ['ชื่อ', 'นามสกุล', 'เบอร์โทรศัพท์', 'อีเมล', 'วันที่สมัคร', 'ระดับ (Tier)', 'สถานะ'];
    }
}

// --- Sheet 3: ประวัติการลงทะเบียน (Product History) ---
class HistorySheet implements FromCollection, WithHeadings, WithTitle
{
    protected $history;
    public function __construct($history)
    {
        $this->history = $history;
    }
    public function title(): string
    {
        return 'ประวัติการลงทะเบียนสินค้า';
    }
    public function collection()
    {
        return $this->history;
    }
    public function headings(): array
    {
        return ['ID', 'รุ่นสินค้า (Model Code)', 'Serial Number', 'วันที่ซื้อ'];
    }
}
