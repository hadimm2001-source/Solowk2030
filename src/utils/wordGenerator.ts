import { AlignmentType, Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, ShadingType, TextRun, VerticalAlign, BorderStyle } from "docx";
import { saveAs } from "file-saver";

const TAJAWAL_FONT = "Tajawal";

export const generateWordReport = async (student: any) => {
    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 720,
                            bottom: 720,
                            left: 720,
                            right: 720,
                        },
                    },
                },
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: "المملكة العربية السعودية", font: TAJAWAL_FONT, size: 28, bold: true })],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 120 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "وزارة التعليم", font: TAJAWAL_FONT, size: 28, bold: true })],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 120 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "مدرسة الجشة المتوسطة", font: TAJAWAL_FONT, size: 28, bold: true })],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 400 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "تقرير تعزيز السلوك الإيجابي - السلوك المتميز", font: TAJAWAL_FONT, size: 36, bold: true, color: "059669" })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 600 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "اسم الطالب: ", font: TAJAWAL_FONT, size: 28, bold: true }),
                            new TextRun({ text: student.name, font: TAJAWAL_FONT, size: 28 }),
                        ],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 200 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "الصف: ", font: TAJAWAL_FONT, size: 28, bold: true }),
                            new TextRun({ text: student.grade, font: TAJAWAL_FONT, size: 28 }),
                        ],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 200 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "إجمالي النقاط: ", font: TAJAWAL_FONT, size: 28, bold: true }),
                            new TextRun({ text: student.totalPoints.toString(), font: TAJAWAL_FONT, size: 32, bold: true, color: "059669" }),
                        ],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 400 },
                    }),
                    new Table({
                        width: {
                            size: 100,
                            type: WidthType.PERCENTAGE,
                        },
                        visuallyRightToLeft: true,
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "م", font: TAJAWAL_FONT, size: 24, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                                        shading: { fill: "059669", type: ShadingType.CLEAR },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "ممارسة السلوك المتميز", font: TAJAWAL_FONT, size: 24, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                                        shading: { fill: "059669", type: ShadingType.CLEAR },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "اليوم", font: TAJAWAL_FONT, size: 24, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                                        shading: { fill: "059669", type: ShadingType.CLEAR },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "التاريخ", font: TAJAWAL_FONT, size: 24, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                                        shading: { fill: "059669", type: ShadingType.CLEAR },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "النقاط", font: TAJAWAL_FONT, size: 24, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                                        shading: { fill: "059669", type: ShadingType.CLEAR },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "المصدر", font: TAJAWAL_FONT, size: 24, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                                        shading: { fill: "059669", type: ShadingType.CLEAR },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                ],
                            }),
                            ...student.behaviors.map((b: any, index: number) => 
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: (index + 1).toString(), font: TAJAWAL_FONT, size: 24 })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: b.behaviorTitle, font: TAJAWAL_FONT, size: 24 })], alignment: AlignmentType.RIGHT })], verticalAlign: VerticalAlign.CENTER }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: b.day || "-", font: TAJAWAL_FONT, size: 24 })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: b.date, font: TAJAWAL_FONT, size: 24 })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: b.points.toString(), font: TAJAWAL_FONT, size: 24, bold: true, color: "059669" })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: b.source || "نظام رصد السلوك", font: TAJAWAL_FONT, size: 20 })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                                    ]
                                })
                            )
                        ],
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "إعداد الموجه الطلابي: عبدالهادي بن محمد المحسن", font: TAJAWAL_FONT, size: 24, bold: true })],
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 800 },
                    }),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `سجل_تميز_${student.name}.docx`);
};

