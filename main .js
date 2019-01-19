  let electron = require('electron')
  const shell = electron.shell
  var request = require('request');
  const fs = require('fs');
  const {
      globalShortcut
  } = require('electron')

  var http = electron.http
  var https = electron.https
      //   http.globalAgent = 25
      //   https.globalAgent = 25
      // Module to control application life.
  const app = electron.app
  const electronLocalShortcut = require('electron-localshortcut')
      // Module to create native browser window.
  const BrowserWindow = electron.BrowserWindow
  const ipcMain = electron.ipcMain

  const path = require('path')
  const url = require('url')
  const os = require('os')

  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  let mainWindow;

  function createWindow() {
      // Create the browser window.
      mainWindow = new BrowserWindow({
          icon: "icon/icon.ico"
      });

      // ipcMain.on('print-to-pdf', (event) => {
      //     const pdfPath = path.join(__dirname, 'print.pdf')

      //     const win = mainWindow.fromWebContents(event.sender)

      //     win.webContents.printToPDF({}, (error, data) => {
      //         if (error) throw error
      //         fs.writeFile(pdfPath, data, (error) => {
      //             if (error) throw error
      //             shell.openExternal('file://' + pdfPath)
      //             event.sender.send('wrote-pdf', pdfPath)
      //         })
      //     })
      //   })

      electronLocalShortcut.register(mainWindow, 'Ctrl+P', () => {
          const pdfPath = path.join(__dirname, 'print.pdf')
          mainWindow.webContents.printToPDF({}, (error, data) => {
              if (error) throw error
              fs.writeFile(pdfPath, data, (error) => {
                  if (error) throw error
                  shell.openExternal('file://' + pdfPath)
                      //event.sender.send('wrote-pdf', pdfPath)
              })
          })
      })

      // and load the index.html of the app.
      mainWindow.loadURL(url.format({
          pathname: path.join(__dirname, 'index.html'),
          protocol: 'file:',
          slashes: true
      }));

      electron.session.defaultSession.on('will-download', (event, item, webContents) => {
          //event.preventDefault()
          require('request')(item.getURL(), (data) => {
              shell.openExternal('file://' + item.getURL())
          })
      })

      // Open the DevTools.

      mainWindow.maximize()
          //   mainWindow.webContents.openDevTools()


      var _addCookie = function(partedSession, cookie) {
          // set cookies here for the partiion webview
          cookie['status'] = true
              // mainWindow.webContents.send('log', cookie);
          partedSession.set(cookie, (error) => {
              if (error) {
                  mainWindow.webContents.send('log', error.toString())
              }

          })
          return cookie
      }

      var addCookies = function(partitionName, cookies) {
          cookiesStack = []

          var partedSession = electron.session.fromPartition(partitionName).cookies;
          // mainWindow.webContents.send("log", partedSession)

          for (let i = 0; i < cookies.length; i++) {
              cookie = _addCookie(partedSession, cookies[i]);
              cookiesStack += [cookie]
          }
          mainWindow.webContents.send("log", partedSession);
      }

      // Emitted when the window is closed.
      mainWindow.on('closed', function() {
          // Dereference the window object, usually you would store windows
          // in an array if your app supports multi windows, this is the time
          // when you should delete the corresponding element.
          mainWindow = null
      })

      ipcMain.on('setSessionProxy', (event, arg) => {

          // var partedSession = session.fromPartition("persist:ladli");
          // // partedSession.setProxy(null, null)
          // event.sender.send('reloadPage', true);
      });


      ipcMain.on('setSessionCookies', (event, arg) => {

          // mainWindow.webContents.send('log', arg)


          partitionName = arg['partitionName']
          cookies = arg['cookies']
              // event.sender.send('log', cookies['entity']['cookies'].length)
              // event.sender.send('async-reply', cookies['entity']['cookies'])

          var cook = addCookies(partitionName, cookies)
              // Reply on async message from renderer process
              // event.sender.send('reloadWebview', { 'webview': arg['webview'], 'reload': true });
      });
  }

  /**
   * Promise based download file method
   */
  // function downloadFile(configuration){
  //     return new Promise(function(resolve, reject){
  //         // Save variable to know progress
  //         var received_bytes = 0;
  //         var total_bytes = 0;

  //         var req = request({
  //             method: 'GET',
  //             uri: configuration.remoteFile
  //         });

  //         var out = fs.createWriteStream(configuration.localFile);
  //         req.pipe(out);

  //         req.on('response', function ( data ) {
  //             // Change the total bytes value to get progress later.
  //             total_bytes = parseInt(data.headers['content-length' ]);
  //         });

  //         // Get progress if callback exists
  //         if(configuration.hasOwnProperty("onProgress")){
  //             req.on('data', function(chunk) {
  //                 // Update the received bytes
  //                 received_bytes += chunk.length;

  //                 configuration.onProgress(received_bytes, total_bytes);
  //             });
  //         }else{
  //             req.on('data', function(chunk) {
  //                 // Update the received bytes
  //                 received_bytes += chunk.length;
  //             });
  //         }

  //         req.on('end', function() {
  //             resolve();
  //         });
  //     });
  // }

  // downloadFile({
  //     remoteFile: "http://www.planwallpaper.com/static/images/butterfly-wallpaper.jpeg",
  //     localFile: "./con.png",
  //     onProgress: function (received,total) {
  //         var percentage = (received * 100) / total;
  //         console.log(percentage + "% | " + received + " bytes out of " + total + " bytes.");
  //     }
  // }).then(function() {
  //     console.log("File succesfully downloaded");
  // });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow)

  // Quit when all windows are closed.
  app.on('window-all-closed', function() {
      // On OS X it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== 'darwin') {
          app.quit()
      }
  })

  app.on('activate', function() {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) {
          createWindow()
      }
  })


  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.

  //   app.on('browser-window-created', function(e, window) {
  //       window.setMenu(null)
  //   });=======
  app.on('browser-window-created', function(e, window) {
      //window.setMenu(null)    
  });