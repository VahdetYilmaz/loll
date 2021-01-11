const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const moment = require('moment');
var Jimp = require('jimp');
const { Client, Util } = require('discord.js');
const fs = require('fs');
const db = require('quick.db');
const http = require('http');
const express = require('express');
require('./util/eventLoader.js')(client);
const path = require('path');
const snekfetch = require('snekfetch');

const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + "7/24 AKTİF TUTMA İŞLEMİ BAŞARILI");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

var prefix = ayarlar.prefix;

const log = message => {
    console.log(`${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
    if (err) console.error(err);
    log(`${files.length} komut yüklenecek.`);
    files.forEach(f => {
        let props = require(`./komutlar/${f}`);
        log(`Yüklenen komut: ${props.help.name}.`);
        client.commands.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });
});


client.reload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.load = command => {
    return new Promise((resolve, reject) => {
        try {
            let cmd = require(`./komutlar/${command}`);
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};




client.unload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.elevation = message => {
    if (!message.guild) {
        return;
    }
    let permlvl = 0;
    if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
    if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
    if (message.author.id === ayarlar.sahip) permlvl = 4;
    return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
// client.on('debug', e => {
//   console.log(chalk.bgBlue.green(e.replace(regToken, 'that was redacted')));
// });

client.on('warn', e => {
    console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});

client.on('error', e => {
    console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});

client.login(ayarlar.token);

//---------------------------------KOMUTLAR---------------------------------\\

//////////////afk
client.on("message", async message => {
  let prefix = (await db.fetch(`prefix_${message.guild.id}`)) || ayarlar.prefix;

  let kullanıcı = message.mentions.users.first() || message.author;
  let afkdkullanıcı = await db.fetch(`afk_${message.author.id}`);
  let afkkullanıcı = await db.fetch(`afk_${kullanıcı.id}`);
  let sebep = afkkullanıcı;

  if (message.author.bot) return;
  if (message.content.includes(`${prefix}afk`)) return;
  if (message.content.includes(`<@${kullanıcı.id}>`)) {
    if (afkdkullanıcı) {
      message.reply(``);
      db.delete(`afk_${message.author.id}`);
      message.member.setNickname("");
      message.reply(`Etiketlediğiniz Kişi Afk \n Sebep : ${sebep}`);
    }
    if (afkkullanıcı)
      return message.channel.send(
        `**${kullanıcı.tag}** \`${sebep}\` Sebebiyle Afk!`
      );
  }

  if (!message.content.includes(`<@${kullanıcı.id}>`)) {
    if (afkdkullanıcı) {
      message.reply(`Artık AFK Değilsin <a:dikkat:707520390242631804>`);
      db.delete(`afk_${message.author.id}`);
      message.member.setNickname("");
    }
  }
});
 //////eklendim atıldım
client.on('guildDelete', guild => {

let avex = new Discord.MessageEmbed()

.setColor("RED")
.setTitle(" Bot Atıldı ")
.addField("Sunucu Adı:", guild.name)
.addField("Sunucu sahibi", guild.owner)
.addField("Sunucu Sahibi'nin ID'si", guild.ownerID)
.addField("Sunucunun Kurulu Olduğu Bölge:", guild.region)
.addField("Sunucudaki Kişi Sayısı:", guild.memberCount)

   client.channels.cache.get('777123079385907242').send(avex);

});


client.on('guildCreate', guild => {

let avex = new Discord.MessageEmbed()

.setColor("GREEN")
.setTitle(" Bot Eklendi ")
.addField("Sunucu Adı:", guild.name)
.addField("Sunucu sahibi", guild.owner)
.addField("Sunucu Sahibi'nin ID'si", guild.ownerID)
.addField("Sunucunun Kurulu Olduğu Bölge:", guild.region)
.addField("Sunucudaki Kişi Sayısı:", guild.memberCount)

   client.channels.cache.get('777123079385907242').send(avex);

});

