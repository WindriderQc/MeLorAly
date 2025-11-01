# MeLorAly - Cleanup Analysis & Findings

**Date:** November 1, 2025  
**Status:** Analysis Complete

## Executive Summary

MeLorAly is a **family-focused educational support application** designed to help families manage children's education, from early childhood to adolescence. The current folder contains HTML prototypes/mockups created with Stitch (likely a design tool) that represent different screens of the application.

### Current State
- **Total Files:** 101 files
- **HTML Pages:** 28 unique screens
- **Screenshots:** 56 PNG files (many duplicates)
- **Zip Archives:** 28 zip files (exported Stitch designs)
- **Excel Spec:** 1 specification file (binary, needs Excel to view)

---

## 🔍 Identified Issues & Duplicates

### 1. **Duplicate HTML Files (CRITICAL)**
Multiple folders contain the exact same HTML code:

#### About Us Page - 2 identical copies:
- `a.propos.de.nous/à_propos_de_nous_familial/code.html` (10,204 bytes)
- `a.propos.de.nous/stitch_accueil_familiale 6/à_propos_de_nous_familial/code.html` (10,204 bytes)

#### Welcome/Onboarding Pages - 2 identical copies:
- `bienvenue/onboarding_-_bienvenue/code.html` (2,769 bytes)
- `accueil.familiale/stitch_accueil_familiale/onboarding_-_bienvenue/code.html` (2,769 bytes)

#### Invite Family Members - 2 identical copies:
- `ajouter.membre.famille/inviter_membres_famille/code.html` (8,135 bytes)
- `ajouter.un.membre/stitch_accueil_familiale 3/inviter_membres_famille/code.html` (8,135 bytes)

#### Home/Welcome Variants - Multiple similar pages:
- `accueil.choix1/accueil_familiale/code.html`
- `accueil.choix2/accueil_familiale/code.html` (different name: accueilchoix2)
- `accueil.choix3/accueil_familiale/code.html`

### 2. **Duplicate Screenshots**
Most screenshots appear in TWO locations:
- Inside their respective folders (`Données.stitch/*/screen-*.png`)
- Centralized in `SCREEN/` folder (duplicates ~9MB of data)

### 3. **Unnecessary Zip Files**
Each folder contains a `stitch_accueil_familiale*.zip` file which appears to be:
- Export archives from the design tool
- Not needed for development
- Taking up ~6MB total

### 4. **Inconsistent Naming**
- Some folders use dots: `accueil.choix1`, `bienvenue.3`
- Some use mixed naming: `accueilchoix2` (no dot)
- Some use proper names: `Connexion`, `Messagerie`, `FAQ`

---

## 📱 Application Structure Analysis

### Core Features Identified

#### 1. **Authentication & Onboarding** (7 screens)
- **Connexion** - Login page with social auth (Google, Apple, Facebook)
- **création.compte** - Registration page
- **bienvenue** - Welcome screen (Step 1)
- **bienvenue.page2** - Children profiles onboarding (Step 2)
- **bienvenue.3** - Adults profiles onboarding (Step 3)
- **bienvenue5** - Profile setup (Step 4)
- **bienvenue6** - Ready to start (Step 5)
- **stitch_accueil_familiale** - Family space onboarding (Step 4 variant)

#### 2. **Home/Dashboard Variants** (3-4 screens)
- **accueil.choix1** - Home option 1
- **accueilchoix2** - Home option 2  
- **accueil.choix3** - Home option 3
- **tableau.de.bord** - Parental dashboard

#### 3. **Family Management** (3 screens)
- **ajouter.un.membre** - Add family member
- **ajouter.membre.famille** - Invite family members
- **espace.gp** - Grandparents dashboard

#### 4. **Educational Support** (3 screens)
- **soutien.pré-scolaire** - Pre-school support (playful/ludique)
- **soutien.scolaire** - School support (pedagogical)
- **accompagnement.parentale** - Parental guidance (in-depth)

#### 5. **Core App Features** (6 screens)
- **Messagerie** - Family messaging
- **notif.calendrier** - Notifications center
- **Profil.individu** - Individual profile management
- **Paramètres** - App settings
- **FAQ** - Frequently asked questions
- **Contact.Cie** - Support/Contact

---

## 🎨 Design System

### Color Palette (from HTML analysis)
```
Primary: #c98d1d (Golden/Warm Orange)
Background Light: #f8f7f6 / #f8f7f5 (Warm off-white)
Background Dark: #211b11 / #221810 (Dark brown)
```

### Font Family
- **Epilogue** (primary display font)
- **Noto Sans** (fallback)

