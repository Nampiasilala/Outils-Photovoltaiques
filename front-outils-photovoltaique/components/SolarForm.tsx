'use client';

import { useState } from 'react';

export default function SolarForm() {
  const [formData, setFormData] = useState({
    location: '',
    consumption: '',
    panelOrientation: 'south',
    panelInclination: '30',
    autonomyDays: '4',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Envoyer les données à une API ou effectuer les calculs
    console.log('Données soumises:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Localisation (ville ou coordonnées GPS)
        </label>
        <input
          type="text"
          name="location"
          id="location"
          value={formData.location}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          placeholder="Ex: Antananarivo"
        />
      </div>
      <div>
        <label htmlFor="consumption" className="block text-sm font-medium text-gray-700">
          Consommation journalière (kWh)
        </label>
        <input
          type="number"
          name="consumption"
          id="consumption"
          value={formData.consumption}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          placeholder="Ex: 5"
        />
      </div>
      <div>
        <label htmlFor="panelOrientation" className="block text-sm font-medium text-gray-700">
          Orientation des panneaux
        </label>
        <select
          name="panelOrientation"
          id="panelOrientation"
          value={formData.panelOrientation}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
        >
          <option value="south">Sud</option>
          <option value="north">Nord</option>
          <option value="east">Est</option>
          <option value="west">Ouest</option>
        </select>
      </div>
      <div>
        <label htmlFor="panelInclination" className="block text-sm font-medium text-gray-700">
          Inclinaison des panneaux (°)
        </label>
        <input
          type="number"
          name="panelInclination"
          id="panelInclination"
          value={formData.panelInclination}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          placeholder="Ex: 30"
        />
      </div>
      <div>
        <label htmlFor="autonomyDays" className="block text-sm font-medium text-gray-700">
          Jours d’autonomie
        </label>
        <input
          type="number"
          name="autonomyDays"
          id="autonomyDays"
          value={formData.autonomyDays}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          placeholder="Ex: 4"
        />
      </div>
      <button type="submit" className="btn-primary">
        Calculer
      </button>
    </form>
  );
}