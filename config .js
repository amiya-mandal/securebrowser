//todo make this part dynamic then export the url

module.exports = {
        host: '192.168.20.55',
        port: '',
        baseUrl: '',
        appPath: 'http://192.168.20.55/webpanel/web/',
        // appPath: 'http://192.168.20.238/webpanel/web/index.php?r=humanint%2Fdefault',
        getAuthUrl: 'http://192.168.20.202:7070/api/entity?q={"social":"{social}","accessToken":"{accessToken}"}&stype=getAuth'
    }
    /*
    192.168.20.202:7070/api/entity?q={}&stype=getEntityList



    192.168.20.202:7070/api/entity?q={"social":"twitter","accessToken":"dyfkf5443jfgf8k"}&stype=getAuth
    */