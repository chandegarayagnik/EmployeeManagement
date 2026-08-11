import PDFDocument from "pdfkit";

// ---------------- TABLE HELPER FUNCTION ----------------
function drawTable(doc, startX, startY, table) {
    const { headers, rows, columnWidths, rowHeight } = table;
    let y = startY;

    const totalWidth = columnWidths.reduce((a, b) => a + b, 0);

    // Header background
    doc.rect(startX, y, totalWidth, rowHeight)
        .fill("#e8e8e8")
        .stroke();

    doc.fillColor("black");

    // Header text
    headers.forEach((header, i) => {
        const x = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.text(header, x + 5, y + 7);
    });

    // Header row border
    doc.rect(startX, y, totalWidth, rowHeight).stroke();
    y += rowHeight;

    // Data rows
    rows.forEach((row) => {
        doc.rect(startX, y, totalWidth, rowHeight).stroke();

        row.forEach((cell, i) => {
            const x = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
            doc.text(String(cell ?? ""), x + 5, y + 7);
        });

        y += rowHeight;
    });

    return y;
}

// ---------------- MAIN FUNCTION ----------------
export const generateSalarySlip = async (req, res) => {
    const { sequelize } = req.db;
    try {
        const { payrollId } = req.params;

        const query = `
            SELECT 
                p.*, 
                e.name, e.email, e.position, e.phone, e.join_date,
                d.DepartmentName,
                s.basic, s.hra, s.bonus, s.deduction
            FROM payroll p WITH (NOLOCK)
            LEFT JOIN emp e WITH (NOLOCK) ON p.empukid = e.empukid
            LEFT JOIN department d WITH (NOLOCK) ON e.DepartmentID = d.DepartmentID
            LEFT JOIN salary s WITH (NOLOCK) ON p.empukid = s.empukid
            WHERE p.id = :payrollId
        `;

        const [rows] = await sequelize.query(query, {
            replacements: { payrollId },
        });

        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: "Payroll record not found" });
        }

        const data = rows[0];

        // ---------------- PDF DOCUMENT ----------------
        const doc = new PDFDocument({ margin: 40 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=SalarySlip-${data.name || "Employee"}.pdf`
        );

        doc.pipe(res);

        // HEADER
        doc.fontSize(22).text("Salary Slip", { align: "center" });
        doc.moveDown(1);

        doc.fontSize(12).text("Company: Your Company Pvt Ltd");
        doc.text("Address: Mumbai, India");
        doc.text("------------------------------------------------------------");
        doc.moveDown(1);

        // EMPLOYEE INFORMATION TABLE
        doc.fontSize(14).text("Employee Information", { underline: true });
        doc.moveDown(0.5);

        drawTable(doc, 40, doc.y, {
            headers: ["Field", "Details"],
            columnWidths: [180, 280],
            rowHeight: 25,
            rows: [
                ["Employee Name", data.name || ""],
                ["Employee ID", data.empukid || ""],
                ["Email", data.email || ""],
                ["Phone", data.phone || ""],
                ["Position", data.position || ""],
                ["Department", data.DepartmentName || ""],
                ["Join Date", data.join_date ? new Date(data.join_date).toLocaleDateString() : ""],
                ["Payroll Month", data.month || ""],
            ],
        });

        doc.moveDown(1);

        // SALARY DETAILS TABLE
        doc.fontSize(14).text("Salary Details", { align: "left" });
        doc.moveDown(0.5);

        drawTable(doc, 40, doc.y, {
            headers: ["Component", "Amount"],
            columnWidths: [180, 280],
            rowHeight: 25,
            rows: [
                ["Basic Salary", data.basic || 0],
                ["HRA", data.hra || 0],
                ["Bonus", data.bonus || 0],
                ["Deductions", data.deduction || 0],
                ["Gross Salary", data.gross_salary || 0],
                ["Net Salary", data.net_salary || 0],
            ],
        });

        doc.moveDown(1);

        // ATTENDANCE TABLE
        doc.fontSize(14).text("Attendance Summary", { underline: true });
        doc.moveDown(0.5);

        drawTable(doc, 40, doc.y, {
            headers: ["Metric", "Value"],
            columnWidths: [180, 280],
            rowHeight: 25,
            rows: [
                ["Total Days", data.total_days || 0],
                ["Present Days", data.present_days || 0],
                ["Absent Days", (data.total_days || 0) - (data.present_days || 0)],
            ],
        });

        doc.moveDown(1);
        doc.text("------------------------------------------------------------");
        doc.text("This is a system-generated salary slip and does not require signature.");

        doc.end();
    } catch (error) {
        console.error("Generate Salary Slip Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        if (sequelize) {
            await sequelize.close();
        }
    }
};
