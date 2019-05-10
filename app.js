const builder = require('botbuilder');

const restify = require('restify');

const apiai = require('apiai');

const app = apiai('826628b62aac4f9cada88f6819c0429e');

const request = require('request-promise');

const inMemory = new builder.MemoryBotStorage();

//create a server

const server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
    appId: '',
    appPassword: ''
})

server.post('/api/messages', connector.listen())

var bot = new builder.UniversalBot(connector).set('storage', inMemory);

var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/baa915d5-5d35-49a1-82c8-91165bc5c69d?verbose=true&timezoneOffset=-360&subscription-key=e3fabb907a5a4a5ebd667fe402a4d897&q='

var recognizer = new builder.LuisRecognizer(model);

var intents = new builder.IntentDialog({
    recognizers: [recognizer]
});

bot.dialog('/', intents);

bot.on('conversationUpdate', (message) => {
    bot.beginDialog(message.address, 'Introduce');
})

bot.dialog('Introduce', [
    function (session) {
        session.send("Hi");
        setTimeout(function () {
            var commands = 'I can help with the departure and arrival of passangers!';
            session.send(commands).endDialog();
        }, 100);
    }
])

intents.onDefault((session, args) => {
    if(args.intent.toLowerCase() === 'citizenship'){
        var aA = [];
        args.entities.forEach(e => {
            var name = e.type;
            var obj = {};
            obj[name] = e.entity;
            aA.push(obj);
        });
        session.send(JSON.stringify(aA)).endDialog();
    }else {
        session.send('No matches found!').endDialog();
    }
})