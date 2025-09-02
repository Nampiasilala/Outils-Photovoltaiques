// app/hooks/usePDFGenerator.ts - Version améliorée avec cohérence mobile
import { useState } from "react";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import {
  formatPrice,
  formatEnergy,
  formatDate,
  sanitizeFilename,
} from "@/utils/formatters";

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
    },
  };

  // --- Helpers affichage + pagination ---
  const ensurePageBreak = (doc: jsPDF, currentY: number, needed: number) => {
    const pageH = doc.internal.pageSize.height;
    const bottomMargin = 30; // espace pour footer
    if (currentY + needed > pageH - bottomMargin) {
      doc.addPage();
      return 20; // marge top par défaut pour page suivante
    }
    return currentY;
  };

  const labelPriorite = (v?: string) =>
    v === "quantite" ? "Nombre minimal" : "Coût minimal"; // défaut = 'cout'

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
      this.drawTableHeader(
        startX,
        currentY,
        headers,
        columnWidths,
        headerColor
      );
      currentY += this.config.headerHeight;

      // Data rows
      data.forEach((row, index) => {
        this.drawTableRow(startX, currentY, row, columnWidths, index % 2 === 1);
        currentY += this.config.rowHeight;
      });

      // Border autour du tableau
      const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
      const totalHeight =
        this.config.headerHeight + data.length * this.config.rowHeight;
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
      this.doc.rect(startX, startY, totalWidth, this.config.headerHeight, "F");

      // Texte du header
      this.doc.setTextColor(255, 255, 255); // Blanc
      this.doc.setFontSize(this.config.headerFontSize);
      this.doc.setFont("helvetica", "bold");

      let currentX = startX;
      headers.forEach((header, i) => {
        this.doc.text(header, currentX + 2, startY + 5.5);
        // Ligne verticale
        if (i < headers.length - 1) {
          this.doc.setDrawColor(255, 255, 255);
          this.doc.line(
            currentX + columnWidths[i],
            startY,
            currentX + columnWidths[i],
            startY + this.config.headerHeight
          );
        }
        currentX += columnWidths[i];
      });
    }

    private drawTableRow(
      startX: number,
      startY: number,
      row: string[],
      columnWidths: number[],
      isAlternate: boolean
    ) {
      // Background alterné
      if (isAlternate) {
        const [r, g, b] = this.config.alternateRowColor;
        this.doc.setFillColor(r, g, b);
        const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
        this.doc.rect(startX, startY, totalWidth, this.config.rowHeight, "F");
      }

      // Texte de la ligne
      this.doc.setTextColor(0, 0, 0); // Noir
      this.doc.setFontSize(this.config.fontSize);
      this.doc.setFont("helvetica", "normal");

      let currentX = startX;
      row.forEach((cell, i) => {
        // Truncate le texte si trop long
        const maxChars = Math.floor(columnWidths[i] / 2.5);
        const displayText =
          cell.length > maxChars
            ? cell.substring(0, maxChars - 3) + "..."
            : cell;

        this.doc.text(displayText, currentX + 2, startY + 4);

        // Ligne verticale
        if (i < row.length - 1) {
          this.doc.setDrawColor(200, 200, 200);
          this.doc.line(
            currentX + columnWidths[i],
            startY,
            currentX + columnWidths[i],
            startY + this.config.rowHeight
          );
        }
        currentX += columnWidths[i];
      });

      // Ligne horizontale
      this.doc.setDrawColor(200, 200, 200);
      const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
      this.doc.line(
        startX,
        startY + this.config.rowHeight,
        startX + totalWidth,
        startY + this.config.rowHeight
      );
    }
  }

  // Générateur de nom de fichier amélioré
  const generateFilename = (data: PDFData, isQuick = false) => {
    const now = new Date();
    const dateStr = formatDate(now.toISOString()).replace(/\//g, "-");
    const location = sanitizeFilename(data.inputData?.localisation || "calcul");
    const prefix = isQuick ? "dimensionnement" : "dimensionnement-solaire";
    const timestamp = now.getTime();
    return `${prefix}-${dateStr}-${location}-${timestamp}.pdf`;
  };

  // Création du header amélioré
  const addHeader = (doc: jsPDF, data: PDFData) => {
    // Ligne de couleur en haut
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, doc.internal.pageSize.width, 5, "F");

    // Titre principal
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("Rapport de Dimensionnement Photovoltaïque", 20, 25);

    // Sous-titre
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Système solaire autonome", 20, 35);

    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 38, doc.internal.pageSize.width - 20, 38);

    // Informations générales
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    const now = new Date();
    const dateStr = formatDate(now.toISOString());
    const location = data.inputData?.localisation || "Non spécifiée";

    doc.text(`Date du rapport: ${dateStr}`, 20, 48);
    doc.text(`Localisation: ${location}`, 120, 48);

    return 58; // Position Y de départ pour le contenu
  };

  // Validation des données d'entrée
  const validateInputData = (data: PDFData): boolean => {
    if (!data?.inputData || !data?.result) {
      toast.error("Données incomplètes pour la génération du PDF");
      return false;
    }

    const required = [
      "E_jour",
      "P_max",
      "N_autonomie",
      "V_batterie",
      "H_solaire",
    ];
    const missing = required.filter((field) => !data.inputData[field]);

    if (missing.length > 0) {
      toast.error(`Données manquantes: ${missing.join(", ")}`);
      return false;
    }

    return true;
  };

  const addInputDataTable = (doc: jsPDF, data: PDFData, startY: number) => {
    const tableBuilder = new TableBuilder(doc, tableConfig);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(52, 152, 219);
    doc.text("1. Données d'entrée", 20, startY);

    const headers = ["Paramètre", "Valeur", "Unité"];
    const inputData: string[][] = [
      ["Consommation journalière", `${data.inputData.E_jour ?? 0}`, "Wh"],
      ["Puissance maximale", `${data.inputData.P_max ?? 0}`, "W"],
      ["Jours d'autonomie", `${data.inputData.N_autonomie ?? 0}`, "jours"],
      ["Tension batterie", `${data.inputData.V_batterie ?? 0}`, "V"],
      ["Irradiation solaire", `${data.inputData.H_solaire ?? 0}`, "kWh/m²/j"],
      ["Hauteur vers le toit", `${data.inputData.H_vers_toit ?? "—"}`, "m"],
      [
        "Stratégie de sélection",
        labelPriorite(data.inputData.priorite_selection),
        "—",
      ],
    ];

    const columnWidths = [80, 50, 40];
    // pagination sûre
    const totalHeight =
      tableConfig.headerHeight + tableConfig.rowHeight * inputData.length + 10;
    const y = ensurePageBreak(doc, startY + 8, totalHeight);

    return tableBuilder.drawTable(
      20,
      y,
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
    doc.setFont("helvetica", "bold");
    doc.setTextColor(46, 204, 113);
    doc.text("2. Résultats du dimensionnement", 20, startY);

    const headers = ["Élément", "Valeur", "Unité"];
    const results: string[][] = [
      [
        "Puissance totale",
        `${(data.result.puissance_totale ?? 0).toFixed(1)}`,
        "W",
      ],
      [
        "Capacité batterie",
        `${(data.result.capacite_batterie ?? 0).toFixed(1)}`,
        "Ah",
      ],
      // bilan_energetique_annuel est en Wh/an → on passe par formatEnergy
      [
        "Bilan énergétique annuel",
        formatEnergy(data.result.bilan_energetique_annuel ?? 0),
        "",
      ],
      ["Coût total estimé", formatPrice(data.result.cout_total ?? 0), "Ar"],
      ["Nombre de panneaux", `${data.result.nombre_panneaux ?? 0}`, "unités"],
      ["Nombre de batteries", `${data.result.nombre_batteries ?? 0}`, "unités"],
    ];

    const columnWidths = [80, 50, 40];
    const totalHeight =
      tableConfig.headerHeight + tableConfig.rowHeight * results.length + 10;
    const y = ensurePageBreak(doc, startY + 8, totalHeight);

    return tableBuilder.drawTable(
      20,
      y,
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

    if (!equipments) return startY;

    // Fallback longueur câble si le backend ne l’a pas renvoyée
    const lCable = Number.isFinite(data.result?.longueur_cable_global_m)
      ? Number(data.result.longueur_cable_global_m)
      : Number(data.inputData?.H_vers_toit) > 0
      ? Math.round(Number(data.inputData.H_vers_toit) * 2 * 1.2)
      : 0;

    // Prix total câble : priorité à la valeur backend, sinon calcule prix_unitaire * longueur
    const prixCableTotal = Number.isFinite(data.result?.prix_cable_global)
      ? Number(data.result.prix_cable_global)
      : equipments?.cable?.prix_unitaire && lCable
      ? equipments.cable.prix_unitaire * lCable
      : 0;

    const equipmentData: string[][] = [];

    const pushIf = (cond: any, row: string[]) => {
      if (cond) equipmentData.push(row);
    };

    pushIf(equipments.panneau, [
      "Panneau",
      equipments.panneau?.modele ?? "N/A",
      equipments.panneau?.reference ?? "N/A",
      equipments.panneau?.puissance_W
        ? `${equipments.panneau.puissance_W} W`
        : "N/A",
      formatPrice(equipments.panneau?.prix_unitaire ?? 0),
      String(data.result?.nombre_panneaux ?? 0),
    ]);

    pushIf(equipments.batterie, [
      "Batterie",
      equipments.batterie?.modele ?? "N/A",
      equipments.batterie?.reference ?? "N/A",
      equipments.batterie?.capacite_Ah
        ? `${equipments.batterie.capacite_Ah} Ah`
        : "N/A",
      formatPrice(equipments.batterie?.prix_unitaire ?? 0),
      String(data.result?.nombre_batteries ?? 0),
    ]);

    pushIf(equipments.regulateur, [
      "Régulateur",
      equipments.regulateur?.modele ?? "N/A",
      equipments.regulateur?.reference ?? "N/A",
      equipments.regulateur?.puissance_W
        ? `${equipments.regulateur.puissance_W} W`
        : "MPPT / PWM",
      formatPrice(equipments.regulateur?.prix_unitaire ?? 0),
      "1",
    ]);

    pushIf(equipments.onduleur, [
      "Onduleur",
      equipments.onduleur?.modele ?? "N/A",
      equipments.onduleur?.reference ?? "N/A",
      equipments.onduleur?.puissance_W
        ? `${equipments.onduleur.puissance_W} W`
        : "N/A",
      formatPrice(equipments.onduleur?.prix_unitaire ?? 0),
      "1",
    ]);

    // ✅ Câble – on affiche la longueur réelle et le prix total
    pushIf(equipments.cable, [
      "Câble",
      equipments.cable?.modele ?? "N/A",
      equipments.cable?.reference ?? "N/A",
      lCable ? `${lCable} m` : "—",
      formatPrice(prixCableTotal),
      lCable ? `${lCable} m` : "—",
    ]);

    if (equipmentData.length === 0) return startY;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(230, 126, 34);
    doc.text("3. Équipements recommandés", 20, startY);

    const headers = ["Type", "Modèle", "Référence", "Specs", "Prix", "Qté"];
    const columnWidths = [25, 35, 30, 25, 30, 25];

    const totalHeight =
      tableConfig.headerHeight +
      tableConfig.rowHeight * equipmentData.length +
      10;
    const y = ensurePageBreak(doc, startY + 8, totalHeight);

    return tableBuilder.drawTable(
      20,
      y,
      headers,
      equipmentData,
      columnWidths,
      tableConfig.sectionColors.equipment
    );
  };

  // Remplacez la fonction addTopologiesSection par cette version corrigée :

const addTopologiesSection = (doc: jsPDF, data: PDFData, startY: number) => {
  const tableBuilder = new TableBuilder(doc, tableConfig);

  // Vérifier s'il y a des données de topologie à afficher
  const hasPV = data.result?.topologie_pv || 
    (data.result?.nb_pv_serie != null && data.result?.nb_pv_parallele != null);
  const hasBatt = data.result?.topologie_batterie || 
    (data.result?.nb_batt_serie != null && data.result?.nb_batt_parallele != null);
  
  if (!hasPV && !hasBatt) return startY;

  // ✅ Création d'un seul tableau unifié
  const headers = ["Type", "Configuration", "Série", "Parallèle", "Total"];
  const topologyData: string[][] = [];

  // Ajouter les données PV si disponibles
  if (hasPV) {
    const configPV = data.result.topologie_pv || 
      `${data.result.nb_pv_serie ?? "—"}S${data.result.nb_pv_parallele ?? "—"}P`;
    
    topologyData.push([
      "Panneaux PV",
      configPV,
      `${data.result.nb_pv_serie ?? "—"}`,
      `${data.result.nb_pv_parallele ?? "—"}`,
      `${data.result.nombre_panneaux ?? "—"}`
    ]);
  }

  // Ajouter les données batteries si disponibles
  if (hasBatt) {
    const configBatt = data.result.topologie_batterie || 
      `${data.result.nb_batt_serie ?? "—"}S${data.result.nb_batt_parallele ?? "—"}P`;
    
    topologyData.push([
      "Batteries",
      configBatt,
      `${data.result.nb_batt_serie ?? "—"}`,
      `${data.result.nb_batt_parallele ?? "—"}`,
      `${data.result.nombre_batteries ?? "—"}`
    ]);
  }

  // ✅ Calculer l'espace total nécessaire (titre + tableau)
  const columnWidths = [35, 45, 25, 25, 25];
  const totalHeight = 15 + // Espacement initial
                     10 + // Espace pour le titre
                     tableConfig.headerHeight + 
                     tableConfig.rowHeight * topologyData.length + 20;
  
  // ✅ Vérifier le saut de page AVANT de placer le titre
  const finalY = ensurePageBreak(doc, startY, totalHeight);

  // ✅ Placer le titre APRÈS la vérification de saut de page
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(41, 128, 185);
  doc.text("4. Topologies", 20, finalY + 10);

  // ✅ Dessiner le tableau unifié (15 unités après le titre)
  const endY = tableBuilder.drawTable(
    20,
    finalY + 18, // Position du tableau après le titre
    headers,
    topologyData,
    columnWidths,
    [41, 128, 185] // Couleur bleue pour la section
  );

  return endY;
};

  // Helpers compatibles toutes versions de jsPDF (et OK pour TS strict)
  const getPageCountSafe = (doc: jsPDF): number => {
    const d = doc as any;
    if (typeof d.getNumberOfPages === "function") return d.getNumberOfPages();
    if (d.internal && typeof d.internal.getNumberOfPages === "function") {
      return d.internal.getNumberOfPages();
    }
    // Anciennes versions: d.internal.pages est un tableau (indexé à partir de 1)
    const pages = d.internal?.pages;
    return Array.isArray(pages) ? Math.max(1, pages.length - 1) : 1;
  };

  const setPageSafe = (doc: jsPDF, pageNumber: number): void => {
    const d = doc as any;
    if (typeof d.setPage === "function") d.setPage(pageNumber);
    // Sinon: on ne fait rien, certaines versions n'exposent pas setPage
  };

  // Ajout du footer amélioré
  const addFooter = (doc: jsPDF) => {
    const pageCount = getPageCountSafe(doc);

    for (let i = 1; i <= pageCount; i++) {
      setPageSafe(doc, i);

      // Largeur/hauteur compatibles toutes versions
      const anyDoc = doc as any;
      const pageHeight =
        anyDoc.internal?.pageSize?.height ?? doc.internal.pageSize.height;
      const pageWidth =
        anyDoc.internal?.pageSize?.width ?? doc.internal.pageSize.width;

      // Ligne de séparation
      doc.setDrawColor(200, 200, 200);
      doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);

      // Texte footer
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(128, 128, 128);

      const now = new Date();
      const generationDate = formatDate(now.toISOString());
      const generationTime = now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      doc.text(
        "Rapport généré automatiquement par le Calculateur Solaire",
        20,
        pageHeight - 20
      );
      doc.text(
        `Date de génération: ${generationDate} à ${generationTime}`,
        20,
        pageHeight - 15
      );
      doc.text(`Page ${i} / ${pageCount}`, pageWidth - 35, pageHeight - 15);
    }
  };

  // Fonction principale de génération PDF
  const generatePDF = async (data: PDFData) => {
    setIsGenerating(true);

    try {
      // Validation des données
      if (!validateInputData(data)) {
        return { success: false, error: "Données invalides" };
      }

      toast.info("Génération du rapport PDF en cours...", { autoClose: 2000 });

      const doc = new jsPDF();

      // Construction du PDF
      let currentY = addHeader(doc, data);
      currentY = addInputDataTable(doc, data, currentY + 10);
      currentY = addResultsTable(doc, data, currentY + 10);
      currentY = addEquipmentsTable(doc, data, currentY + 10);
      currentY = addTopologiesSection(doc, data, currentY + 10);

      // Footer sur toutes les pages
      addFooter(doc);

      // Sauvegarde
      const fileName = generateFilename(data);
      doc.save(fileName);

      toast.success("Rapport PDF téléchargé avec succès !", {
        autoClose: 4000,
      });
      toast.info(`Nom du fichier : ${fileName}`, {
        autoClose: 6000,
        position: "bottom-right",
      });

      return { success: true, fileName };
    } catch (error: unknown) {
      console.error("Erreur lors de la génération du PDF:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      toast.error(`Erreur lors de la génération du PDF : ${errorMessage}`, {
        autoClose: 8000,
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
        return { success: false, error: "Données invalides" };
      }

      const doc = new jsPDF();
      const tableBuilder = new TableBuilder(doc, tableConfig);

      // Header simplifié mais cohérent
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, doc.internal.pageSize.width, 3, "F");

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(41, 128, 185);
      doc.text("Rapport de Dimensionnement - Résumé", 20, 25);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      const now = new Date();
      const dateStr = formatDate(now.toISOString());
      const location = data.inputData?.localisation || "Non spécifiée";

      doc.text(`Date: ${dateStr}`, 20, 35);
      doc.text(`Localisation: ${location}`, 120, 35);

      // Tableau des résultats essentiels
      const headers = ["Élément", "Valeur"];
      const quickResults = [
        [
          "Puissance totale",
          `${(data.result.puissance_totale || 0).toFixed(1)} W`,
        ],
        ["Coût total", formatPrice(data.result.cout_total || 0)],
        ["Panneaux nécessaires", `${data.result.nombre_panneaux || 0}`],
        ["Batteries nécessaires", `${data.result.nombre_batteries || 0}`],
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

      toast.success("PDF téléchargé !", { autoClose: 2000 });
      return { success: true, fileName };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      toast.error("Erreur lors de la génération du PDF", { autoClose: 4000 });
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
