import { googleSheetService } from "@/service/googleSheet.service";
import { bannerService } from "@/service/banner.service.js";
import { isBirthdayToday } from "@/utils/dateUtils";
import { COLUMN_NAMES } from "@/utils/constants";

export const birthdayManager = {
  async processDailyBirthdays() {
    const rows = await googleSheetService.getAllRows();
    const birthdayCol = process.env.BIRTHDAY_COLUMN;

    const candidates = rows.filter((row) =>
      isBirthdayToday(row.get(birthdayCol))
    );
    const results = [];

    for (const person of candidates) {
      const fullName = person.get(COLUMN_NAMES.FULL_NAME) || "";
      const birthdayStr = person.get(birthdayCol);

      const parts = fullName.trim().split(" ");
      const name = parts[0] || "Empleado";
      const lastname = parts.slice(1).join(" ") || " ";

      const fileName = await bannerService.generate(
        name,
        lastname,
        birthdayStr
      );
      results.push({ name: fullName, file: fileName });
    }
    return results;
  },
};
