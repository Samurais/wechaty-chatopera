"use strict";

var path = require("path");
var _ = require("lodash");

var env = process.env.NODE_ENV || "development";
env = env.toLowerCase();

var all = {
  env: env,
  node: {
    port: 8025,
  },
  root: path.normalize(path.join(__dirname, "..", "..")),
  /* unique chatbot ID in superbrain */
  /* 运营者信息 */
  admin: {
    email: null, // string 邮箱，用于接收登录二维码或其他信息
  },
  gitter: {
    token: null,
  },
  smtp: {
    service: null,
    auth: {
      user: null,
      pass: null,
    },
    from: null,
  },
  filters: {
    group_prefix: [],
  },
  bot: {
    provider: "https://bot.chatopera.com",
    clientId: null,
    secret: null,
  },
};

var config = all;

try {
  config = _.merge(all, require("./" + env + ".js") || {});
} catch (e) {
  console.log("WARN: ignore ", e);
}

if (process.env.BOT_CLIENT_ID) {
  config.bot.clientId = process.env.BOT_CLIENT_ID;
}

if (process.env.BOT_CLIENT_SECRET) {
  config.bot.secret = process.env.BOT_CLIENT_SECRET;
}

if (process.env.SMTP_SERVICE) {
  config.smtp.service = process.env.SMTP_SERVICE;
}

if (process.env.SMTP_USER) {
  config.smtp.auth.user = process.env.SMTP_USER;
}

if (process.env.SMTP_PASS) {
  config.smtp.auth.pass = process.env.SMTP_PASS;
}

if (process.env.SMTP_FROM) {
  config.smtp.from = process.env.SMTP_FROM;
}

if (process.env.ADMIN_EMAIL) {
  config.admin.email = process.env.ADMIN_EMAIL;
}

if (process.env.RESPONSE_GROUP_PREFIX) {
  config.filters.group_prefix = process.env.RESPONSE_GROUP_PREFIX.split(",");
}

module.exports = config;
