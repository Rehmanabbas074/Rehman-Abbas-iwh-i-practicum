const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------
// MIDDLEWARE
// --------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.set("view engine", "pug");
app.set("views", path.join(process.cwd(), "views"));

// --------------------
// CUSTOM OBJECT ID
// --------------------
// Replace this with your HubSpot custom object type ID, e.g., "2-55446827"
const OBJECT_TYPE_ID = process.env.OBJECT_TYPE_ID;

// --------------------
// HELPER: HUBSPOT FETCH
// --------------------
async function hubspotFetch(endpoint, options = {}) {
  const response = await fetch(`https://api.hubapi.com${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PRIVATE_APP_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      data,
    };
  }

  return data;
}

// --------------------
// ROUTE: GET ALL RECORDS
// --------------------
app.get("/", (req, res, next) => {
  hubspotFetch(`/crm/v3/objects/0-1?limit=10&properties=email,phone,firstname`)
    .then(data => {
      res.render("homepage", {
        title: "Contact Table",
        records: data.results || []   
      });
    })
    .catch(next);
});

// --------------------
// ROUTE: FORM PAGE
// --------------------
app.get("/update-cobj", (req, res) => {
  res.render("updates", {
    title: "Add / Update Contact",
  });
});

// --------------------
// ROUTE: CREATE CONTACT
// --------------------
app.post("/update-cobj", (req, res, next) => {
  const { firstname, email, phone } = req.body;

  hubspotFetch(`/crm/v3/objects/0-1`, {
    method: "POST",
    body: JSON.stringify({
      properties: {
        firstname,
        email,
        phone,
      },
    }),
  })
    .then(() => {
      console.log(" Contact created");
      res.redirect("/");
    })
    .catch(next);
});
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
