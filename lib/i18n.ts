export type Locale = 'en' | 'fr' | 'nl'

export const LOCALES: Locale[] = ['en', 'fr', 'nl']

// BCP-47 codes for toLocaleString / toLocaleTimeString
export const LOCALE_CODE: Record<Locale, string> = {
  en: 'en-GB',
  fr: 'fr-BE',
  nl: 'nl-BE',
}

export type Trans = {
  // Checkout / order form
  confirmOrder: string
  eatIn: string
  takeaway: string
  delivery: string
  customerName: string
  phone: string
  tableNumber: string
  paymentLabel: string
  cash: string
  card: string
  exclVat: string
  vatRate: string        // template: "VAT {rate}%"
  total: string
  totalVat: string
  placingOrder: string
  placeOrder: string
  errCustomerName: string
  errTableNumber: string
  errPlaceOrder: string
  // Order panel
  orderTitle: string
  newOrder: string
  addItems: string
  confirmOrderBtn: string
  // Menu grid
  loadingMenu: string
  noItemsInCategory: string
  // Order card
  pending: string
  preparing: string
  ready: string
  completed: string
  cancelled: string
  minutesAgo: string     // template: "{n}m ago"
  dineIn: string         // template: "Dine-in · Table {n}"
  pickupLabel: string    // template: "Pickup: {time}"
  scheduledLabel: string // template: "Scheduled: {dt}"
  deliveryAddress: string
  noItemsLoaded: string
  customerNote: string
  reprint: string
  cancel: string
  cancelTitle: string
  cancelWarning: string
  keepOrder: string
  yesCancel: string
  // Nav tabs
  navKitchen: string
  navCounter: string
  navCompleted: string
  navPos: string
  // Settings page
  settingsTitle: string
  language: string
  notifications: string
  soundAlerts: string
  // Print tickets
  printDineIn: string    // template: "Dine-in — Table {n}"
  printDelivery: string
  printTakeaway: string
  printNote: string
  printDeliverTo: string
  printPickup: string    // template: "Pickup: {time}"
  printScheduled: string // template: "SCHEDULED: {dt}"
  printExclVat: string
  printVatRate: string   // template: "VAT {rate}%"
  printTotal: string
  printThankYou: string
}

