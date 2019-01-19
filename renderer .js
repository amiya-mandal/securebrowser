const path = require("path")
const TabGroup = require('./webmine-tabgroup')
const config = require('./config')
var url = require('url')
var http = require('http')
var https = require('https')
const request = require('request')
const cheerio = require('cheerio')
const $ = cheerio.load('body')
const ipc = require('electron').ipcRenderer;

var ElectronProxyAgent = require('electron-proxy-agent')

var {
    ipcRenderer,
    remote,
    globalShortcut
} = require('electron')

var main = remote.require("./main.js")
let tabGroup = new TabGroup()

var addTab = function(arg) {
    closable = false
    if (arg['closable']) {
        closable = true
    }

    let tab = tabGroup.addTab({
        title: arg['title'] || '<svg width="15px" height="15px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-dual-ring" style="background: rgba(0, 0, 0, 0) none repeat scroll 0% 0%;"> <circle cx="50" cy="50" ng-attr-r="{{config.radius}}" ng-attr-stroke-width="{{config.width}}" ng-attr-stroke="{{config.c1}}" ng-attr-stroke-dasharray="{{config.dasharray}}" fill="none" stroke-linecap="round" r="30" stroke-width="8" stroke="#0667d6" stroke-dasharray="47.12388980384689 47.12388980384689"> <animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"/> </circle> <circle cx="50" cy="50" ng-attr-r="{{config.radius2}}" ng-attr-stroke-width="{{config.width}}" ng-attr-stroke="{{config.c2}}" ng-attr-stroke-dasharray="{{config.dasharray2}}" ng-attr-stroke-dashoffset="{{config.dashoffset2}}" fill="none" stroke-linecap="round" r="21" stroke-width="8" stroke="#0fb3ff" stroke-dasharray="32.98672286269283 32.98672286269283" stroke-dashoffset="32.98672286269283"> <animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;-360 50 50" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"/> </circle> </svg>',

        webviewAttributes: {
            "preload": "injector.js",
            'partition': arg['partitionName']
        },
        closable: arg['closable'],
        id: arg['id'],
        src: arg['src'],
        visible: true,
        active: true,
        iconURL: arg.icoURL(arg),
    });


    tab.webview.addEventListener('ipc-message', function(event) {

        switch (event.channel) {
            case "humanInitAvatarInit":
                {
                    startOperate(event.args[0], tab.webview);
                    break;
                }
            case "setTabTitle":
                {
                    tab.setTitle(event.args[0])
                    break
                }
            default:
                break;
        }
    });

    tab.webview.addEventListener('new-window', function(e) {
        addTab({
            partitionName: 'persist:defaultMain',
            id: "webmineId",
            src: e.url,
            icoURL: tab => {
                let abc = tab.src

                function domain_from_url(url) {
                    let result
                    let match
                    if (match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im)) {
                        result = match[1]
                        if (match = result.match(/^[^\.]+\.(.+\..+)$/)) {
                            result = match[1]
                        }
                    }
                    return result
                }
                let trimmedSRC = domain_from_url(abc)
                return 'https://s2.googleusercontent.com/s2/favicons?domain_url=' + trimmedSRC
            },
        });
    });

    tab.webview.addEventListener("dom-ready", function() {
        if (!arg['title']) {
            tab.webview.send('setTabTitle', {})
        }

        // Show devTools if you want
        if (arg['debug']) {
            tab.webview.openDevTools();
        }
        if (arg['sendMsgWebview']) {
            for (let i = 0; i < arg['sendMsgWebview'].length; i++) {
                tab.webview.send(arg['sendMsgWebview'][i]['channel'], arg['sendMsgWebview'][i]['message'])
            }
        } else {

        }

        tab.webview.send('documentIsReady', {})

    });


    if (arg['proxy']) {
        sendDataProxy = {
            partition: arg['partionName'],
            proxy: arg['proxy'],
            webview: tab.webview
        }
        ipcRenderer.send('setSessionProxy', sendDataProxy);
    }


    if (arg['cookies']) {
        sendDataSession = {
            partitionName: arg['partitionName'],
            cookies: arg['cookies'],
            webview: tab.id,
        }
        ipcRenderer.send('setSessionCookies', sendDataSession);
    }

    return tab;
}

ipcRenderer.on('log', (event, arg) => {
    console.log(arg)
});

addTab({
    partitionName: 'persist:defaultMain',
    id: "mainwebmine",
    closable: false,
    //debug: true,
    src: config.appPath,
    icoURL: tab => {
        let abc = tab['src']

        function domain_from_url(url) {
            let result
            let match
            if (match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im)) {
                result = match[1]
                if (match = result.match(/^[^\.]+\.(.+\..+)$/)) {
                    result = match[1]
                }
            }
            return result
        }
        let trimmedSRC = domain_from_url(abc)
        return 'https://s2.googleusercontent.com/s2/favicons?domain_url=' + trimmedSRC
    },
})

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}


let startOperate = function(data, webview = null) {
    data = JSON.parse(data)
    let requestUrl;

    if (data['social']) {
        requestUrl = config.getAuthUrl.replace('{social}', data['social']);
        requestUrl = requestUrl.replace('{accessToken}', data['accessToken']);
    }

    var social = function(socialName, requestUrl, partitionName, socialUrl) {
        let sendMsgWebview = null;
        httpGetAsync(requestUrl, function(response) {
            let resultJson = JSON.parse(response);
            // console.log(resultJson);
            console.log(socialName);
            if (socialName == "Facebook") {
                cookies = null;
                sendMsgWebview = [{
                    "channel": "facebookAutoLogin",
                    "message": {
                        "username": resultJson['entity']['username'],
                        "password": resultJson['entity']['password']
                    },
                }]
            }
            cookies = resultJson['entity']['cookies']
            for (let i = 0; i < cookies.length; i++) {
                cookies[i]['url'] = socialUrl;
            }
            // console.log(cookies);
            addTab({
                partitionName: 'persist:' + socialName + partitionName,
                title: socialName,
                src: socialUrl,
                //debug: true,
                sendMsgWebview: sendMsgWebview,
                // proxy: {},
                "cookies": cookies
            });
        });
    };

    switch (data['social']) {
        case 'twitter':
            {
                let partionName = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
                partionName = partionName.substr(4, 5);
                socialUrl = "https://twitter.com/";
                social('Twitter', requestUrl, partionName, socialUrl);
                break;
            }
        case 'facebook':
            {
                let partionName = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
                partionName = partionName.substr(4, 5);
                socialUrl = "https://www.facebook.com/";
                social('Facebook', requestUrl, partionName, socialUrl);
                break
            }
        default:
            {
                // console.log('Error: ', data)
                break;
            }
    }

}