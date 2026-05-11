export type Lang = 'pl' | 'en' | 'lt';

export interface T {
  nav: {
    brand: string; myProjects: string; archive: string; profile: string;
    portfolio: string; addProject: string; about: string; login: string; logout: string;
  };
  about: { title: string; description: string; };
  login: {
    title: string; subtitle: string; email: string; password: string;
    loggingIn: string; submit: string; noAccount: string; register: string;
    successToast: string; errorFallback: string;
  };
  register: {
    title: string; subtitle: string; fullName: string; email: string; password: string;
    passwordPlaceholder: string; confirmPassword: string;
    passwordMismatch: string; passwordTooShort: string; creating: string; submit: string;
    hasAccount: string; login: string; successToast: string; errorFallback: string;
  };
  myProjects: {
    offlineBanner: string; title: string; subtitle: (n: number) => string;
    addProject: string; emptyIcon: string; emptyTitle: string; emptyText: string;
    deleteConfirm: string; deleteSuccess: string; deleteError: string;
  };
  archive: {
    title: string; subtitle: (n: number) => string; searchPlaceholder: string;
    search: string; clear: string; allTechnologies: string; allLevels: string;
    emptyIcon: string; emptyTitle: string; emptyText: string;
    deleteConfirm: string; deleteSuccess: string; deleteError: string;
  };
  addProject: {
    title: string; subtitle: string; sectionBasic: string; labelTitle: string;
    titlePlaceholder: string; labelDesc: string; descPlaceholder: string;
    labelRole: string; rolePlaceholder: string; sectionSource: string;
    sourceHint: string; labelRepo: string; repoHint: string; labelFile: string;
    fileSelected: (name: string) => string; warnSource: string;
    analyzing: string; submit: string; cancel: string;
    errorSource: string; successToast: string; errorFallback: string;
  };
  projectDetail: {
    back: string; editTitle: string; labelTitle: string; labelDesc: string;
    labelRole: string; labelRepo: string; save: string; cancel: string;
    editBtn: string; repoBtn: string; analyzing: string; reanalyze: string; deleteBtn: string;
    technologiesTitle: (n: number) => string; noTechnologies: string;
    aiDocTitle: string; aiStatus: string; aiNoDoc: string; aiUnavailable: string;
    aiCompleteness: string; aiReadability: string; aiBusinessContext: string;
    aiTechStack: string; aiTechStackRationale: string; aiSummary: string;
    noData: string; noScore: string;
    scoringTitle: string; scoringUnit: string; infoTitle: string;
    infoRole: string; infoTech: string; infoCicd: string; infoDocs: string;
    infoAdded: string; infoRepoCreated: string; infoLastActivity: string;
    infoStars: string; infoFiles: string;
    yes: string; no: string; yesPdf: string;
    downloadsTitle: string; downloadZipLabel: string; downloadZipBtn: string;
    downloadDocLabel: string; downloadDocBtn: string; noFile: string;
    deleteConfirm: string; deleteSuccess: string;
    analyzeSuccess: string; analyzeError: string;
    updateSuccess: string; updateError: string;
  };
  profile: {
    title: string; statProjects: string; statTechnologies: string;
    statTopSkills: string; statRecommendations: string;
    radarTitle: string; emptyIcon: string; emptyTitle: string; emptyText: string;
    tooltipStrength: string; strengthTitle: string;
    skillStat: (count: number, avg: number) => string;
    topTitle: string; recoTitle: string; recoText: string; recoEmpty: string;
    allTechTitle: (n: number) => string;
    contactsTitle: string; contactsEdit: string; contactsSave: string; contactsCancel: string;
    contactsEmpty: string; contactsSaved: string; contactsError: string;
  };
  portfolios: {
    title: string; subtitle: (n: number) => string; generateBtn: string;
    emptyIcon: string; emptyTitle: string; emptyText: string;
    projects: (n: number) => string;
    open: string; copyLink: string; delete: string; created: string;
    linkCopied: string; selectError: string; successToast: string; errorToast: string;
    deleteConfirm: string; deleteSuccess: string; modalTitle: string;
    labelName: string; defaultName: string; labelDesc: string;
    selectTitle: (n: number) => string; noProjects: string;
    generating: string; generate: string; cancel: string;
  };
  publicPortfolio: {
    notFoundIcon: string; notFound: string; errorMsg: string;
    badge: string; projectsCount: (n: number) => string; downloadPdf: string;
    aiDescriptionTitle: string; noProjects: string; technologies: string;
    footer: (date: string) => string;
  };
  projectCard: {
    details: string; github: string; delete: string;
    confidence: (n: number) => string; pts: string;
  };
  difficulty: Record<string, string>;
  dateLocale: string;
}

