/**
 * lib/content/site.js
 *
 * One place for the public-facing numbers and copy that used to be
 * duplicated (and contradicting each other) across pages.
 *
 * ⚠️  Before deploying: confirm every figure marked VERIFY with the NGO.
 *     Donors read these as facts.
 */
import { getPhoto } from "@/lib/images/drivePhotos";

export const ORG = {
  name: "Helping Mechons",
  city: "Visakhapatnam",
  founded: 2020,
  email: "helpingmechons@gmail.com",
  phone: "+91 9966752148",
  phoneHref: "tel:+919966752148",
  instagram: "https://www.instagram.com/helpingmechons/",
};

// Lifetime totals. Same numbers on every page.
export const STATS = [
  { value: 500, suffix: "+", label: "meals served" },
  { value: 30,  suffix: "+", label: "medical consultations" },
  { value: 50,  suffix: "+", label: "school kits handed out" },
];

// Six programmes. `color` comes from the ring of figures in the logo and is
// used as the programme's colour code everywhere on the site.
export const CAUSES = [
  { id: "food",      title: "Food distribution",  color: "#f57c00", icon: "utensils",
    img: getPhoto("food-distribution-1"),
    desc: "Hot meals and food packets handed out at night to people sleeping on the streets." },
  { id: "medical",   title: "Medical support",    color: "#1e88e5", icon: "stethoscope",
    img: getPhoto("medical-support"),
    desc: "Free check-ups, medicines and help with treatment costs for families who can't pay." },
  { id: "grocery",   title: "Grocery kits",       color: "#43a047", icon: "basket",
    img: getPhoto("grocery-support"),
    desc: "Rice, dal, oil and essentials packed to last a family through the month." },
  { id: "education", title: "Education support",  color: "#7b1fa2", icon: "book",
    img: getPhoto("education-support"),
    desc: "Bags, books, stationery and uniforms for children in tribal and rural schools." },
  { id: "orphanage", title: "Orphanage care",     color: "#d81b60", icon: "home",
    img: getPhoto("orphanage-care"),
    desc: "Regular visits with meals, clothes, school fees and time spent with the children." },
  { id: "elderly",   title: "Elder care",         color: "#9e1b4f", icon: "hand",
    img: getPhoto("old-age-care"),
    desc: "Monthly food, medicines and company for residents of old age homes." },
];

// "What your gift does" calculator.
// VERIFY: these unit costs are placeholders — replace with the NGO's real
// average cost per item from recent drives before going live.
export const IMPACT_UNITS = [
  { id: "meal",    cost: 40,   one: "hot meal",                many: "hot meals",                color: "#f57c00" },
  { id: "consult", cost: 300,  one: "medical consultation",    many: "medical consultations",    color: "#1e88e5" },
  { id: "kit",     cost: 600,  one: "school kit",              many: "school kits",              color: "#7b1fa2" },
  { id: "grocery", cost: 1500, one: "month of groceries for a family", many: "months of groceries for a family", color: "#43a047" },
];

export const PRESETS = [500, 1000, 2500, 5000];

export const PHOTOS = [
  { src: getPhoto("food-distribution-1"), alt: "Volunteers handing out food at night" },
  { src: getPhoto("education-support"),   alt: "School kits for children" },
  { src: getPhoto("food-distribution-2"), alt: "Street food relief drive" },
  { src: getPhoto("grocery-support"),     alt: "Monthly grocery kits" },
  { src: getPhoto("medical-support"),     alt: "Medical aid distribution" },
  { src: getPhoto("orphanage-care"),      alt: "Orphanage visit" },
  { src: getPhoto("food-distribution-3"), alt: "Grocery distribution to families" },
  { src: getPhoto("old-age-care"),        alt: "Visit to an old age home" },
];

// Answers reflect how the donate flow actually works in this codebase.
export const FAQ = [
  { q: "How much of my donation reaches the field?",
    a: "All of it. Public donations go only to programmes such as food, medicine, kits and groceries. Every drive is photographed and logged on our Transparency page." },
  { q: "How can I pay?",
    a: "Scan our UPI QR code with any UPI app, or pay by card, UPI or net banking through Razorpay. Card details are handled by Razorpay and never stored by us." },
  { q: "Will I get a receipt?",
    a: "Yes. Card and net-banking payments are confirmed straight away. UPI scan-and-pay donations are checked by our team first. Either way, a receipt is emailed to you and saved to your donation history." },
  { q: "Can I give to one specific cause?",
    a: "Yes. Open any campaign and press Donate. Your gift is tagged to that campaign and shown in its report." },
  { q: "Can I donate without my name being shown?",
    a: "Yes. Tick “Donate anonymously” on the donate page and your name won't appear in the public donor list." },
  { q: "I'd rather give time or supplies. How?",
    a: "Email or call us. We run drives most weekends and always need hands, rice, clothes, school supplies and medicines." },
];
