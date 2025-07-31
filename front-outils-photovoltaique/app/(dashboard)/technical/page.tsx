'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

// Assure-toi que ce chemin est bon
const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), { ssr: false });

export default function Technical() {
  const [content, setContent] = useState('<p>Contenu initial</p>');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Fiche technique</h1>

        <TiptapEditor content={content} onChange={setContent} editable={isEditing} />

        <div className="mt-4 flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Enregistrer
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Annuler
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Modifier
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
