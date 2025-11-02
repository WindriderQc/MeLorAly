# MeLorAly - Design System Documentation

Basé sur les maquettes Stitch dans /Onboarding/Données.stitch

## 🎨 Couleurs

### Palette Principale
- **Primary (Orange)**: `#f58a3d`
- **Background Light**: `#f8f7f5`  
- **Background Dark**: `#221810`
- **Text Dark**: `#221810`
- **Text Light**: `#f8f7f5`

### Couleurs Secondaires
- Bleu (Accueil): `#13a4ec`
- Or (Onboarding final): `#c98d1d`
- Vert succès: `#10b981`

## 📝 Typographie

### Police Principale
- **Font**: Epilogue (Google Fonts)
- **Weights**: 400 (Regular), 500 (Medium), 700 (Bold), 900 (Black)

### Hiérarchie
- **H1**: 3xl (1.875rem) - Bold
- **H2**: 2xl (1.5rem) - Bold  
- **H3**: xl (1.25rem) - Bold
- **Body**: base (1rem) - Regular
- **Small**: sm (0.875rem) - Regular

## 🎯 Border Radius

- **Default**: 1rem (16px)
- **Large**: 2rem (32px)
- **XL**: 3rem (48px)
- **Full**: 9999px (complètement rond)

## 🏗️ Composants

### Cartes
- Border radius: 1-2rem
- Shadow subtile
- Padding: 1-1.5rem
- Background: blanc ou #f8f7f5

### Boutons
- **Primary**: Background #f58a3d, texte blanc
- **Secondary**: Outline avec bordure primaire
- Radius: 0.5-1rem
- Padding: 0.75rem 1.5rem
- Font weight: 500-700

### Formulaires
- Input background: blanc
- Border: gris clair
- Focus: bordure primaire
- Radius: 0.5-1rem
- Padding: 0.75-1rem

## 📱 Layout

### Mobile-First
- Container max-width: 100%
- Padding horizontal: 1rem (16px)
- Padding vertical: 1.5-2rem

### Header
- Sticky top-0
- Background: #f8f7f5/80 avec backdrop-blur
- Height: 64px
- Z-index: 10

### Navigation Bottom
- Fixed bottom-0
- Background: blanc
- Shadow vers le haut
- Icons Material Symbols

## ✨ Style Particulier

### Onboarding
- Images plein écran en haut
- Texte centré
- Boutons arrondis complets (rounded-full)
- Espacement généreux

### Dashboard
- Cards avec images de fond
- Grid 2 colonnes sur mobile
- Gradients subtils
- Icons Material Symbols

### Auth Pages  
- Formulaires centrés
- Background avec image
- Overlay sombre sur images
- Boutons sociaux (Google, Facebook, Apple)

## 🎭 Animations
- Transitions smooth (0.3s)
- Hover: légère élévation (shadow)
- Focus: ring primaire