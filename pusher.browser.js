// Push notification module

// ONLY FOR TESTING PURPOSE

/* jshint ignore:start */
(function () {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(sw => {
                console.log('Service worker registered');
                initializeUI(sw);
            })
            .catch(e => console.error('Service worker error ', e));
    }

    function initializeUI(swRegistration) {
        swRegistration.pushManager.getSubscription()
            .then(function (subscription) {
                if (!getCookie('_ptk')) {
                    fetch('/api/create-account/', {
                        method: 'post',
                        headers: {
                            'Accept': 'application/json, text/plain, */*',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            domain: 'www.jabong.com'
                        })
                    })
                        .then(res => res.json())
                        .then(data => {
                            const { accountId, serverKey } = data;
                            const applicationServerKey = urlB64ToUint8Array(serverKey);
                            swRegistration.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: applicationServerKey
                            })
                                .then(function (subscription) {
                                    updateSubscriptionOnServer(subscription, accountId);
                                });
                        });
                } else {
                    // fetch('/api/account/', {
                    //     method: 'post',
                    //     headers: {
                    //         'Accept': 'application/json, text/plain, */*',
                    //         'Content-Type': 'application/json'
                    //     },
                    //     body: JSON.stringify({
                    //         accountId: getCookie('_ptk')    
                    //     })
                    // })
                    // .then(res => res.json())
                    // .then(data => {
                    //     const { serverKey } = data;
                    //     const applicationServerKey = urlB64ToUint8Array(serverKey);
                    //     console.log(serverKey);
                    //     swRegistration.pushManager.subscribe({
                    //         userVisibleOnly: true,
                    //         applicationServerKey: applicationServerKey
                    //     })
                    //     .then(function(subscription) {
                    //         console.log('user is already subscribed');
                    //     });
                    // })

                    console.log('User is already subscribed');
                }
            })
            .catch(function (err) {
                console.log('Failed to subscribe the user: ', err);
            });
    }

    function updateSubscriptionOnServer(subscription, id) {
        return new Promise((resolve) => {
            fetch('/api/v1/save-subscription/', {
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                method: 'post',
                body: JSON.stringify({ id, subscription })
            })
                .then(response => response.json())
                .then(data => {
                    setCookie('_ptk', id, 25 * 365);
                    console.log(data)
                });
        });
    }

    function urlB64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
}());
/* jshint ignore:end */
