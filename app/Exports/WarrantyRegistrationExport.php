<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class WarrantyRegistrationExport implements FromCollection, WithHeadings, WithTitle, ShouldAutoSize, WithStyles
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function title(): string
    {
        return 'ทะเบียนรับประกัน CRM';
    }

    public function headings(): array
    {
        return [
            'ลำดับ',
            'รหัสลูกค้า',
            'ชื่อลูกค้า',
            'เบอร์โทร',
            'Line ID',
            'Serial Number',
            'รหัสรุ่น',
            'รุ่นสินค้า',
            'ชื่อสินค้า',
            'ร้านค้า',
            'แหล่งซื้อ',
            'วันที่ซื้อ',
            'วันหมดประกัน',
            'สถานะ',
            'ผู้อนุมัติ',
            'รหัส PC',
            'ลิงก์สลิป',
        ];
    }

    public function collection()
    {
        return $this->data->values()->map(function ($row, $index) {
            $approval = $row->approval ?? '';
            if ($approval === '') {
                $approvalLabel = 'รอดำเนินการ';
            } elseif (strtoupper($approval) === 'Y') {
                $approvalLabel = 'ผ่านการอนุมัติ';
            } elseif (strtoupper($approval) === 'N') {
                $approvalLabel = 'ไม่ผ่านการอนุมัติ';
            } else {
                $approvalLabel = $approval;
            }

            return [
                $index + 1,
                $row->customer_code ?? '',
                $row->customer_name ?? '',
                $row->cust_tel ?? '',
                $row->lineid ?? '',
                $row->serial_number ?? '',
                $row->model_code ?? '',
                $row->model_name ?? '',
                $row->product_name ?? '',
                $row->store_name ?? '',
                $row->buy_from ?? '',
                $row->buy_date ?? '',
                $row->insurance_expire ?? '',
                $approvalLabel,
                $row->approver ?? '',
                $row->pc_code ?? '',
                $row->slip ?? '',
            ];
        });
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '4F46E5']],
            ],
        ];
    }
}
