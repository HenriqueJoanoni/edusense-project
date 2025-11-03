from pubnub.pnconfiguration import PNConfiguration
from pubnub.pubnub import PubNub
from pubnub.callbacks import SubscribeCallback
from dotenv import load_dotenv
import os

load_dotenv()

pnconfig = PNConfiguration()
pnconfig.publish_key = os.getenv("PUBNUB_PUBLISH_KEY")
pnconfig.subscribe_key = os.getenv("PUBNUB_SUBSCRIBE_KEY")
pnconfig.uuid = os.getenv("PUBNUB_UUID")
pnconfig.ss1 = True

pubnub = PubNub(pnconfig)
CHANNEL = os.getenv("PUBNUB_CHANNEL")

class IDListener(SubscribeCallback):
    def message(self, pubnub, message):
        print(f"{message.message}")


pubnub.add_listener(IDListener())
pubnub.subscribe().channels(CHANNEL).execute()

while True:
    pass