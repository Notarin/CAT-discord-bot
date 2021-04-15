const Discord = require('discord.js');//activate discords api library
const client = new Discord.Client();//activate discord api client
const token = require("./token.json");//read token
const config = require("./config.json");//read config
const axios = require("axios").default;//activate axios
const git = require('simple-git');

//Functions
async function callback(interaction, type, content) {
  await client.api.interactions(interaction.id, interaction.token).callback.post(
    {data: {type: type, data: {content: content}}}
  );
}

//api call for player count
function playercount() {
  axios.request({method: 'POST',url: 'https://6178d.playfabapi.com/Client/LoginWithCustomID',headers: {'Content-Type': 'application/json'},data: {CustomId: 'CardsTankardsDiscordBot', TitleId: '6178D'}}).then(function (response) {
    var ticket = response.data.data.SessionTicket;
    axios.request({method: 'POST',url: 'https://6178d.playfabapi.com/Client/ExecuteCloudScript',headers: {'Content-Type': 'application/json','X-Authorization': ticket},data: {FunctionName: 'getPlayerCountOnline'}}).then(function (response) {
      var count = response.data.data.FunctionResult;
      switch (response.data.data.FunctionResult) {
        case 0:
        var right = " players in the tavern"
        break;
        case 1:
        var right = " player in the tavern"
        break;
        default:
        var right = " players in the tavern"
        break;
      }
      client.user.setPresence({ activity: { name: response.data.data.FunctionResult.toString() + right, type: 'WATCHING' }, status: 'online'});
    }).catch(function (error) {console.error(error);});
  }).catch(function (error) {console.error(error);});
}

//when the bot is online
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  playercount();
  setInterval(playercount, 60000);
});

//when the bot recieves a slash command
client.ws.on('INTERACTION_CREATE', async interaction => {
  const command = interaction.data.name.toLowerCase();
  const args = interaction.data.options;
  switch (command) {
    case 'ping':
    callback(interaction, 4, "PONG!!!");
    break;
    case 'lfg':
    client.guilds.fetch(interaction.guild_id)
    .then(function (response) {
      var guild = response;
      guild.members.fetch(interaction.member.user.id)
      .then(function (response) {
        var user = response
        if (interaction.member.roles.includes(config.lfgrole)) {
          user.roles.remove(config.lfgrole, "user ran lfg command")
          var say = "You\'re no longer looking for a group!"
        }
        if (!interaction.member.roles.includes(config.lfgrole)) {
          user.roles.add(config.lfgrole, "user ran lfg command")
          var say = "You\'re now looking for a group!"
        }
        callback(interaction, 4, say)
      })
    })
    break;
  }
  if (interaction.member.user.id == config.owner) {
    switch (command) {
      case 'restart':
      callback(interaction, 4, "brb...").then(() => process.exit(0));
      break;
      case 'update':
      const log = await git().pull();
      callback(interaction, 4, "```json\n" + JSON.stringify(log, null, '\t') + "```");
      break;
    }
  }
});

//use bot token to login
client.login(token.token);
