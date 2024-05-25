const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const amqplib = require("amqplib");
const  OpenAI  = require('openai');
const {TokenExpiredError, AuthorizeError} = require('./errors/app-errors');
const {v4: uuid4} = require("uuid");

const { APP_SECRET, MESSAGE_BROKER_URL,EXCHANGE_NAME, SUGGESTION_SERVICE, QUEUE_NAME, OPEN_AI_SECRET} = require('../config');
let amqplibConnection = null;
//Utility functions
module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};

(module.exports.GenerateSignature = async (payload) => {
  return await jwt.sign(payload, APP_SECRET, { expiresIn: "1d" });
}),
(module.exports.ValidateSignature = async (req) => {
  const signature = req.get("Authorization");

  if (signature) {
    try{
      const payload = await jwt.verify(signature.split(" ")[1], APP_SECRET);
      req.user = payload;
      return true;
    }catch(err){
      if (err.name === 'TokenExpiredError') {
      throw new TokenExpiredError('JWT token has expired');
    }
    throw new AuthorizeError('Invalid token');
    }
  }else {
    throw new AuthorizeError('No token provided');
  }
});

module.exports.FormateData = (data) => {
if (data) {
  return { data };
} else {
  throw new Error("Data Not found!");
}
};

const getChannel = async () => {
  if (amqplibConnection === null) {
    amqplibConnection = await amqplib.connect(MESSAGE_BROKER_URL);
  }
  return await amqplibConnection.createChannel();
};

//create channel
module.exports.CreateChannel = async() => {
  
  try{
    const channel =  await getChannel();
    await channel.assertExchange(EXCHANGE_NAME,'direct', false);
    return channel
  }catch(err){
    throw err
  }

}


// publish messages
module.exports.PublishMessage = async(channel, binding_key, message) => {

  try{
    await channel.publish(EXCHANGE_NAME,binding_key,Buffer.from(message));
  }catch(err){
    throw err
  }
  

}

//subscribe messages
module.exports.SubscribeMessage = async(channel, service) => {
  
  const appQueue = await channel.assertQueue(QUEUE_NAME);
  
  
  channel.bindQueue(appQueue.queue, EXCHANGE_NAME, SUGGESTION_SERVICE);

  channel.consume(appQueue.queue,data =>{
    console.log('received data');
    console.log(data.content.toString());
    service.SubscribeEvents(data.content.toString());
    channel.ack(data);
  });
} 


const requestData = async (RPC_QUEUE_NAME, requestPayload, uuid) => {
  try {
    const channel = await getChannel();

    const q = await channel.assertQueue("", { exclusive: true });

    channel.sendToQueue(
      RPC_QUEUE_NAME,
      Buffer.from(JSON.stringify(requestPayload)),
      {
        replyTo: q.queue,
        correlationId: uuid,
      }
    );

    return new Promise((resolve, reject) => {
      // timeout n
      const timeout = setTimeout(() => {
        channel.close();
        resolve("API could not fullfil the request!");
      }, 8000);
      channel.consume(
        q.queue,
        (msg) => {
          if (msg.properties.correlationId == uuid) {
            resolve(JSON.parse(msg.content.toString()));
            clearTimeout(timeout);
          } else {
            reject("data Not found!");
          }
        },
        {
          noAck: true,
        }
      );
    });
  } catch (error) {
    console.log(error);
    return "error";
  }
};


module.exports.RPCRequest = async (RPC_QUEUE_NAME, requestPayload) => {
  const uuid = uuid4(); // correlationId
  return await requestData(RPC_QUEUE_NAME, requestPayload, uuid);
};


//OPEN AI

module.exports.EnhanceRequest = async(content)=>{
  const openai = new OpenAI({
    apiKey: OPEN_AI_SECRET,
  });

  const response = await openai.chat.completions.create({
    messages: [
            {
              role: "system",
              content: `Benim girdiğim notları iyileştirmeni ve güzelleştirmeni istiyorum. Kurallarım aşağıdaki gibidir ve bu kuralların dışında çıkılmayacaktır.

                1- Girdiğim not yarım kalmış olabilir ya da birkaç anahtar kelimeyi içerebilir. Yazdığım şeyin ne olabileceğini tahmin edip, tamamlayıp, genişletmekle görevli olacaksın.
                    
                2- Girdiğim not herhangi bir konu hakkında olabilir.
                    
                3- Girdiğim notları akıllıca, damıtılmış, rafine hale getirilmiş istiyorum. Gereksiz bilgi vermekten kaçın. Birkaç cümlelik açıklamalar istiyorum fazla açıklama yapmamalısın.
                    
                4- Girdiğim notların konusundan şaşmamaya özen göster.  
                    
                5- Girdiğim notları "best practice" yapıda yaz.  
                    
                6- Ben herhangi bir şey hakkında not girdiğim zaman ya da anahtar kelimeler yazdığım zaman direkt olarak yanıt vermeye başla.`,
                },
              { role: "user", content },
              ],
              model: "gpt-4o",
}); 
return response.choices[0].message.content;
}
 