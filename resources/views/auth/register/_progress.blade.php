@php
$steps = [
1 => 'ประเภท',
2 => 'ข้อมูล',
3 => 'ยืนยัน',
];
@endphp

<div class="mb-6">
    <div class="flex items-center justify-between relative">
        {{-- Background connector line --}}
        <div class="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 z-0" style="margin: 0 26px;"></div>

        {{-- Filled connector --}}
        @if($currentStep > 1)
        <div class="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 z-0 transition-all duration-500"
            style="margin-left: 26px; width: calc({{ min(($currentStep - 1), count($steps) - 1) }} / {{ count($steps) - 1 }} * (100% - 52px));"></div>
        @endif

        @foreach($steps as $num => $label)
        <div class="flex flex-col items-center z-10" style="flex: 1;">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-sm
                    {{ $num < $currentStep
                        ? 'bg-orange-500 text-white shadow-orange-200 shadow-md'
                        : ($num === $currentStep
                            ? 'bg-orange-500 text-white ring-4 ring-orange-100 shadow-orange-200 shadow-md'
                            : 'bg-white text-gray-300 border-2 border-gray-100') }}">
                @if($num < $currentStep)
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                    @else
                    {{ $num }}
                    @endif
            </div>
            <span class="mt-1.5 text-center transition-all duration-300
                {{ $num <= $currentStep ? 'text-orange-500 font-semibold' : 'text-gray-300 font-medium' }}"
                style="font-size: 0.6rem; letter-spacing: 0.02em;">
                {{ $label }}
            </span>
        </div>
        @endforeach
    </div>
</div>