export const translations: Record<Locale, Trans> = {
  en: {
    confirmOrder: 'Confirm Order',
    eatIn: 'Eat-in',
    takeaway: 'Takeaway',
    delivery: 'Delivery',
    customerName: 'Customer name *',
    phone: 'Phone',
    tableNumber: 'Table number *',
    paymentLabel: 'Payment',
    cash: 'Cash',
    card: 'Card',
    exclVat: 'Excl. VAT',
    vatRate: 'VAT {rate}%',
    total: 'Total',
    totalVat: 'Total VAT',
    placingOrder: 'Placing order…',
    placeOrder: 'Place Order →',
    errCustomerName: 'Customer name is required',
    errTableNumber: 'Table number is required',
    errPlaceOrder: 'Failed to place order. Try again.',
    orderTitle: 'ORDER',
    newOrder: 'New order',
    addItems: 'Add items from the menu',
    confirmOrderBtn: 'Confirm Order →',
    loadingMenu: 'Loading menu…',
    noItemsInCategory: 'No items in this category',
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready',
    completed: 'Completed',
    cancelled: 'Cancelled',
    minutesAgo: '{n}m ago',
    dineIn: 'Dine-in · Table {n}',
    pickupLabel: 'Pickup: {time}',
    scheduledLabel: 'Scheduled: {dt}',
    deliveryAddress: 'Delivery address',
    noItemsLoaded: 'No items loaded',
    customerNote: 'Customer note',
    reprint: 'Reprint',
    cancel: 'Cancel',
    cancelTitle: 'Cancel order?',
    cancelWarning: 'This cannot be undone. The order will be marked as cancelled.',
    keepOrder: 'Keep order',
    yesCancel: 'Yes, cancel',
    navKitchen: 'Kitchen',
    navCounter: 'Counter',
    navCompleted: 'Completed',
    navPos: 'POS',
    settingsTitle: 'Settings',
    language: 'Language',
    notifications: 'Notifications',
    soundAlerts: 'Sound alerts',
    printDineIn: 'Dine-in — Table {n}',
    printDelivery: 'Delivery',
    printTakeaway: 'Takeaway',
    printNote: 'NOTE:',
    printDeliverTo: 'DELIVER TO:',
    printPickup: 'Pickup: {time}',
    printScheduled: 'SCHEDULED: {dt}',
    printExclVat: 'Excl. VAT',
    printVatRate: 'VAT {rate}%',
    printTotal: 'TOTAL',
    printThankYou: 'Thank you!',
  },
  fr: {
    confirmOrder: 'Confirmer la commande',
    eatIn: 'Sur place',
    takeaway: 'À emporter',
    delivery: 'Livraison',
    customerName: 'Nom du client *',
    phone: 'Téléphone',
    tableNumber: 'N° de table *',
    paymentLabel: 'Paiement',
    cash: 'Espèces',
    card: 'Carte',
    exclVat: 'HTVA',
    vatRate: 'TVA {rate}%',
    total: 'Total',
    totalVat: 'Total TVA',
    placingOrder: 'Commande en cours…',
    placeOrder: 'Passer la commande →',
    errCustomerName: 'Le nom du client est requis',
    errTableNumber: 'Le numéro de table est requis',
    errPlaceOrder: 'Échec de la commande. Réessayez.',
    orderTitle: 'COMMANDE',
    newOrder: 'Nouvelle commande',
    addItems: 'Ajoutez des articles au menu',
    confirmOrderBtn: 'Confirmer →',
    loadingMenu: 'Chargement du menu…',
    noItemsInCategory: 'Aucun article dans cette catégorie',
    pending: 'En attente',
    preparing: 'En préparation',
    ready: 'Prêt',
    completed: 'Terminé',
    cancelled: 'Annulé',
    minutesAgo: 'il y a {n}m',
    dineIn: 'Sur place · Table {n}',
    pickupLabel: 'Pickup : {time}',
    scheduledLabel: 'Planifié : {dt}',
    deliveryAddress: 'Adresse de livraison',
    noItemsLoaded: 'Aucun article chargé',
    customerNote: 'Note du client',
    reprint: 'Réimprimer',
    cancel: 'Annuler',
    cancelTitle: 'Annuler la commande ?',
    cancelWarning: 'Cette action est irréversible. La commande sera marquée comme annulée.',
    keepOrder: 'Garder la commande',
    yesCancel: 'Oui, annuler',
    navKitchen: 'Cuisine',
    navCounter: 'Comptoir',
    navCompleted: 'Terminé',
    navPos: 'POS',
    settingsTitle: 'Paramètres',
    language: 'Langue',
    notifications: 'Notifications',
    soundAlerts: 'Alertes sonores',
    printDineIn: 'Sur place — Table {n}',
    printDelivery: 'Livraison',
    printTakeaway: 'À emporter',
    printNote: 'NOTE :',
    printDeliverTo: 'LIVRER À :',
    printPickup: 'Pickup : {time}',
    printScheduled: 'PLANIFIÉ : {dt}',
    printExclVat: 'HTVA',
    printVatRate: 'TVA {rate}%',
    printTotal: 'TOTAL',
    printThankYou: 'Merci !',
  },
  nl: {
    confirmOrder: 'Bestelling bevestigen',
    eatIn: 'Ter plaatse',
    takeaway: 'Meenemen',
    delivery: 'Levering',
    customerName: 'Naam klant *',
    phone: 'Telefoon',
    tableNumber: 'Tafelnummer *',
    paymentLabel: 'Betaling',
    cash: 'Contant',
    card: 'Kaart',
    exclVat: 'Excl. BTW',
    vatRate: 'BTW {rate}%',
    total: 'Totaal',
    totalVat: 'Totaal BTW',
    placingOrder: 'Bestelling plaatsen…',
    placeOrder: 'Bestellen →',
    errCustomerName: 'Naam klant is verplicht',
    errTableNumber: 'Tafelnummer is verplicht',
    errPlaceOrder: 'Bestelling mislukt. Probeer opnieuw.',
    orderTitle: 'BESTELLING',
    newOrder: 'Nieuwe bestelling',
    addItems: 'Voeg items toe uit het menu',
    confirmOrderBtn: 'Bevestigen →',
    loadingMenu: 'Menu laden…',
    noItemsInCategory: 'Geen items in deze categorie',
    pending: 'In afwachting',
    preparing: 'In bereiding',
    ready: 'Klaar',
    completed: 'Voltooid',
    cancelled: 'Geannuleerd',
    minutesAgo: '{n}m geleden',
    dineIn: 'Ter plaatse · Tafel {n}',
    pickupLabel: 'Afhalen: {time}',
    scheduledLabel: 'Gepland: {dt}',
    deliveryAddress: 'Leveringsadres',
    noItemsLoaded: 'Geen items geladen',
    customerNote: 'Klantnotitie',
    reprint: 'Herdrukken',
    cancel: 'Annuleren',
    cancelTitle: 'Bestelling annuleren?',
    cancelWarning: 'Dit kan niet ongedaan worden gemaakt. De bestelling wordt als geannuleerd gemarkeerd.',
    keepOrder: 'Bestelling behouden',
    yesCancel: 'Ja, annuleren',
    navKitchen: 'Keuken',
    navCounter: 'Balie',
    navCompleted: 'Voltooid',
    navPos: 'POS',
    settingsTitle: 'Instellingen',
    language: 'Taal',
    notifications: 'Meldingen',
    soundAlerts: 'Geluidsmeldingen',
    printDineIn: 'Ter plaatse — Tafel {n}',
    printDelivery: 'Levering',
    printTakeaway: 'Meenemen',
    printNote: 'NOOT:',
    printDeliverTo: 'LEVEREN AAN:',
    printPickup: 'Afhalen: {time}',
    printScheduled: 'GEPLAND: {dt}',
    printExclVat: 'Excl. BTW',
    printVatRate: 'BTW {rate}%',
    printTotal: 'TOTAAL',
    printThankYou: 'Dank u!',
  },
}

export function t(key: keyof Trans, locale: Locale): string {
  return translations[locale][key] ?? translations.en[key]
}

// Replace {varName} placeholders in a translated string
export function fill(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
}
