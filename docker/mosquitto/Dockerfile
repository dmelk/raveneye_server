FROM eclipse-mosquitto:1.6

# Generate pwfile based on environment variables
ARG MQTT_USER
ARG MQTT_PASSWORD

RUN if [ -n "$MQTT_USER" ] && [ -n "$MQTT_PASSWORD" ]; then \
        mosquitto_passwd -b /mosquitto/config/pwfile $MQTT_USER $MQTT_PASSWORD; \
    fi

# Start broker \
CMD ["mosquitto", "-c", "/mosquitto/config/mosquitto.conf"]