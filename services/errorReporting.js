const axios = require('axios')

module.exports = {
    SendMessage: async (content) => {
            await axios({ 
                method: 'post',
                url: process.env.DISCORD_WEBHOOK_URL,
                data: {content}
            }).then((res)=> {}).catch((err)=>{
                console.log(err)
            })
    }
}