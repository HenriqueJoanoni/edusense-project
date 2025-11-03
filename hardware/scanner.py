from gpiozero import Buzzer, LED, Button
from time import sleep
import random
import board
import digitalio
from adafruit_character_lcd.character_lcd import Character_LCD_Mono
from pubnub_client import publish_message


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
    lcd_rs, lcd_en, lcd_d4, lcd_d5, lcd_d6, lcd_d7, lcd_columns, lcd_rows
)

sleep(0.5)

# Other components
buzzer = Buzzer(16)
green_led = LED(6)
red_led = LED(5)
button = Button(26)

# ID lists
ID_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9]
VALID_IDS = [1, 2, 4, 6, 7, 8]


def problem_indicator():
    buzzer.on()
    red_led.on()
    sleep(0.5)
    buzzer.off()
    red_led.off()
    sleep(0.5)


def success_indicator():
    buzzer.on()
    green_led.on()
    sleep(0.25)
    buzzer.off()
    green_led.off()
    sleep(0.75)


def display_text(line1="", line2=""):
    lcd.clear()
    sleep(0.1)
    lcd.message = f"{line1[:lcd_columns]}\n{line2[:lcd_columns]}"


try:
    print("Program Started")
    while True:
        lcd.message = "Please Scan\nYour ID"
        button.wait_for_press()
        id = random.choice(ID_LIST)

        # Publish scanned ID
        publish_message({"ID": id})

        if id in VALID_IDS:
            display_text("Valid ID", f"ID: {id}")
            success_indicator()
        else:
            display_text("Invalid ID", f"ID: {id}")
            problem_indicator()

except KeyboardInterrupt:
    print("Program Ended by User.")

finally:
    lcd.clear()
    buzzer.off()
    green_led.off()
    red_led.off()
    print("Program Finished")