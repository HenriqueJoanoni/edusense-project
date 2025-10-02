<?php

namespace App\Providers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

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
     * @throws \Exception
     */
    public function boot(): void
    {
        $this->setSchemaDefaultLength();
    }

    /**
     * @return void
     */
    private function setSchemaDefaultLength(): void
    {
        try {
            Schema::defaultStringLength(125);
        } catch (\Exception $e) {
            throw new $e;
        }
    }
}