export const generateComprehensiveReport = async (students: any[], grade: string) => {
    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        size: {
                            orientation: "landscape" as any,
                        },
                    },
                },
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: "المملكة العربية السعودية", font: TAJAWAL_FONT, size: 28, bold: true })],
                        alignment: AlignmentType.RIGHT,
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "تقرير الطلاب الشامل - " + grade, font: TAJAWAL_FONT, size: 36, bold: true, color: "059669" })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 600 },
                    }),
                    new Table({
                        width: {
                            size: 100,
                            type: WidthType.PERCENTAGE,
                        },
                        columnWidths: [400, 2500, 1000, 1000, 1000, 1200, 2800],
                        visuallyRightToLeft: true,
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ width: { size: 400, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "م", font: TAJAWAL_FONT, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })], shading: { fill: "059669" } }),
                                    new TableCell({ width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "اسم الطالب", font: TAJAWAL_FONT, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })], shading: { fill: "059669" } }),
                                    new TableCell({ width: { size: 1000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "الصف", font: TAJAWAL_FONT, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })], shading: { fill: "059669" } }),
                                    new TableCell({ width: { size: 1000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "إجمالي النقاط", font: TAJAWAL_FONT, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })], shading: { fill: "059669" } }),
                                    new TableCell({ width: { size: 1000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "اليوم", font: TAJAWAL_FONT, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })], shading: { fill: "059669" } }),
                                    new TableCell({ width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "التاريخ", font: TAJAWAL_FONT, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })], shading: { fill: "059669" } }),
                                    new TableCell({ width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "السلوكيات المرصودة", font: TAJAWAL_FONT, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })], shading: { fill: "059669" } }),
                                ],
                            }),
                            ...students.map((s: any, index: number) => 
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: (index + 1).toString() })], alignment: AlignmentType.CENTER })] }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.name, font: TAJAWAL_FONT })], alignment: AlignmentType.RIGHT })] }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.grade, font: TAJAWAL_FONT })], alignment: AlignmentType.CENTER })] }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.totalPoints.toString(), bold: true })], alignment: AlignmentType.CENTER })] }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.behaviors.length > 0 ? Array.from(new Set(s.behaviors.map((b: any) => b.day))).join(" | ") : "-", font: TAJAWAL_FONT, size: 16 })], alignment: AlignmentType.CENTER })] }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.behaviors.length > 0 ? Array.from(new Set(s.behaviors.map((b: any) => b.date))).join(" | ") : "-", font: TAJAWAL_FONT, size: 16 })], alignment: AlignmentType.CENTER })] }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.behaviors.length > 0 ? s.behaviors.map((b: any) => b.behaviorTitle).join(" | ") : "لا يوجد", font: TAJAWAL_FONT, size: 16 })], alignment: AlignmentType.RIGHT })] }),
                                    ]
                                })
                            )
                        ],
                    }),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `التقرير_الشامل_${grade}.docx`);
};

export const generateLiveLogsReport = async (logs: any[]) => {
    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 720,
                            bottom: 720,
                            left: 720,
                            right: 720,
                        },
                    },
                },
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: "المملكة العربية السعودية", font: TAJAWAL_FONT, size: 28, bold: true })],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 120 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "وزارة التعليم", font: TAJAWAL_FONT, size: 28, bold: true })],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 120 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "مدرسة الجشة المتوسطة", font: TAJAWAL_FONT, size: 28, bold: true })],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 400 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "سجل الرصد المباشر للمعلمين والتميز السلوكي", font: TAJAWAL_FONT, size: 36, bold: true, color: "059669" })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 600 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "تاريخ التصدير: ", font: TAJAWAL_FONT, size: 24, bold: true }),
                            new TextRun({ text: `${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA')}`, font: TAJAWAL_FONT, size: 24 }),
                        ],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 400 },
                    }),
                    new Table({
                        width: {
                            size: 100,
                            type: WidthType.PERCENTAGE,
                        },
                        visuallyRightToLeft: true,
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "م", font: TAJAWAL_FONT, size: 24, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                                        shading: { fill: "059669", type: ShadingType.CLEAR },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "المعلم المراقب", font: TAJAWAL_FONT, size: 24, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                                        shading: { fill: "059669", type: ShadingType.CLEAR },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "اسم الطالب", font: TAJAWAL_FONT, size: 24, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                                        shading: { fill: "059669", type: ShadingType.CLEAR },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "السلوك المرصود / الفئة", font: TAJAWAL_FONT, size: 24, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                                        shading: { fill: "059669", type: ShadingType.CLEAR },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "النقاط", font: TAJAWAL_FONT, size: 24, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                                        shading: { fill: "059669", type: ShadingType.CLEAR },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "الوقت والتاريخ", font: TAJAWAL_FONT, size: 24, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                                        shading: { fill: "059669", type: ShadingType.CLEAR },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                ],
                            }),
                            ...logs.map((log: any, index: number) => {
                                const logTime = log.timestamp 
                                    ? `${new Date(log.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })} في ${log.date}`
                                    : log.date;
                                
                                return new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: (index + 1).toString(), font: TAJAWAL_FONT, size: 24 })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: log.teacherName || "غير محدد", font: TAJAWAL_FONT, size: 24 })], alignment: AlignmentType.RIGHT })], verticalAlign: VerticalAlign.CENTER }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: log.studentName || "غير محدد", font: TAJAWAL_FONT, size: 24, bold: true })], alignment: AlignmentType.RIGHT })], verticalAlign: VerticalAlign.CENTER }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: log.category || "سلوك متميز", font: TAJAWAL_FONT, size: 22 })], alignment: AlignmentType.RIGHT })], verticalAlign: VerticalAlign.CENTER }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `+${log.points}`, font: TAJAWAL_FONT, size: 24, bold: true, color: "059669" })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: logTime, font: TAJAWAL_FONT, size: 22 })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                                    ]
                                });
                            })
                        ],
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "إعداد الموجه الطلابي: عبدالهادي بن محمد المحسن", font: TAJAWAL_FONT, size: 24, bold: true })],
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 800 },
                    }),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `سجل_الرصد_المباشر_للمعلمين.docx`);
};

