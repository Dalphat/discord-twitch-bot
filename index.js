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
var map = new Map([
    ['!purge',func.purge],
    ['!add',(msg,arr)=>func.add(msg, arr, fs, respond)],
    ['!rem',(msg,arr)=>func.rem(msg, arr, fs, respond)],
]);

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
            if(map.has(arr[0])){
                map.get(arr[0])(msg,arr);
            }else if(respond.has(arr[0])){
                msg.reply(respond.get(arr[0]));
                console.log(respond.get(arr[0]))
            }
        }
    }
});