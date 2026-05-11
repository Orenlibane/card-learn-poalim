import { mkdir, rm, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const seasonDir = new URL("assets/season-1/", root);
const quizDir = new URL("assets/season-1/quizzes/", root);
const questionsDir = new URL("assets/season-1/card-questions/", root);
const cardAssetRoot = "assets/season-1/cards-poalim";
const packAssetRoot = "assets/season-1/packs-poalim";
const promptPath = new URL("assets/season-1/prompts/poalim-finance-prompts.json", root);

const packs = [
  {
    pack_id: "poalim-bank-basics",
    pack_title_he: "בנק הפועלים: כסף בבנק",
    short_title_he: "כסף בבנק",
    domain_he: "מונחי יסוד בבנקאות לילדים",
    age_group_he: "ילדים 6-12",
    color: "#d71920",
    accent: "#5f6670",
    cards: [
      card("bank-account", "חשבון בנק", ["מקום מסודר לשמור בו כסף", "לחשבון יש בעלים וכללים", "בודקים מה מותר לעשות בחשבון"], ["חשבון", "בנק"], "לפני פעולה שואלים: למי החשבון ומה הכללים?"),
      card("balance", "יתרה", ["היתרה מראה כמה כסף יש עכשיו", "יתרה משתנה אחרי קנייה או הפקדה", "בודקים יתרה לפני שמחליטים לקנות"], ["בדיקה", "כסף"], "אם היתרה קטנה מהמחיר, מחכים או בוחרים משהו זול יותר."),
      card("deposit", "הפקדה", ["הפקדה מוסיפה כסף לחשבון", "אפשר להפקיד כסף שקיבלנו או חסכנו", "רושמים הפקדה כדי לזכור מאיפה הכסף"], ["חיסכון", "תנועה"], "כסף שנכנס יכול ללכת קודם ליעד חיסכון קטן."),
      card("withdrawal", "משיכה", ["משיכה מוציאה כסף מהחשבון", "משיכה מקטינה את היתרה", "מושכים רק סכום שבאמת צריך"], ["מזומן", "בחירה"], "לפני משיכה מחליטים למה הכסף מיועד."),
      card("transaction", "תנועה בחשבון", ["כל כניסה או יציאה של כסף נקראת תנועה", "תנועות עוזרות לעקוב אחרי כסף", "בודקים תנועות כדי למצוא טעויות"], ["מעקב", "סדר"], "מעקב קצר מונע הפתעות בסוף השבוע."),
      card("bank-branch", "סניף", ["סניף הוא מקום שבו מקבלים שירות בנקאי", "בסניף אפשר לשאול שאלות ולקבל הסבר", "מבוגר אחראי מגיע עם ילד לפעולות חשובות"], ["שירות", "עזרה"], "כשלא מבינים משהו, מבקשים הסבר פשוט."),
      card("banker", "בנקאי", ["בנקאי עוזר להבין פעולות בנק", "שאלה טובה עוזרת לקבל שירות מתאים", "לא חותמים לפני שמבינים"], ["שיחה", "אחריות"], "שאלה חכמה: מה יקרה לכסף שלי אחר כך?"),
      card("account-statement", "דף חשבון", ["דף חשבון מסכם תנועות בתקופה", "הוא עוזר לראות לאן הכסף הלך", "משווים בין דף החשבון לתכנון"], ["סיכום", "הרגלים"], "בסוף חודש מחפשים הוצאה שאפשר לשפר."),
      card("bank-app", "אפליקציית הבנק", ["אפליקציה עוזרת לבדוק חשבון מהטלפון", "נכנסים רק עם פרטים אישיים וסיסמה", "לא נותנים לאחרים להשתמש בחשבון"], ["דיגיטל", "זהירות"], "בודקים כסף רק במכשיר בטוח ועם מבוגר כשצריך."),
      card("financial-goal", "יעד כספי", ["יעד כספי אומר למה חוסכים", "יעד ברור עוזר לא לבזבז מהר", "מחלקים יעד גדול לצעדים קטנים"], ["מטרה", "התמדה"], "כותבים יעד ומסמנים התקדמות כמו במשחק."),
    ],
  },
  {
    pack_id: "poalim-saving-choices",
    pack_title_he: "בנק הפועלים: חיסכון ובחירות",
    short_title_he: "חיסכון ובחירות",
    domain_he: "תקציב, חיסכון וקבלת החלטות",
    age_group_he: "ילדים 6-12",
    color: "#d71920",
    accent: "#8b929b",
    cards: [
      card("budget", "תקציב", ["תקציב הוא תוכנית לכסף", "מחלקים כסף לקנייה, חיסכון ונתינה", "תקציב עוזר לבחור בלי לחץ"], ["תכנון", "בחירה"], "נותנים לכל שקל תפקיד לפני שיוצאים לקנות."),
      card("needs-wants", "צריך או רוצה", ["צורך הוא דבר חשוב באמת", "רצון הוא דבר שכיף לקבל", "מחליטים קודם על צרכים ואז על רצונות"], ["עדיפות", "שיקול דעת"], "אם מתלבטים, שואלים: מה יקרה אם אחכה?"),
      card("saving", "חיסכון", ["חיסכון הוא כסף ששומרים למטרה", "גם סכומים קטנים מצטברים", "קל יותר לחסוך כשיש יעד"], ["התמדה", "מטרה"], "כל מטבע קטן הוא צעד במסלול."),
      card("interest", "ריבית", ["ריבית היא כסף שמתווסף או משולם על כסף", "בחיסכון ריבית יכולה להגדיל סכום", "בהלוואה ריבית מגדילה החזר"], ["ריבית", "זמן"], "אותה מילה יכולה לעזור או לעלות כסף, תלוי בהחלטה."),
      card("deposit-plan", "פיקדון", ["פיקדון שומר כסף לתקופה מוסכמת", "לפעמים אי אפשר למשוך מיד", "בודקים תנאים לפני שמפקידים"], ["פיקדון", "תנאים"], "לא נועלים כסף שצריך מחר."),
      card("automatic-saving", "חיסכון אוטומטי", ["אפשר להעביר סכום קבוע לחיסכון", "הרגל קבוע מקל על התמדה", "מתחילים מסכום שמתאים לתקציב"], ["הרגל", "אוטומטי"], "חיסכון קטן וקבוע מנצח שכחה."),
      card("emergency-cushion", "כרית ביטחון", ["כרית ביטחון היא כסף למצבים מפתיעים", "היא עוזרת לא להיבהל מהוצאה פתאומית", "שומרים אותה לפני קניות לא דחופות"], ["ביטחון", "עתיד"], "הפתעה קטנה פחות מלחיצה כשיש כרית מוכנה."),
      card("price-check", "השוואת מחירים", ["בודקים מחיר לפני שקונים", "אותו מוצר יכול לעלות אחרת במקומות שונים", "השוואה משאירה יותר כסף לחיסכון"], ["צרכנות", "בדיקה"], "לפעמים שתי דקות בדיקה שוות כמה מטבעות."),
      card("opportunity-cost", "בחירה בין דברים", ["כשקונים דבר אחד מוותרים על דבר אחר", "לכל בחירה יש מחיר וגם רווח", "מחשבים מה הכי חשוב עכשיו"], ["ויתור", "החלטה"], "בחירה טובה היא לדעת על מה ויתרנו."),
      card("smart-delay", "לחכות רגע", ["המתנה קצרה עוזרת להחליט בשקט", "לא כל מבצע מתאים לנו", "מחשבה לפני קנייה חוסכת חרטה"], ["סבלנות", "קנייה"], "חוק המשחק: מחכים עשר דקות לפני קנייה לא מתוכננת."),
    ],
  },
  {
    pack_id: "poalim-payments-cards",
    pack_title_he: "בנק הפועלים: תשלומים וכרטיסים",
    short_title_he: "תשלומים וכרטיסים",
    domain_he: "דרכי תשלום, כרטיסים ועמלות",
    age_group_he: "ילדים 8-12",
    color: "#d71920",
    accent: "#3f474f",
    cards: [
      card("cash", "מזומן", ["מזומן הוא כסף פיזי ביד", "קל לראות כמה נשאר בארנק", "מזומן שאבד קשה להחזיר"], ["מזומן", "ארנק"], "סופרים עודף לפני שעוזבים את הקופה."),
      card("debit-card", "כרטיס חיוב", ["כרטיס חיוב מוריד כסף מהחשבון", "בודקים שיש מספיק יתרה", "שומרים את הקוד הסודי לעצמנו"], ["כרטיס", "יתרה"], "כרטיס הוא לא קסם, הוא מחובר לכסף אמיתי."),
      card("credit-card", "כרטיס אשראי", ["אשראי מאפשר לשלם עכשיו ולהחזיר אחר כך", "צריך להבין מתי התשלום יורד", "שימוש לא מתוכנן עלול להכביד"], ["אשראי", "אחריות"], "לא קונים באשראי בלי לדעת מאיפה ההחזר יגיע."),
      card("bank-transfer", "העברה בנקאית", ["העברה מעבירה כסף מחשבון לחשבון", "בודקים שם וסכום לפני אישור", "טעות בפרטים יכולה ליצור בעיה"], ["העברה", "בדיקה"], "לפני אישור עושים עצירת בדיקה של שם, סכום וסיבה."),
      card("payment-app", "אפליקציית תשלום", ["אפליקציית תשלום שולחת כסף במהירות", "מאשרים רק לאדם שמכירים", "בודקים הודעה לפני שליחה"], ["דיגיטל", "מהירות"], "מהיר זה נחמד, אבל בדיקה לפני שליחה חשובה יותר."),
      card("receipt", "קבלה", ["קבלה מוכיחה ששילמנו", "שומרים קבלה כשאולי נרצה להחליף", "קבלה עוזרת לעקוב אחרי הוצאות"], ["הוכחה", "מעקב"], "קבלה היא רמז חשוב במסע הכסף."),
      card("standing-order", "הוראת קבע", ["הוראת קבע משלמת סכום חוזר בזמן קבוע", "היא נוחה לתשלומים קבועים", "צריך לבדוק שהיא עדיין נחוצה"], ["קבוע", "מעקב"], "תשלום שחוזר בלי בדיקה יכול להמשיך גם כשלא צריך."),
      card("installments", "תשלומים", ["תשלומים מחלקים קנייה לכמה חודשים", "המחיר הכולל עדיין חשוב", "יותר מדי תשלומים מקשים לעקוב"], ["חלוקה", "חודשים"], "שואלים: האם גם בחודש הבא זה יתאים לתקציב?"),
      card("fee", "עמלה", ["עמלה היא תשלום על שירות", "עמלות קטנות יכולות להצטבר", "בודקים אם יש דרך זולה יותר"], ["עמלה", "השוואה"], "גם מטבע קטן שיוצא הרבה פעמים הוא סכום גדול."),
      card("credit-limit", "מסגרת", ["מסגרת קובעת גבול לשימוש באשראי", "גבול לא אומר שחייבים להשתמש בכולו", "שומרים מרחק מהגבול כדי לא להילחץ"], ["גבול", "אחריות"], "מסגרת היא גדר בטיחות, לא יעד להגיע אליו."),
    ],
  },
  {
    pack_id: "poalim-loans-mortgage",
    pack_title_he: "בנק הפועלים: הלוואות ומשכנתא",
    short_title_he: "הלוואות ומשכנתא",
    domain_he: "הלוואות, החזרים ומשכנתא בשפה פשוטה",
    age_group_he: "ילדים 9-12",
    color: "#d71920",
    accent: "#b4232a",
    cards: [
      card("loan", "הלוואה", ["הלוואה היא כסף שמקבלים ומחזירים", "מחזירים בדרך כלל יותר מהסכום שקיבלו", "בודקים אם באמת צריך הלוואה"], ["הלוואה", "החזר"], "הלוואה היא כלי, לא קיצור דרך לקניות."),
      card("monthly-payment", "החזר חודשי", ["החזר חודשי הוא סכום שמשלמים בכל חודש", "הוא צריך להתאים להכנסות ולהוצאות", "החזר גבוה מדי יוצר לחץ"], ["חודש", "תכנון"], "החזר טוב משאיר מקום לאוכל, נסיעות וחיסכון."),
      card("fixed-rate", "ריבית קבועה", ["ריבית קבועה לא משתנה לפי ההסכם", "היא עוזרת לדעת מראש מה צפוי", "בודקים מחיר מול יציבות"], ["יציבות", "ריבית"], "לפעמים שקט וביטחון שווים בדיקה רצינית."),
      card("variable-rate", "ריבית משתנה", ["ריבית משתנה יכולה לעלות או לרדת", "שינוי ריבית משנה החזר", "צריך לחשוב גם על תרחיש פחות נוח"], ["שינוי", "סיכון"], "בודקים אם נוכל לשלם גם אם ההחזר יעלה."),
      card("mortgage", "משכנתא", ["משכנתא היא הלוואה גדולה לרכישת דירה", "ההחזר נמשך שנים רבות", "בודקים יכולת החזר לפני שמתחייבים"], ["דירה", "הלוואה"], "החלטה גדולה דורשת הרבה שאלות וסבלנות."),
      card("pre-approval", "אישור עקרוני", ["אישור עקרוני הוא בדיקה ראשונית", "הוא מבוסס על פרטים שמוסרים לבנק", "האישור אינו חוזה סופי"], ["בדיקה", "תהליך"], "ראשוני אומר התחלה, לא סוף הדרך."),
      card("mortgage-mix", "תמהיל מסלולים", ["משכנתא יכולה לכלול כמה מסלולים", "כל מסלול מתנהג אחרת", "משווים סיכון, מחיר וגמישות"], ["מסלולים", "השוואה"], "מערבבים מסלולים רק אחרי שמבינים כל חלק."),
      card("index-linkage", "הצמדה למדד", ["מדד מודד שינוי במחירים", "הצמדה יכולה לשנות את החוב", "בודקים איך המדד משפיע לאורך זמן"], ["מדד", "מחירים"], "מחיר שנראה קטן היום יכול לזוז עם הזמן."),
      card("refinance", "מחזור הלוואה", ["מחזור בודק שינוי תנאים של הלוואה קיימת", "לא תמיד מחזור משתלם", "משווים עלויות לפני החלטה"], ["בדיקה", "שינוי"], "שינוי תנאים הוא חידה שפותרים עם מספרים."),
      card("appraisal", "שמאות", ["שמאות מעריכה שווי של נכס", "הבנק משתמש בה כחלק מהבדיקה", "שווי הנכס משפיע על החלטות הלוואה"], ["נכס", "בדיקה"], "לפני סכום גדול בודקים גם את ערך הדבר שקונים."),
    ],
  },
  {
    pack_id: "poalim-digital-safety",
    pack_title_he: "בנק הפועלים: כסף דיגיטלי בטוח",
    short_title_he: "כסף דיגיטלי בטוח",
    domain_he: "בטיחות פיננסית, פרטיות והונאות",
    age_group_he: "ילדים 7-12",
    color: "#d71920",
    accent: "#2e353d",
    cards: [
      card("strong-password", "סיסמה חזקה", ["סיסמה חזקה קשה לניחוש", "לא משתמשים בשם או תאריך קל", "לא משתפים סיסמה עם חברים"], ["סיסמה", "פרטיות"], "סיסמה היא מפתח, ושומרים מפתח בכיס בטוח."),
      card("two-step", "אימות נוסף", ["אימות נוסף מוסיף בדיקה לפני כניסה", "קוד חד פעמי עוזר להגן על החשבון", "לא מוסרים קוד שקיבלנו בהודעה"], ["קוד", "הגנה"], "קוד שמגיע אליך נשאר אצלך."),
      card("phishing", "הודעה מתחזה", ["הודעה מתחזה מנסה לגנוב פרטים", "בודקים שולח וקישור לפני לחיצה", "כשיש ספק שואלים מבוגר"], ["זהירות", "הונאה"], "קישור מלחיץ הוא סימן לעצור ולבדוק."),
      card("privacy", "פרטיות", ["פרטים אישיים שומרים בזהירות", "לא מפרסמים מספר חשבון או קוד", "משתפים מידע רק כשמבינים למה"], ["מידע", "אחריות"], "מידע אישי הוא חלק מהאוצר שלך."),
      card("pin-code", "קוד סודי", ["קוד סודי מאשר פעולה בכרטיס", "מסתירים את היד כשמקישים קוד", "לא כותבים קוד ליד הכרטיס"], ["כרטיס", "קוד"], "הקוד והכרטיס לא גרים באותו מקום."),
      card("card-lock", "נעילת כרטיס", ["אם כרטיס אבד אפשר לבקש חסימה", "חסימה עוזרת למנוע שימוש לא מורשה", "מדווחים מהר למבוגר או לבנק"], ["אובדן", "פעולה"], "כשמשהו נעלם, פועלים מהר ובשקט."),
      card("safe-site", "אתר מאובטח", ["בודקים כתובת אתר לפני שמקלידים פרטים", "אתר אמיתי לא מבקש הכל בהודעה מפתיעה", "נכנסים דרך כתובת מוכרת"], ["אתר", "בדיקה"], "לא נכנסים לבנק דרך קישור חשוד."),
      card("purchase-check", "קנייה בטוחה", ["בודקים מוכר, מחיר ותנאי החזרה", "מחיר נמוך מדי יכול להיות סימן אזהרה", "שומרים אישור תשלום"], ["קנייה", "אחריות"], "עסקה טובה עדיין צריכה להיות בטוחה."),
      card("alert-message", "התראת פעולה", ["התראה מספרת שקרה משהו בחשבון", "קוראים התראה גם אם עסוקים", "פעולה לא מוכרת דורשת בדיקה"], ["התראה", "מעקב"], "התראה היא פעמון קטן שמגן על הכסף."),
      card("ask-grownup", "שואלים מבוגר", ["כסף דיגיטלי דורש אחריות", "שאלה בזמן יכולה למנוע טעות", "מבוגר עוזר לבדוק לפני פעולה חשובה"], ["עזרה", "החלטה"], "גיבור פיננסי יודע מתי לבקש עזרה."),
    ],
  },
];

function card(slug, title_he, facts_he, tags_he, decision_tip_he) {
  return { slug, title_he, facts_he, tags_he, decision_tip_he };
}

function rarity(index) {
  if (index === 10) return "legendary";
  if (index === 7 || index === 8) return "epic";
  if (index === 4 || index === 6) return "rare";
  return "common";
}

function cardId(pack, index, slug) {
  return `${pack.pack_id}-${String(index).padStart(2, "0")}-${slug}`;
}

function assetFile(pack, index, slug) {
  return `${cardAssetRoot}/${pack.pack_id}/${String(index).padStart(2, "0")}-${slug}.webp`;
}

function makeQuizzes(cardItem) {
  const [first, second, third] = cardItem.facts_he;
  return {
    junior: {
      age_band_he: "3-5",
      reward_brain_coins: 8,
      question_he: `מה נכון לגבי ${cardItem.title_he}?`,
      options_he: [first, `תמיד מתעלמים מ${cardItem.title_he}.`, "אין קשר בין הקלף לבין כסף."],
      correct_answer_index: 0,
      source_fact_he: first,
    },
    child: {
      age_band_he: "6-12",
      reward_brain_coins: 15,
      question_he: `איזו החלטה חכמה קשורה ל${cardItem.title_he}?`,
      options_he: [cardItem.decision_tip_he, "לוחצים מהר בלי לבדוק.", "בוחרים תמיד את הדבר הכי יקר."],
      correct_answer_index: 0,
      source_fact_he: cardItem.decision_tip_he,
    },
    advanced: {
      age_band_he: "13+",
      reward_brain_coins: 25,
      question_he: `איזה הסבר הכי מדויק על ${cardItem.title_he}?`,
      options_he: [`${second}, ולכן כדאי להבין את התנאים.`, "זה מושג שלא קשור להחלטות כספיות.", `${third} אומר שאין צורך לבדוק כלום.`],
      correct_answer_index: 0,
      source_fact_he: second,
    },
  };
}

function makeMvpQuestions(cardItem) {
  const [first, second, third] = cardItem.facts_he;
  return [
    q(`מה נכון לפי הקלף על ${cardItem.title_he}?`, [first, "אין צורך לבדוק כסף אף פעם.", "כל קנייה היא תמיד חובה."], 0),
    q(`איזה פרט עוזר לקבל החלטה על ${cardItem.title_he}?`, [second, "מה שהחבר הכי רוצה.", "הצבע של הארנק בלבד."], 0),
    q(`מה כדאי לזכור לפני פעולה שקשורה ל${cardItem.title_he}?`, [cardItem.decision_tip_he, "לא לקרוא את הפרטים.", "לנחש בלי לשאול."], 0),
    q(`איזה משפט נשאר נאמן לעובדות של ${cardItem.title_he}?`, [`${first} וגם ${second}`, "כסף מופיע בלי תכנון.", "כללים בבנק אינם חשובים."], 0),
    q(`איזו שאלה טובה שואלים על ${cardItem.title_he}?`, ["מה יקרה לכסף אחרי הפעולה?", "איך מסיימים הכי מהר?", "איך מתעלמים מהיתרה?"], 0),
    q(`איזו בחירה מתאימה למשחק הלמידה?`, ["בודקים, משווים ואז מחליטים.", "קונים מיד כל מה שרואים.", "נותנים סיסמה לחבר."], 0),
    q(`מה הקשר בין ${cardItem.title_he} לאחריות?`, [third, "אחריות אומרת לא לבדוק.", "אחריות שייכת רק למבוגרים."], 0),
    q(`איזה רמז מראה החלטה פיננסית טובה?`, ["יש מטרה, תקציב ובדיקה.", "יש לחץ והחלטה מהירה.", "יש קישור חשוד וסיסמה גלויה."], 0),
    q(`מה כדאי לעשות כשלא בטוחים לגבי ${cardItem.title_he}?`, ["לשאול מבוגר או בעל מקצוע.", "לאשר מהר כדי לסיים.", "לשכוח מהתנאים."], 0),
    q(`איזה כיוון כדאי להעמיק אחרי הקלף?`, [`הקשר בין ${cardItem.title_he} לבין ${cardItem.tags_he.join(" ו")}.`, "איך לנחש בלי עובדות.", "איך להסתיר טעויות."], 0),
  ];
}

function q(question, options, correct_index) {
  return { question, options, correct_index };
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function textLine(value, x, y, size, weight = 800, fill = "#172033") {
  return `<text x="${x}" y="${y}" text-anchor="middle" direction="rtl" unicode-bidi="plaintext" font-family="Arial, Noto Sans Hebrew, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${escapeXml(value)}</text>`;
}

function factLines(lines, x, y, width, color) {
  return lines.map((line, index) => {
    const top = y + index * 58;
    return `
      <rect x="${x}" y="${top}" width="${width}" height="42" rx="18" fill="#fff7e8" stroke="${color}" stroke-width="3"/>
      <circle cx="${x + width - 25}" cy="${top + 21}" r="13" fill="${color}" opacity=".95"/>
      ${textLine(line, x + width / 2 - 8, top + 27, 20, 800)}
    `;
  }).join("");
}

function cardSvg(pack, cardItem, index) {
  const title = cardItem.title_he;
  const titleSize = title.length > 13 ? 34 : 40;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="716" viewBox="0 0 512 716" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset=".58" stop-color="#f7f8fa"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="foil" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d71920"/>
      <stop offset=".58" stop-color="#f3f4f6"/>
      <stop offset="1" stop-color="${pack.accent}"/>
    </linearGradient>
  </defs>
  <rect x="12" y="12" width="488" height="692" rx="32" fill="url(#foil)"/>
  <rect x="28" y="28" width="456" height="660" rx="24" fill="url(#bg)" stroke="#d71920" stroke-width="5"/>
  <rect x="42" y="42" width="428" height="88" rx="18" fill="#ffffff"/>
  <rect x="55" y="55" width="64" height="64" rx="16" fill="#d71920" transform="rotate(45 87 87)"/>
  <path d="M76 87 H98 M87 76 V98" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
  <rect x="134" y="52" width="84" height="34" rx="17" fill="#f3f4f6" stroke="#d2d6dc" stroke-width="2"/>
  ${textLine("עונה 1", 176, 76, 18, 900, "#4b525a")}
  <rect x="328" y="52" width="136" height="34" rx="17" fill="#d71920"/>
  ${textLine(pack.short_title_he, 396, 76, 17, 900, "#ffffff")}
  ${textLine("בנק הפועלים", 256, 121, 34, 900, "#d71920")}
  <rect x="64" y="150" width="384" height="58" rx="24" fill="#ffffff" stroke="#d71920" stroke-width="4"/>
  ${textLine(title, 256, 190, titleSize, 900, "#202833")}
  <g transform="translate(94 238)">
    <rect x="0" y="0" width="324" height="188" rx="34" fill="#f6f7f9" stroke="#d71920" stroke-width="6"/>
    <rect x="42" y="40" width="92" height="92" rx="24" fill="#d71920" transform="rotate(45 88 86)"/>
    <rect x="192" y="40" width="92" height="92" rx="24" fill="${pack.accent}" transform="rotate(45 238 86)" opacity=".88"/>
    <path d="M96 132 C120 96, 198 94, 224 132" fill="none" stroke="#202833" stroke-width="11" stroke-linecap="round"/>
    <rect x="124" y="54" width="76" height="90" rx="16" fill="#ffffff" stroke="#202833" stroke-width="6"/>
    <circle cx="162" cy="100" r="17" fill="#d71920"/>
    <path d="M71 86 H105 M88 69 V103" stroke="#ffffff" stroke-width="10" stroke-linecap="round"/>
    <path d="M220 86 H256" stroke="#ffffff" stroke-width="10" stroke-linecap="round"/>
  </g>
  ${factLines(cardItem.facts_he, 54, 454, 404, pack.color)}
  <rect x="134" y="638" width="244" height="38" rx="19" fill="#d71920" stroke="#ffffff" stroke-width="3"/>
  ${textLine(`${index}/10 · ${rarity(index)}`, 256, 664, 21, 900, "#ffffff")}
</svg>
`;
}

function packSvg(pack) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="716" viewBox="0 0 512 716" role="img" aria-label="${escapeXml(pack.pack_title_he)}">
  <defs>
    <linearGradient id="wrap" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d71920"/>
      <stop offset=".62" stop-color="#f7f8fa"/>
      <stop offset="1" stop-color="${pack.accent}"/>
    </linearGradient>
  </defs>
  <rect x="42" y="24" width="428" height="668" rx="38" fill="url(#wrap)" stroke="#ffffff" stroke-width="8"/>
  <path d="M64 82 C150 52, 336 52, 448 88 L448 194 C340 160, 176 160, 64 194 Z" fill="#ffffff" opacity=".96"/>
  <rect x="210" y="62" width="92" height="92" rx="24" fill="#d71920" transform="rotate(45 256 108)"/>
  <path d="M236 108 H276 M256 88 V128" stroke="#ffffff" stroke-width="11" stroke-linecap="round"/>
  ${textLine("בנק הפועלים", 256, 178, 38, 900, "#d71920")}
  <rect x="82" y="214" width="348" height="86" rx="28" fill="#ffffff" stroke="#d71920" stroke-width="5"/>
  ${textLine(pack.short_title_he, 256, 268, pack.short_title_he.length > 14 ? 34 : 40, 900, "#202833")}
  <g transform="translate(92 330)">
    <circle cx="80" cy="72" r="62" fill="#ffffff" opacity=".9"/>
    <circle cx="168" cy="72" r="62" fill="#d71920" opacity=".92"/>
    <circle cx="252" cy="72" r="62" fill="#ffffff" opacity=".9"/>
    <path d="M58 108 H275" stroke="#202833" stroke-width="12" stroke-linecap="round"/>
    <rect x="130" y="28" width="76" height="96" rx="16" fill="#ffffff" stroke="#202833" stroke-width="7"/>
    <circle cx="168" cy="80" r="18" fill="#d71920"/>
    <path d="M62 72 H98 M80 54 V90" stroke="#d71920" stroke-width="9" stroke-linecap="round"/>
    <path d="M234 72 H270" stroke="#d71920" stroke-width="9" stroke-linecap="round"/>
  </g>
  <rect x="116" y="536" width="280" height="54" rx="27" fill="#ffffff" stroke="#d71920" stroke-width="5"/>
  ${textLine("10 קלפי עובדות", 256, 572, 32, 900, "#202833")}
  <rect x="146" y="610" width="220" height="36" rx="18" fill="#d71920" opacity=".96"/>
  ${textLine("עונה 1 · בנקאות לילדים", 256, 635, 20, 900, "#ffffff")}
</svg>
`;
}

async function cleanOldContent() {
  const contentDirs = [
    "assets/season-1/quizzes",
    "assets/season-1/card-questions",
    "assets/season-1/cards-generated-he",
    "assets/season-1/cards-native-he",
    "assets/season-1/cards-individual-he",
    "assets/season-1/cards-promo-he",
    "assets/season-1/cards-tech-he",
    "assets/season-1/cards-wave2-he",
    "assets/season-1/packs-native-he",
    "assets/season-1/packs-promo-he",
    "assets/season-1/packs-tech-he",
    "assets/season-1/packs-wave2-he",
    "assets/season-1/cards-poalim",
    "assets/season-1/packs-poalim",
    "assets/season-1/concepts",
    "assets/season-1/finalized",
    "assets/season-1/prompts",
    "assets/season-1/prompts-tech-he",
    "assets/season-1/skill-tests",
  ];

  await Promise.all(contentDirs.map((dir) => rm(new URL(dir, root), { recursive: true, force: true })));
  await Promise.all([
    "assets/season-1/missing-pack-assets-manifest.json",
    "assets/season-1/missing-pack-assets-contact-sheet.webp",
    "assets/season-1/rendered-card-replacements-manifest.json",
    "assets/season-1/rendered-pack-replacements-manifest.json",
    "assets/season-1/content-plan.md",
  ].map((file) => rm(new URL(file, root), { force: true })));
  await mkdir(quizDir, { recursive: true });
  await mkdir(questionsDir, { recursive: true });
  await mkdir(new URL(cardAssetRoot, root), { recursive: true });
  await mkdir(new URL(packAssetRoot, root), { recursive: true });
  await mkdir(new URL("assets/season-1/prompts/", root), { recursive: true });
}

async function main() {
  await cleanOldContent();

  const promptPlan = {
    schema_version: 1,
    product_name_he: "אוספים עובדות",
    language: "he",
    text_direction: "rtl",
    note_he: "הפרויקט משתמש בנכסי PNG/WebP מרונדרים. הפרומפטים כאן מיועדים לשדרוג עתידי ב-image generation אחד־אחד.",
    packs: [],
    cards: [],
  };

  const index = {
    schema_version: 1,
    product_name_he: "אוספים עובדות",
    language: "he",
    text_direction: "rtl",
    season: 1,
    packs: [],
  };

  for (const pack of packs) {
    await mkdir(new URL(`${cardAssetRoot}/${pack.pack_id}/`, root), { recursive: true });
    const packAssetPath = `${packAssetRoot}/pack-${pack.pack_id}.webp`;

    const cards = [];
    const questionEntries = [];
    pack.cards.forEach((cardItem, position) => {
      const index = position + 1;
      const id = cardId(pack, index, cardItem.slug);
      const asset_path = assetFile(pack, index, cardItem.slug);
      cards.push({
        card_id: id,
        index,
        title_he: cardItem.title_he,
        asset_path,
        facts_he: cardItem.facts_he,
        tags_he: cardItem.tags_he,
        decision_tip_he: cardItem.decision_tip_he,
        rarity: rarity(index),
        quizzes: makeQuizzes(cardItem),
      });
      questionEntries.push({ card_id: id, questions: makeMvpQuestions(cardItem) });
      promptPlan.cards.push({
        asset_id: id,
        output_path: asset_path,
        pack_id: pack.pack_id,
        title_he: cardItem.title_he,
        prompt_he: `צור קלף פרימיום יחיד למשחק "אוספים עובדות" בעברית מלאה, עונה 1, חבילה "${pack.pack_title_he}", כותרת "${cardItem.title_he}", שלוש עובדות: ${cardItem.facts_he.join(" / ")}. קלף playful לילדים על החלטות פיננסיות, בלי ייעוץ פיננסי, בלי אנגלית, רק תמונה אחת עם רקע שקוף.`,
      });
    });

    const quizJson = {
      schema_version: 1,
      product_name_he: "אוספים עובדות",
      language: "he",
      text_direction: "rtl",
      season: 1,
      pack_id: pack.pack_id,
      pack_title_he: pack.pack_title_he,
      domain_he: pack.domain_he,
      age_group_he: pack.age_group_he,
      pack_asset_path: packAssetPath,
      card_count: cards.length,
      quiz_flow_he: "תמונת הקלף מציגה מושג, עובדות וטיפ החלטה. הבוחן מלמד ילדים לבדוק, להשוות ולשאול לפני פעולה כספית.",
      financial_note_he: "תוכן חינוכי בלבד. אין כאן ייעוץ פיננסי, תנאי מוצר, ריבית עדכנית או המלצה לבצע פעולה בבנק.",
      cards,
    };

    await writeFile(new URL(`assets/season-1/quizzes/${pack.pack_id}.json`, root), `${JSON.stringify(quizJson, null, 2)}\n`, "utf8");
    await writeFile(new URL(`assets/season-1/card-questions/${pack.pack_id}.json`, root), `${JSON.stringify(questionEntries, null, 2)}\n`, "utf8");

    index.packs.push({
      pack_id: pack.pack_id,
      pack_title_he: pack.pack_title_he,
      domain_he: pack.domain_he,
      card_count: cards.length,
      quiz_path: `assets/season-1/quizzes/${pack.pack_id}.json`,
    });
    promptPlan.packs.push({
      asset_id: `pack-${pack.pack_id}`,
      output_path: packAssetPath,
      pack_id: pack.pack_id,
      prompt_he: `צור עטיפת חבילת קלפים יחידה למשחק "אוספים עובדות" בעברית מלאה, שם "${pack.pack_title_he}", 10 קלפי עובדות, playful לילדים, בנקאות וחינוך פיננסי, רקע שקוף, בלי אנגלית ובלי ייעוץ פיננסי.`,
    });
  }

  await writeFile(new URL("assets/season-1/quizzes/index.json", root), `${JSON.stringify(index, null, 2)}\n`, "utf8");
  await writeFile(promptPath, `${JSON.stringify(promptPlan, null, 2)}\n`, "utf8");

  await mkdir(seasonDir, { recursive: true });
  console.log(JSON.stringify({ packs: packs.length, cards: packs.length * 10 }, null, 2));
}

await main();