export const generateTeacherReport = async (teacherName: string, teacherSubject: string, behaviors: any[]) => {
    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 720,
                            bottom: 720,
                            left: 720,
                            right: 720,
                        },
                    },
                },
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: "المملكة العربية السعودية", font: TAJAWAL_FONT, size: 28, bold: true })],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 120 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "وزارة التعليم", font: TAJAWAL_FONT, size: 28, bold: true })],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 120 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "مدرسة الجشة المتوسطة", font: TAJAWAL_FONT, size: 28, bold: true })],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 400 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "تقرير رصد سلوكيات التميز - المعلم المبادر", font: TAJAWAL_FONT, size: 36, bold: true, color: "0f766e" })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 600 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "اسم المعلم: ", font: TAJAWAL_FONT, size: 28, bold: true }),
                            new TextRun({ text: teacherName, font: TAJAWAL_FONT, size: 28 }),
                        ],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 150 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "المادة الدراسية: ", font: TAJAWAL_FONT, size: 28, bold: true }),
                            new TextRun({ text: teacherSubject, font: TAJAWAL_FONT, size: 28 }),
                        ],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 150 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "إجمالي الرصد السلوكي: ", font: TAJAWAL_FONT, size: 28, bold: true }),
                            new TextRun({ text: behaviors.length.toString(), font: TAJAWAL_FONT, size: 28, bold: true, color: "0f766e" }),
                        ],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 150 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "مجموع النقاط الممنوحة: ", font: TAJAWAL_FONT, size: 28, bold: true }),
                            new TextRun({ text: behaviors.reduce((acc, curr) => acc + (curr.points || 0), 0).toString(), font: TAJAWAL_FONT, size: 28, bold: true, color: "0f766e" }),
                        ],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 400 },
                    }),
                    new Table({
                        width: {
                            size: 100,
                            type: WidthType.PERCENTAGE,
                        },
                        visuallyRightToLeft: true,
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "م", font: TAJAWAL_FONT, size: 24, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                                        shading: { fill: "0f766e", type: ShadingType.CLEAR },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "اسم الطالب", font: TAJAWAL_FONT, size: 24, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                                        shading: { fill: "0f766e", type: ShadingType.CLEAR },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "السلوك المتميز", font: TAJAWAL_FONT, size: 24, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                                        shading: { fill: "0f766e", type: ShadingType.CLEAR },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "التاريخ", font: TAJAWAL_FONT, size: 24, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                                        shading: { fill: "0f766e", type: ShadingType.CLEAR },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "النقاط", font: TAJAWAL_FONT, size: 24, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                                        shading: { fill: "0f766e", type: ShadingType.CLEAR },
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                ],
                            }),
                            ...behaviors.map((b: any, index: number) => 
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: (index + 1).toString(), font: TAJAWAL_FONT, size: 24 })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: b.studentName, font: TAJAWAL_FONT, size: 24, bold: true })], alignment: AlignmentType.RIGHT })], verticalAlign: VerticalAlign.CENTER }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: b.behaviorTitle, font: TAJAWAL_FONT, size: 24 })], alignment: AlignmentType.RIGHT })], verticalAlign: VerticalAlign.CENTER }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: b.date, font: TAJAWAL_FONT, size: 24 })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `+${b.points}`, font: TAJAWAL_FONT, size: 24, bold: true, color: "0f766e" })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                                    ]
                                })
                            )
                        ],
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "إعداد الموجه الطلابي: عبدالهادي بن محمد المحسن", font: TAJAWAL_FONT, size: 24, bold: true })],
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 800 },
                    }),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `تقرير_رصد_المعلم_${teacherName.replace(/\s+/g, '_')}.docx`);
};
