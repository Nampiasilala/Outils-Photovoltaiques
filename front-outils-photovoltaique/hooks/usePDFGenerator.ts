// app/hooks/usePDFGenerator.ts - Version avec utilitaires centralisés
import { useState } from 'react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import { formatPrice, formatEnergy, formatDate, sanitizeFilename } from '@/utils/formatters';

interface PDFData {
  result: any;
  inputData: any;
}

export const usePDFGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Configuration pour les tableaux manuels
  const tableConfig = {
    headerHeight: 8,
    rowHeight: 6,
    fontSize: 9,
    headerFontSize: 10,
    margin: 20,
    headerColor: [41, 128, 185] as const, // Bleu
    alternateRowColor: [245, 245, 245] as const, // Gris clair
  };

  // Classe pour créer des tableaux manuellement
  class TableBuilder {
    private doc: jsPDF;
    private config: typeof tableConfig;

    constructor(doc: jsPDF, config: typeof tableConfig) {
      this.doc = doc;
      this.config = config;
    }

    drawTable(
      startX: number, 
      startY: number, 
      headers: string[], 
      data: string[][], 
      columnWidths: number[]
    ): number {
      let currentY = startY;
      
      // Header
      this.drawTableHeader(startX, currentY, headers, columnWidths);
      currentY += this.config.headerHeight;
      
      // Data rows
      data.forEach((row, index) => {
        this.drawTableRow(startX, currentY, row, columnWidths, index % 2 === 1);
        currentY += this.config.rowHeight;
      });
      
      // Border autour du tableau
      const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
      const totalHeight = this.config.headerHeight + (data.length * this.config.rowHeight);
      this.doc.rect(startX, startY, totalWidth, totalHeight);
      
      return currentY + 5; // Espacement après le tableau
    }

    private drawTableHeader(startX: number, startY: number, headers: string[], columnWidths: number[]) {
      // Background du header
      const [r, g, b] = this.config.headerColor;
      this.doc.setFillColor(r, g, b);
      const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
      this.doc.rect(startX, startY, totalWidth, this.config.headerHeight, 'F');
      
      // Texte du header
      this.doc.setTextColor(255, 255, 255); // Blanc
      this.doc.setFontSize(this.config.headerFontSize);
      this.doc.setFont('helvetica', 'bold');
      
      let currentX = startX;
      headers.forEach((header, i) => {
        this.doc.text(header, currentX + 2, startY + 5.5);
        // Ligne verticale
        if (i < headers.length - 1) {
          this.doc.setDrawColor(255, 255, 255);
          this.doc.line(currentX + columnWidths[i], startY, currentX + columnWidths[i], startY + this.config.headerHeight);
        }
        currentX += columnWidths[i];
      });
    }

    private drawTableRow(startX: number, startY: number, row: string[], columnWidths: number[], isAlternate: boolean) {
      // Background alterné
      if (isAlternate) {
        const [r, g, b] = this.config.alternateRowColor;
        this.doc.setFillColor(r, g, b);
        const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
        this.doc.rect(startX, startY, totalWidth, this.config.rowHeight, 'F');
      }
      
      // Texte de la ligne
      this.doc.setTextColor(0, 0, 0); // Noir
      this.doc.setFontSize(this.config.fontSize);
      this.doc.setFont('helvetica', 'normal');
      
      let currentX = startX;
      row.forEach((cell, i) => {
        // Truncate le texte si trop long
        const maxChars = Math.floor(columnWidths[i] / 2.5);
        const displayText = cell.length > maxChars ? cell.substring(0, maxChars - 3) + '...' : cell;
        
        this.doc.text(displayText, currentX + 2, startY + 4);
        
        // Ligne verticale
        if (i < row.length - 1) {
          this.doc.setDrawColor(200, 200, 200);
          this.doc.line(currentX + columnWidths[i], startY, currentX + columnWidths[i], startY + this.config.rowHeight);
        }
        currentX += columnWidths[i];
      });
      
      // Ligne horizontale
      this.doc.setDrawColor(200, 200, 200);
      const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
      this.doc.line(startX, startY + this.config.rowHeight, startX + totalWidth, startY + this.config.rowHeight);
    }
  }

  // Générateur de nom de fichier
  const generateFilename = (data: PDFData, isQuick = false) => {
    const date = formatDate(data.result.date_calcul).replace(/\//g, '-');
    const location = sanitizeFilename(data.inputData.localisation);
    const prefix = isQuick ? 'dimensionnement' : 'dimensionnement-solaire';
    return `${prefix}-${date}-${location}.pdf`;
  };

  // Création du header
  const addHeader = (doc: jsPDF, data: PDFData) => {
    // Titre principal
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Rapport de Dimensionnement Photovoltaique', 20, 25);

    // Informations générales
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dateStr = formatDate(data.result.date_calcul);
    doc.text(`Date: ${dateStr}`, 20, 40);
    doc.text(`Localisation: ${data.inputData.localisation}`, 120, 40);

    return 50; // Position Y de départ pour le contenu
  };

  // Tableau des données d'entrée
  const addInputDataTable = (doc: jsPDF, data: PDFData, startY: number) => {
    const tableBuilder = new TableBuilder(doc, tableConfig);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('1. Données d\'entrée', 20, startY);

    const headers = ['Paramètre', 'Valeur'];
    const inputData = [
      ['Consommation journalière', `${data.inputData.E_jour} Wh`],
      ['Puissance maximale', `${data.inputData.P_max} W`],
      ['Jours d\'autonomie', `${data.inputData.N_autonomie}`],
      ['Tension batterie', `${data.inputData.V_batterie} V`],
      ['Irradiation solaire', `${data.inputData.H_solaire} kWh/m²/j`],
    ];

    const columnWidths = [100, 70];
    return tableBuilder.drawTable(20, startY + 8, headers, inputData, columnWidths);
  };

  // Tableau des résultats
  const addResultsTable = (doc: jsPDF, data: PDFData, startY: number) => {
    const tableBuilder = new TableBuilder(doc, tableConfig);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('2. Résultats du dimensionnement', 20, startY);

    const headers = ['Élément', 'Valeur'];
    const results = [
      ['Puissance totale', `${data.result.puissance_totale.toFixed(1)} W`],
      ['Capacité batterie', `${data.result.capacite_batterie.toFixed(1)} Wh`],
      ['Bilan énergétique annuel', formatEnergy(data.result.bilan_energetique_annuel)],
      ['Coût total estimé', formatPrice(data.result.cout_total)],
      ['Nombre de panneaux', `${data.result.nombre_panneaux}`],
      ['Nombre de batteries', `${data.result.nombre_batteries}`],
    ];

    const columnWidths = [100, 70];
    return tableBuilder.drawTable(20, startY + 8, headers, results, columnWidths);
  };

  // Tableau des équipements
  const addEquipmentsTable = (doc: jsPDF, data: PDFData, startY: number) => {
    const tableBuilder = new TableBuilder(doc, tableConfig);
    const equipments = data.result.equipements_recommandes;
    const equipmentData: string[][] = [];

    // Mappage des équipements
    const equipmentMap = [
      { 
        equipment: equipments.panneau, 
        name: 'Panneau', 
        quantity: data.result.nombre_panneaux,
        getSpecs: (eq: any) => `${eq.puissance_W || ''} W`
      },
      { 
        equipment: equipments.batterie, 
        name: 'Batterie', 
        quantity: data.result.nombre_batteries,
        getSpecs: (eq: any) => `${eq.capacite_Ah || ''} Ah`
      },
      { 
        equipment: equipments.regulateur, 
        name: 'Régulateur', 
        quantity: 1,
        getSpecs: (eq: any) => 'MPPT'
      },
      { 
        equipment: equipments.onduleur, 
        name: 'Onduleur', 
        quantity: 1,
        getSpecs: (eq: any) => `${eq.puissance_W || ''} W`
      },
      { 
        equipment: equipments.cable, 
        name: 'Câble', 
        quantity: 'Variable',
        getSpecs: (eq: any) => 'Installation'
      },
    ];

    equipmentMap.forEach(({ equipment, name, quantity, getSpecs }) => {
      if (equipment) {
        equipmentData.push([
          name,
          equipment.modele || '',
          equipment.reference || '',
          getSpecs(equipment),
          formatPrice(equipment.prix_unitaire),
          quantity.toString()
        ]);
      }
    });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('3. Équipements recommandés', 20, startY);

    const headers = ['Type', 'Modèle', 'Référence', 'Specs', 'Prix', 'Qté'];
    const columnWidths = [25, 35, 30, 25, 30, 25];
    
    return tableBuilder.drawTable(20, startY + 8, headers, equipmentData, columnWidths);
  };

  // Ajout du footer
  const addFooter = (doc: jsPDF) => {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128); // Gris
    
    doc.text('Rapport généré automatiquement par le Calculateur Solaire', 20, pageHeight - 20);
    doc.text(`Date de génération: ${formatDate(new Date().toISOString())}`, 20, pageHeight - 15);
  };

  // Fonction principale de génération PDF
  const generatePDF = async (data: PDFData) => {
    setIsGenerating(true);
    
    try {
      toast.info('🔄 Génération du rapport PDF en cours...', { autoClose: 2000 });

      const doc = new jsPDF();
      
      // Construction du PDF avec tableaux manuels
      let currentY = addHeader(doc, data);
      currentY = addInputDataTable(doc, data, currentY + 10);
      currentY = addResultsTable(doc, data, currentY + 10);
      currentY = addEquipmentsTable(doc, data, currentY + 10);
      
      addFooter(doc);
      
      // Sauvegarde
      const fileName = generateFilename(data);
      doc.save(fileName);

      toast.success('✅ Rapport PDF téléchargé avec succès !', { autoClose: 4000 });
      toast.info(`📄 Nom du fichier : ${fileName}`, { autoClose: 6000, position: 'bottom-right' });

      return { success: true, fileName };
      
    } catch (error: unknown) {
      console.error('Erreur lors de la génération du PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(`❌ Erreur lors de la génération du PDF : ${errorMessage}`, { autoClose: 8000 });
      return { success: false, error: errorMessage };
    } finally {
      setIsGenerating(false);
    }
  };

  // Version rapide avec tableau simplifié
  const generatePDFQuick = async (data: PDFData) => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const tableBuilder = new TableBuilder(doc, tableConfig);
      
      // Header simplifié
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Rapport de Dimensionnement', 20, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${formatDate(data.result.date_calcul)}`, 20, 35);
      doc.text(`Localisation: ${data.inputData.localisation}`, 120, 35);

      // Tableau des résultats essentiels
      const headers = ['Élément', 'Valeur'];
      const quickResults = [
        ['Puissance totale', `${data.result.puissance_totale.toFixed(1)} W`],
        ['Coût total', formatPrice(data.result.cout_total)],
        ['Panneaux nécessaires', `${data.result.nombre_panneaux}`],
        ['Batteries nécessaires', `${data.result.nombre_batteries}`],
      ];

      const columnWidths = [100, 70];
      tableBuilder.drawTable(20, 45, headers, quickResults, columnWidths);
      
      const fileName = generateFilename(data, true);
      doc.save(fileName);

      toast.success('📄 PDF téléchargé !', { autoClose: 2000 });
      return { success: true, fileName };
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error('❌ Erreur lors de la génération du PDF', { autoClose: 4000 });
      return { success: false, error: errorMessage };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePDF,
    generatePDFQuick,
    isGenerating,
  };
};