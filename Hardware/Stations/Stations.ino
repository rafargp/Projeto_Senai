/*  SENAI - PROJETO ESTAÇÃO SCANNER BLUETOOTH PARA LOCALIZAÇÃO INDOOR UTILIZANDO ESP32 */

//Biblioteca String para manipulação de variavel texto
#include <string>
//Biblioteca Wifi para gerenciamento de redes sem fio
#include <WiFi.h>
//Biblioteca PubSubClient para gerenciamento do protocolo MQTT
#include <PubSubClient.h>
//Bibliotecas BLE para gerenciamento do bluetooth
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

//Constante que define a quantidade maxima que a estaçao poderá ler
#define MAX_BEACONS_BUFFER 50

//Constante que define o tempo de busca do bluetooth, em segundos
const int beaconScanTime = 4;
//Constante que o nome do dispositivo bluetooth da estação
const char *stationName = "Station 1";
//Constante que define o nome da rede WiFi
const char *ssid = "RAFAEL - 2.4G";
//Constante que define a senha da rede Wifi
const char *password = "Rafael02";
// const char *ssid              = "F106_CS10";
// const char *password          = "Senai4.0";
//Constante que define o nome do servidor Broker MQTT
const char *mqttServer = "brware.com.br";
//Constante que define a porta do Broker MQTT
const int mqttPort = 1883;
//Constante que define o usuário do Broker MQTT
const char *mqttUser = "brware";
//Constante que define a senha do Broker MQTT
const char *mqttPassword = "SQRT(pi)!=314";
//Constante que define os tópicos de subscrição para o MQTT
const char *subTopics[1] = {"/stations/command"};
//Constante que define os tópicos de publicação para o MQTT
const char *pubTopics[1] = {"/stations/beacons/get"};

//Estrutura de dados para armazenamento dos beacons
typedef struct
{
  //Endereço MAC do dispositivo bluetooth encontrado
  char address[17];
  //Potencia do sinal do dispositivo bluetooth encontrado
  int rssi;
  //Nome do dispositivo bluetooth encontrado
  char *bName;

} BeaconData; //Nome da estrutura de dados

//Objeto Wifi Client para gerenciamento da rede Sem fio
WiFiClient espClient;
//Objeto PubSubCliente para gerenciamento do protocolo MQTT
PubSubClient client(espClient);
//Array de Objetos que armazenara os dados dos beacons encontrados 
BeaconData beacons[MAX_BEACONS_BUFFER];
//Variavel para localização de um beacon dentro do array "beacons"
uint8_t beaconIndex = 0;
//Buffer para envio dos beacons no formato JSON
uint8_t message_char_buffer[MQTT_MAX_PACKET_SIZE];

//Classe personalizada que herda os métodos BLEAdvertisedDeviceCallbacks para subrecarga do método onResult
class MyAdvertisedDeviceCallbacks : public BLEAdvertisedDeviceCallbacks
{
public:
  //Sobrecarga do método onResult para tratamento dos dados recebidos pela busca bluetooth
  void onResult(BLEAdvertisedDevice advertisedDevice)
  {
    //Varivel relacionada a beaconIndex externa.
    extern uint8_t beaconIndex;
    //Varivel relacionada a beacons externo.
    extern BeaconData beacons[];

    //Valida a quantidade de beacons encontrados na busca
    if (beaconIndex >= MAX_BEACONS_BUFFER) return;
    //Valida a potencia de sinal do dispositivo encontrado
    if (advertisedDevice.haveRSSI()) beacons[beaconIndex].rssi = advertisedDevice.getRSSI();
    //Caso não possua sinal, é definido 0 para esse dispositivo
    else beacons[beaconIndex].rssi = 0;

    //Atribui o endereço MAC do dispositivo a variavel beacons[beaconIndex].address
    strcpy(beacons[beaconIndex].address, advertisedDevice.getAddress().toString().c_str());

    //Atribui o nome do dispositivo a variavel beacons[beaconIndex].bName
    std::string str = advertisedDevice.getName();
    beacons[beaconIndex].bName = new char[str.length() + 1];
    strcpy(beacons[beaconIndex].bName, str.c_str());
     
    //Incrementa mais um ao contador de dispositivos
    beaconIndex++;
  }
};

//Método de configuração do ESP
void setup()
{
  //Método de início a porta serial na velocidade 115200
  Serial.begin(115200);
  //Método de início ao dispositivo bluetooth 
  BLEDevice::init(stationName);
}

//Método de configuração WiFi
void connectWiFi()
{
  //Valida se o Wifi esta conectado a rede, caso nao esteja, inicia
  if (WiFi.status() != WL_CONNECTED) WiFi.begin(ssid, password);

  //Aguarda até que o status do wifi seja conectado
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(2000);
    Serial.println("Connecting to WiFi...");
  }
}

//Método de configuração do protocolo MQTT
void connectMQTT()
{
  //Executa enquanto o protocolo está desconectado
  while (!client.connected())
  {
    //Define as credenciais do Broker MQTT
    client.setServer(mqttServer, mqttPort);
    //Define o método de callback para os tópicos de subscrição
    client.setCallback(mqttCallback);

    Serial.println("Connecting to MQTT...");
    //Tenta conexão e Valida se a conxão com o Broker funcionou
    if (client.connect("ESP32Client", mqttUser, mqttPassword))
    {
      Serial.println("Client Connected");
      Serial.println("Subscribing to topic:");
      boolean result;

      Serial.print(subTopics[0]);
      //Faz a subscrição no tópico definido em subTopics[0]
      result = client.subscribe(subTopics[0]);
      Serial.print(".....");
      Serial.println(result);
    }
    else
    {
      Serial.print("failed with state: ");
      Serial.print(client.state());
      delay(2000);
    }
  }
  //Coloca o protocolo MQTT em loop para novas mensagens
  client.loop();
}

