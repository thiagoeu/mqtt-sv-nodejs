const express = require("express");
const bodyParser = require("body-parser");
const aedes = require("aedes")();
const cors = require("cors");

const app = express();
app.use(cors());

// criando servidor mqtt
const mqttServer = require("net").createServer(aedes.handle);
const mqttPort = 1883;

mqttServer.listen(mqttPort, () => {
  console.log(`mqtt rondando na porta ${mqttPort}`);
});

aedes.on("client", (client) => {
  console.log("novo cliente conectado ", client);
});

aedes.on("clientDisconect", (client) => {
  console.log("cliente desconectado", client);
});

aedes.on("publish", async function (packet, client) {
  console.log(
    "Client \x1b[31m" +
      (client ? client.id : "BROKER_" + aedes.id) +
      "\x1b[0m has published",
    packet.payload.toString(),
    "on",
    packet.topic,
    "to broker",
    aedes.id
  );
});

/// express

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send({ message: "api mqtt rodando" });
});

app.post("/echo", (req, res) => {
  res.send(req.body);
});

app.post("/send", (req, send) => {
  try {
    const mensagem = req.body.mensagem;
    console.log(mensagem);
    aedes.publish({ topic: "esp32/data", payload: mensagem });
    res.status(200).send({ message: "mensagem publicada" });
  } catch {
    throw new Error("falha ao publicar");
  }
});

const port = 5000;

app.listen(port, () => {
  console.log("servidor rodando na porta: ", port);
});
