// injector.js// Get the ipcRenderer of electron
const {
    ipcRenderer
} = require('electron');

ipcRenderer.on('documentIsReady', () => {
    operateClass = document.getElementsByClassName('avatar-operate')
    for (let i = 0; i < operateClass.length; i++) {
        operateClass[i].addEventListener('click', operateInitate);
    }
});

ipcRenderer.on('facebookAutoLogin', (e, data) => {

    function inputVal(usernameId, passwordId, username, password) {
        document.getElementById(usernameId).value = username
        document.getElementById(passwordId).value = password
    }
    inputVal("email", "pass", data['username'], data['password'])
    document.getElementById("loginbutton").click()

})

ipcRenderer.on('setTabTitle', () => {
    ipcRenderer.sendToHost("setTabTitle", document.title);
});

var operateInitate = function(e) {
    target = e.target
    data = {
        "channel": "humanInitAvatarInit",
        "data": target.getAttribute('data-txt')
    }
    ipcRenderer.sendToHost(data['channel'], data['data']);
}