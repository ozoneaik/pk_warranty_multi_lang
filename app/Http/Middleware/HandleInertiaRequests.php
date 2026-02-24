<?php

namespace App\Http\Middleware;

use App\Models\AdminMenu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'ziggy' => fn() => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'menus' => function () use ($request) {
                if ($request->is('admin*')) {
                    // ตรวจสอบว่ามี Admin ล็อกอินอยู่หรือไม่ (อาจจะต้องเปลี่ยนชื่อ guard เป็น 'admin' ตามที่คุณตั้งไว้)
                    $admin = Auth::guard('admin')->user() ?? $request->user();

                    // ถ้าพบ admin และมีฟังก์ชัน getAllowedMenus ให้เรียกใช้งาน
                    if ($admin && method_exists($admin, 'getAllowedMenus')) {
                        return $admin->getAllowedMenus();
                    }
                }
                return null;
            },
        ];
    }
}
