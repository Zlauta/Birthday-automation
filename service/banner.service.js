import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import axios from "axios";
import {
  BANNER_APP_URL,
  DUMMY_IMAGE_URL,
  DOWNLOADS_DIR_NAME,
} from "@/utils/constants.js";
import { parseBirthdayForBanner } from "@/utils/dateUtils.js";

export const bannerService = {
  async generate(nombre, apellido, fechaMezclada) {
    let browserInstance;
    let activePage;

    try {
      const downloadsDirectory = path.resolve(DOWNLOADS_DIR_NAME);
      if (!fs.existsSync(downloadsDirectory)) {
        fs.mkdirSync(downloadsDirectory, { recursive: true });
      }

      const { day, monthName } = parseBirthdayForBanner(fechaMezclada);

      const tempImagePath = path.join(downloadsDirectory, "avatar_to_upload.png");
      const imageStream = await axios({ url: DUMMY_IMAGE_URL, responseType: "stream" });
      const streamWriter = fs.createWriteStream(tempImagePath);
      imageStream.data.pipe(streamWriter);
      await new Promise((res, rej) => { streamWriter.on("finish", res); streamWriter.on("error", rej); });

      browserInstance = await puppeteer.launch({ headless: "new" });
      activePage = await browserInstance.newPage();

      const cdpSession = await activePage.createCDPSession();
      await cdpSession.send("Page.setDownloadBehavior", {
        behavior: "allow",
        downloadPath: downloadsDirectory,
      });

      await activePage.setViewport({ width: 1280, height: 1000 });
      await activePage.goto(BANNER_APP_URL, { waitUntil: "networkidle2" });

      const fileInput = await activePage.waitForSelector('input[type="file"]');
      await fileInput.uploadFile(tempImagePath);

      const confirmCropButton = '.ant-modal-content .ant-btn-primary';
      await activePage.waitForSelector(confirmCropButton, { visible: true });
      await activePage.click(confirmCropButton);
      await activePage.waitForSelector('.ant-modal-content', { hidden: true });

      await activePage.waitForSelector("#name", { visible: true });
      await activePage.type("#name", String(`${nombre} ${apellido}`), { delay: 30 });
      await activePage.type('input[placeholder="Día"]', String(day));
      await activePage.type('input[placeholder="Mes (solo texto)"]', String(monthName));

      const previewButton = '.ant-btn-primary'; 
      await activePage.waitForSelector(previewButton, { visible: true });
      await activePage.click(previewButton); 

      await activePage.waitForSelector('.ant-modal-body', { visible: true });

      await new Promise(resolve => setTimeout(resolve, 4000));

      const downloadButtonSelector = '.download-button';
      await activePage.waitForSelector(downloadButtonSelector, { visible: true });
      
      const filesBefore = fs.readdirSync(downloadsDirectory);

      await activePage.click(downloadButtonSelector);

      let downloadedFileName = "";
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        const filesAfter = fs.readdirSync(downloadsDirectory);
        const newFiles = filesAfter.filter(f => !filesBefore.includes(f) && !f.endsWith('.crdownload'));
        
        if (newFiles.length > 0) {
          downloadedFileName = newFiles[0];
          break;
        }
      }

      if (!downloadedFileName) throw new Error("No se detectó el archivo.");

      const finalFileName = `cumple_${nombre.replace(/\s/g, "_")}_${Date.now()}.png`;
      fs.renameSync(
        path.join(downloadsDirectory, downloadedFileName),
        path.join(downloadsDirectory, finalFileName)
      );

      return finalFileName;

    } catch (error) {
      console.error("❌ Error en banner.service:", error.message);
      throw error;
    } finally {
      if (browserInstance) await browserInstance.close();
    }
  },
};