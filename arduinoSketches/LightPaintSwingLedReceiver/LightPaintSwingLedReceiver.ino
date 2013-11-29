// receiver.pde
//
// Simple example of how to use VirtualWire to receive messages
// Implements a simplex (one-way) receiver with an Rx-B1 module
//
// See VirtualWire.h for detailed API docs
// Author: Mike McCauley (mikem@airspayce.com)
// Copyright (C) 2008 Mike McCauley
// $Id: receiver.pde,v 1.3 2009/03/30 00:07:24 mikem Exp $

#include <VirtualWire.h>

const int led_pin = 1;

void setup(){
    vw_set_rx_pin(2);
    vw_set_ptt_inverted(true); // Required for DR3100
    vw_setup(2000);	 // Bits per sec
    vw_rx_start();       // Start the receiver PLL running
    pinMode(led_pin, OUTPUT);
    digitalWrite(led_pin, LOW);
}

void loop(){
    uint8_t buf[1];
    if (vw_get_message(buf, 1)) {
      if (buf[0] == 0){
        digitalWrite(led_pin, LOW);
      } else {
         digitalWrite(led_pin, HIGH);
      }
    }
}
