const axios = require('axios')

module.exports = {
    SendMessage: async (content) => {
        if (process.env.NODE_ENV === 'production') {
            await axios({ 
                method: 'post',
                url: process.env.DISCORD_WEBHOOK_URL,
                data: {content}
            }).then((res)=> {}).catch((err)=>{
                console.log(err)
            })
    }  else {

    }
}
}