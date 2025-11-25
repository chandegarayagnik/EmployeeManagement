import PDFDocument from "pdfkit";
import { dbConnection } from "../config/db.js";

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
        res.setHeader("Content-Disposition",
            `attachment; filename=SalarySlip-${data.empukid}.pdf`
        );

        doc.pipe(res);

        // HEADER
        doc.fontSize(22).text("Salary Slip", { align: "center" });
        doc.moveDown(1);

        doc.fontSize(12).text("Company: Your Company Pvt Ltd");
        doc.text("Address: Mumbai, India");
        doc.text("------------------------------------------------------------");
        doc.moveDown(1);

        // EMPLOYEE DETAILS
        doc.fontSize(14).text("Employee Information", { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(12).text(`Employee Name: ${data.name}`);
        doc.text(`Employee ID: ${data.empukid}`);
        doc.text(`Email: ${data.email}`);
        doc.text(`Phone: ${data.phone}`);
        doc.text(`Position: ${data.position}`);
        doc.text(`Department: ${data.DepartmentName}`);
        doc.text(`Join Date: ${data.join_date}`);
        doc.text(`Payroll Month: ${data.month}`);
        doc.moveDown(1);

        // SALARY DETAILS
        doc.fontSize(14).text("Salary Details", { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(12).text(`Basic Salary: ₹${data.basic}`);
        doc.text(`HRA: ₹${data.hra}`);
        doc.text(`Bonus: ₹${data.bonus}`);
        doc.text(`Deductions: ₹${data.deduction}`);
        doc.text(`Gross Salary: ₹${data.gross_salary}`);
        doc.text(`Net Salary: ₹${data.net_salary}`);
        doc.moveDown(1);

        // ATTENDANCE
        doc.fontSize(14).text("Attendance Summary", { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(12).text(`Total Days in Month: ${data.total_days}`);
        doc.text(`Present Days: ${data.present_days}`);
        doc.text(`Absent Days: ${data.total_days - data.present_days}`);
        doc.moveDown(1);

        // FOOTER
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
