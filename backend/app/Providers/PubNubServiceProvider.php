<?php

namespace App\Providers;

use App\Services\PubNubService;
use Illuminate\Support\ServiceProvider;

class PubNubServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(PubNubService::class, function ($app) {
            return new PubNubService();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
