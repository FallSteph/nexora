import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Board } from "@/context/AppContext";

export type PdfScope = "allUsers" | "projectOnly" | "all";

export const generateAnalyticsPDF = (
  boards: Board[],
  users: { email: string; role?: string }[],
  scope: PdfScope
) => {
  const doc = new jsPDF();

  // -----------------------------
  // Title
  // -----------------------------
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text("Analytics Report", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

  let yPosition = 40;

  // -----------------------------
  // Projects Overview
  // -----------------------------
  if (scope === "projectOnly" || scope === "all") {
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Projects Overview", 14, yPosition);
    yPosition += 10;

    const projectsData = boards.map((board) => [
      board.title,
      board.members?.length || 0,
      board.description || "No description",
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Project Title", "Members", "Description"]],
      body: projectsData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 20, halign: "center" }, 2: { cellWidth: 110 } },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // -----------------------------
  // Users Section
  // -----------------------------
  if (scope === "allUsers" || scope === "all") {
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("All Project Managers", 14, yPosition);
    yPosition += 10;

    const usersMap = new Map<string, { email: string; role?: string }>();

    boards.forEach((board) =>
      board.members?.forEach((member) => {
        if (!usersMap.has(member.email)) usersMap.set(member.email, member);
      })
    );

    users.forEach((u) => {
      if (!usersMap.has(u.email)) usersMap.set(u.email, { email: u.email, role: u.role });
    });

    const usersData = Array.from(usersMap.values()).map((u) => [u.email, u.role ?? "member"]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Email", "Role"]],
      body: usersData.length ? usersData : [["No users found", ""]],
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 60 } },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // -----------------------------
  // Project Details
  // -----------------------------
  if (scope === "projectOnly" || scope === "all") {
    doc.addPage();
    yPosition = 20;
    doc.setFontSize(16);
    doc.text("Project Details", 14, yPosition);
    yPosition += 10;

    boards.forEach((board, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(59, 130, 246);
      doc.text(`${index + 1}. ${board.title}`, 14, yPosition);
      yPosition += 7;

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const splitDesc = doc.splitTextToSize(board.description || "No description", 180);
      doc.text(splitDesc, 20, yPosition);
      yPosition += splitDesc.length * 5 + 5;

      const membersData = board.members?.map((m) => [m.email, m.role ?? "member"]) || [];
      if (membersData.length) {
        autoTable(doc, {
          startY: yPosition,
          head: [["Email", "Role"]],
          body: membersData,
          theme: "striped",
          headStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: "bold", fontSize: 9 },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 60 } },
          margin: { left: 20 },
        });
        yPosition = (doc as any).lastAutoTable.finalY + 10;
      } else {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("No members", 20, yPosition);
        yPosition += 10;
      }
    });
  }

  // Save PDF
  doc.save(`analytics-report-${new Date().toISOString().split("T")[0]}.pdf`);
};
