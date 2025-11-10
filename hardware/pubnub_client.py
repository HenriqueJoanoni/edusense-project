# https://www.pubnub.com/docs/sdks/python

from pubnub.pnconfiguration import PNConfiguration
from pubnub.pubnub import PubNub
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

def publish_message(message):
    envelope = pubnub.publish().channel(CHANNEL).message(message).sync()

    if envelope.status.is_error():
        print(f'Publish failed: {e}')
    else:
        print(f'Published message with timetoken: {envelope.result.timetoken}')