import { app, BrowserWindow, dialog, Menu } from "electron";
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";

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
    height: 800,
    width: 1200,
  });

  Menu.setApplicationMenu(appMenu);
  mainWindow.loadFile(join(__dirname, "../index.html"));

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });
});
export const getFileFromUser = async (): Promise<void> => {
  const files = await dialog.showOpenDialog(mainWindow as BrowserWindow, {
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

export const openFile = (file: string): void => {
  const content = readFileSync(file).toString();
  app.addRecentDocument(file);
  mainWindow?.webContents.send("file-opened", file, content);
};

export const saveMd = async (
  filePath: string,
  content: string
): Promise<void> => {
  if (!filePath) {
    const newfilePath = await dialog.showSaveDialog(
      mainWindow as BrowserWindow,
      {
        title: "Save markdown",
        filters: [
          {
            name: "Markdown files",
            extensions: ["md", "mdown", "markdown", "marcdown"],
          },
        ],
        defaultPath: app.getPath("desktop"),
      }
    );

    if (!newfilePath.canceled && newfilePath.filePath) {
      writeFileSync(newfilePath.filePath[0], content);
      openFile(newfilePath.filePath[0]);
    }

    return;
  }

  writeFileSync(filePath, content);
  openFile(filePath);
};

export const saveHTML = async (content: string): Promise<void> => {
  const newfilePath = await dialog.showSaveDialog(mainWindow as BrowserWindow, {
    filters: [
      {
        name: "HTML files",
        extensions: ["html", "htm"],
      },
    ],
    title: "Save HTML",
    defaultPath: app.getPath("desktop"),
  });

  if (!newfilePath.canceled && newfilePath.filePath) {
    writeFileSync(newfilePath.filePath[0], content);
  }
};

const template = [
  {
    label: "File",
    submenu: [
      {
        label: "Open file",
        accelerator: "CommandOrControl+O",
        click() {
          getFileFromUser();
        },
      },
      {
        label: "Save file",
        accelerator: "CommandOrControl+S",
        click() {
          mainWindow?.webContents.send("save-markdown");
        },
      },
      {
        label: "Save HTML",
        accelerator: "CommandOrControl+I",
        click() {
          mainWindow?.webContents.send("save-html");
        },
      },
      {
        label: "Open in default",
        click() {
          mainWindow?.webContents.send("open-default");
        },
      },
      {
        label: "Open default folder",
        click() {
          mainWindow?.webContents.send("show-folder");
        },
      },
    ],
  },
  {
    label: "Actions",
    submenu: [
      { label: "Copy", role: "copy" },
      { label: "Paste", role: "paste" },
      { label: "Undo", role: "undo" },
      { label: "Paste", role: "paste" },
    ],
  },
];

if (process.platform === "darwin") {
  const appName = "Markdown Reader";
  (template as any).unshift({
    label: appName,
    submenu: [
      {
        label: `About ${appName}`,
      },
      {
        label: `Quit ${appName}`,
        role: "quit",
      },
    ],
  });
}

const appMenu = Menu.buildFromTemplate(template as any);
