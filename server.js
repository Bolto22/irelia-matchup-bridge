import express from "express";
import cors from "cors";
import axios from "axios";
import cheerio from "cheerio";

const app = express();
app.use(cors());

const MOBALYTICS_URL = process.env.MOBALYTICS_URL ||
  "https://app.mobalytics.gg/lol/profile/euw/Bolto-2012/matchup-pool";

app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.get("/matchups", async (req, res) => {
  try {
    const { data: html } = await axios.get(MOBALYTICS_URL);
    const $ = cheerio.load(html);
    const rows = [];

    $("tr").each((_, tr) => {
      const tds = $(tr).find("td");
      if (tds.length > 3) {
        rows.push({
          matchup: $(tds[0]).text().trim(),
          games: $(tds[1]).text().trim(),
          wr: $(tds[2]).text().trim(),
          kda: $(tds[3]).text().trim()
        });
      }
    });

    res.json({ success: true, rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Bridge läuft auf Port ${PORT}`));
