/*
    Simple script for managing Discord bot.
    TODO: Simultaneously handle Twitch bot.

*/
const Discord = require('discord.js');//Discord: use to make operations with Discord.
const fs = require('fs');//FileSystem: use to read the token password from textfile.
const func = require('./function');

const client = new Discord.Client();//Create an instance of a Discord Client.

var stop = [];
var respond = new Map();
var channel = [];

//Populate Prohibited words from 'stop.txt'
fs.readFile('stop.txt', (err, data) => func.stop(err,data,stop));
//Populate Response words from 'respond.txt'
fs.readFile('respond.txt', (err,data) => func.respond(err,data,respond));

//Read channels from file to enable bot access to particular channels.
fs.readFile('channel.txt', (err, data) => func.channel(err,data,channel));

//Read token from file to enable logging bot client.
fs.readFile('token.txt', (err, data) => func.login(err,data,client));

//Print to console when the bot successfully logs:
client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));

//Discord Listner:
client.on('message', msg => {
    if(channel.indexOf(msg.channel.name) != -1){
        //Check if PROHIBITED words were used:
        if(!msg.author.bot){
            for(let i = 0; i < stop.length; ++i){
                if(msg.content.includes(stop[i])){
                    //TODO: EDIT post instead of deleting it.
                    msg.delete();//Delete the message immediately.
                    msg.reply(`Your message deleted! \nReason: Usage of banned word: || ${stop[i]} ||`);
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
                        break;
                }
            }else if(respond.has(arr[0])){
                msg.reply(respond.get(arr[0]));
                console.log(respond.get(arr[0]))
            }
        }
    }
});
//Commands Array:
var commands = [
    '!purge',
    '!add',
    '!remove'
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
    (msg,key,value)=>{
        console.log(key + ' ' + value);
        if(key && value){
            key = key.replace(/[\n\r]/g,'');
            value = value.replace(/[\n\r]/g,'');
            if(key.length > 0 && value.length > 0){
                key = '!' + key;
                console.log(key + ' ' + value);
                respond.set(key,value);
                fs.appendFile('respond.txt', key + ' ' + value + '\n', (err)=>{
                    if(err)
                        console.log("Invalid response command!");
                    console.log('Successfully added: '+key+' '+value);
                    msg.channel.send('Successfully added: '+key+' '+value);
                });
            }
        }
    },
];
//Reaction Map:
var react = new Map([
    [commands[0], actions[0]],
    [commands[1], actions[1]],
    [commands[2], actions[2]],
]);