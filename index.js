/*
    Simple script for managing Discord bot.
    TODO: Simultaneously handle Twitch bot.

*/
const Discord = require('discord.js');//Discord: use to make operations with Discord.
const fs = require('fs');//FileSystem: use to read the token password from textfile.

const client = new Discord.Client();//Create an instance of a Discord Client.

var stop = [];
var respond = new Map();
var channel = 'bot-channel';//Change this to join different channels in the server.

//Populate Prohibited words from 'stop.txt'
fs.readFile('stop.txt', (err, data) => {
    if (err)
        throw err;
    console.log("Reading 'stop.txt'");
    let lines = data.toString().split('\n');
    for(let i = 0; i < lines.length; ++i){
        lines[i] = lines[i].replace(/[\n\r]/g,'');
        if(lines[i].length > 0){
            stop.push(lines[i]);
            console.log(lines[i]);
        }
    }
});
//Populate Response words from 'respond.txt'
fs.readFile('respond.txt', (err,data) => {
    if (err)
        throw err;
    console.log("Reading 'respond.txt'");
    let lines = data.toString().split('\n');
    for(let i = 0; i < lines.length; ++i){
        lines[i] = lines[i].replace(/[\n\r]/g,'');
        let index = lines[i].indexOf(' ');
        if(index > 0){
            lines[i] = lines[i].replace(' ','');
            let first = lines[i].substr(0,index);
            let second = lines[i].substr(index,lines[i].length - (index + 1));
            respond.set(first,second);
            console.log('Respond: [' + first + ', ' + second +']');
        }
    }
});
//Read token from file and ues it to log into bot.
fs.readFile('token.txt', (err, data) => {
    if (err)
        throw err;
    client.login(data.toString());
});

//Print to console when the bot successfully logs:
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
//Discord Listner:
client.on('message', msg => {
    if(msg.channel.name === channel){
        //Check if PROHIBITED words were used:
        for(let i = 0; i < stop.length; ++i){
            if(msg.content.includes(stop[i])){
                //TODO: EDIT post instead of deleting it.
                msg.delete();//Delete the message immediately.
                msg.reply("Nope, not going to happen!");
                return;
            }
        }
        //Split the long string to individual words:
        let arr = msg.content.split(' ');//delimited by WHITESPACE
        if(react.has(arr[0])){
            switch(arr.length){
                case 2:
                    react.get(arr[0])(msg,arr[1],null);
                    break;
                case 3:
                    react.get(arr[0])(msg,arr[1],arr[2]);
                    break;
                default:
                    msg.reply('Invalid command');
            }
        }else if(respond.has(arr[0])){
            msg.reply(respond.get(arr[0]));
            console.log(respond.get(arr[0]))
        }
    }
});
//Commands Array:
var commands = [
    '!purge',
];
//Actions Array:
var actions = [
    (msg,count,user)=>{
        msg.channel.fetchMessages({limit:++count})
        .then(msgs => {
            console.log(`Purged ${msgs.size} messages`);
            if(user)
                msgs = msgs.filter( e => {
                    console.log(e.author + " " + user);
                    return e.author == user
                });
            console.log(`Purged ${msgs.size} messages`);
            for(let i = 0; i < msgs.size; ++i)
                (async () => {
                    await msgs.array()[i].delete(100);
                })();
        })
        .catch(console.error);
    },
];
//Reaction Map:
var react = new Map([
    [commands[0], actions[0]],
]);