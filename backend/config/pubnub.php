<?php

return [
    /*
    |--------------------------------------------------------------------------
    | PubNub Configuration
    |--------------------------------------------------------------------------
    |
    | Configure your PubNub credentials and settings here.
    |
    */

    'publish_key' => env('PUBNUB_PUBLISH_KEY'),
    'subscribe_key' => env('PUBNUB_SUBSCRIBE_KEY'),
    'secret_key' => env('PUBNUB_SECRET_KEY'),
    'uuid' => env('PUBNUB_UUID', function() {
        if (auth()->check()) {
            return 'user-' . auth()->id();
        }
        return config('app.name') . '-' . gethostname();
    }),

    // Optional configurations
    'ssl' => env('PUBNUB_SSL', true),
    'auth_key' => env('PUBNUB_AUTH_KEY'),

    // Channels configuration
    'channels' => [
        'attendance' => env('PUBNUB_ATTENDANCE_CHANNEL', 'edusense-attendance'),
        'notifications' => env('PUBNUB_NOTIFICATIONS_CHANNEL', 'edusense-notifications'),
    ],
];
