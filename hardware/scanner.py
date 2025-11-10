from gpiozero import Buzzer, LED
from time import sleep
import serial
import board
import digitalio
from adafruit_character_lcd.character_lcd import Character_LCD_Mono
from pubnub_client import publish_message
from qrcode2 import QRCode2


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
buzzer = Buzzer(16)
green_led = LED(6)
red_led = LED(5)


# barcode scanner setup
scanner = QRCode2("/dev/ttyAMA0")
scanner.set_brightness(75)
scanner.set_continuous(True)


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
    display_text("Ready to Scan", "")
    print("System ready. Waiting for barcode data...")

    while True:
        data = scanner.read()

        if data:
            data = data.strip()
            print(f"Scanned: {data}")

            if data.startswith("D"):
                display_text("Access Granted", f"{data}")
                success_indicator()

                # Publish scanned ID
                # publish_message({"ID": data})
            else:
                display_text("Access Denied", f"{data}")
                problem_indicator()

            sleep(2)
            display_text("Ready to Scan", "")


except KeyboardInterrupt:
    print("Exiting...")


finally:
    scanner.ser.close()  
    lcd.clear()
    green_led.off()
    red_led.off()
    buzzer.off()
    print("Program Finished")