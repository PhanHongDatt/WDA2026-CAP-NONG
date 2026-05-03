package com.capnong.service.impl;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Call;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import com.twilio.type.Twiml;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class TwilioGatewayService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String fromPhoneNumber;

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.isEmpty() && authToken != null && !authToken.isEmpty()) {
            try {
                Twilio.init(accountSid, authToken);
                log.info("Twilio SDK initialized successfully.");
            } catch (Exception e) {
                log.error("Failed to initialize Twilio: {}", e.getMessage());
            }
        } else {
            log.warn("Twilio credentials are missing! Smart Notifications will fail.");
        }
    }

    public String sendSms(String toPhoneNumber, String content) {
        toPhoneNumber = sanitizePhoneNumber(toPhoneNumber);
        log.info("Sending SMS to: {}", toPhoneNumber);
        Message message = Message.creator(
                new PhoneNumber(toPhoneNumber),
                new PhoneNumber(fromPhoneNumber),
                content
        ).create();
        log.info("SMS sent successfully. SID: {}", message.getSid());
        return message.getSid();
    }

    public String makeVoiceCall(String toPhoneNumber, String textToSpeech) {
        toPhoneNumber = sanitizePhoneNumber(toPhoneNumber);
        log.info("Making Voice Call to: {}", toPhoneNumber);
        
        // Use Vietnamese voice TTS (Google or basic Twilio voice)
        String twimlContent = "<Response><Say language=\"vi-VN\">" 
                + textToSpeech + "</Say></Response>";
        Twiml twiml = new Twiml(twimlContent);

        Call call = Call.creator(
                new PhoneNumber(toPhoneNumber),
                new PhoneNumber(fromPhoneNumber),
                twiml
        ).create();
        
        log.info("Call initiated successfully. SID: {}", call.getSid());
        return call.getSid();
    }

    public String sanitizePhoneNumber(String phone) {
        if (phone == null) return "";
        phone = phone.trim();
        // Convert Vietnamese local format "09..." to "+849..."
        if (phone.startsWith("0")) {
            phone = "+84" + phone.substring(1);
        } else if (!phone.startsWith("+") && phone.startsWith("84")) {
            phone = "+" + phone;
        } else if (!phone.startsWith("+")) {
             phone = "+" + phone;
        }
        return phone;
    }
}
