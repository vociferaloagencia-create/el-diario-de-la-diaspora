import React from 'react';

interface TranslatedCategoryNameProps {
  name: string;
}

/**
 * Ensures "Deportes" is strictly translated as "Sport" in French 
 * rather than "Sportif" via Google Translate DOM manipulation CSS trick.
 * Ensures "Actualidad" is translated to "Actualités" (FR) and "News" (EN)
 */
export function TranslatedCategoryName({ name }: TranslatedCategoryNameProps) {
  const lowerName = name.toLowerCase();

  if (lowerName === 'deportes') {
    return (
      <>
        <span className="fr-lang-hide">{name}</span>
        <span className="fr-lang-show notranslate">Sport</span>
      </>
    );
  }

  if (lowerName === 'actualidad') {
    return (
      <>
        <span className="hide-on-fr hide-on-en">{name}</span>
        <span className="lang-fr-only notranslate">Actualités</span>
        <span className="lang-en-only notranslate">News</span>
      </>
    );
  }

  return <>{name}</>;
}
