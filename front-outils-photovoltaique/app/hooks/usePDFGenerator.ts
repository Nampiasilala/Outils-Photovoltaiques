// app/hooks/usePDFGenerator.ts - Version améliorée avec cohérence mobile
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

  // Configuration pour les tableaux manuels - cohérente avec mobile
  const tableConfig = {
    headerHeight: 8,
    rowHeight: 6,
    fontSize: 9,
    headerFontSize: 10,
    margin: 20,
    headerColor: [41, 128, 185] as const, // Bleu
    alternateRowColor: [245, 245, 245] as const, // Gris clair
    sectionColors: {
      parameters: [52, 152, 219] as const, // Bleu
      results: [46, 204, 113] as const, // Vert
      equipment: [230, 126, 34] as const, // Orange
    }
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
      columnWidths: number[],
      headerColor?: readonly [number, number, number]
    ): number {
      let currentY = startY;
      
      // Header
      this.drawTableHeader(startX, currentY, headers, columnWidths, headerColor);
      currentY += this.config.headerHeight;
      
      // Data rows
      data.forEach((row, index) => {
        this.drawTableRow(startX, currentY, row, columnWidths, index % 2 === 1);
        currentY += this.config.rowHeight;
      });
      
      // Border autour du tableau
      const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
      const totalHeight = this.config.headerHeight + (data.length * this.config.rowHeight);
      this.doc.setDrawColor(150, 150, 150);
      this.doc.rect(startX, startY, totalWidth, totalHeight);
      
      return currentY + 5; // Espacement après le tableau
    }

    private drawTableHeader(
      startX: number, 
      startY: number, 
      headers: string[], 
      columnWidths: number[],
      customColor?: readonly [number, number, number]
    ) {
      // Background du header
      const [r, g, b] = customColor || this.config.headerColor;
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

  // Générateur de nom de fichier amélioré
  const generateFilename = (data: PDFData, isQuick = false) => {
    const now = new Date();
    const dateStr = formatDate(now.toISOString()).replace(/\//g, '-');
    const location = sanitizeFilename(data.inputData?.localisation || 'calcul');
    const prefix = isQuick ? 'dimensionnement' : 'dimensionnement-solaire';
    const timestamp = now.getTime();
    return `${prefix}-${dateStr}-${location}-${timestamp}.pdf`;
  };

  // Création du header amélioré
  const addHeader = (doc: jsPDF, data: PDFData) => {
    // Ligne de couleur en haut
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, doc.internal.pageSize.width, 5, 'F');
    
    // Titre principal
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text('Rapport de Dimensionnement Photovoltaïque', 20, 25);

    // Sous-titre
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Système solaire autonome', 20, 35);

    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 38, doc.internal.pageSize.width - 20, 38);

    // Informations générales
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const now = new Date();
    const dateStr = formatDate(now.toISOString());
    const location = data.inputData?.localisation || 'Non spécifiée';
    
    doc.text(`Date du rapport: ${dateStr}`, 20, 48);
    doc.text(`Localisation: ${location}`, 120, 48);

    return 58; // Position Y de départ pour le contenu
  };

  // Validation des données d'entrée
  const validateInputData = (data: PDFData): boolean => {
    if (!data?.inputData || !data?.result) {
      toast.error('Données incomplètes pour la génération du PDF');
      return false;
    }

    const required = ['E_jour', 'P_max', 'N_autonomie', 'V_batterie', 'H_solaire'];
    const missing = required.filter(field => !data.inputData[field]);
    
    if (missing.length > 0) {
      toast.error(`Données manquantes: ${missing.join(', ')}`);
      return false;
    }

    return true;
  };

  // Tableau des données d'entrée amélioré
  const addInputDataTable = (doc: jsPDF, data: PDFData, startY: number) => {
    const tableBuilder = new TableBuilder(doc, tableConfig);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(52, 152, 219);
    doc.text('1. Données d\'entrée', 20, startY);

    const headers = ['Paramètre', 'Valeur', 'Unité'];
    const inputData = [
      ['Consommation journalière', `${data.inputData.E_jour || 0}`, 'Wh'],
      ['Puissance maximale', `${data.inputData.P_max || 0}`, 'W'],
      ['Jours d\'autonomie', `${data.inputData.N_autonomie || 0}`, 'jours'],
      ['Tension batterie', `${data.inputData.V_batterie || 0}`, 'V'],
      ['Irradiation solaire', `${data.inputData.H_solaire || 0}`, 'kWh/m²/j'],
    ];

    const columnWidths = [80, 50, 40];
    return tableBuilder.drawTable(
      20, 
      startY + 8, 
      headers, 
      inputData, 
      columnWidths,
      tableConfig.sectionColors.parameters
    );
  };

  // Tableau des résultats amélioré
  const addResultsTable = (doc: jsPDF, data: PDFData, startY: number) => {
    const tableBuilder = new TableBuilder(doc, tableConfig);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(46, 204, 113);
    doc.text('2. Résultats du dimensionnement', 20, startY);

    const headers = ['Élément', 'Valeur', 'Unité'];
    const results = [
      ['Puissance totale', `${(data.result.puissance_totale || 0).toFixed(1)}`, 'W'],
      ['Capacité batterie', `${(data.result.capacite_batterie || 0).toFixed(1)}`, 'Wh'],
      ['Bilan énergétique annuel', `${(data.result.bilan_energetique_annuel || 0).toFixed(2)}`, 'kWh'],
      ['Coût total estimé', formatPrice(data.result.cout_total || 0), 'Ar'],
      ['Nombre de panneaux', `${data.result.nombre_panneaux || 0}`, 'unités'],
      ['Nombre de batteries', `${data.result.nombre_batteries || 0}`, 'unités'],
    ];

    const columnWidths = [80, 50, 40];
    return tableBuilder.drawTable(
      20, 
      startY + 8, 
      headers, 
      results, 
      columnWidths,
      tableConfig.sectionColors.results
    );
  };

  // Tableau des équipements amélioré
  const addEquipmentsTable = (doc: jsPDF, data: PDFData, startY: number) => {
    const tableBuilder = new TableBuilder(doc, tableConfig);
    const equipments = data.result?.equipements_recommandes;
    
    if (!equipments) {
      return startY; // Pas d'équipements à afficher
    }

    const equipmentData: string[][] = [];

    // Mappage des équipements avec vérifications
    const equipmentMap = [
      { 
        equipment: equipments.panneau, 
        name: 'Panneau', 
        quantity: data.result.nombre_panneaux || 0,
        getSpecs: (eq: any) => eq?.puissance_W ? `${eq.puissance_W} W` : 'N/A'
      },
      { 
        equipment: equipments.batterie, 
        name: 'Batterie', 
        quantity: data.result.nombre_batteries || 0,
        getSpecs: (eq: any) => eq?.capacite_Ah ? `${eq.capacite_Ah} Ah` : 'N/A'
      },
      { 
        equipment: equipments.regulateur, 
        name: 'Régulateur', 
        quantity: 1,
        getSpecs: (eq: any) => eq?.puissance_W ? `${eq.puissance_W} W` : 'MPPT'
      },
      { 
        equipment: equipments.onduleur, 
        name: 'Onduleur', 
        quantity: 1,
        getSpecs: (eq: any) => eq?.puissance_W ? `${eq.puissance_W} W` : 'N/A'
      },
      { 
        equipment: equipments.cable, 
        name: 'Câble', 
        quantity: 'Variable',
        getSpecs: () => 'Installation'
      },
    ];

    equipmentMap.forEach(({ equipment, name, quantity, getSpecs }) => {
      if (equipment) {
        const price = equipment.prix_unitaire ? 
          formatPrice(equipment.prix_unitaire) : 'N/A';
        
        equipmentData.push([
          name,
          equipment.modele || 'N/A',
          equipment.reference || 'N/A',
          getSpecs(equipment),
          price,
          quantity.toString()
        ]);
      }
    });

    if (equipmentData.length === 0) {
      return startY; // Aucun équipement valide
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(230, 126, 34);
    doc.text('3. Équipements recommandés', 20, startY);

    const headers = ['Type', 'Modèle', 'Référence', 'Specs', 'Prix', 'Qté'];
    const columnWidths = [25, 35, 30, 25, 30, 25];
    
    return tableBuilder.drawTable(
      20, 
      startY + 8, 
      headers, 
      equipmentData, 
      columnWidths,
      tableConfig.sectionColors.equipment
    );
  };

  // Ajout du footer amélioré
  const addFooter = (doc: jsPDF) => {
    const pageHeight = doc.internal.pageSize.height;
    
    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(20, pageHeight - 30, doc.internal.pageSize.width - 20, pageHeight - 30);
    
    // Texte du footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    
    const now = new Date();
    const generationDate = formatDate(now.toISOString());
    const generationTime = now.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    doc.text('Rapport généré automatiquement par le Calculateur Solaire', 20, pageHeight - 20);
    doc.text(`Date de génération: ${generationDate} à ${generationTime}`, 20, pageHeight - 15);
    
    // Numéro de page
    doc.text('Page 1', doc.internal.pageSize.width - 30, pageHeight - 15);
  };

  // Fonction principale de génération PDF
  const generatePDF = async (data: PDFData) => {
    setIsGenerating(true);
    
    try {
      // Validation des données
      if (!validateInputData(data)) {
        return { success: false, error: 'Données invalides' };
      }

      toast.info('Génération du rapport PDF en cours...', { autoClose: 2000 });

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

      toast.success('Rapport PDF téléchargé avec succès !', { autoClose: 4000 });
      toast.info(`Nom du fichier : ${fileName}`, { 
        autoClose: 6000, 
        position: 'bottom-right' 
      });

      return { success: true, fileName };
      
    } catch (error: unknown) {
      console.error('Erreur lors de la génération du PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(`Erreur lors de la génération du PDF : ${errorMessage}`, { 
        autoClose: 8000 
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsGenerating(false);
    }
  };

  // Version rapide avec tableau simplifié
  const generatePDFQuick = async (data: PDFData) => {
    setIsGenerating(true);
    
    try {
      if (!validateInputData(data)) {
        return { success: false, error: 'Données invalides' };
      }

      const doc = new jsPDF();
      const tableBuilder = new TableBuilder(doc, tableConfig);
      
      // Header simplifié mais cohérent
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, doc.internal.pageSize.width, 3, 'F');
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('Rapport de Dimensionnement - Résumé', 20, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const now = new Date();
      const dateStr = formatDate(now.toISOString());
      const location = data.inputData?.localisation || 'Non spécifiée';
      
      doc.text(`Date: ${dateStr}`, 20, 35);
      doc.text(`Localisation: ${location}`, 120, 35);

      // Tableau des résultats essentiels
      const headers = ['Élément', 'Valeur'];
      const quickResults = [
        ['Puissance totale', `${(data.result.puissance_totale || 0).toFixed(1)} W`],
        ['Coût total', formatPrice(data.result.cout_total || 0)],
        ['Panneaux nécessaires', `${data.result.nombre_panneaux || 0}`],
        ['Batteries nécessaires', `${data.result.nombre_batteries || 0}`],
      ];

      const columnWidths = [100, 70];
      tableBuilder.drawTable(
        20, 
        45, 
        headers, 
        quickResults, 
        columnWidths,
        tableConfig.sectionColors.results
      );
      
      const fileName = generateFilename(data, true);
      doc.save(fileName);

      toast.success('PDF téléchargé !', { autoClose: 2000 });
      return { success: true, fileName };
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error('Erreur lors de la génération du PDF', { autoClose: 4000 });
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