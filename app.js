const builder = require('botbuilder');

const restify = require('restify');

const apiai = require('apiai');

const app = apiai('826628b62aac4f9cada88f6819c0429e');

const request = require('request-promise');

const inMemory = new builder.MemoryBotStorage();

const spellService = require('./spell-check');

const db = require('./db');

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

var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/9c0872c2-4b45-4b3d-93d6-f335b5dff3ae?verbose=true&timezoneOffset=-360&subscription-key=e3fabb907a5a4a5ebd667fe402a4d897&q='

var recognizer = new builder.LuisRecognizer(model);

var intents = new builder.IntentDialog({
    recognizers: [recognizer]
});

bot.dialog('/', intents);

bot.on('conversationUpdate', (message) => {
    if (message.membersAdded) {
        console.log("Message " + JSON.stringify(message));
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                bot.beginDialog(message.address, 'Introduce');
            }
        });
    }
})

//=======================================================================================================
//BING SPEECH
//=====================================================================================================
bot.use({
    botbuilder: function (session, next) {
        spellService.getCorrectedText(session.message.text).then(text => {
            session.message.text = text;
            next();
        })
            .catch((error) => {
                console.error(error);
                next();
            });
    }
});

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
    var message = session.message.text.toLowerCase();
    require('./index')(message, function (err, data1) {
        if (err) throw err;
        else {
            var MLmappeddata = data1;
            if (args.intent.toLowerCase() === 'citizenship') {
                var aA = [], bA = [], cA = [], Dates = [];
                var obj = {};
                var data = {};
                let i = 0;
                args.entities.forEach(e => {
                    var name = e.type.toLowerCase();
                    if (name === "builtin.datetimev2.daterange") {
                        if (new Date(e.entity).toString() !== 'Invalid Date') {
                            let month;
                            if (date.getMonth() > 9) {
                                month = date.getMonth() + 1;
                            } else {
                                month = `0${date.getMonth() + 1}`
                            }
                            obj[`Month${i}`] = date.getFullYear() + '-' + month;
                            i++;
                        } else {
                            obj['yearmonth'] = [];
                            require('./regex')(e.entity).forEach((e) => {
                                let month, date;
                                date = new Date(e);
                                if (date.getMonth() > 9) {
                                    month = date.getMonth() + 1;
                                } else {
                                    month = `0${date.getMonth() + 1}`
                                }
                                date = date.getFullYear() + '-' + month;
                                obj['yearmonth'].push(date);
                            })
                        }
                    }
                    else if (name.toLowerCase() === 'count') {
                        data['deciding_factor'] = 'count';
                    }
                    else if (name === 'builtin.geographyv2.countryregion') {
                        cA.push(e.entity);
                        obj['countryofresidence'] = cA;
                    } else if (name === 'status') {
                        aA.push(e.entity);
                        obj[name] = aA;
                    } else if (name === 'visa'){
                        bA.push(e.entity)
                        obj[name] = bA;
                    } else {
                        obj[name] = e.entity;
                    }
                });
                Object.keys(obj).forEach((ele) => {
                    if (ele.includes('Month')) {
                        Dates.push(obj[ele]);
                        delete obj[ele];
                    }
                })
                if (Dates.length > 1) {
                    var sorted = Dates.sort(sortMonths);
                    obj['yearmonth'] = sorted[0];
                    obj['monthofrelease'] = sorted[1];
                } else if (message.includes('releas')) {
                    obj['monthofrelease'] = Dates[0];
                } else if (Dates.length == 0) {
                    delete obj["yearmonth"];
                } else {
                    obj['yearmonth'] = Dates[0];
                }
                // aA.push(obj);
                // aA.push(data);
                var sqlQuerries = {
                    A: 'select count(*) from nlptosql.file1',
                    A3B: 'select count(*) from nlptosql.file1 where "" between "" and "" and "" = "" ',
                    A1: `select count(*) from nlptosql.file1 where "" = ""`,
                    A2: `select count(*) from nlptosql.file1 where "" = "" and "" = ""`,
                    AI: 'select count(*) from nlptosql.file1 where "" in ("", "", "")',
                    A3: `select count(*) from nlptosql.file1 where "" = "" and "" = "" and "" = ""`,
                    A4: 'select count(*) from nlptosql.file1 where "" = "" and "" = "" and "" = "" and "" = ""'
                }
                // var MainQuery = sqlQuerries[MLmappeddata];
                require('./util')(sqlQuerries, MLmappeddata, obj, (data) => {
                    db.execute(data, function (err, result) {
                        if (err) throw err;
                        else
                            session.send(JSON.stringify(Object.values(result[0])[0])).endDialog();
                    })
                })
            } else {
                session.send('No matches found!').endDialog();
            }
        }
    })
})

function sortMonths(a, b) {
    var aDate = new Date(a);
    var bDate = new Date(b);
    return aDate.getTime() - bDate.getTime();
}