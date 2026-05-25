<?php

namespace App\Http\Requests\Warranty;

use Illuminate\Foundation\Http\FormRequest;

class WrFormRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isUpdate = filter_var($this->input('is_service_center_update', false), FILTER_VALIDATE_BOOLEAN);
        $isBypass  = filter_var($this->input('is_status_approval_bypass', false), FILTER_VALIDATE_BOOLEAN);
        $skipFile  = $isUpdate || $isBypass;

        return [
            'is_service_center_update'  => 'nullable|boolean',
            'is_status_approval_bypass' => 'nullable|boolean',
            // 'warranty_file' => $skipFile ? 'nullable' : 'required',
            'warranty_file' => $skipFile ? 'nullable' : 'required|file|mimes:jpeg,jpg,png,pdf|max:10240',
            'serial_number' => 'required',
            'phone' => 'nullable|digits:10',
            'model_code' => $skipFile ? 'nullable' : 'required',
            'model_name' => 'nullable',
            'product_name' => $skipFile ? 'nullable' : 'required',
            'buy_from' => 'required',
            'buy_date' => 'required',
            'store_name' => 'required',
            'customer_code' => 'nullable',
            'pc_code' => 'nullable|string|max:50',

            'power_accessories' => 'nullable|array',
            'power_accessories.*.serial_number' => 'required|string',
            'power_accessories.*.model_code'    => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'warranty_file.mimes' => 'ระบบไม่รองรับไฟล์รูปภาพจาก iPhone (.heic) กรุณาแปลงเป็น .jpg หรือแคปหน้าจอมาอัปโหลดใหม่',
            'warranty_file.max' => 'ขนาดไฟล์ใบเสร็จต้องไม่เกิน 10MB',
        ];
    }
}
