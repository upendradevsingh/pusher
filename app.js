const webpush = require('web-push');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))

// parse application/json
app.use(bodyParser.json())

app.all("*", (req, res, next) => {
    console.log("Setting up cors");
    res.header("Access-Control-Allow-Origin", "http://localhost");
    return next();
});
app.get('/api/hc', (req, res) => {
    //const vapidKeys = webpush.generateVAPIDKeys();

		if(!global.vapidKeys){
				global.vapidKeys  = webpush.generateVAPIDKeys();
		}

		const { subsData, vapidKeys } = global;

    res.send({subsData, vapidKeys});
});

app.get('/api/nofifyAll', (req, res) => {
    let data;
		let { vapidKeys } = global;
    for (let key in global.subsData) {
        data = global.subsData[key];
        break;
    }

		webpush.setVapidDetails(
  		'http://localhost',
  		vapidKeys.publicKey,
  		vapidKeys.privateKey
		);

		webpush.setGCMAPIKey('123456789');

    // webpush.sendNotification(data, {
    // 	notification: {
    // 		title: 'Server Push'
    // 	}
    // })
    webpush.sendNotification(data, req.param('msg') || 'Sever Push')
    .then(() => {
            res.send({
                sucess: true
            })
        })
        .catch(function(err) {
            res.status(500);
            res.setHeader('Content-Type', 'application/json');
						console.log(err);
            res.send(JSON.stringify({
                error: {
                    id: 'unable-to-send-messages',
                    message: `We were unable to send messages to all subscriptions : ` +
                        `'${err.message}'`
                }
            }));
        });

});

app.post('/api/save-subscription/', (req, res) => {
    const data = req.body;
    global.subsData = global.subsData || {};
    global.subsData[data.keys.p256dh] = data;

    const vapidKeys = webpush.generateVAPIDKeys();
    res.send({
        success: true
    });

});


app.listen(3000, () => {
    console.log('Pusher app listening on port 3000');
})
