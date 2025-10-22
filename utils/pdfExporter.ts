import type { ScriptScene } from '../types';

declare const jspdf: any;

export const exportScriptToPDF = (
    scenes: ScriptScene[],
    storyIdea: string,
    visualStyle: string,
    duration: string
) => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF({
        orientation: 'landscape',
    });

    // Add Title and Premise
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('Roteiro Gerado por IA - Roteiro Prime', 14, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Premissa: ${storyIdea}`, 14, 32, { maxWidth: 270 });
    doc.text(`Estilo Visual: ${visualStyle} | Duração: ${duration}`, 14, 40);

    // Prepare table data
    const head = [['História', 'Falas', 'Prompt de Imagem', 'Prompt de Vídeo']];
    const body: any[][] = [];

    scenes.forEach(scene => {
        scene.detalhes.forEach((detail, index) => {
            const row: any[] = [
                detail.descricaoHistoria,
            ];
            if (index === 0) {
                row.push({ content: scene.falas, rowSpan: scene.detalhes.length });
            }
            row.push(detail.promptImagem);
            row.push(detail.promptVideo);
            body.push(row);
        });
    });

    doc.autoTable({
        head: head,
        body: body,
        startY: 50,
        theme: 'grid',
        headStyles: {
            fillColor: [76, 29, 149], 
            textColor: 255,
            fontStyle: 'bold',
        },
        styles: {
            cellPadding: 2,
            fontSize: 8,
            overflow: 'linebreak'
        },
        columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 60 },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 'auto' },
        },
        didParseCell: function (data: any) {
          if(data.section === 'body' && data.row.raw.length > 3) {
             const falasCell = data.row.cells['1'];
             if(falasCell){
                data.row.cells['2'] = data.row.cells['1'];
                data.row.cells['3'] = data.row.cells['2'];
                data.row.cells['1'] = falasCell;
             }
          }
        }
    });

    doc.save('roteiro-gerado.pdf');
};