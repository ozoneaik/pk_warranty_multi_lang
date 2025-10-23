<?php

namespace App\Providers;

use App\Models\MasterWaaranty\TblHistoryProd;
use App\Observers\HistoryProdObserver;
use App\Observers\TblHistoryProdObserver;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Event::listen(function (\SocialiteProviders\Manager\SocialiteWasCalled $event) {
            $event->extendSocialite('line', \SocialiteProviders\Line\Provider::class);
            $event->extendSocialite('google', \SocialiteProviders\Google\Provider::class);
            $event->extendSocialite('facebook', \SocialiteProviders\Facebook\Provider::class);
        });

        Inertia::share([
            'line_avatar' => fn() => session('line_avatar'),
            'line_email' => fn() => session('line_email'),

            'app_env' => config('app.env'),
            'app_debug' => config('app.debug'),
            // 'is_dev_mode' => app()->environment('local') || config('app.debug') === true,
            'is_dev_mode' => config('app.debug') === true,
        ]);
    }
}
