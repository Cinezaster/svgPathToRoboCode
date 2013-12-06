#include <VirtualWire.h>

const int led_pin = 1;

void setup(){
    vw_set_rx_pin(2);
    vw_setup(2000);  // Bits per sec
    vw_rx_start();       // Start the receiver PLL running
    pinMode(led_pin, OUTPUT);
    digitalWrite(led_pin, LOW);
}

void loop(){
    uint8_t buf[1];
    if (vw_get_message(buf, 1)) {
      if (buf[0] == "0"){
        digitalWrite(led_pin, LOW);
      } else if (buf[0] == "1") {
         digitalWrite(led_pin, HIGH);
      }
    }
}
