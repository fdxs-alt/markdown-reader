import { app, BrowserWindow } from "electron";
import { join } from "path";
let mainWindow: BrowserWindow | null = null;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    center: true,
    resizable: true,
    
  });

  console.log(join(__dirname, "../index.html"));
  mainWindow.loadFile(join(__dirname, "../index.html"));

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
    mainWindow?.webContents.openDevTools();
  });
});
