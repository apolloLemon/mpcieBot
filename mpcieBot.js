const Discord = require('discord.js');
const fs = require('fs');
const links_DATAloc = 'data/links.json';

const bot = new Discord.Client();
const prefix = "::";
const modePrefix = "~";
const modName = "botteam";
var input;
var connected = false;

const r = "r+";
var buf = new Buffer(1024);

if (!connected) {
	LogOn();
}

bot.on('ready', ready =>{
	connected = true;
	console.log("Hello World");
});

bot.on('disconnect', (erMsg, code) =>{
	console.log("-=- Disconnect from Discord -- code: ", code, " -- erMsg: ", erMsg, " -=-")
	connected = false;
});

bot.on('message', message => {
	let modRole = message.guild.roles.find("name", modName);
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix));

	input = message;
	let inputC = message.content.toUpperCase();
	let command = inputC.split(" ")[0];
	command = command.slice(prefix.length);
	let args = inputC.split(" ").slice(1);

	switch (command) {
		case "HELLO":
			SayHello();
			break;
		case "ROLL":
			DiceRoll(args);
			break;
		case "HELP":
			Help(args);
			break;
		case "LINK":
		case "LINKS":
			LinkTo(args);
			break;
		default:
			break;
	}
});

function Help () {
	input.reply('Bonjour, je suis mpcieBot.\nenvois ::roll pour rouler un Dé');
}

function SayHello () {
	var greetings = ["Hello", "Hi", "Hey", "Howdy"];
	var greetingNum = Math.floor(Math.random()*greetings.length);
	var greeting = greetings[greetingNum];
	input.reply(greeting);
}

function DiceRoll (args) {
	var roll=0;
	//var diceSize=6;
	//var diceNum=1;
	
	if ((args[0] > 9999 || args[1] > 9999)) { // && args[2] != modePrefix+"F"
		var forcer = modePrefix+"F";
		var forcerIndex = args.indexOf(forcer);
		if (forcerIndex != -1) {
			input.reply("you've forced large numbers...\nif you're using lots of dice, prepare to wait");
			args.splice(forcerIndex,1);
		} else return input.reply("please use smaller/fewer dice.");	
	}

	if (args.length==0){
		roll = Dice(6);
	} else if (args.length==1) {
		roll = Dice(args[0]);
	} else if (args.length==2) {
		for (var i=0;i<args[1];i++) {
			roll += Dice(args[0]);
		}
	}

	input.reply(" rolled "+roll);
};

function Dice (arg) {
	if (arg > 1) {
		var rng = Math.floor(Math.random()*arg)+1;
		return rng;
	} else if (arg == 1) {
		var rng = (Math.round(Math.random()*1000))/1000;
		return rng;
	} else if (arg == "BINARY" || arg == (modePrefix+"B")) {
		var rng = Math.round(Math.random());
		return rng;
	} else {
		input.channel.send("Please use int for dice amount and quantity");
	}		
};

function LinkTo (args) {
	var LinkTypes = ["website", "youtube", "github", "forum"];
	if (args.length == 0){
		return input.channel.send("What do you want links for?");
	} else if (args.length == 1) {
		LinkLoad(args[0], [LinkTypes[0], LinkTypes[1], LinkTypes[2], LinkTypes[3]]);
	} else if (args.length > 1) {
		var singleLinks = args.slice(1);
		var badSingleLinks = 0; 
		for (var i=0;i<singleLinks.length; i++) {
			if (singleLinks[i] == modePrefix+"W"){
				singleLinks[i] = LinkTypes[0];
				//correctSingleLinks ++;
			} else if (singleLinks[i] == modePrefix+"YT") {
				singleLinks[i] = LinkTypes[1];
				//correctSingleLinks ++;
			} else if (singleLinks[i] == modePrefix+"G") {
				singleLinks[i] = LinkTypes[2];
				//correctSingleLinks ++;
			} else if (singleLinks[i] == modePrefix+"F") {
				singleLinks[i] = LinkTypes[3];
			} else {
				input.channel.send("Invalid LinkType: "+singleLinks[i]);
				singleLinks[i] = "skip";
				badSingleLinks++;
			}
		}

		if (badSingleLinks == 0 || singleLinks.length != 0){
			LinkLoad(args[0], singleLinks);
		}
		/*var correctSingleLinksARR = [];
		for (var i = 0; i<correctSingleLinks; i++) {
			outText += singleLinks[i]
		};*/
	}
}

function LinkLoad (linkgroup, singleLinks) {
	// var name = "Matthew";
	// var singleLink = "youtube";
	fs.readFile(links_DATAloc, 'utf8', function (err, data) {
		if (err) throw err;
		var links_DATA = JSON.parse(data);

		if (links_DATA[linkgroup] == undefined) {
			return input.channel.send(`no such LinkGroup: ${linkgroup} does not exist`);
		}

		var outText = "";
		for (var i=0;i<singleLinks.length; i++) {
			if (!singleLinks[i] != "skip") {
				var linkToReturn = links_DATA[linkgroup][singleLinks[i]];
				if (linkToReturn != undefined) {
					outText += linkToReturn;
					//console.log("adding Link");
					if (i<singleLinks.length-1){
						outText +="\n";
						//console.log("line break");
					}
				}
			}
		}
		input.channel.send(outText);
	});
}

function LogOn () {
	bot.login('');
}