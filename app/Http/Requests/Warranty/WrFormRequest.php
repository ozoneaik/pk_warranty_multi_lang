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
        return [
            'warranty_file' => 'required',
            'serial_number' => 'required',
            'phone' => 'required',
            'model_code' => 'required',
            'model_name' => 'required',
            'product_name' => 'required',
            'buy_from' => 'required',
            'buy_date' => 'required',
            'store_name' => 'required',
            'customer_code' => 'required',
        ];
    }
}
