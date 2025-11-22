<?php

namespace App\Services;

use Carbon\Carbon;
use PubNub\Exceptions\PubNubException;
use PubNub\PubNub;
use PubNub\PNConfiguration;
use PubNub\Callbacks\SubscribeCallback;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PubNubService
{
    protected PubNub $pubnub;
    protected array $config;
    protected string $uuid;

    public function __construct()
    {
        $this->config = config('pubnub');
        $this->uuid = $this->generateUuid();
        $this->initializePubNub();
    }

    /**
     * Generate a UUID for this PubNub instance
     *
     * Priority:
     * 1. Authenticated user ID
     * 2. Environment variable
     * 3. Generated UUID
     */
    protected function generateUuid(): string
    {
        if (auth()->check()) {
            $user = auth()->user();
            return sprintf(
                'user-%d-%s',
                $user->id,
                $user->user_email ? Str::slug($user->user_email) : 'unknown'
            );
        }

        if (!empty(env('PUBNUB_UUID'))) {
            return env('PUBNUB_UUID');
        }

        return sprintf(
            '%s-%s-%s',
            config('app.name', 'edusense'),
            gethostname(),
            Str::uuid()->toString()
        );
    }

    /**
     * Get the current UUID
     */
    public function getUuid(): string
    {
        return $this->uuid;
    }

    /**
     * Set a custom UUID
     */
    public function setUuid(string $uuid): self
    {
        $this->uuid = $uuid;
        $this->initializePubNub();

        return $this;
    }

    /**
     * Initialize PubNub instance
     */
    protected function initializePubNub(): void
    {
        $pnConfig = new PNConfiguration();
        $pnConfig->setPublishKey($this->config['publish_key']);
        $pnConfig->setSubscribeKey($this->config['subscribe_key']);
        $pnConfig->setSecretKey($this->config['secret_key']);
        $pnConfig->setUuid($this->uuid);
        $pnConfig->setSecure($this->config['ssl'] ?? true);

        if (!empty($this->config['auth_key'])) {
            $pnConfig->setAuthKey($this->config['auth_key']);
        }

        $this->pubnub = new PubNub($pnConfig);
    }

    /**
     * Publish a message to a channel
     */
    public function publish(string $channel, array|string $message, array $metadata = []): array
    {
        try {
            $metadata['publisher_uuid'] = $this->uuid;
            $metadata['published_at'] = now()->toIso8601String();

            if (auth()->check()) {
                $metadata['user_id'] = auth()->id();
                $metadata['user_email'] = auth()->user()->user_email;
            }

            $result = $this->pubnub->publish()
                ->channel($channel)
                ->message($message)
                ->meta($metadata)
                ->sync();

            return [
                'success' => true,
                'timetoken' => $result->getTimetoken(),
                'message' => 'Message published successfully',
                'uuid' => $this->uuid,
            ];
        } catch (PubNubException $e) {
            Log::error('PubNub Publish Error', [
                'channel' => $channel,
                'uuid' => $this->uuid,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Subscribe to channels with proper callback implementation
     */
    public function subscribe(
        array|string $channels,
        ?callable $onMessage = null,
        ?callable $onPresence = null,
        ?callable $onStatus = null
    ): void {
        $channels = is_array($channels) ? $channels : [$channels];

        Log::info('PubNub Subscribe', [
            'uuid' => $this->uuid,
            'channels' => $channels,
        ]);

        $callback = new class($onMessage, $onPresence, $onStatus) extends SubscribeCallback {
            private $messageCallback;
            private $presenceCallback;
            private $statusCallback;

            public function __construct(?callable $onMessage, ?callable $onPresence, ?callable $onStatus)
            {
                $this->messageCallback = $onMessage;
                $this->presenceCallback = $onPresence;
                $this->statusCallback = $onStatus;
            }

            public function status($pubnub, $status): void
            {
                if ($this->statusCallback) {
                    call_user_func($this->statusCallback, $pubnub, $status);
                }
            }

            public function message($pubnub, $message): void
            {
                if ($this->messageCallback) {
                    call_user_func($this->messageCallback, $pubnub, $message);
                }
            }

            public function presence($pubnub, $presence): void
            {
                if ($this->presenceCallback) {
                    call_user_func($this->presenceCallback, $pubnub, $presence);
                }
            }
        };

        $this->pubnub->addListener($callback);
        $this->pubnub->subscribe()
            ->channels($channels)
            ->withPresence()
            ->execute();
    }

    /**
     * Unsubscribe from channels
     */
    public function unsubscribe(array|string $channels): void
    {
        $channels = is_array($channels) ? $channels : [$channels];

        $this->pubnub->unsubscribe()
            ->channels($channels)
            ->execute();
    }

    /**
     * Unsubscribe from all channels
     */
    public function unsubscribeAll(): void
    {
        $this->pubnub->unsubscribeAll();
    }

    /**
     * Get message history for a channel
     */
    public function history(
        string $channel,
        int $count = 100,
        ?int $start = null,
        ?int $end = null
    ): array {
        try {
            $historyBuilder = $this->pubnub->history()
                ->channel($channel)
                ->count($count)
                ->includeTimetoken(true);

            if ($start !== null) {
                $historyBuilder->start($start);
            }

            if ($end !== null) {
                $historyBuilder->end($end);
            }

            $result = $historyBuilder->sync();

            $messages = collect($result->getMessages())->map(function ($item) {
                return [
                    'message' => $item->getEntry(),
                    'timetoken' => $item->getTimetoken(),
                    'timestamp' => $this->timeTokenToDateTime($item->getTimetoken()),
                ];
            })->toArray();

            return [
                'success' => true,
                'messages' => $messages,
                'count' => count($messages),
                'start' => $result->getStartTimetoken(),
                'end' => $result->getEndTimetoken(),
            ];
        } catch (PubNubException $e) {
            Log::error('PubNub History Error', [
                'channel' => $channel,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get presence information for a channel
     */
    public function hereNow(string $channel): array
    {
        try {
            $result = $this->pubnub->hereNow()
                ->channels([$channel])
                ->includeUUIDs(true)
                ->includeState(true)
                ->sync();

            return [
                'success' => true,
                'occupancy' => $result->getTotalOccupancy(),
                'channels' => $result->getChannels(),
                'current_uuid' => $this->uuid,
            ];
        } catch (PubNubException $e) {
            Log::error('PubNub HereNow Error', [
                'channel' => $channel,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Fire (publish without storing in history)
     */
    public function fire(string $channel, array|string $message): array
    {
        try {
            $result = $this->pubnub->fire()
                ->channel($channel)
                ->message($message)
                ->sync();

            return [
                'success' => true,
                'timetoken' => $result->getTimetoken(),
                'uuid' => $this->uuid,
            ];
        } catch (PubNubException $e) {
            Log::error('PubNub Fire Error', [
                'channel' => $channel,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Set state for the current UUID on specific channels
     */
    public function setState(array|string $channels, array $state): array
    {
        try {
            $channels = is_array($channels) ? $channels : [$channels];

            $result = $this->pubnub->setState()
                ->channels($channels)
                ->state($state)
                ->sync();

            return [
                'success' => true,
                'state' => $result->getState(),
                'uuid' => $this->uuid,
            ];
        } catch (PubNubException $e) {
            Log::error('PubNub SetState Error', [
                'channels' => $channels,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get state for the current UUID on specific channels
     */
    public function getState(array|string $channels): array
    {
        try {
            $channels = is_array($channels) ? $channels : [$channels];

            $result = $this->pubnub->getState()
                ->channels($channels)
                ->sync();

            return [
                'success' => true,
                'channels' => $result->getChannels(),
                'uuid' => $this->uuid,
            ];
        } catch (PubNubException $e) {
            Log::error('PubNub GetState Error', [
                'channels' => $channels,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get the PubNub instance for advanced usage
     */
    public function getInstance(): PubNub
    {
        return $this->pubnub;
    }

    /**
     * Convert PubNub timetoken to readable DateTime
     *
     * @param int $timeToken
     * @return string
     */
    protected function timeTokenToDateTime(int $timeToken): string
    {
        // PubNub timetoken is in hundreds of nanoseconds since Unix epoch
        // Divide by 10,000,000 to get seconds
        $timestamp = (int)($timeToken / 10000000);

        return Carbon::createFromTimestamp($timestamp)->toIso8601String();
    }
}