const pl: T = {
  nav: {
    brand: 'Archiwum Projektów', myProjects: 'Moje Projekty', archive: 'Archiwum',
    profile: 'Profil', portfolio: 'Portfolio', addProject: '+ Dodaj Projekt',
    about: 'O projekcie', login: 'Zaloguj się', logout: 'Wyloguj',
  },
  about: {
    title: 'A Smart Archive of Student Projects',
    description: 'Inteligentne archiwum projektów studenckich pozwala gromadzić, opisywać i analizować projekty tworzone przez studentów. System pomaga porządkować dorobek projektowy, wykrywać technologie oraz prezentować wybrane prace w formie portfolio.',
  },
  login: {
    title: 'Zaloguj się', subtitle: 'Inteligentne Archiwum Projektów Studenta',
    email: 'Email', password: 'Hasło', loggingIn: 'Logowanie...', submit: 'Zaloguj się',
    noAccount: 'Nie masz konta?', register: 'Zarejestruj się',
    successToast: 'Zalogowano pomyślnie!', errorFallback: 'Błąd logowania',
  },
  register: {
    title: 'Utwórz konto', subtitle: 'Dołącz do Archiwum Projektów',
    fullName: 'Imię i nazwisko', email: 'Email', password: 'Hasło',
    passwordPlaceholder: 'min. 6 znaków', confirmPassword: 'Potwierdź hasło',
    passwordMismatch: 'Hasła nie są zgodne', passwordTooShort: 'Hasło musi mieć co najmniej 6 znaków',
    creating: 'Tworzenie konta...', submit: 'Zarejestruj się',
    hasAccount: 'Masz już konto?', login: 'Zaloguj się',
    successToast: 'Konto utworzone!', errorFallback: 'Błąd rejestracji',
  },
  myProjects: {
    offlineBanner: 'Jesteś w trybie offline. Przeglądasz zapisaną wersję projektów.',
    title: 'Moje Projekty', subtitle: (n) => `${n} projektów w archiwum`,
    addProject: '+ Dodaj Projekt', emptyIcon: 'Brak', emptyTitle: 'Brak projektów',
    emptyText: 'Dodaj swój pierwszy projekt, aby rozpocząć budowanie archiwum.',
    deleteConfirm: 'Czy na pewno chcesz usunąć ten projekt?',
    deleteSuccess: 'Projekt usunięty', deleteError: 'Błąd podczas usuwania',
  },
  archive: {
    title: 'Archiwum Globalne', subtitle: (n) => `${n} projektów od wszystkich studentów`,
    searchPlaceholder: 'Szukaj po nazwie lub opisie...',
    search: 'Szukaj', clear: 'Wyczyść',
    allTechnologies: 'Wszystkie technologie', allLevels: 'Wszystkie poziomy',
    emptyIcon: 'Brak', emptyTitle: 'Brak wyników',
    emptyText: 'Spróbuj zmienić kryteria wyszukiwania.',
    deleteConfirm: 'Usunąć projekt?', deleteSuccess: 'Projekt usunięty', deleteError: 'Błąd usuwania',
  },
  addProject: {
    title: 'Dodaj Projekt',
    subtitle: 'Technologie zostaną wykryte automatycznie z repozytorium',
    sectionBasic: 'Podstawowe informacje',
    labelTitle: 'Tytuł projektu', titlePlaceholder: 'np. System zarządzania biblioteką',
    labelDesc: 'Opis', descPlaceholder: 'Opisz projekt: cel, technologie, wyzwania...',
    labelRole: 'Rola w projekcie', rolePlaceholder: 'np. Fullstack Developer',
    sectionSource: 'Źródło projektu',
    sourceHint: 'Podaj link do repozytorium. Dokumentacja jest opcjonalna.',
    labelRepo: 'Link do repozytorium (GitHub)',
    repoHint: 'Technologie zostaną wykryte automatycznie z GitHub API',
    labelFile: 'Wgraj plik dokumentacji (opcjonalnie: PDF, package.json)',
    fileSelected: (name) => `Plik: ${name}`,
    warnSource: 'Podaj link do repozytorium',
    analyzing: 'Analizowanie...', submit: 'Zapisz i Analizuj', cancel: 'Anuluj',
    errorSource: 'Musisz podać link do repozytorium.',
    successToast: 'Projekt dodany i przeanalizowany!',
    errorFallback: 'Błąd podczas zapisywania projektu',
  },
  projectDetail: {
    back: 'Wróć', editTitle: 'Edytuj projekt',
    labelTitle: 'Tytuł', labelDesc: 'Opis', labelRole: 'Rola', labelRepo: 'Repozytorium',
    save: 'Zapisz', cancel: 'Anuluj',
    editBtn: 'Edytuj', repoBtn: 'Repozytorium',
    analyzing: 'Analizowanie...', reanalyze: 'Przeanalizuj ponownie', deleteBtn: 'Usuń',
    technologiesTitle: (n) => `Wykryte technologie (${n})`,
    noTechnologies: 'Brak wykrytych technologii. Kliknij "Przeanalizuj ponownie".',
    aiDocTitle: 'Ocena dokumentacji AI',
    aiStatus: 'Status', aiNoDoc: 'Brak dokumentacji dla oceniania',
    aiUnavailable: 'Ocenianie jest niedostępne',
    aiCompleteness: 'Completeness Score (Kompletność)',
    aiReadability: 'Readability & Structure (Czytelność)',
    aiBusinessContext: 'Business Context (Kontekst biznesowy)',
    aiTechStack: 'Tech Stack (Technologie i uzasadnienie)',
    aiTechStackRationale: 'Tech Stack Rationale (Uzasadnienie technologii)',
    aiSummary: 'Podsumowanie',
    noData: 'Brak danych', noScore: 'Brak oceny',
    scoringTitle: 'Scoring trudności', scoringUnit: '',
    infoTitle: 'Informacje',
    infoRole: 'Rola', infoTech: 'Technologii', infoCicd: 'CI/CD',
    infoDocs: 'Dokumentacja', infoAdded: 'Dodano',
    infoRepoCreated: 'Stworzono reposytorium', infoLastActivity: 'Ostatnia aktywność',
    infoStars: 'Liczba gwiazdek', infoFiles: 'Liczba plików',
    yes: 'Tak', no: 'Nie', yesPdf: 'Tak (PDF)',
    downloadsTitle: 'Pobranie plików',
    downloadZipLabel: 'Pobrać ZIP projektu', downloadZipBtn: 'Pobierz ZIP',
    downloadDocLabel: 'Pobrać dokumentację', downloadDocBtn: 'Pobierz dokumentację',
    noFile: 'Brak pliku',
    deleteConfirm: 'Usunąć projekt?', deleteSuccess: 'Projekt usunięty',
    analyzeSuccess: 'Analiza zakończona!', analyzeError: 'Błąd analizy',
    updateSuccess: 'Projekt zaktualizowany', updateError: 'Błąd aktualizacji',
  },
  profile: {
    title: 'Profil Kompetencji',
    statProjects: 'Projektów', statTechnologies: 'Technologii',
    statTopSkills: 'Top Skills', statRecommendations: 'Rekomendacji',
    radarTitle: 'Mapa Umiejętności (Radar)',
    emptyIcon: 'Brak', emptyTitle: 'Brak danych',
    emptyText: 'Dodaj projekty, aby zbudować profil kompetencji.',
    tooltipStrength: 'Siła', strengthTitle: 'Siła technologii',
    skillStat: (count, avg) => `${count} proj · Ø ${avg} pkt`,
    topTitle: 'Top technologie', recoTitle: 'Rekomendowane do nauki',
    recoText: 'Na podstawie Twojego profilu, warto poznać:',
    recoEmpty: 'Dodaj więcej projektów, aby uzyskać rekomendacje.',
    allTechTitle: (n) => `Wszystkie technologie (${n})`,
    contactsTitle: 'Kontakty', contactsEdit: 'Edytuj kontakty', contactsSave: 'Zapisz',
    contactsCancel: 'Anuluj', contactsEmpty: 'Brak kontaktów',
    contactsSaved: 'Kontakty zaktualizowane', contactsError: 'Błąd zapisu kontaktów',
  },
  portfolios: {
    title: 'Portfolio', subtitle: (n) => `${n} wygenerowanych portfolio`,
    generateBtn: '+ Generuj Portfolio',
    emptyIcon: 'Brak', emptyTitle: 'Brak portfolio',
    emptyText: 'Wybierz projekty i wygeneruj swoje pierwsze portfolio.',
    projects: (n) => `${n} projektów`,
    open: 'Otwórz', copyLink: 'Kopiuj link', delete: 'Usuń', created: 'Utworzono:',
    linkCopied: 'Link skopiowany!', selectError: 'Wybierz co najmniej jeden projekt',
    successToast: 'Portfolio wygenerowane!', errorToast: 'Błąd generowania portfolio',
    deleteConfirm: 'Usunąć portfolio?', deleteSuccess: 'Portfolio usunięte',
    modalTitle: 'Generuj nowe portfolio', labelName: 'Nazwa portfolio',
    defaultName: 'Moje Portfolio', labelDesc: 'Opis (opcjonalny)',
    selectTitle: (n) => `Wybierz projekty (${n} zaznaczonych)`,
    noProjects: 'Brak projektów. Dodaj projekty, aby wygenerować portfolio.',
    generating: 'Generowanie...', generate: 'Generuj Portfolio', cancel: 'Anuluj',
  },
  publicPortfolio: {
    notFoundIcon: 'Brak wyników', notFound: 'Nie znaleziono portfolio',
    errorMsg: 'Portfolio nie istnieje lub zostało usunięte.',
    badge: 'Publiczne Portfolio · Read-Only',
    projectsCount: (n) => `${n} projektów`,
    downloadPdf: 'Pobierz jako PDF (Ctrl+P)',
    aiDescriptionTitle: 'Rekomendacja portfolio',
    noProjects: 'Brak projektów', technologies: 'TECHNOLOGIE',
    footer: (date) => `Wygenerowano przez Archiwum Projektów Studenta · ${date}`,
  },
  projectCard: {
    details: 'Szczegóły', github: 'GitHub', delete: 'Usuń',
    confidence: (n) => `Pewność: ${n}%`, pts: 'pkt',
  },
  difficulty: {
    'Początkujący': 'Początkujący', 'Średni': 'Średni',
    'Zaawansowany': 'Zaawansowany', 'Ekspert': 'Ekspert',
    'Master': 'Master', 'Legenda': 'Legenda',
  },
  dateLocale: 'pl',
};

