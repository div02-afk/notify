import { config } from "dotenv";
import { app, BrowserWindow } from "electron";
import started from "electron-squirrel-startup";
import path from "node:path";
import Pushy from "pushy-electron";
config();
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

interface notificationData {
  message: string;
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.webContents.on("did-finish-load", () => {
    Pushy.alert(mainWindow, "Pushy device token: " + process.env.PUSHY_APP_ID);
    Pushy.register({ appId: process.env.PUSHY_APP_ID })
      .then(async (deviceToken) => {
        // Display an alert with device token
        await fetch("http://localhost:4000/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "divyam.7379@gmail.com",
            deviceToken,
          }),
        });
        // Pushy.alert(mainWindow, "Pushy device token: " + deviceToken);
      })
      .catch((err) => {
        // Display error dialog
        // Pushy.alert(mainWindow, "Pushy registration error: " + err.message);
      });
    Pushy.setNotificationListener((data: notificationData) => {
      // Display an alert with the "message" payload value
      console.log(data);
      mainWindow.webContents.send("fromMain", { message: data.message });
      // Pushy.alert(mainWindow, "Received notification: " + JSON.stringify(data));
    });
    Pushy.listen();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
