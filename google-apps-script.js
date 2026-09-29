/**
 * Google Apps Script for SEO Ideas Dashboard Integration
 *
 * HOW TO SET UP (Takes 1 minute):
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1U85yUu5J21RHuxNq-Sc38_zklRSWiGkLitB8w6SChIg/edit
 * 2. In the top menu, click: Extensions > Apps Script
 * 3. Delete any existing code and PASTE this entire file content.
 * 4. Click "Deploy" (blue button at top right) > "New deployment".
 * 5. Click the gear icon (Select type) > Choose "Web app".
 * 6. Set Description: "SEO Ideas API"
 * 7. Set "Execute as": "Me"
 * 8. Set "Who has access": "Anyone"  <-- IMPORTANT
 * 9. Click "Deploy" and authorize access.
 * 10. Copy the "Web app URL" and paste it into app.js (GOOGLE_SHEET_WEBAPP_URL).
 */

function setupHeaders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "ID",
      "Timestamp",
      "Name",
      "Email",
      "Idea Title",
      "Category",
      "Description",
      "Impact (1-10)",
      "Confidence (1-10)",
      "Ease (1-10)",
      "Total ICE Score",
      "Status",
      "Admin Notes"
    ]);
    sheet.getRange(1, 1, 1, 13).setFontWeight("bold").setBackground("#f1f5f9");
  }
}

// GET handler: Fetch all ideas for Admin Portal
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    setupHeaders();

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: "success", ideas: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const headers = data[0];
    const rows = data.slice(1);
    const ideas = rows.map((row, index) => {
      const impact = Number(row[7]) || 1;
      const confidence = Number(row[8]) || 1;
      const ease = Number(row[9]) || 1;
      const totalScore = ((impact + confidence + ease) / 3).toFixed(1);

      return {
        rowIndex: index + 2, // 1-indexed for header
        id: row[0] || "idea-" + (index + 1),
        createdAt: row[1] ? new Date(row[1]).toISOString() : new Date().toISOString(),
        name: row[2] || "",
        email: row[3] || "",
        title: row[4] || "",
        category: row[5] || "Uplifting Existing Traffic",
        description: row[6] || "",
        impact: impact,
        confidence: confidence,
        ease: ease,
        totalIceScore: totalScore,
        status: row[11] || "Route for discussion",
        adminNotes: row[12] || ""
      };
    });

    return ContentService.createTextOutput(JSON.stringify({ status: "success", ideas: ideas }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// POST handler: Submit new idea or update existing idea status
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    setupHeaders();

    const body = JSON.parse(e.postData.contents);
    const action = body.action || "submit";

    if (action === "updateStatus") {
      const targetId = body.id;
      const newStatus = body.status;
      const adminNotes = body.adminNotes;
      const data = sheet.getDataRange().getValues();

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(targetId)) {
          if (newStatus) sheet.getRange(i + 1, 12).setValue(newStatus);
          if (adminNotes !== undefined) sheet.getRange(i + 1, 13).setValue(adminNotes);
          break;
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Status updated" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Default: Submit New Idea
    const id = body.id || "idea-" + new Date().getTime();
    const timestamp = new Date().toLocaleString();
    const name = body.name || "";
    const email = body.email || "";
    const title = body.title || "";
    const category = body.category || "Uplifting Existing Traffic";
    const description = body.description || "";
    const impact = Number(body.impact) || 1;
    const confidence = Number(body.confidence) || 1;
    const ease = Number(body.ease) || 1;
    const totalScore = ((impact + confidence + ease) / 3).toFixed(1);
    const status = body.status || "Route for discussion";
    const adminNotes = body.adminNotes || "";

    sheet.appendRow([
      id,
      timestamp,
      name,
      email,
      title,
      category,
      description,
      impact,
      confidence,
      ease,
      totalScore,
      status,
      adminNotes
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success", id: id }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