//Afk
client.on('message', async message => {

    const ms = require('parse-ms');

  if(message.author.bot) return;

  if(!message.guild) return;

  if(message.content.includes(`${prefix}afk`)) return;

  

  if(await db.fetch(`afk_${message.author.id}`)) {

      var user = message.mentions.users.first();

    let zamans = await db.fetch(`afksüre_${message.author.id}`);

    let timeObj = ms(Date.now() - zamans);

      message.reply(`Artık AFK değilsin, **${timeObj.hours}** Saat **${timeObj.minutes}** Dakika **${timeObj.seconds}** Saniyedir AFKydın`);

        db.delete(`afk_${message.author.id}`);

    db.delete(`afksüre_${message.author.id}`);

  }

  

  var user = message.mentions.users.first();

  if(!user) return;

  var REASON = await db.fetch(`afk_${user.id}`);

  

  if(REASON) {

    let zamant = await db.fetch(`afksüre_${user.id}`);

    let timeObj = ms(Date.now() - zamant);

    const darkcode  = new Discord.MessageEmbed()

     .setDescription(`<@${user.id}> kullanıcısı AFK `)

                  .setColor("2F3136")

                  .addField(`Saat :`,`${timeObj.hours}`,true)

                  .addField(`Dakika :`,`${timeObj.minutes}`,true)

                  .addField(`Saniye :`,`${timeObj.seconds}`,true)

                 .setThumbnail(user.avatarURL())

    message.channel.send(darkcode)

  }

});


client.on("messageDelete", async (message) => {

    if (message.author.bot || message.channel.type == "dm") return;

    let log = message.guild.channels.cache.get(await db.fetch(`log_${message.guild.id}`));

    if (!log) return;

    const embed = new Discord.MessageEmbed()

      .setTitle(message.author.username + " | Mesaj Silindi")

      .addField("Kullanıcı: ", message.author)

      .addField("Kanal: ", message.channel)

      .addField("Mesaj: ", "" + message.content + "")

    log.send(embed)

  })

client.on("messageUpdate", async (oldMessage, newMessage) => {

    let modlog = await db.fetch(`log_${oldMessage.guild.id}`);

    if (!modlog) return;

    let embed = new Discord.MessageEmbed()

    .setAuthor(oldMessage.author.username, oldMessage.author.avatarURL())

    .addField("**Eylem**", "Mesaj Düzenleme")

    .addField("**Mesajın sahibi**", `<@${oldMessage.author.id}> === **${oldMessage.author.id}**`)

    .addField("**Eski Mesajı**", `${oldMessage.content}`)

    .addField("**Yeni Mesajı**", `${newMessage.content}`)

    .setTimestamp()

    .setColor("RANDOM")

    .setFooter(`Sunucu: ${oldMessage.guild.name} - ${oldMessage.guild.id}`, oldMessage.guild.iconURL())

    .setThumbnail(oldMessage.guild.iconURL)

    client.channels.cache.get(modlog).send(embed)

  });

client.on("channelCreate", async(channel) => {

    let modlog = await db.fetch(`log_${channel.guild.id}`);

      if (!modlog) return;

      const entry = await channel.guild.fetchAuditLogs({type: 'CHANNEL_CREATE'}).then(audit => audit.entries.first());

      let kanal;

      if (channel.type === "text") kanal = `<#${channel.id}>`

      if (channel.type === "voice") kanal = `\`${channel.name}\``

      let embed = new Discord.MessageEmbed()

      .setAuthor(entry.executor.username, entry.executor.avatarURL())

      .addField("**Eylem**", "Kanal Oluşturma")

      .addField("**Kanalı Oluşturan Kişi**", `<@${entry.executor.id}>`)

      .addField("**Oluşturduğu Kanal**", `${kanal}`)

      .setTimestamp()

      .setColor("RANDOM")

      .setFooter(`Sunucu: ${channel.guild.name} - ${channel.guild.id}`, channel.guild.iconURL())

      .setThumbnail(channel.guild.iconUR)

      client.channels.cache.get(modlog).send(embed)

      })

client.on("channelDelete", async(channel) => {

    let modlog = await db.fetch(`log_${channel.guild.id}`);

      if (!modlog) return;

      const entry = await channel.guild.fetchAuditLogs({type: 'CHANNEL_DELETE'}).then(audit => audit.entries.first());

      let embed = new Discord.MessageEmbed()

      .setAuthor(entry.executor.username, entry.executor.avatarURL())

      .addField("**Eylem**", "Kanal Silme")

      .addField("**Kanalı Silen Kişi**", `<@${entry.executor.id}>`)

      .addField("**Silinen Kanal**", `\`${channel.name}\``)

      .setTimestamp()

      .setColor("RANDOM")

      .setFooter(`Sunucu: ${channel.guild.name} - ${channel.guild.id}`, channel.guild.iconURL())

      .setThumbnail(channel.guild.iconURL)

      client.channels.cache.get(modlog).send(embed)

      })