### Framework & Tools
- **Tailwind CSS** (via CDN)
- **Google Material Symbols** (icons)
- **Stitch** (design/prototyping tool)
- Dark mode support throughout

---

## 📊 Cleanup Recommendations

### Priority 1: Remove Duplicates

#### Delete These Files (Exact Duplicates):
```
DELETE: a.propos.de.nous/stitch_accueil_familiale 6/
DELETE: accueil.familiale/stitch_accueil_familiale/
DELETE: ajouter.un.membre/stitch_accueil_familiale 3/
```

#### Delete All Zip Files (28 files, ~6MB):
```
DELETE: **/*.zip
```

### Priority 2: Consolidate Screenshots

**Option A** - Keep centralized SCREEN folder:
```
DELETE: All PNG files inside Données.stitch/*/ folders
KEEP: SCREEN/ folder with all screenshots
```

**Option B** - Keep distributed screenshots:
```
DELETE: SCREEN/ folder entirely
KEEP: Screenshots in their respective component folders
```

**Recommendation:** Option A - Centralized SCREEN folder is cleaner

### Priority 3: Standardize Naming

Rename folders for consistency:
```
RENAME: bienvenue.3 → bienvenue.adultes (or onboarding.adultes)
RENAME: bienvenue.page2 → bienvenue.enfants (or onboarding.enfants)
RENAME: bienvenue5 → bienvenue.profils (or onboarding.profils)
RENAME: bienvenue6 → bienvenue.pret (or onboarding.pret)
RENAME: accueilchoix2 → accueil.choix2
RENAME: notif.calendrier → notifications
```

### Priority 4: Clarify Home Screen Variants

The 3-4 home screen variants need clarification:
- Are these A/B test variations?
- Different user roles (parent vs grandparent)?
- Progressive states?

**Action:** Review and document the purpose of each variant, potentially consolidate

---

## 🗂️ Proposed Clean Structure

```
MeLorAly/
├── SPEC. - MeLorAly_.xlsx
├── CLEANUP_ANALYSIS.md (this file)
├── APP_SPECIFICATIONS.md (to be created)
├── PROTOTYPE_PLAN.md (to be created)
│
└── MeLorAly/
    └── Onboarding/
        ├── SCREENS/                    # All screenshots centralized
        │   ├── auth/
        │   ├── onboarding/
        │   ├── dashboard/
        │   ├── education/
        │   └── settings/
        │
        └── Prototypes/                 # HTML prototypes
            ├── 01-auth/
            │   ├── connexion/
            │   └── creation-compte/
            │
            ├── 02-onboarding/
            │   ├── bienvenue/
            │   ├── enfants/
            │   ├── adultes/
            │   ├── profils/
            │   ├── espace-famille/
            │   └── pret-a-partir/
            │
            ├── 03-home-dashboard/
            │   ├── tableau-de-bord-parental/
            │   ├── espace-grands-parents/
            │   └── (home variants to clarify)
            │
            ├── 04-family/
            │   ├── ajouter-membre/
            │   └── inviter-membres/
            │
            ├── 05-education/
            │   ├── soutien-pre-scolaire/
            │   ├── soutien-scolaire/
            │   └── accompagnement-parental/
            │
            └── 06-app-features/
                ├── messagerie/
                ├── notifications/
                ├── profil/
                ├── parametres/
                ├── faq/
                ├── a-propos/
                └── contact/
```

---

## 📈 Storage Optimization

### Current Storage: ~22 MB
- HTML files: ~220 KB
- Screenshots: ~15 MB (with duplicates ~9 MB unique)
- Zip files: ~6 MB
- Excel: ~5 KB

### After Cleanup: ~10 MB (55% reduction)
- HTML files: ~150 KB (unique only)
- Screenshots: ~9 MB (no duplicates)
- Zip files: 0 KB (removed)
- Excel: ~5 KB

---

## ✅ Next Steps

1. **Review this analysis** with stakeholders
2. **Decide on home screen variants** purpose
3. **Execute cleanup** (see PROTOTYPE_PLAN.md for detailed commands)
4. **Extract specifications** from HTML into structured documentation
5. **Create prototype development plan** with tech stack recommendations

---

## 🎯 App Mission Statement (from HTML)

> "Nous sommes une équipe passionnée dédiée à soutenir les familles dans l'éducation et le bien-être de leurs enfants. Notre application est conçue pour offrir des ressources et des outils pratiques, adaptés à chaque étape de la vie familiale, de la petite enfance à l'adolescence."

**Translation:** "We are a passionate team dedicated to supporting families in the education and well-being of their children. Our application is designed to offer practical resources and tools, adapted to each stage of family life, from early childhood to adolescence."
