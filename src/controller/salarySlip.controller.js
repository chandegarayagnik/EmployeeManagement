import PDFDocument from "pdfkit";
import { dbConnection } from "../config/db.js";

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
    rows.forEach(row => {
        doc.rect(startX, y, totalWidth, rowHeight).stroke();

        row.forEach((cell, i) => {
            const x = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
            doc.text(String(cell), x + 5, y + 7);
        });

        y += rowHeight;
    });

    return y;
}

// ---------------- MAIN FUNCTION ----------------
export const generateSalarySlip = async (req, res) => {
    const { payrollId } = req.params;
    const sequelize = await dbConnection();

    try {
        const query = `
            SELECT 
                p.*, 
                e.name, e.email, e.position, e.phone, e.join_date,
                d.DepartmentName,
                s.basic, s.hra, s.bonus, s.deduction
            FROM payroll p
            INNER JOIN emp e ON p.empukid = e.empukid
            LEFT JOIN department d ON e.DepartmentID = d.DepartmentID
            LEFT JOIN salary s ON p.empukid = s.empukid
            WHERE p.id = :payrollId
        `;

        const [rows] = await sequelize.query(query, {
            replacements: { payrollId },
        });

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "Payroll record not found" });
        }

        const data = rows[0];

        // ---------------- PDF DOCUMENT ----------------
        const doc = new PDFDocument({ margin: 40 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=SalarySlip-${data.name}.pdf`
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
                ["Employee Name", data.name],
                ["Employee ID", data.empukid],
                ["Email", data.email],
                ["Phone", data.phone],
                ["Position", data.position],
                ["Department", data.DepartmentName],
                ["Join Date", data.join_date],
                ["Payroll Month", data.month],
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
                ["Basic Salary", data.basic],
                ["HRA", data.hra],
                ["Bonus", data.bonus],
                ["Deductions", data.deduction],
                ["Gross Salary", data.gross_salary],
                ["Net Salary", data.net_salary],
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
                ["Total Days", data.total_days],
                ["Present Days", data.present_days],
                ["Absent Days", data.total_days - data.present_days],
            ],
        });

        doc.moveDown(1);
        doc.text("------------------------------------------------------------");
        doc.text("This is a system-generated salary slip and does not require signature.");

        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    } finally {
        await sequelize.close();
    }
};
