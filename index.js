import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import Hubspot from "@hubspot/api-client";
import path from "path";
import { fileURLToPath } from "url";

/* ------------------ Config ------------------ */
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

/* ------------------ HubSpot Client ------------------ */
const hubspotClient = new Hubspot.Client({
  accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
});

/* ------------------ Express Setup ------------------ */
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ------------------ Routes ------------------ */

// Home page
app.get("/", (req, res) => {
  res.render("index", {
    title: "HubSpot Foundations Practicum",
    message: "HubSpot API Integration Working 🚀",
  });
});

// Get contacts using HubSpot SDK
app.get("/contacts", async (req, res) => {
  try {
    const contacts = await hubspotClient.crm.contacts.basicApi.getPage(
      10
    );
    res.json(contacts.results);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// Example using Axios (raw HubSpot API call)
app.get("/contacts-axios", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data.results);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Axios request failed" });
  }
});

/* ------------------ Server ------------------ */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