const en: T = {
  nav: {
    brand: 'Project Archive', myProjects: 'My Projects', archive: 'Archive',
    profile: 'Profile', portfolio: 'Portfolio', addProject: '+ Add Project',
    about: 'About', login: 'Log in', logout: 'Log out',
  },
  about: {
    title: 'A Smart Archive of Student Projects',
    description: 'The intelligent student project archive allows you to collect, describe and analyse projects created by students. The system helps organise project work, detect technologies and present selected works as a portfolio.',
  },
  login: {
    title: 'Log in', subtitle: 'Intelligent Student Project Archive',
    email: 'Email', password: 'Password', loggingIn: 'Logging in...', submit: 'Log in',
    noAccount: "Don't have an account?", register: 'Register',
    successToast: 'Logged in successfully!', errorFallback: 'Login error',
  },
  register: {
    title: 'Create account', subtitle: 'Join the Project Archive',
    fullName: 'Full name', email: 'Email', password: 'Password',
    passwordPlaceholder: 'min. 6 characters', confirmPassword: 'Confirm password',
    passwordMismatch: "Passwords don't match",
    passwordTooShort: 'Password must be at least 6 characters',
    creating: 'Creating account...', submit: 'Register',
    hasAccount: 'Already have an account?', login: 'Log in',
    successToast: 'Account created!', errorFallback: 'Registration error',
  },
  myProjects: {
    offlineBanner: 'You are offline. You are browsing the saved version of projects.',
    title: 'My Projects', subtitle: (n) => `${n} projects in archive`,
    addProject: '+ Add Project', emptyIcon: 'Empty', emptyTitle: 'No projects',
    emptyText: 'Add your first project to start building the archive.',
    deleteConfirm: 'Are you sure you want to delete this project?',
    deleteSuccess: 'Project deleted', deleteError: 'Error deleting project',
  },
  archive: {
    title: 'Global Archive', subtitle: (n) => `${n} projects from all students`,
    searchPlaceholder: 'Search by name or description...',
    search: 'Search', clear: 'Clear',
    allTechnologies: 'All technologies', allLevels: 'All levels',
    emptyIcon: 'Empty', emptyTitle: 'No results',
    emptyText: 'Try changing the search criteria.',
    deleteConfirm: 'Delete project?', deleteSuccess: 'Project deleted', deleteError: 'Delete error',
  },
  addProject: {
    title: 'Add Project',
    subtitle: 'Technologies will be detected automatically from the repository',
    sectionBasic: 'Basic information',
    labelTitle: 'Project title', titlePlaceholder: 'e.g. Library management system',
    labelDesc: 'Description',
    descPlaceholder: 'Describe the project: goal, technologies, challenges...',
    labelRole: 'Role in project', rolePlaceholder: 'e.g. Fullstack Developer',
    sectionSource: 'Project source',
    sourceHint: 'Provide a repository link. Documentation is optional.',
    labelRepo: 'Repository link (GitHub)',
    repoHint: 'Technologies will be detected automatically from GitHub API',
    labelFile: 'Upload documentation file (optional: PDF, package.json)',
    fileSelected: (name) => `File: ${name}`,
    warnSource: 'Provide a repository link',
    analyzing: 'Analyzing...', submit: 'Save and Analyze', cancel: 'Cancel',
    errorSource: 'You must provide a repository link.',
    successToast: 'Project added and analyzed!',
    errorFallback: 'Error saving project',
  },
  projectDetail: {
    back: 'Back', editTitle: 'Edit project',
    labelTitle: 'Title', labelDesc: 'Description', labelRole: 'Role', labelRepo: 'Repository',
    save: 'Save', cancel: 'Cancel',
    editBtn: 'Edit', repoBtn: 'Repository',
    analyzing: 'Analyzing...', reanalyze: 'Re-analyze', deleteBtn: 'Delete',
    technologiesTitle: (n) => `Detected technologies (${n})`,
    noTechnologies: 'No technologies detected. Click "Re-analyze".',
    aiDocTitle: 'AI Documentation Evaluation',
    aiStatus: 'Status', aiNoDoc: 'No documentation to evaluate',
    aiUnavailable: 'Evaluation is unavailable',
    aiCompleteness: 'Completeness Score',
    aiReadability: 'Readability & Structure',
    aiBusinessContext: 'Business Context',
    aiTechStack: 'Tech Stack (Technologies and rationale)',
    aiTechStackRationale: 'Tech Stack Rationale',
    aiSummary: 'Summary',
    noData: 'No data', noScore: 'No score',
    scoringTitle: 'Difficulty Score', scoringUnit: '',
    infoTitle: 'Information',
    infoRole: 'Role', infoTech: 'Technologies', infoCicd: 'CI/CD',
    infoDocs: 'Documentation', infoAdded: 'Added',
    infoRepoCreated: 'Repository created', infoLastActivity: 'Last activity',
    infoStars: 'Stars count', infoFiles: 'File count',
    yes: 'Yes', no: 'No', yesPdf: 'Yes (PDF)',
    downloadsTitle: 'File downloads',
    downloadZipLabel: 'Download project ZIP', downloadZipBtn: 'Download ZIP',
    downloadDocLabel: 'Download documentation', downloadDocBtn: 'Download documentation',
    noFile: 'No file',
    deleteConfirm: 'Delete project?', deleteSuccess: 'Project deleted',
    analyzeSuccess: 'Analysis complete!', analyzeError: 'Analysis error',
    updateSuccess: 'Project updated', updateError: 'Update error',
  },
  profile: {
    title: 'Competency Profile',
    statProjects: 'Projects', statTechnologies: 'Technologies',
    statTopSkills: 'Top Skills', statRecommendations: 'Recommendations',
    radarTitle: 'Skills Map (Radar)',
    emptyIcon: 'Empty', emptyTitle: 'No data',
    emptyText: 'Add projects to build a competency profile.',
    tooltipStrength: 'Strength', strengthTitle: 'Technology Strength',
    skillStat: (count, avg) => `${count} proj · Ø ${avg} pts`,
    topTitle: 'Top technologies', recoTitle: 'Recommended for learning',
    recoText: 'Based on your profile, it is worth learning:',
    recoEmpty: 'Add more projects to get recommendations.',
    allTechTitle: (n) => `All technologies (${n})`,
    contactsTitle: 'Contacts', contactsEdit: 'Edit contacts', contactsSave: 'Save',
    contactsCancel: 'Cancel', contactsEmpty: 'No contacts',
    contactsSaved: 'Contacts updated', contactsError: 'Error saving contacts',
  },
  portfolios: {
    title: 'Portfolio', subtitle: (n) => `${n} generated portfolios`,
    generateBtn: '+ Generate Portfolio',
    emptyIcon: 'Empty', emptyTitle: 'No portfolios',
    emptyText: 'Select projects and generate your first portfolio.',
    projects: (n) => `${n} projects`,
    open: 'Open', copyLink: 'Copy link', delete: 'Delete', created: 'Created:',
    linkCopied: 'Link copied!', selectError: 'Select at least one project',
    successToast: 'Portfolio generated!', errorToast: 'Error generating portfolio',
    deleteConfirm: 'Delete portfolio?', deleteSuccess: 'Portfolio deleted',
    modalTitle: 'Generate new portfolio', labelName: 'Portfolio name',
    defaultName: 'My Portfolio', labelDesc: 'Description (optional)',
    selectTitle: (n) => `Select projects (${n} selected)`,
    noProjects: 'No projects. Add projects to generate a portfolio.',
    generating: 'Generating...', generate: 'Generate Portfolio', cancel: 'Cancel',
  },
  publicPortfolio: {
    notFoundIcon: 'Not found', notFound: 'Portfolio not found',
    errorMsg: 'Portfolio does not exist or has been deleted.',
    badge: 'Public Portfolio · Read-Only',
    projectsCount: (n) => `${n} projects`,
    downloadPdf: 'Download as PDF (Ctrl+P)',
    aiDescriptionTitle: 'Portfolio recommendation',
    noProjects: 'No projects', technologies: 'TECHNOLOGIES',
    footer: (date) => `Generated by Student Project Archive · ${date}`,
  },
  projectCard: {
    details: 'Details', github: 'GitHub', delete: 'Delete',
    confidence: (n) => `Confidence: ${n}%`, pts: 'pts',
  },
  difficulty: {
    'Początkujący': 'Beginner', 'Średni': 'Intermediate',
    'Zaawansowany': 'Advanced', 'Ekspert': 'Expert',
    'Master': 'Master', 'Legenda': 'Legend',
  },
  dateLocale: 'en',
};

