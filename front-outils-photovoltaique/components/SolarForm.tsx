"use client";

import { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

interface Appliance {
  name: string;
  power: number;
  quantity: number;
  hoursPerDay: number;
  isAC: boolean;
}

interface FormData {
  appliances: Appliance[];
  location: string;
  hsp: number;
  autonomyDays: number;
  systemVoltage: number;
  budget: number;
}

export default function SolarForm() {
  const [formData, setFormData] = useState<FormData>({
    appliances: [
      { name: "", power: 0, quantity: 1, hoursPerDay: 0, isAC: true },
    ],
    location: "",
    hsp: 4, // Valeur par défaut (heures d'ensoleillement équivalent)
    autonomyDays: 2, // Par défaut 2 jours d'autonomie
    systemVoltage: 24, // Par défaut 24V
    budget: 0, // Budget facultatif
  });

  const [errors, setErrors] = useState<string[]>([]);

  // Ajouter un nouvel appareil
  const addAppliance = () => {
    setFormData((prev) => ({
      ...prev,
      appliances: [
        ...prev.appliances,
        { name: "", power: 0, quantity: 1, hoursPerDay: 0, isAC: true },
      ],
    }));
  };

  // Supprimer un appareil
  const removeAppliance = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      appliances: prev.appliances.filter((_, i) => i !== index),
    }));
  };

  // Mettre à jour un champ d'appareil
  const updateAppliance = (
    index: number,
    field: keyof Appliance,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      appliances: prev.appliances.map((app, i) =>
        i === index ? { ...app, [field]: value } : app
      ),
    }));
  };

  // Mettre à jour les autres champs
  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Valider le formulaire
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    // Vérifier les appareils
    formData.appliances.forEach((app, index) => {
      if (!app.name)
        newErrors.push(`Le nom de l'appareil ${index + 1} est requis.`);
      if (app.power <= 0)
        newErrors.push(
          `La puissance de l'appareil ${index + 1} doit être supérieure à 0.`
        );
      if (app.quantity <= 0)
        newErrors.push(
          `La quantité de l'appareil ${index + 1} doit être supérieure à 0.`
        );
      if (app.hoursPerDay < 0)
        newErrors.push(
          `Les heures d'utilisation de l'appareil ${
            index + 1
          } doivent être positives.`
        );
    });

    // Vérifier les autres champs
    if (!formData.location) newErrors.push("La localisation est requise.");
    if (formData.hsp <= 0)
      newErrors.push(
        "Les heures d'ensoleillement doivent être supérieures à 0."
      );
    if (formData.autonomyDays <= 0)
      newErrors.push("Les jours d'autonomie doivent être supérieurs à 0.");
    if (![12, 24, 48].includes(formData.systemVoltage)) {
      newErrors.push("La tension du système doit être 12V, 24V ou 48V.");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Exemple : Envoyer les données au backend Django via une API
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Erreur lors du calcul.");
      const result = await response.json();
      console.log("Résultat du calcul :", result);

      // TODO : Afficher les résultats (puissance PV, équipements, bilan énergétique)
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : "Une erreur est survenue.",
      ]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-body">
      {/* Section : Appareils */}
      <h3 className="text-sm font-semibold mb-2">
        Informations sur les appareils
      </h3>
      <div className="overflow-x-auto text-sm">
        <table className="table w-full text-sm">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Puissance (W)</th>
              <th>Quantité</th>
              <th>Heures/Jour</th>
              <th>Type (AC/DC)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {formData.appliances.map((app, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={app.name}
                    onChange={(e) =>
                      updateAppliance(index, "name", e.target.value)
                    }
                    className="input input-bordered w-full"
                    placeholder="Ex. : Réfrigérateur"
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={app.power || ""}
                    onChange={(e) =>
                      updateAppliance(index, "power", Number(e.target.value))
                    }
                    className="input input-bordered w-full"
                    placeholder="Ex. : 150"
                    min="0"
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={app.quantity || ""}
                    onChange={(e) =>
                      updateAppliance(index, "quantity", Number(e.target.value))
                    }
                    className="input input-bordered w-full"
                    placeholder="Ex. : 1"
                    min="1"
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={app.hoursPerDay || ""}
                    onChange={(e) =>
                      updateAppliance(
                        index,
                        "hoursPerDay",
                        Number(e.target.value)
                      )
                    }
                    className="input input-bordered w-full"
                    placeholder="Ex. : 5"
                    min="0"
                    step="0.1"
                    required
                  />
                </td>
                <td>
                  <select
                    value={app.isAC ? "AC" : "DC"}
                    onChange={(e) =>
                      updateAppliance(index, "isAC", e.target.value === "AC")
                    }
                    className="select select-bordered w-full"
                  >
                    <option>AC</option>
                    <option>DC</option>
                  </select>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => removeAppliance(index)}
                    className="btn btn-error btn-sm"
                    disabled={formData.appliances.length === 1}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Boutons sur la même ligne */}
      <div className="flex flex-row gap-4 mt-6">
        <button
          type="button"
          onClick={addAppliance}
          className="inline-flex items-center px-4 py-2 border border-green-600 text-green-600 bg-transparent rounded-md text-sm hover:bg-green-600 hover:text-white transition-colors flex-1 sm:flex-none"
        >
          <FaPlus className="mr-2" /> Appareil
        </button>
      </div>

      {/* Section : Localisation et paramètres */}
      <h3 className="text-sm font-semibold mt-8 mb-4">Autres informations</h3>
      <div className="grid grid-cols-1 text-sm md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Localisation</span>
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => updateField("location", e.target.value)}
            className="input input-bordered"
            placeholder="Ex. : Antananarivo"
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Heures d’ensoleillement (HSP)</span>
          </label>
          <input
            type="number"
            value={formData.hsp || ""}
            onChange={(e) => updateField("hsp", Number(e.target.value))}
            className="input input-bordered"
            placeholder="Ex. : 4.5"
            min="0"
            step="0.1"
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Jours d’autonomie</span>
          </label>
          <input
            type="number"
            value={formData.autonomyDays || ""}
            onChange={(e) =>
              updateField("autonomyDays", Number(e.target.value))
            }
            className="input input-bordered"
            placeholder="Ex. : 2"
            min="1"
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Tension du système (V)</span>
          </label>
          <select
            value={formData.systemVoltage}
            onChange={(e) =>
              updateField("systemVoltage", Number(e.target.value))
            }
            className="select select-bordered"
            required
          >
            <option value={12}>12V</option>
            <option value={24}>24V</option>
            <option value={48}>48V</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">
              Budget approximatif (€, facultatif)
            </span>
          </label>
          <input
            type="number"
            value={formData.budget || ""}
            onChange={(e) => updateField("budget", Number(e.target.value))}
            className="input input-bordered"
            placeholder="Ex. : 5000"
            min="0"
          />
        </div>
      </div>

      {/* Erreurs */}
      {errors.length > 0 && (
        <div className="alert alert-error mt-4">
          <ul className="list-disc pl-5">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Soumission */}
      <div className="form-control mt-6">
        <button type="submit" className="btn btn-primary text-sm">
          Calculer
        </button>
      </div>
    </form>
  );
}
