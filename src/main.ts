import { app, BrowserWindow, dialog } from "electron";
import { join } from "path";
import { readFileSync } from "fs";
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
    title: "Markdown Reader",
  });

  mainWindow.loadFile(join(__dirname, "../index.html"));

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
    mainWindow?.webContents.openDevTools();
  });
});

export const getFileFromUser = async (): Promise<void> => {
  const files = await dialog.showOpenDialog({
    properties: ["openFile"],
    title: "Open file to read",
    filters: [
      { name: "Text files", extensions: ["txt", "text"] },
      {
        name: "Markdown files",
        extensions: ["md", "mdown", "markdown", "marcdown"],
      },
    ],
  });

  if (!files.canceled) {
    const file = files.filePaths[0];
    openFile(file);
  }
};

const openFile = (file: string) => {
  const content = readFileSync(file).toString();
  app.addRecentDocument(file);
  mainWindow?.webContents.send("file-opened", file, content);
};
