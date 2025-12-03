<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\PubNubService;
use App\Jobs\ProcessAttendanceFromPubNub;
use Illuminate\Support\Facades\Log;

class PubNubListenCommand extends Command
{
    protected $signature = 'pubnub:listen
                            {channel? : The channel to listen to}
                            {--all : Listen to all configured channels}
                            {--uuid= : Custom UUID for this listener}';

    protected $description = 'Listen to PubNub channel messages';

    protected PubNubService $pubNubService;

    public function __construct(PubNubService $pubNubService)
    {
        parent::__construct();
        $this->pubNubService = $pubNubService;
    }

    public function handle(): int
    {
        if ($customUuid = $this->option('uuid')) {
            $this->pubNubService->setUuid($customUuid);
            $this->comment("Using custom UUID: {$customUuid}");
        } else {
            $this->comment("Auto-generated UUID: " . $this->pubNubService->getUuid());
        }

        if ($this->option('all')) {
            $channels = [
                config('pubnub.channels.attendance'),
                config('pubnub.channels.notifications'),
            ];
            $this->info("Listening to multiple channels: " . implode(', ', $channels));
        } else {
            $channel = $this->argument('channel') ?? config('pubnub.channels.attendance');
            $channels = [$channel];
            $this->info("Listening to channel: {$channel}");
        }

        $this->info("Press Ctrl+C to stop...");
        $this->newLine();

        // Define callbacks...
        $onMessage = function ($pubnub, $message) {
            $messageData = $message->getMessage();

            $this->line("┌─────────────────────────────────────┐");
            $this->info("│ NEW MESSAGE RECEIVED                │");
            $this->line("└─────────────────────────────────────┘");
            $this->line("Channel:   " . $message->getChannel());
            $this->line("Publisher: " . $message->getPublisher());
            $this->line("My UUID:   " .  $this->pubNubService->getUuid());
            $this->line("Timetoken: " . $message->getTimetoken());
            $this->newLine();
            $this->comment("Message Content:");
            $this->line(json_encode($messageData, JSON_PRETTY_PRINT));
            $this->line("─────────────────────────────────────");
            $this->newLine();

            Log::info('PubNub Message Received', [
                'channel' => $message->getChannel(),
                'message' => $messageData,
                'publisher' => $message->getPublisher(),
                'listener_uuid' => $this->pubNubService->getUuid(),
                'timetoken' => $message->getTimetoken(),
            ]);

            if (isset($messageData['ID'])) {
                ProcessAttendanceFromPubNub::dispatch($messageData);
                $this->comment("✓ Job dispatched for student ID: {$messageData['ID']}");
            } else {
                $this->warn("⚠ Message received without 'ID' field - skipping attendance processing");
            }
        };

        $onPresence = function ($pubnub, $presence) {
            $event = $presence->getEvent();
            $uuid = $presence->getUuid();
            $channel = $presence->getChannel();

            $this->comment("👤 Presence Event: {$event} | UUID: {$uuid} | Channel: {$channel}");
        };

        $onStatus = function ($pubnub, $status) {
            $category = $status->getCategory();

            if ($status->isError()) {
                $this->error("❌ Status Error: {$category}");
            } else {
                $this->info("✓ Status: {$category}");
            }
        };

        try {
            $this->pubNubService->subscribe($channels, $onMessage, $onPresence, $onStatus);
            while (true) {
                sleep(1);
            }
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