const lt: T = {
  nav: {
    brand: 'Projektų Archyvas', myProjects: 'Mano Projektai', archive: 'Archyvas',
    profile: 'Profilis', portfolio: 'Portfelis', addProject: '+ Pridėti Projektą',
    about: 'Apie projektą', login: 'Prisijungti', logout: 'Atsijungti',
  },
  about: {
    title: 'Išmanusis Studentų Projektų Archyvas',
    description: 'Išmanusis studentų projektų archyvas leidžia rinkti, aprašyti ir analizuoti studentų sukurtus projektus. Sistema padeda tvarkyti projektų veiklą, aptikti technologijas ir pristatyti pasirinktus darbus portfelio pavidalu.',
  },
  login: {
    title: 'Prisijungti', subtitle: 'Intelektuali Studento Projektų Archyvo Sistema',
    email: 'El. paštas', password: 'Slaptažodis',
    loggingIn: 'Jungiamasi...', submit: 'Prisijungti',
    noAccount: 'Neturite paskyros?', register: 'Registruotis',
    successToast: 'Prisijungta sėkmingai!', errorFallback: 'Prisijungimo klaida',
  },
  register: {
    title: 'Sukurti paskyrą', subtitle: 'Prisijunkite prie Projektų Archyvo',
    fullName: 'Vardas ir pavardė', email: 'El. paštas', password: 'Slaptažodis',
    passwordPlaceholder: 'min. 6 simbolių', confirmPassword: 'Patvirtinkite slaptažodį',
    passwordMismatch: 'Slaptažodžiai nesutampa',
    passwordTooShort: 'Slaptažodis turi būti bent 6 simbolių',
    creating: 'Kuriama paskyra...', submit: 'Registruotis',
    hasAccount: 'Jau turite paskyrą?', login: 'Prisijungti',
    successToast: 'Paskyra sukurta!', errorFallback: 'Registracijos klaida',
  },
  myProjects: {
    offlineBanner: 'Esate neprisijungę. Naršote išsaugotą projektų versiją.',
    title: 'Mano Projektai', subtitle: (n) => `${n} projektų archyve`,
    addProject: '+ Pridėti Projektą',
    emptyIcon: 'Tuščia', emptyTitle: 'Projektų nėra',
    emptyText: 'Pridėkite savo pirmąjį projektą, kad pradėtumėte kurti archyvą.',
    deleteConfirm: 'Ar tikrai norite ištrinti šį projektą?',
    deleteSuccess: 'Projektas ištrintas', deleteError: 'Trynimo klaida',
  },
  archive: {
    title: 'Globalus Archyvas', subtitle: (n) => `${n} projektų nuo visų studentų`,
    searchPlaceholder: 'Ieškoti pagal pavadinimą arba aprašymą...',
    search: 'Ieškoti', clear: 'Išvalyti',
    allTechnologies: 'Visos technologijos', allLevels: 'Visi lygiai',
    emptyIcon: 'Tuščia', emptyTitle: 'Rezultatų nėra',
    emptyText: 'Pabandykite pakeisti paieškos kriterijus.',
    deleteConfirm: 'Ištrinti projektą?',
    deleteSuccess: 'Projektas ištrintas', deleteError: 'Trynimo klaida',
  },
  addProject: {
    title: 'Pridėti Projektą',
    subtitle: 'Technologijos bus automatiškai aptiktos iš saugyklos',
    sectionBasic: 'Pagrindinė informacija',
    labelTitle: 'Projekto pavadinimas',
    titlePlaceholder: 'pvz. Bibliotekos valdymo sistema',
    labelDesc: 'Aprašymas',
    descPlaceholder: 'Aprašykite projektą: tikslas, technologijos, iššūkiai...',
    labelRole: 'Vaidmuo projekte', rolePlaceholder: 'pvz. Fullstack Developer',
    sectionSource: 'Projekto šaltinis',
    sourceHint: 'Nurodykite saugyklos nuorodą. Dokumentacija yra neprivaloma.',
    labelRepo: 'Saugyklos nuoroda (GitHub)',
    repoHint: 'Technologijos bus automatiškai aptiktos iš GitHub API',
    labelFile: 'Įkelkite dokumentacijos failą (neprivaloma: PDF, package.json)',
    fileSelected: (name) => `Failas: ${name}`,
    warnSource: 'Nurodykite saugyklos nuorodą',
    analyzing: 'Analizuojama...', submit: 'Išsaugoti ir Analizuoti', cancel: 'Atšaukti',
    errorSource: 'Turite nurodyti saugyklos nuorodą.',
    successToast: 'Projektas pridėtas ir analizuotas!',
    errorFallback: 'Projekto išsaugojimo klaida',
  },
  projectDetail: {
    back: 'Grįžti', editTitle: 'Redaguoti projektą',
    labelTitle: 'Pavadinimas', labelDesc: 'Aprašymas',
    labelRole: 'Vaidmuo', labelRepo: 'Saugykla',
    save: 'Išsaugoti', cancel: 'Atšaukti',
    editBtn: 'Redaguoti', repoBtn: 'Saugykla',
    analyzing: 'Analizuojama...', reanalyze: 'Analizuoti iš naujo', deleteBtn: 'Ištrinti',
    technologiesTitle: (n) => `Aptiktos technologijos (${n})`,
    noTechnologies: 'Technologijų neaptikta. Paspauskite "Analizuoti iš naujo".',
    aiDocTitle: 'AI dokumentacijos vertinimas',
    aiStatus: 'Būsena', aiNoDoc: 'Nėra dokumentacijos vertinimui',
    aiUnavailable: 'Vertinimas nepasiekiamas',
    aiCompleteness: 'Completeness Score (Išsamumas)',
    aiReadability: 'Readability & Structure (Skaitomumas)',
    aiBusinessContext: 'Business Context (Verslo kontekstas)',
    aiTechStack: 'Tech Stack (Technologijos ir pagrindimas)',
    aiTechStackRationale: 'Tech Stack Rationale (Technologijų pagrindimas)',
    aiSummary: 'Apibendrinimas',
    noData: 'Nėra duomenų', noScore: 'Nėra įvertinimo',
    scoringTitle: 'Sudėtingumo įvertinimas', scoringUnit: '',
    infoTitle: 'Informacija',
    infoRole: 'Vaidmuo', infoTech: 'Technologijų', infoCicd: 'CI/CD',
    infoDocs: 'Dokumentacija', infoAdded: 'Pridėta',
    infoRepoCreated: 'Saugykla sukurta', infoLastActivity: 'Paskutinis aktyvumas',
    infoStars: 'Žvaigždučių skaičius', infoFiles: 'Failų skaičius',
    yes: 'Taip', no: 'Ne', yesPdf: 'Taip (PDF)',
    downloadsTitle: 'Failų atsisiuntimas',
    downloadZipLabel: 'Atsisiųsti projekto ZIP', downloadZipBtn: 'Atsisiųsti ZIP',
    downloadDocLabel: 'Atsisiųsti dokumentaciją', downloadDocBtn: 'Atsisiųsti dokumentaciją',
    noFile: 'Failo nėra',
    deleteConfirm: 'Ištrinti projektą?', deleteSuccess: 'Projektas ištrintas',
    analyzeSuccess: 'Analizė baigta!', analyzeError: 'Analizės klaida',
    updateSuccess: 'Projektas atnaujintas', updateError: 'Atnaujinimo klaida',
  },
  profile: {
    title: 'Kompetencijų Profilis',
    statProjects: 'Projektų', statTechnologies: 'Technologijų',
    statTopSkills: 'Geriausių įgūdžių', statRecommendations: 'Rekomendacijų',
    radarTitle: 'Įgūdžių žemėlapis (Radaras)',
    emptyIcon: 'Tuščia', emptyTitle: 'Nėra duomenų',
    emptyText: 'Pridėkite projektų, kad sukurtumėte kompetencijų profilį.',
    tooltipStrength: 'Stiprumas', strengthTitle: 'Technologijų stiprumas',
    skillStat: (count, avg) => `${count} proj · Ø ${avg} tšk`,
    topTitle: 'Geriausios technologijos', recoTitle: 'Rekomenduojama mokytis',
    recoText: 'Remiantis jūsų profiliu, verta išmokti:',
    recoEmpty: 'Pridėkite daugiau projektų, kad gautumėte rekomendacijas.',
    allTechTitle: (n) => `Visos technologijos (${n})`,
    contactsTitle: 'Kontaktai', contactsEdit: 'Redaguoti kontaktus', contactsSave: 'Išsaugoti',
    contactsCancel: 'Atšaukti', contactsEmpty: 'Kontaktų nėra',
    contactsSaved: 'Kontaktai atnaujinti', contactsError: 'Kontaktų išsaugojimo klaida',
  },
  portfolios: {
    title: 'Portfelis', subtitle: (n) => `${n} sugeneruotų portfelių`,
    generateBtn: '+ Generuoti Portfelį',
    emptyIcon: 'Tuščia', emptyTitle: 'Portfelių nėra',
    emptyText: 'Pasirinkite projektus ir sugeneruokite savo pirmąjį portfelį.',
    projects: (n) => `${n} projektų`,
    open: 'Atidaryti', copyLink: 'Kopijuoti nuorodą', delete: 'Ištrinti', created: 'Sukurta:',
    linkCopied: 'Nuoroda nukopijuota!', selectError: 'Pasirinkite bent vieną projektą',
    successToast: 'Portfelis sugeneruotas!', errorToast: 'Portfelio generavimo klaida',
    deleteConfirm: 'Ištrinti portfelį?', deleteSuccess: 'Portfelis ištrintas',
    modalTitle: 'Generuoti naują portfelį', labelName: 'Portfelio pavadinimas',
    defaultName: 'Mano Portfelis', labelDesc: 'Aprašymas (nebūtinas)',
    selectTitle: (n) => `Pasirinkite projektus (${n} pasirinkta)`,
    noProjects: 'Projektų nėra. Pridėkite projektų, kad galėtumėte generuoti portfelį.',
    generating: 'Generuojama...', generate: 'Generuoti Portfelį', cancel: 'Atšaukti',
  },
  publicPortfolio: {
    notFoundIcon: 'Nerasta', notFound: 'Portfelis nerastas',
    errorMsg: 'Portfelis neegzistuoja arba buvo ištrintas.',
    badge: 'Viešas portfelis · Tik skaitymas',
    projectsCount: (n) => `${n} projektų`,
    downloadPdf: 'Atsisiųsti kaip PDF (Ctrl+P)',
    aiDescriptionTitle: 'Portfelio rekomendacija',
    noProjects: 'Projektų nėra', technologies: 'TECHNOLOGIJOS',
    footer: (date) => `Sugeneravo Studentų projektų archyvas · ${date}`,
  },
  projectCard: {
    details: 'Detalės', github: 'GitHub', delete: 'Ištrinti',
    confidence: (n) => `Tikimybė: ${n}%`, pts: 'tšk',
  },
  difficulty: {
    'Początkujący': 'Pradedantysis', 'Średni': 'Vidutinis',
    'Zaawansowany': 'Pažengęs', 'Ekspert': 'Ekspertas',
    'Master': 'Meistras', 'Legenda': 'Legenda',
  },
  dateLocale: 'lt',
};

export const translations: Record<Lang, T> = { pl, en, lt };