client.on("roleCreate", async(role) => {

let modlog = await db.fetch(`log_${role.guild.id}`);

  if (!modlog) return;

  const entry = await role.guild.fetchAuditLogs({type: 'ROLE_CREATE'}).then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

  .setAuthor(entry.executor.username, entry.executor.avatarURL())

  .addField("**Eylem**", "Rol Oluşturma")

  .addField("**Rolü oluşturan kişi**", `<@${entry.executor.id}>`)

  .addField("**Oluşturulan rol**", `\`${role.name}\` **=** \`${role.id}\``)

  .setTimestamp()

  .setFooter(`Sunucu: ${role.guild.name} - ${role.guild.id}`, role.guild.iconURL)

  .setColor("RANDOM")

  .setThumbnail(role.guild.iconURL)

  client.channels.cache.get(modlog).send(embed)

  })

client.on("roleDelete", async(role) => {

let modlog = await db.fetch(`log_${role.guild.id}`);

  if (!modlog) return;

  const entry = await role.guild.fetchAuditLogs({type: 'ROLE_DELETE'}).then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

  .setAuthor(entry.executor.username, entry.executor.avatarURL())

  .addField("**Eylem**", "Rol Silme")

  .addField("**Rolü silen kişi**", `<@${entry.executor.id}>`)

  .addField("**Silinen rol**", `\`${role.name}\` **=** \`${role.id}\``)

  .setTimestamp()

  .setFooter(`Sunucu: ${role.guild.name} - ${role.guild.id}`, role.guild.iconURL)

  .setColor("RANDOM")

  .setThumbnail(role.guild.iconURL)

  client.channels.cache.get(modlog).send(embed)

  })

client.on("emojiCreate", async(emoji) => {

  let modlog = await db.fetch(`log_${emoji.guild.id}`);

  if (!modlog) return;

  const entry = await emoji.guild.fetchAuditLogs({type: 'EMOJI_CREATE'}).then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

  .setAuthor(entry.executor.username, entry.executor.avatarURL())

  .addField("**Eylem**", "Emoji Oluşturma")

  .addField("**Emojiyi oluşturan kişi**", `<@${entry.executor.id}>`)

  .addField("**Oluşturulan emoji**", `${emoji} - İsmi: \`${emoji.name}\``)

  .setTimestamp()

  .setColor("RANDOM")

  .setFooter(`Sunucu: ${emoji.guild.name} - ${emoji.guild.id}`, emoji.guild.iconURL)

  .setThumbnail(emoji.guild.iconURL)

  client.channels.cache.get(modlog).send(embed)

})

  client.on("emojiDelete", async(emoji) => {

  let modlog = await db.fetch(`log_${emoji.guild.id}`);

  if (!modlog) return;

  const entry = await emoji.guild.fetchAuditLogs({type: 'EMOJI_DELETE'}).then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

  .setAuthor(entry.executor.username, entry.executor.avatarURL())

  .addField("**Eylem**", "Emoji Silme")

  .addField("**Emojiyi silen kişi**", `<@${entry.executor.id}>`)

  .addField("**Silinen emoji**", `${emoji}`)

  .setTimestamp()

  .setFooter(`Sunucu: ${emoji.guild.name} - ${emoji.guild.id}`, emoji.guild.iconURL)

  .setColor("RANDOM")

  .setThumbnail(emoji.guild.iconURL)

  client.channels.cache.get(modlog).send(embed)

})

client.on("emojiUpdate", async(oldEmoji, newEmoji) => {

  let modlog = await db.fetch(`log_${oldEmoji.guild.id}`);

  if (!modlog) return;

  const entry = await oldEmoji.guild.fetchAuditLogs({type: 'EMOJI_UPDATE'}).then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

  .setAuthor(entry.executor.username, entry.executor.avatarURL())

  .addField("**Eylem**", "Emoji Güncelleme")

  .addField("**Emojiyi güncelleyen kişi**", `<@${entry.executor.id}>`)

  .addField("**Güncellenmeden önceki emoji**", `${oldEmoji} - İsmi: \`${oldEmoji.name}\``)

  .addField("**Güncellendikten sonraki emoji**", `${newEmoji} - İsmi: \`${newEmoji.name}\``)

  .setTimestamp()

  .setColor("RANDOM")

  .setFooter(`Sunucu: ${oldEmoji.guild.name} - ${oldEmoji.guild.id}`, oldEmoji.guild.iconURL)

  .setThumbnail(oldEmoji.guild.iconURL)

  client.channels.cache.get(modlog).send(embed)

})

