/**
 * Google Apps Script for SEO Ideas Dashboard Integration
 *
 * HOW TO UPDATE IN APPS SCRIPT:
 * 1. Open your Google Sheet > Extensions > Apps Script
 * 2. Replace the code with this updated version
 * 3. Click "Deploy" > "Manage deployments" > Edit (pencil icon) > Version: "New version" > Click "Deploy"
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

    const rows = data.slice(1);
    const ideas = rows.map((row, index) => {
      const impact = Number(row[7]) || 1;
      const confidence = Number(row[8]) || 1;
      const ease = Number(row[9]) || 1;
      const totalScore = ((impact + confidence + ease) / 3).toFixed(1);

      // Safe date formatting that never throws RangeError
      let dateStr = "";
      try {
        if (row[1] instanceof Date) {
          dateStr = row[1].toISOString();
        } else if (row[1]) {
          dateStr = String(row[1]);
        } else {
          dateStr = new Date().toISOString();
        }
      } catch (err) {
        dateStr = String(row[1] || "");
      }

      return {
        id: String(row[0] || ("idea-" + (index + 1))),
        createdAt: dateStr,
        name: String(row[2] || ""),
        email: String(row[3] || ""),
        title: String(row[4] || ""),
        category: String(row[5] || "Uplifting Existing Traffic"),
        description: String(row[6] || ""),
        impact: impact,
        confidence: confidence,
        ease: ease,
        totalIceScore: totalScore,
        status: String(row[11] || "Route for discussion"),
        adminNotes: String(row[12] || "")
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
      const targetId = String(body.id);
      const newStatus = body.status;
      const adminNotes = body.adminNotes;
      const data = sheet.getDataRange().getValues();

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === targetId) {
          if (newStatus) sheet.getRange(i + 1, 12).setValue(newStatus);
          if (adminNotes !== undefined) sheet.getRange(i + 1, 13).setValue(adminNotes);
          break;
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Status updated" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Default: Submit New Idea
    const id = String(body.id || ("idea-" + new Date().getTime()));
    const timestamp = new Date().toLocaleString();
    const name = String(body.name || "");
    const email = String(body.email || "");
    const title = String(body.title || "");
    const category = String(body.category || "Uplifting Existing Traffic");
    const description = String(body.description || "");
    const impact = Number(body.impact) || 1;
    const confidence = Number(body.confidence) || 1;
    const ease = Number(body.ease) || 1;
    const totalScore = ((impact + confidence + ease) / 3).toFixed(1);
    const status = String(body.status || "Route for discussion");
    const adminNotes = String(body.adminNotes || "");

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
