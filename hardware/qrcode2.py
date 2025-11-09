# chatgpt chat for this code
# https://chatgpt.com/share/6910c985-3b68-8013-8df6-e27631d4f187

import serial
import time

class QRCode2:
    def __init__(self, port="/dev/ttyAMA0", baudrate=115200):
        self.ser = serial.Serial(port, baudrate, timeout=0.1)

    def send_cmd(self, cmd_bytes):
        self.ser.write(bytearray(cmd_bytes))

    def trigger_once(self):
        # Single scan trigger
        self.send_cmd([0x7E,0x00,0x08,0x01,0x00,0x00,0x00,0x00,0x01,0x07])

    def set_continuous(self, enable=True):
        if enable:
            cmd = [0x7E,0x00,0x08,0x01,0x00,0x00,0x00,0x00,0x00,0x08]
        else:
            cmd = [0x7E,0x00,0x08,0x01,0x00,0x00,0x00,0x00,0x01,0x07]
        self.send_cmd(cmd)

    def set_brightness(self, value):
        value = max(0, min(100, value))
        cs = (0x7E + 0x00 + 0x09 + 0x0D + 0x00 + 0x01 + value + 0x00 + 0x00) & 0xFF
        cmd = [0x7E,0x00,0x09,0x0D,0x00,0x01,value,0x00,0x00,cs]
        self.send_cmd(cmd)

    def read(self):
        if self.ser.in_waiting:
            return self.ser.read(self.ser.in_waiting).decode(errors="ignore")
        return None