client.on("guildBanAdd", async(guild, user) => {

let modlog = await db.fetch(`log_${guild.id}`);

  if (!modlog) return;

  const entry = await guild.fetchAuditLogs({type: "MEMBER_BAN_ADD"}).then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

  .setAuthor(entry.executor.username, entry.executor.avatarURL())

  .addField("**Eylem**", "Yasaklama")

  .addField("**Kullanıcıyı yasaklayan yetkili**", `<@${entry.executor.id}>`)

  .addField("**Yasaklanan kullanıcı**", `**${user.tag}** - ${user.id}`)

  .addField("**Yasaklanma sebebi**", `${entry.reason}`)

  .setTimestamp()

  .setColor("RANDOM")

  .setFooter(`Sunucu: ${guild.name} - ${guild.id}`, guild.iconURL)

  .setThumbnail(guild.iconURL)

  client.channels.cache.get(modlog).send(embed)

})

client.on("guildBanRemove", async(guild, user) => {

let modlog = await db.fetch(`log_${guild.id}`);

  if (!modlog) return;

  const entry = await guild.fetchAuditLogs({type: "MEMBER_BAN_REMOVE"}).then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

  .setAuthor(entry.executor.username, entry.executor.avatarURL())

  .addField("**Eylem**", "Yasak kaldırma")

  .addField("**Yasağı kaldıran yetkili**", `<@${entry.executor.id}>`)

  .addField("**Yasağı kaldırılan kullanıcı**", `**${user.tag}** - ${user.id}`)

  .setTimestamp()

  .setColor("RANDOM")

  .setFooter(`Sunucu: ${guild.name} - ${guild.id}`, guild.iconURL)

  .setThumbnail(guild.iconURL)

  client.channels.cache.get(modlog).send(embed)
})


//////// OTO ROL

client.on("guildMemberAdd", async member => {
  let kanal = await db.fetch(`otoRK_${member.guild.id}`);
  let rol = await db.fetch(`otoRL_${member.guild.id}`);
  let mesaj = db.fetch(`otoRM_${member.guild.id}`);
  if (!rol) return;
//DarkCode
  if (!mesaj) {
    client.channels.cache.get(kanal).send(":loudspeaker: :inbox_tray: Otomatik Rol Verildi Seninle Beraber `" + member.guild.memberCount + "` Kişiyiz! Hoşgeldin! `" + member.user.username + "`");
    return member.roles.add(rol);
  }
//DarkCode
  if (mesaj) {
    var mesajs = mesaj.replace("-uye-", `${member.user}`).replace("-uyetag-", `${member.user.tag}`).replace("-rol-", `${member.guild.roles.cache.get(rol).name}`).replace("-server-", `${member.guild.name}`).replace("-uyesayisi-", `${member.guild.memberCount}`).replace("-botsayisi-", `${member.guild.members.filter(m => m.user.bot).size}`).replace("-bolge-", `${member.guild.region}`).replace("-kanalsayisi-", `${member.guild.channels.size}`);
    member.roles.add(rol);
    return client.channels.cache.get(kanal).send(mesajs);
     }
});

client.on("message", async msg => {
const request = require('node-superfetch');
const db = require('quick.db');
const ms2 = require('parse-ms')
let timeout = 600000 //süresini dilediğiniz gibi kısaltabilirsiniz.
let dakdest = 1
let i = db.fetch(`goldsure_${msg.author.id}`)
          if (db.has(`goldsure_${msg.author.id}`) == true) {
    if (dakdest !== null && timeout - (Date.now() - dakdest) > 0) {
        let time = ms2(timeout - (Date.now() - dakdest));
    } else {
  if(msg.author.bot) return;   
  if (msg.content.length > 64) {
  var embed = new Discord.MessageEmbed()
  .setAuthor(`DarkCode`,`${msg.author.avatarURL || msg.author.displayAvatarURL}`)
  .setDescription(`${client.emojis.cache.get("EMOJİ İD")} Hizzaya Geçin! Burada Bir Gold Üye Belirdi! <@${msg.author.id}>`)
  .setColor("RANDOM")
  msg.channel.send(embed).then(message => {
    message.delete(4000)
  })

  }
};
          }
   else if (i == undefined) {           
          }
          if (!i) return;
        
});

