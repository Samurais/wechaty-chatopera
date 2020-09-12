#! /bin/bash 
###########################################
#
###########################################

# constants
baseDir=$(cd `dirname "$0"`;pwd)
WEBOT_CHATBOT_ID=
WEBOT_SMTP_SERVICE=
WEBOT_SMTP_USER=
WEBOT_SMTP_PASS=
WEBOT_SMTP_FROM=
WEBOT_OPERATOR_EMAIL=
WEBOT_RESPONSE_PREFIX=

# functions

# main 
[ -z "${BASH_SOURCE[0]}" -o "${BASH_SOURCE[0]}" = "$0" ] || return
cd $baseDir/../app
DEBUG=gitter* npm run dev

