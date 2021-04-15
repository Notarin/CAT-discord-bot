const Discord = require('discord.js');//activate discords api library
const client = new Discord.Client();//activate discord api client
const token = require("./token.json");//read token
const config = require("./config.json");//read config
const axios = require("axios").default;//activate axios

//Functions

//api call for player count
function playercount() {
  axios.request({method: 'POST',url: 'https://6178d.playfabapi.com/Client/LoginWithCustomID',headers: {'Content-Type': 'application/json'},data: {CustomId: 'CardsTankardsDiscordBot', TitleId: '6178D'}}).then(function (response) {
    var ticket = response.data.data.SessionTicket;
    axios.request({method: 'POST',url: 'https://6178d.playfabapi.com/Client/ExecuteCloudScript',headers: {'Content-Type': 'application/json','X-Authorization': ticket},data: {FunctionName: 'getPlayerCountOnline'}}).then(function (response) {
      var count = response.data.data.FunctionResult;
      switch (count) {
        case 0:
        client.user.setPresence({ activity: { name: count.toString() + " players in the tavern", type: 'WATCHING' }, status: 'online'});
        break;
        case 1:
        client.user.setPresence({ activity: { name: count.toString() + " player in the tavern", type: 'WATCHING' }, status: 'online'});
        break;
        default:
        client.user.setPresence({ activity: { name: count.toString() + " players in the tavern", type: 'WATCHING' }, status: 'online'});
        break;
      }
    }).catch(function (error) {console.error(error);});
  }).catch(function (error) {console.error(error);});
}

//when the bot is online
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  setInterval(playercount, 60000);
});

//when the bot recieves a slash command
client.ws.on('INTERACTION_CREATE', async interaction => {
  const command = interaction.data.name.toLowerCase();
  const args = interaction.data.options;
  if (command === 'ping'){
    client.api.interactions(interaction.id, interaction.token).callback.post({
      data: {type: 4, data: {content: "PONG!!!"}}
    })
  }
  if (command === 'lfg'){
    client.guilds.fetch(interaction.guild_id)
    .then(function (response) {
      var guild = response;
      guild.members.fetch(interaction.member.user.id)
      .then(function (response) {
        var user = response
        if (interaction.member.roles.includes(config.lfgrole)) {
          user.roles.remove(config.lfgrole, "user ran lfg command")
          client.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
              type: 4,
              data: {
                content: "You\'re no longer looking for a group!"
              }
            }
          })
        }
        if (!interaction.member.roles.includes(config.lfgrole)) {
          user.roles.add(config.lfgrole, "user ran lfg command")
          client.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
              type: 4,
              data: {
                content: "You\'re now looking for a group!"
              }
            }
          })
        }
      })
    })
  }
  if (command === 'restart'){
    if (interaction.member.user.id == config.owner) {
      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: "brb..."
          }
        }
      })
      .then(function(result) {
        process.exit(0);
      });
    }
    if (!interaction.member.user.id == config.owner) {
      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: "no..."
          }
        }
      })
    }
  }
});

//use bot token to login
client.login(token.token);
