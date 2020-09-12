/**
 * Superbrain Service Client
 */
const _ = require("lodash");
const path = require("path");
const Microloom = require("microloom");
const { MsgType, Message } = require("wechaty");
const { createWriteStream } = require("fs");
const debug = require("debug")("webot:brain");
const { sendEmail } = require("./mail.service");
const sanitize = require("sanitize-filename");
const config = require("../config/environment");
const { Chatbot } = require("@chatopera/sdk");

const app = new Microloom();
var chatbot = new Chatbot(config.bot.clientId, config.bot.secret);

/**
 * download media data and resolve group, text, etc.
 */
app.use(async function (ctx, next) {
  const m = ctx.message;
  ctx.room = m.room();
  ctx.sender = m.from().name();
  ctx.group = ctx.room ? ctx.room.topic() : null; // 微信群
  ctx.mentioned = false; // 是否被@
  ctx.recipient = null;
  ctx.textMessage = m.content(); //
  // downloaded file path locally
  ctx.mediaMessageResource = null;

  // 多媒体消息[图片, 视频, 小视频, 声音]
  if (
    m.type() === MsgType.IMAGE ||
    // || m.type() === MsgType.EMOTICON
    m.type() === MsgType.VIDEO ||
    m.type() === MsgType.VOICE ||
    m.type() === MsgType.MICROVIDEO
    // || m.type() === MsgType.APP
    // || (m.type() === MsgType.TEXT && m.typeSub() === MsgType.LOCATION)  // LOCATION
  ) {
    debug("agent [%s] save [%s] %s", ctx.botName, m.type(), m.filename());
    try {
      ctx.mediaMessageResource = await saveMediaFile(m);
    } catch (e) {
      console.error("saveMediaFile", e);
    }

    if (m.type() === MsgType.VOICE) {
      ctx.type = "voiceMessage";
    } else if (m.type() === MsgType.IMAGE) {
      ctx.type = "imageMessage";
    } else if (m.type() === MsgType.VIDEO) {
      ctx.type = "videoMessage";
    } else {
      ctx.type = "otherMessage";
    }
  } else if (m.type() === MsgType.TEXT) {
    ctx.type = "textMessage";
  }
  await next();
  return ctx;
});

/**
 * handle common tasks
 * invite friend to group, send help.
 */
app.use(async function (ctx, next) {
  /**
   * 群聊：在微信群里 @我
   */
  if (ctx.room && _.includes(ctx.textMessage, "@" + ctx.botName)) {
    // a group message and @me
    ctx.textMessage = _.trim(_.replace(ctx.textMessage, "@" + ctx.botName, "")); // 改写 query
    ctx.mentioned = true;
    debug(
      "群聊：在微信群里 @我[%s], %s: %s",
      ctx.room,
      ctx.sender,
      ctx.textMessage
    );
    await next();
  } else if (ctx.room) {
    /**
     * 群聊：没有@我
     */
    // a group message but not @me
    debug("群聊：没有@我 [%s], %s: %s", ctx.room, ctx.sender, ctx.textMessage);
    const monitored = _.some(config.filters.group_prefix, (val) => {
      if (ctx.group.startsWith(val)) {
        return true;
      }
    });
    if (monitored) {
      await next();
    }
  } else if (!ctx.room) {
    /**
     * 私聊：普通消息
     */
    // 回复私聊消息
    debug("私聊：普通消息", ctx.textMessage);
    await next();
  } else {
    /**
     * 未知类型消息
     */
    warn("未知类型消息", "Unknown message");
  }
});

/**
 * 请求 Superbrain 服务
 *
 */
app.use(async function (ctx, next) {
  switch (ctx.type) {
    case "textMessage":
      // 发送 adapter client
      const nickName = ctx.sender;
      const openId = ctx.message.rawObj.FromUserName;
      const textMessage = ctx.textMessage;

      debug(
        "chatbot send: %s, %s, %s, %s",
        config.bot.clientId,
        openId,
        nickName,
        textMessage
      );
      if (chatbot) {
        var reply = await chatbot.conversation(openId, textMessage);

        // 回复：答案存在而且不是fallback，用户没有被屏蔽
        if (
          reply &&
          !reply.logic_is_fallback &&
          reply.service.provider !== "mute"
        ) {
          replyTo(
            ctx.message,
            reply.string,
            ctx.botName,
            ctx.group,
            ctx.sender,
            ctx.room
          );
        }
        await next();
      } else {
        console.log("adapter-server client is not inited.");
      }
      break;
    default:
      debug("ignore message ...");
  }
});

/**
 * Handle Message from Wechat
 * @param ctx.botName  string
 * @param m Message
 */
async function handle(botName, m) {
  return await app.handle({
    botName: botName,
    message: m,
  });
}

/**
 * 发送文字消息到微信群或者人
 * @param m  Wechaty.Message
 * @param response string
 * @param botName string
 * @param group string| null
 * @param sender string
 * @param room Wechaty.Room | null
 */
function replyTo(m, response, botName, group, sender, room) {
  m.say(response);
  debug(
    "reply",
    (room ? "[" + room.topic() + "]" : "") +
      "<" +
      m.from().name() +
      ">" +
      ":" +
      m.toStringDigest() +
      "<< " +
      response
  );
}

/**
 * Save media into local storage
 * @param message : Wechaty.Message
 */
function saveMediaFile(message) {
  const filename = sanitize(message.filename());
  const filepath = path.join(config.root, "..", "tmp", filename);
  debug("Media File local filename: " + filepath);
  const fileStream = createWriteStream(filepath);

  return new Promise((resolve, reject) => {
    debug("start to readyStream()");
    message
      .readyStream()
      .then((stream) => {
        stream.pipe(fileStream).on("close", () => {
          debug("finish readyStream()");
          resolve(filepath);
        });
      })
      .catch((e) => {
        console.error("stream error:" + e);
        reject(e);
      });
  });
}

exports = module.exports = {
  handle,
  replyTo,
};