//Método que escaneia os beacons e armazena os dados encontrados
void scanBeacons()
{
  delay(1000);
  //Objeto que define o scanner bluetooth
  BLEScan *pBLEScan = BLEDevice::getScan();
  //Objeto que define o método de callback
  MyAdvertisedDeviceCallbacks cb;
  //Configura o scanner para o callback definido
  pBLEScan->setAdvertisedDeviceCallbacks(&cb);
  //Configura o scanner como ativo
  pBLEScan->setActiveScan(true);
  //Objeto que receberá os dispositivos encontrados pelo scanner
  BLEScanResults foundDevices = pBLEScan->start(beaconScanTime);
  //Configura o scanner como inativo
  pBLEScan->stop();
  //Aguarda 1 segundo
  delay(1000);
}

//Método que trata as mensagens recebidas pelo protocolo MQTT
void mqttCallback(char *topic, byte *payload, unsigned int length)
{
  //Objeto para conversão da mensagem em String
  String strPayload = "";

  //Conversão da mensagem em String
  for (int i = 0; i < length; i++) strPayload += (char)payload[i];

  Serial.print("Message arrived in topic: ");
  Serial.print(topic);
  Serial.print(" => ");
  Serial.println(strPayload);

  //Validaçao da mensagem para comando de busca
  if (String(topic) == String(subTopics[0]) && strPayload == "find") scanBeacons();
  //Validaçao da mensagem para comando de envio de dados no formato CSV
  else if (String(topic) == String(subTopics[0]) && strPayload == "sendCSV") sendBeaconsCSV();
  //Validaçao da mensagem para comando de envio de dados no formato JSON
  else if (String(topic) == String(subTopics[0]) && strPayload == "sendJSON") sendBeaconsJSON();
  //Validaçao da mensagem para comando de busca e envio de dados no formato CSV
  else if (String(topic) == String(subTopics[0]) && strPayload == "findAndSendCSV") {
    //Busca os dispositivos
    scanBeacons();
    //Envia os dispositivos encontrados em formato CSV
    sendBeaconsCSV();
  }
  //Validaçao da mensagem para comando de busca e envio de dados no formato JSON
  else if (String(topic) == String(subTopics[0]) && strPayload == "findAndSendJSON")
  {
    //Busca os dispositivos
    scanBeacons();
    //Envia os dispositivos encontrados em formato JSON
    sendBeaconsJSON();
  }
}

//Método de envio das informações em formato JSON
void sendBeaconsJSON()
{
  //Varival de resultado da publicação no Broker MQTT
  boolean result;

  //Variavel de mensagem payload
  String payload = "{\"e\":[";

  for (uint8_t i = 0; i < beaconIndex; i++)
  {
    //Incremento do endereço
    payload += "{\"m\":\"";
    payload += String(beacons[i].address);
    //Incremento da força do sinal
    payload += "\",\"r\":\"";
    payload += String(beacons[i].rssi);
    //Incremento do nome
    payload += "\",\"n\":\"";
    payload += String(beacons[i].bName);
    payload += "\"}";
    if (i < beaconIndex - 1) payload += ',';
  }
  //Incremento do endereço da estação
  payload += "],\"stMac\":\"";
  payload += String(WiFi.macAddress());
  //Incremento do nome da estação
  payload += "\",\"stNome\":\"";
  payload += stationName;
  payload += "\"}";

  //Publicação da mensagem no Broker
  Serial.print("Publishing: ");
  Serial.print(payload);
  payload.getBytes(message_char_buffer, payload.length() + 1);
  result = client.publish_P(pubTopics[0], message_char_buffer, payload.length(), false);
  Serial.print(" -> Result: ");
  Serial.println(result);

  //Reseta a variavel para posição inicial
  beaconIndex = 0;
}
void sendBeaconsCSV()
{
  //Varival de resultado da publicação no Broker MQTT
  boolean result;
  for (uint8_t i = 0; i < beaconIndex; i++)
  {
    //Variavel de mensagem payload e Incremento do endereço da estação
    String payload = String(WiFi.macAddress());
    payload += ";";
    //Incremento do nome da estação
    payload += stationName;
    payload += ";";
    //Incremento do nome
    payload += String(beacons[i].bName);
    payload += ";";
    //Incremento do endereço
    payload += String(beacons[i].address);
    payload += ";";
    //Incremento da potencia do sinal
    payload += String(beacons[i].rssi);

    //Publicação da mensagem no Broker
    Serial.print("Publishing: ");
    Serial.print(payload);
    result = client.publish(pubTopics[0], (char *)payload.c_str());
    Serial.print(" -> Result: ");
    Serial.println(result);
  }
  //Reseta a variavel para posição inicial
  beaconIndex = 0;
}

void loop()
{
  //Método que valida a conexão do Wifi
  connectWiFi();
  //Método que valida a conexao com Broker MQTT
  connectMQTT();
  //Aguarda 0.5 segundos
  delay(500);
}