////////SA AS 

client.on("message", async msg => {
 
 
  const i = await db.fetch(`ssaass_${msg.guild.id}`);
    if (i == 'acik') {
      if (msg.content.toLowerCase() == 'sa' || msg.content.toLowerCase() == 's.a' || msg.content.toLowerCase() == 'selamun aleyküm') {
          try {
 
                  return msg.reply('**<a:yildizz:768859233382694982> Aleyküm Selam, Hoşgeldin :)** ')
          } catch(err) {
            console.log(err);
          }
      }
    }
    else if (i == 'kapali') {
   
    }
    if (!i) return;
 
    });
///küfür///
client.on("message", async msg => {
  if (msg.author.bot) return;
  if (msg.channel.type === "dm") return;

  let i = await db.fetch(`küfürFiltre_${msg.guild.id}`);
  if (i == "acik") {
    const küfür = [
      "amcık",
      "yarrak",
      "orospu",
      "piç",
      "sikerim",
      "sikik",
      "amına",
      "pezevenk",
      "yavşak",
      "ananı",
      "anandır",
      "orospu",
      "evladı",
      "göt",
      "pipi",
      "sokuk",
      "yarak",
      "bacını",
      "karını",
      "amk",
      "aq",
      "mk",
      "anaskm"
    ];
    if (küfür.some(word => msg.content.toLowerCase().includes(word))) {
      try {
        if (!msg.member.hasPermission("MANAGE_WEBHOOKS")) {
          msg.delete();
          let embed = new Discord.MessageEmbed()
            .setColor(0xffa300)
            .setFooter("Cowboy Küfür Sistemi", client.user.avatarURL())
            .setAuthor(
              msg.guild.owner.user.username,
              msg.guild.owner.user.avatarURL()
            )
            .setDescription(
              "Cowboy, " +
                `***${msg.guild.name}***` +
                " adlı sunucunuzda küfür yakaladım."
            )
            .addField(
              "Küfür Eden Kişi",
              "Kullanıcı: " + msg.author.tag + "\nID: " + msg.author.id,
              true
            )
            .addField("Engellenen mesaj", msg.content, true)
            .setTimestamp();
          msg.guild.owner.user.send(embed);
          return msg.channel
            .send(
              `${msg.author}, Küfür Etmek Yasak! Senin Mesajını Özelden Kurucumuza Gönderdim.`
            )
            .then(msg => msg.delete(25000));
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  if (!i) return;
});
///reklam-engelle///
client.on("message", async msg => {
  if (msg.author.bot) return;
  if (msg.channel.type === "dm") return;

  let i = await db.fetch(`reklamFiltre_${msg.guild.id}`);
  if (i == "acik") {
    const reklam = [
      "discord.app",
      "discord.gg",
      "invite",
      "discordapp",
      "discordgg",
      ".com",
      ".net",//Lord Creative
      ".xyz",
      ".tk",
      ".pw",
      ".io",
      ".me",
      ".gg",
      "www.",
      "https",
      "http",
      ".gl",
      ".org",
      ".com.tr",
      ".biz",
      ".party",
      ".rf.gd",
      ".az"
    ];
    if (reklam.some(word => msg.content.toLowerCase().includes(word))) {
      try {
        if (!msg.member.hasPermission("MANAGE_GUILD")) {
          msg.delete();
          let embed = new Discord.MessageEmbed()
            .setColor(0xffa300)
            .setFooter(
              " Reklam engellendi.",
              client.user.avatarURL()
            )
            .setAuthor(
              msg.guild.owner.user.username,
              msg.guild.owner.user.avatarURL()
            )
            .setDescription(
              " Cowboy Reklam Sistemi, " +
                `**${msg.guild.name}**` +
                " Adlı Sunucuda Reklam Yakaladım."
            )
            .addField(
              "Reklamı yapan kişi",
              "Kullanıcı: " + msg.author.tag + "\nID: " + msg.author.id,
              true
            )
            .addField("Engellenen mesaj", msg.content, true)
            .setTimestamp();
          msg.guild.owner.user.send(embed);
          return msg.channel
            .send(`${msg.author.tag}, Reklam Yapmak Yasak!`)
            .then(msg => msg.delete(25000));
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  if (!i) return;
});
//otorol///
client.on("guildMemberAdd", async (member, guild, message) => {
  let role = db.fetch(`otorolisim_${member.guild.id}`);
  let otorol = db.fetch(`autoRole_${member.guild.id}`);//Lord Creative
  let i = db.fetch(`otorolKanal_${member.guild.id}`);
  if (!otorol || otorol.toLowerCase() === "yok") return;
  else {
    try {
      if (!i) return;
      if (!role) {
        member.addRole(member.guild.roles.get(otorol));
        var embed = new Discord.RichEmbed()
          .setDescription(
            "**Sunucuya Yeni Katılan** @" +
              member.user.tag +
              " **Kullanıcısına** <@&" +
              otorol +
              ">  **Rolü verildi:white_check_mark:**"
          )
          .setColor("0x36393E")
          .setFooter(`wonders Otorol Sistemi`);
        member.guild.channels.get(i).send(embed);
      } else if (role) {
        member.addRole(member.guild.roles.get(otorol));
        var embed = new Discord.RichEmbed()
          .setDescription(
            `**Sunucuya Yeni Katılan** \`${member.user.tag}\` **Kullanıcısına** \`${role}\` **Rolü verildi. <a:blobjoining:696373472431177781>**`
          )
          .setColor("0x36393E")
          .setFooter(`Cowbot Otorol Sistemi`);
        member.guild.channels.get(i).send(embed);
      }
    } catch (e) {
      console.log(e);
    }
  }
});

//////otorol 
client.on("guildMemberAdd", async member => {
  let kanal = await db.fetch(`otoRK_${member.guild.id}`);
  let rol = await db.fetch(`otoRL_${member.guild.id}`);
  let mesaj = db.fetch(`otoRM_${member.guild.id}`);
  if (!rol) return;

  if (!mesaj) {
    client.channels.get(kanal).send(":loudspeaker: :inbox_tray: Otomatik Rol Verildi Seninle Beraber `" + member.guild.memberCount + "` Kişiyiz! Hoşgeldin! `" + member.user.username + "`");
    return member.addRole(rol);
  }

  if (mesaj) {
    var mesajs = mesaj.replace("-uye-", `${member.user}`).replace("-uyetag-", `${member.user.tag}`).replace("-rol-", `${member.guild.roles.get(rol).name}`).replace("-server-", `${member.guild.name}`).replace("-uyesayisi-", `${member.guild.memberCount}`).replace("-botsayisi-", `${member.guild.members.filter(m => m.user.bot).size}`).replace("-bolge-", `${member.guild.region}`).replace("-kanalsayisi-", `${member.guild.channels.size}`);
    member.addRole(rol);
    return client.channels.get(kanal).send(mesajs);
     }
});
if(!db.get("giveaways")) db.set("giveaways", []);

const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {

    async getAllGiveaways(){
        return db.get("giveaways");
    }

    async saveGiveaway(messageID, giveawayData){
        db.push("giveaways", giveawayData);
        return true;
    }

    async editGiveaway(messageID, giveawayData){
        const giveaways = db.get("giveaways");
        const newGiveawaysArray = giveaways.filter((giveaway) => giveaway.messageID !== messageID);
        newGiveawaysArray.push(giveawayData);
        db.set("giveaways", newGiveawaysArray);
        return true;
    }

    async deleteGiveaway(messageID){
        const newGiveawaysArray = db.get("giveaways").filter((giveaway) => giveaway.messageID !== messageID);
        db.set("giveaways", newGiveawaysArray);
        return true;
    }
  
  
};
const manager = new GiveawayManagerWithOwnDatabase(client, {
  storage: false,
  updateCountdownEvery: 5000,
  default: {
    botsCanWin: false,
    embedColor: "#0a99ff",
    reaction: "🎉"
  }
});
client.giveawaysManager = manager;