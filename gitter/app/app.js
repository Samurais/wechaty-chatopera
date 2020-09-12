/**
 * Wechat Bot Service
 */
const debug = require("debug")("webot:app");
const config = require("./config/environment");
const { Wechaty, Message } = require("wechaty");
const { PuppetGitter } = require("wechaty-puppet-gitter");
const { sendEmail } = require("./services/mail.service");
// const bot = Wechaty.instance({ profile: config.default.DEFAULT_PROFILE });

// handle uncaughtException
process.on("uncaughtException", function (err) {
  console.error(err);
});

process.on("unhandledRejection", function (err, promise) {
  console.error(
    "Unhandled rejection (promise: ",
    promise,
    ", reason: ",
    err,
    ")."
  );
});

// bot
//   .on("login", (user) => {
//     console.log("Bot", `${user.name()} logined`);
//     sendEmail(
//       conf.admin.email,
//       `【webot完成登入】名字：${user.name()}，聊天机器人ID：${
//         conf.chatbotID
//       } [EOM]`,
//       ``
//     );
//   })
//   .on("logout", (user) => {
//     console.log("Bot", `${user.name()} logouted`);
//     if (conf.smtp.service) {
//       sendEmail(
//         conf.admin.email,
//         `【webot登出】聊天机器人ID ${conf.chatbotID} [EOM]`,
//         ``
//       );
//     }
//   })
//   .on("error", (e) => {
//     console.log("Bot", "error: %s", e);
//   })
//   .on("scan", (url, code) => {
//     if (!/201|200/.test(String(code))) {
//       let loginUrl = url.replace(/\/qrcode\//, "/l/");

//       if (conf.smtp.service) {
//         QRCode.toDataURL(loginUrl, function (err, qrUrl) {
//           sendEmail(
//             conf.admin.email,
//             `【webot登录】聊天机器人ID ${conf.chatbotID}`,
//             `扫描附件二维码，登录。 <br> <img width="300" src="${qrUrl}"/>`
//           );
//           console.log("Login bot with QR Code sent to " + conf.admin.email);
//         });
//       } else {
//         QrcodeTerminal.generate(loginUrl, function (qrcode) {
//           console.log(
//             `${url}\n[${code}] Scan QR Code in above url to login: \n ${qrcode}`
//           );
//         });
//       }
//     }
//   })
//   // 被其他用户主动添加为好友
//   .on("friend", (contact, request) => {
//     console.log("on friend request");
//     if (request) {
//       request.accept();
//       // contact.say(WELCOME_TXT);
//       debug(`${contact.name()} accepted.`);
//     }
//   })
//   .on("message", async (m) => {
//     try {
//       debug("message: %j", m);
//       if (m.self()) {
//         return;
//       }
//       await brain.handle(bot.self().name(), m);
//     } catch (e) {
//       console.error("Bot", "on(message) exception: %s", e);
//     }
//   });

// bot.start().catch((e) => {
//   log.error("Bot", "init() fail: %s", e);
//   bot.stop();
//   process.exit(-1);
// });

// main function
async function main() {
  const brain = require("./services/brain.service");

  if (!config.gitter.token) throw new Error("Invalid Token");

  const puppet = new PuppetGitter({ token: config.gitter.token });
  const bot = new Wechaty({ puppet });

  bot.on("error", (e) => {
    console.log("Bot", "error: %s", e);
  });

  bot.on("message", async (m) => {
    try {
      debug("message: %j", m);
      if (m.self()) {
        return;
      }
      //   await brain.handle(bot.self().name(), m);
    } catch (e) {
      console.error("Bot", "on(message) exception: %s", e);
    }
  });

  await bot.start();
  console.log("Bot started.");
}

// on main entry
if (require.main === module) {
  (async function () {
    await main();
    // process.exit(0);
  })();
}
