from gpiozero import Buzzer, LED, DigitalOutputDevice, Button
from time import sleep
import re
import serial
import board
import digitalio
from adafruit_character_lcd.character_lcd import Character_LCD_Mono
from pubnub_client import publish_message
from qrcode2 import QRCode2
from datetime import datetime, timezone


# lcd setup
# refrence for LCD https://pimylifeup.com/raspberry-pi-lcd-16x2/
lcd_rs = digitalio.DigitalInOut(board.D4)
lcd_en = digitalio.DigitalInOut(board.D24)
lcd_d4 = digitalio.DigitalInOut(board.D23)
lcd_d5 = digitalio.DigitalInOut(board.D17)
lcd_d6 = digitalio.DigitalInOut(board.D18)
lcd_d7 = digitalio.DigitalInOut(board.D22)

lcd_columns = 16
lcd_rows = 2

lcd = Character_LCD_Mono(
    lcd_rs, lcd_en, lcd_d4, lcd_d5, lcd_d6, lcd_d7,
    lcd_columns, lcd_rows
)


# components
buzzer = Buzzer(13)
green_led = LED(6)
red_led = LED(5)


# barcode scanner setup
scanner = QRCode2("/dev/ttyAMA0")
scanner.set_brightness(75)
scanner.set_continuous(True)


# keyboard button setup
# https://nerdcave.xyz/raspberrypi/module-and-sensors/tutorial-4-keypad/
# https://docs.sunfounder.com/projects/davinci-kit/en/latest/python_pi5/pi5_2.1.5_keypad_python.html
row_pins = [12, 16, 25, 26]
rows = [DigitalOutputDevice(pin) for pin in row_pins]

col_pins = [7, 8, 9, 11]
cols = [Button(pin, pull_up=False) for pin in col_pins]

keys = [
    "1", "2", "3", "A",
    "4", "5", "6", "B",
    "7", "8", "9", "C",
    "*", "0", "#", "D"
]

def read_keypad():
    pressed_keys = []
    for i, row in enumerate(rows):
        row.on()
        for j, col in enumerate(cols):
            if col.is_pressed:
                index = i * len(cols) + j
                pressed_keys.append(keys[index])
        row.off()
    return pressed_keys


def success_indicator():
    green_led.on()
    buzzer.on()
    sleep(0.2)
    buzzer.off()
    green_led.off()
    sleep(0.3)


def problem_indicator():
    for _ in range(2):
        red_led.on()
        buzzer.on()
        sleep(0.2)
        red_led.off()
        buzzer.off()
        sleep(0.2)


def display_text(line1="", line2=""):
    lcd.clear()
    sleep(0.1)
    lcd.message = f"{line1[:lcd_columns]}\n{line2[:lcd_columns]}"


try:
    display_text("Ready to Scan", "or Enter ID")
    print("System ready. Waiting for barcode data or keypad input...")

    input_buffer = ""
    last_key = []

    while True:
        data = scanner.read()

        # check for barcode data
        if data:
            data = data.strip()
            print(f"Scanned: {data}")

            if re.match(r"^D00\d{6}$", data):
                display_text("Access Granted", f"{data}")
                success_indicator()

                # Publish scanned ID
                gmt_now = datetime.now(timezone.utc).replace(tzinfo=None)
                publish_message({
                    "ID": data,
                    "date": gmt_now.strftime("%Y-%m-%d"),
                    "time": gmt_now.strftime("%H:%M:%S")
                })
            else:
                display_text("AInvalid ID", f"{data}")
                problem_indicator()

            sleep(2)
            display_text("Ready to Scan", "or Enter ID")


        # check for keypad input
        pressed_keys = read_keypad()
        if pressed_keys and pressed_keys != last_keys:
            key = pressed_keys[0] 
            print(f"Key pressed: {key}")

            if key == "*":
                input_buffer = ""
                display_text("Input Cleared", "")
                problem_indicator()
                sleep(1)
                display_text("Enter ID:", input_buffer)

            elif key == "#":
                print(f"Entered ID: {input_buffer}")
                if re.match(r"^D00\d{6}$", input_buffer):
                    display_text("Access Granted", input_buffer)
                    success_indicator()
                    
                    # Publish entered ID
                    gmt_now = datetime.now(timezone.utc).replace(tzinfo=None)
                    publish_message({
                        "ID": data,
                        "date": gmt_now.strftime("%Y-%m-%d"),
                        "time": gmt_now.strftime("%H:%M:%S")
                    })
                else:
                    display_text("Invalid ID", input_buffer)
                    problem_indicator()
                input_buffer = ""
                sleep(2)
                display_text("Ready to Scan", "or Enter ID")

            else:
                # add key to buffer
                input_buffer += key
                display_text("Enter ID:", input_buffer[-lcd_columns:])

            last_keys = pressed_keys

        elif not pressed_keys:
            last_keys = []

        sleep(0.1)


except KeyboardInterrupt:
    print("Exiting...")


finally:
    scanner.ser.close()  
    lcd.clear()
    green_led.off()
    red_led.off()
    buzzer.off()
    print("Program Finished")