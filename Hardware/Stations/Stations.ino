#include <sstream>
#include <string>
#include <WiFi.h>
#include <PubSubClient.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

#define MQTT_MAX_PACKET_SIZE 1844
#define MAX_BEACONS_BUFFER 50
const int   beaconScanTime    = 4;
const char *stationName       = "Station 1";
const char *ssid              = "RAFAEL - 2.4G";
const char *password          = "Rafael02";
const char *mqttServer        = "brware.com.br";
const int   mqttPort          = 1883;
const char *mqttUser          = "brware";
const char *mqttPassword      = "SQRT(pi)!=314";
const char *subTopics[1]      = {"/stations/command"};
const char *pubTopics[1]      = {"/stations/beacons/get"};

typedef struct
{
  char address[17];
  int rssi;
  char *name;
} BeaconData;

WiFiClient espClient;
PubSubClient client(espClient);
BeaconData beacons[MAX_BEACONS_BUFFER];
uint8_t beaconIndex = 0;
uint8_t message_char_buffer[MQTT_MAX_PACKET_SIZE];

class MyAdvertisedDeviceCallbacks : public BLEAdvertisedDeviceCallbacks
{
public:
  void onResult(BLEAdvertisedDevice advertisedDevice)
  {
    extern uint8_t beaconIndex;
    extern BeaconData beacons[];
    if (beaconIndex >= MAX_BEACONS_BUFFER) return;

    if (advertisedDevice.haveRSSI()) beacons[beaconIndex].rssi = advertisedDevice.getRSSI();
    else beacons[beaconIndex].rssi = 0;

    strcpy(beacons[beaconIndex].address, advertisedDevice.getAddress().toString().c_str());
    strcpy(beacons[beaconIndex].name, advertisedDevice.getName().c_str());

    beaconIndex++;
  }
};

void setup()
{
  Serial.begin(115200);
  BLEDevice::init(stationName);
}

void connectWiFi()
{
  if(WiFi.status() != WL_CONNECTED) WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(2000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.print("Connected to the WiFi network ");
  Serial.println(ssid);
}

void connectMQTT()
{
  while (!client.connected())
  {
    client.setServer(mqttServer, mqttPort);
    Serial.println("Connecting to MQTT...");
    if (client.connect("ESP32Client", mqttUser, mqttPassword))
    {
      client.setCallback(mqttCallback);
      Serial.println("Client Connected");
      Serial.println("Subscribing to topic:");
      boolean result;
      for(int x=0;x<=sizeof(subTopics)-1;x++){
        Serial.print(subTopics[x]);
        result = client.subscribe(subTopics[x]);
        Serial.print(".....");
        Serial.println(result);
      }
    }
    else
    {
      Serial.print("failed with state ");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

void scanBeacons()
{
  delay(1000);
  BLEScan *pBLEScan = BLEDevice::getScan();
  MyAdvertisedDeviceCallbacks cb;
  pBLEScan->setAdvertisedDeviceCallbacks(&cb);
  pBLEScan->setActiveScan(true);
  BLEScanResults foundDevices = pBLEScan->start(beaconScanTime);
  pBLEScan->stop();
  delay(1000);
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {

  String strPayload = "";
  for (int i = 0; i < length; i++) {
    strPayload += (char)payload[i];
  }
  
  Serial.print("Message arrived in topic: ");
  Serial.print(topic);
  Serial.print(" => ");
  Serial.println(strPayload);

  if(topic == "command" && strPayload == "find") scanBeacons();
  else if(topic == "command" && strPayload == "send") sendBeacons();
  else if(topic == "command" && strPayload == "findAndSend") {
    scanBeacons();
    sendBeacons();
  }
}

void sendBeacons(){
  boolean result;
  client.loop();

  for (uint8_t i = 0; i < beaconIndex; i++)
  {
    String payload = String(WiFi.macAddress());
    payload += ";";
    payload += stationName;
    payload += ";";
    payload += String(beacons[i].name);
    payload += ";";
    payload += String(beacons[i].address);
    payload += ";";
    payload += String(beacons[i].rssi);    
    Serial.print("Publishing: ");
    Serial.print(payload);
    result = client.publish(pubTopics[0], (char*) payload.c_str());
    Serial.print(" -> Result: ");
    Serial.println(result);
  }
  beaconIndex = 0;
}
void loop()
{
  connectWiFi();
  connectMQTT();
  delay(500);
}